<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResumeMatchController extends Controller
{
    public function show(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));

        return response()->json([
            'success' => true,
            'data' => [
                'result' => $internship->resume_match_result,
                'analyzed_at' => $internship->resume_match_analyzed_at?->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $user = $request->user();

        $validated = $request->validate([
            'resume_source' => 'nullable|in:text,upload,asset',
            'resume_text' => 'nullable|string|min:20',
            'asset_id' => 'nullable|integer',
            'file' => 'nullable|file|max:10240',
            'file_name' => 'nullable|string|max:255',
        ]);

        $resumeInput = $this->resolveResumeInput($request, $internship, $validated);

        if (empty($resumeInput['text']) && empty($resumeInput['file_part'])) {
            return response()->json([
                'error' => 'Choose a readable resume asset, upload a file, or paste resume text before analyzing.',
            ], 422);
        }

        $geminiResult = $this->geminiResult($internship, $resumeInput);

        if ($geminiResult === null) {
            if ($this->allowNonGeminiFallbacks()) {
                $result = $this->localFallbackResult($internship, $resumeInput['text'] ?? '');
                $proxyResult = $this->proxyResult($internship, $resumeInput, $result);
                if ($proxyResult !== null) {
                    $result = $proxyResult;
                }
            } else {
                return response()->json([
                    'error' => 'AI resume analysis is unavailable. Please try again later.',
                ], 503);
            }
        } else {
            $fallback = $this->localFallbackResult($internship, $resumeInput['text'] ?? '');
            $result = $this->normalizeResult($geminiResult, $fallback);

            $user->forceFill([
                'ai_resume_match_uses' => (int) $user->ai_resume_match_uses + 1,
                'ai_resume_match_used_at' => now(),
            ])->saveQuietly();
        }

        $internship->forceFill([
            'resume_match_result' => $result,
            'resume_match_analyzed_at' => now(),
            'last_activity_at' => now(),
        ])->saveQuietly();

        return response()->json([
            'success' => true,
            'data' => [
                'result' => $result,
                'analyzed_at' => $internship->resume_match_analyzed_at?->toIso8601String(),
            ],
        ]);
    }

    private function allowNonGeminiFallbacks(): bool
    {
        return app()->environment(['local', 'testing']);
    }

    private function resolveResumeInput(Request $request, Internship $internship, array $validated): array
    {
        $source = $validated['resume_source'] ?? ($request->hasFile('file') ? 'upload' : (!empty($validated['asset_id']) ? 'asset' : 'text'));
        $resumeText = trim((string) ($validated['resume_text'] ?? ''));
        $filePart = null;
        $fileName = $validated['file_name'] ?? null;

        if ($source === 'upload' && $request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            [$fileText, $filePart] = $this->fileContentForGemini(
                $file->getRealPath(),
                $file->getMimeType() ?: 'application/octet-stream',
                $fileName
            );
            $resumeText = trim($resumeText . "\n\n" . $fileText);
        }

        if ($source === 'asset' && !empty($validated['asset_id'])) {
            $asset = $internship->assets()->findOrFail($validated['asset_id']);
            $fileName = $asset->file_name ?: $asset->label;

            $assetPath = $this->resolveReadableAssetPath($asset->file_path);
            if ($assetPath !== null) {
                [$fileText, $filePart] = $this->fileContentForGemini(
                    $assetPath,
                    $asset->mime_type ?: 'application/octet-stream',
                    $fileName
                );
                $resumeText = trim($resumeText . "\n\n" . $fileText);
            } elseif ($asset->url) {
                $resumeText = trim($resumeText . "\n\nSelected resume asset link: {$asset->url}\nAsset label: {$asset->label}");
            }
        }

        return [
            'source' => $source,
            'text' => $resumeText,
            'file_part' => $filePart,
            'file_name' => $fileName,
        ];
    }

    private function resolveReadableAssetPath(?string $filePath): ?string
    {
        if (empty($filePath)) {
            return null;
        }

        $disk = Storage::disk('public');

        if (!$disk->exists($filePath)) {
            return null;
        }

        try {
            $localPath = $disk->path($filePath);
            if (is_readable($localPath)) {
                return $localPath;
            }
        } catch (\Throwable) {
            // Remote disk drivers do not support path().
        }

        $tempPath = sys_get_temp_dir() . '/' . uniqid('resume_', true) . '_' . basename($filePath);
        file_put_contents($tempPath, $disk->get($filePath) ?: '');

        return is_readable($tempPath) ? $tempPath : null;
    }

    private function fileContentForGemini(string $path, string $mimeType, ?string $fileName): array
    {
        if (!$path || !is_readable($path)) {
            return ['', null];
        }

        $extension = strtolower(pathinfo((string) $fileName, PATHINFO_EXTENSION));

        if (str_starts_with($mimeType, 'text/') || in_array($extension, ['txt', 'md', 'csv'], true)) {
            return [file_get_contents($path) ?: '', null];
        }

        if ($extension === 'docx') {
            return [$this->extractDocxText($path), null];
        }

        return [
            '',
            [
                'inline_data' => [
                    'mime_type' => $mimeType,
                    'data' => base64_encode(file_get_contents($path) ?: ''),
                ],
            ],
        ];
    }

    private function extractDocxText(string $path): string
    {
        if (!class_exists(\ZipArchive::class)) {
            return '';
        }

        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return '';
        }

        $xml = $zip->getFromName('word/document.xml') ?: '';
        $zip->close();

        if ($xml === '') {
            return '';
        }

        $text = preg_replace('/<w:tab\/>/', ' ', $xml);
        $text = preg_replace('/<\/w:p>/', "\n", (string) $text);
        $text = strip_tags((string) $text);

        return html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function geminiResult(Internship $internship, array $resumeInput): ?array
    {
        $apiKey = config('services.gemini.key');
        if (empty($apiKey)) {
            return null;
        }

        $parts = [
            [
                'text' => $this->buildGeminiPrompt($internship, $resumeInput),
            ],
        ];

        if (!empty($resumeInput['file_part'])) {
            $parts[] = $resumeInput['file_part'];
        }

        $model = config('services.gemini.model', 'gemini-2.0-flash');
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
            ])->timeout((int) config('services.gemini.timeout', 30))->post($endpoint, [
                'contents' => [
                    [
                        'parts' => $parts,
                    ],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                    'response_schema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'score' => ['type' => 'INTEGER'],
                            'summary' => ['type' => 'STRING'],
                            'matchedKeywords' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                            'missingKeywords' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                            'strengths' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                            'gaps' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                            'recommendations' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                        ],
                        'required' => ['score', 'summary', 'matchedKeywords', 'missingKeywords', 'strengths', 'gaps', 'recommendations'],
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::warning('Gemini resume alignment failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $text = $response->json('candidates.0.content.parts.0.text');
            $decoded = is_string($text) ? json_decode($text, true) : null;

            return is_array($decoded) ? $decoded : null;
        } catch (\Throwable $e) {
            Log::warning('Gemini resume alignment unavailable', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function buildGeminiPrompt(Internship $internship, array $resumeInput): string
    {
        $resumeText = trim((string) ($resumeInput['text'] ?? ''));

        return <<<PROMPT
You are reviewing how a user's resume aligns with a saved internship application.
Return only JSON matching the provided schema.

Score from 0 to 100 using this rubric:
- Role and skill match: 40
- Evidence of relevant projects or experience: 25
- Company/application fit: 20
- Resume clarity and specificity: 15

Application details:
- Company: {$internship->company_name}
- Position: {$internship->position}
- Location: {$internship->location}
- Duration: {$internship->duration}
- Paid: {$internship->is_paid}
- Posting URL: {$internship->url}

Resume source: {$resumeInput['source']}
Resume file name: {$resumeInput['file_name']}

Resume text or asset metadata:
{$resumeText}

Write concise, specific comments. Do not invent credentials not shown in the resume.
PROMPT;
    }

    private function proxyResult(Internship $internship, array $resumeInput, array $fallback): ?array
    {
        $endpoint = config('services.resume_matcher.url');
        if (empty($endpoint) || empty($resumeInput['text'])) {
            return null;
        }

        $payload = [
            'resume_text' => $resumeInput['text'],
            'file_name' => $resumeInput['file_name'] ?? null,
            'internship' => [
                'id' => $internship->id,
                'company_name' => $internship->company_name,
                'position' => $internship->position,
                'location' => $internship->location,
                'status' => $internship->status,
            ],
        ];

        try {
            $response = Http::timeout((int) config('services.resume_matcher.timeout', 30))
                ->acceptJson()
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $body = $response->json();
                $candidate = $body['data'] ?? $body['result'] ?? $body;
                if (is_array($candidate) && isset($candidate['score'])) {
                    return $this->normalizeResult($candidate, $fallback);
                }
            }

            Log::warning('Resume matcher proxy returned an error response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Resume matcher proxy unavailable, using local fallback', [
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    private function normalizeResult(array $candidate, array $fallback): array
    {
        return [
            'score' => max(0, min(100, (int) ($candidate['score'] ?? $fallback['score']))),
            'summary' => (string) ($candidate['summary'] ?? $candidate['overallComment'] ?? $candidate['overall_comment'] ?? $fallback['summary']),
            'matchedKeywords' => array_values($candidate['matchedKeywords'] ?? $candidate['matched_keywords'] ?? $fallback['matchedKeywords']),
            'missingKeywords' => array_values($candidate['missingKeywords'] ?? $candidate['missing_keywords'] ?? $fallback['missingKeywords']),
            'strengths' => array_values($candidate['strengths'] ?? $fallback['strengths']),
            'gaps' => array_values($candidate['gaps'] ?? $fallback['gaps']),
            'recommendations' => array_values($candidate['recommendations'] ?? $fallback['recommendations']),
        ];
    }

    private function localFallbackResult(Internship $internship, string $resumeText): array
    {
        $position = strtolower($internship->position);
        $matchedKeywords = [];
        $missingKeywords = [];
        $strengths = [];
        $gaps = [];
        $recommendations = [];
        $score = 55;

        if (str_contains($position, 'front') || str_contains($position, 'react') || str_contains($position, 'ui') || str_contains($position, 'ux') || str_contains($position, 'design')) {
            $keywords = ['React', 'CSS', 'HTML', 'Git', 'JavaScript', 'TypeScript', 'Tailwind', 'Figma', 'Responsive Design'];
            foreach ($keywords as $keyword) {
                if (str_contains(strtolower($resumeText), strtolower($keyword))) {
                    $matchedKeywords[] = $keyword;
                    $score += 5;
                } else {
                    $missingKeywords[] = $keyword;
                }
            }

            $strengths = [
                'Identified strong match for modern frontend terminology.',
                'Active usage of responsive design language.',
                'Demonstrated knowledge of collaborative tools like Git.',
            ];

            $gaps = [
                'Missing core UI/UX prototyping tools like Figma.',
                'No explicit mention of state management frameworks.',
                'Design system vocabulary is underrepresented.',
            ];

            $recommendations = [
                'Surface React and TypeScript earlier in the summary.',
                'Replace passive bullets with direct impact statements.',
                'Add a concise skills matrix for languages and tools.',
            ];
        } elseif (str_contains($position, 'back') || str_contains($position, 'laravel') || str_contains($position, 'php') || str_contains($position, 'api') || str_contains($position, 'database')) {
            $keywords = ['PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST API', 'Git', 'Database Design', 'Redis', 'Docker', 'MVC'];
            foreach ($keywords as $keyword) {
                if (str_contains(strtolower($resumeText), strtolower($keyword))) {
                    $matchedKeywords[] = $keyword;
                    $score += 5;
                } else {
                    $missingKeywords[] = $keyword;
                }
            }

            $strengths = [
                'Back-end foundational terminology is robust.',
                'Proper mapping of relational model structures.',
                'Strong database lifecycle awareness.',
            ];

            $gaps = [
                'No reference to containerization tools.',
                'API testing protocols are not featured.',
                'High-performance caching is omitted.',
            ];

            $recommendations = [
                'Mention Laravel models and performance metrics.',
                'Describe how you secure endpoints.',
                'Add a project demonstrating schema design and indexes.',
            ];
        } else {
            $keywords = ['Communication', 'Teamwork', 'Git', 'Problem Solving', 'Data', 'Project Management', 'Agile', 'SQL', 'Python'];
            foreach ($keywords as $keyword) {
                if (str_contains(strtolower($resumeText), strtolower($keyword))) {
                    $matchedKeywords[] = $keyword;
                    $score += 5;
                } else {
                    $missingKeywords[] = $keyword;
                }
            }

            $strengths = [
                'Clean layout with clear functional highlights.',
                'Strong alignment with collaboration objectives.',
                'Mentions analytic and problem-solving capacity.',
            ];

            $gaps = [
                'Agile workflows are not emphasized.',
                'SQL or repository evidence is missing.',
                'Lacks concrete results metrics.',
            ];

            $recommendations = [
                'Quantify accomplishments with numbers and dates.',
                'State familiarity with Agile tools like Jira or Trello.',
                'Tailor the summary to the target company and role.',
            ];
        }

        return [
            'score' => min($score, 98),
            'summary' => 'This preliminary review is based on local keyword matching because Gemini was unavailable. Use it as a quick signal, then run Gemini analysis when the API key is configured.',
            'matchedKeywords' => $matchedKeywords,
            'missingKeywords' => $missingKeywords,
            'strengths' => $strengths,
            'gaps' => $gaps,
            'recommendations' => $recommendations,
        ];
    }
}
