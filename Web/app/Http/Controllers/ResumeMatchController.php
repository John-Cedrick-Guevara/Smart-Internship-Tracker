<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

        $validated = $request->validate([
            'resume_text' => 'required|string|min:20',
            'file_name' => 'nullable|string|max:255',
        ]);

        $endpoint = config('services.resume_matcher.url');
        $payload = [
            'resume_text' => $validated['resume_text'],
            'file_name' => $validated['file_name'] ?? null,
            'internship' => [
                'id' => $internship->id,
                'company_name' => $internship->company_name,
                'position' => $internship->position,
                'location' => $internship->location,
                'status' => $internship->status,
            ],
        ];

        $result = $this->localFallbackResult($internship, $validated['resume_text']);

        if (!empty($endpoint)) {
            try {
                $response = Http::timeout((int) config('services.resume_matcher.timeout', 30))
                    ->acceptJson()
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $body = $response->json();
                    $candidate = $body['data'] ?? $body['result'] ?? $body;
                    if (is_array($candidate) && isset($candidate['score'])) {
                        $result = $this->normalizeResult($candidate, $result);
                    }
                } else {
                    Log::warning('Resume matcher proxy returned an error response', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Resume matcher proxy unavailable, using local fallback', [
                    'error' => $e->getMessage(),
                ]);
            }
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

    private function normalizeResult(array $candidate, array $fallback): array
    {
        return [
            'score' => (int) ($candidate['score'] ?? $fallback['score']),
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
            'matchedKeywords' => $matchedKeywords,
            'missingKeywords' => $missingKeywords,
            'strengths' => $strengths,
            'gaps' => $gaps,
            'recommendations' => $recommendations,
        ];
    }
}
