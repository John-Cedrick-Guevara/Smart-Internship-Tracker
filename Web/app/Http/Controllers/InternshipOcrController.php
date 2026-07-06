<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InternshipOcrController extends Controller
{
    public function processScreenshot(Request $request)
    {
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }

        if (!config('services.ai.ocr_enabled')) {
            return response()->json([
                'error' => 'Screenshot OCR is disabled in this environment.',
            ], 403);
        }

        set_time_limit(120);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $user = $request->user();

        try {
            $file = $request->file('image');
            $ocrServiceUrl = config('services.ocr.url');

            if (empty($ocrServiceUrl)) {
                return response()->json(['error' => 'OCR service is not configured.'], 503);
            }

            try {
                $ocrResponse = Http::timeout((int) config('services.ocr.timeout', 60))->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )->post($ocrServiceUrl);
            } catch (\Exception $e) {
                Log::warning('OCR Service Connection Failed: ' . $e->getMessage());

                return response()->json(['error' => 'OCR service is unavailable. Please try again later.'], 503);
            }

            if ($ocrResponse->failed()) {
                $errorMessage = $ocrResponse->json()['detail'] ?? 'OCR extraction failed';
                Log::warning('OCR Extraction Failed: ' . $errorMessage);

                return response()->json(['error' => 'Failed to extract text from image. ' . $errorMessage], 400);
            }

            $ocrData = $ocrResponse->json();

            if (!isset($ocrData['extracted_text']) || empty($ocrData['extracted_text'])) {
                Log::warning('No text extracted from image');

                return response()->json(['error' => 'No text could be extracted from the image. Please try a clearer image.'], 400);
            }

            $extractedText = $ocrData['extracted_text'];
            $apiKey = config('services.gemini.key');

            if (empty($apiKey)) {
                return response()->json(['error' => 'AI processing service is not configured.'], 503);
            }

            $model = config('services.gemini.model', 'gemini-2.0-flash');
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "Analyze this raw text extracted from an internship screenshot. Fix any OCR typos, extract the core details, and output 5 short, single-sentence interview questions:\n\n" . $extractedText],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                    'response_schema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'company_name' => ['type' => 'STRING'],
                            'company_email' => ['type' => 'STRING'],
                            'position' => ['type' => 'STRING'],
                            'location' => ['type' => 'STRING'],
                            'duration' => ['type' => 'STRING'],
                            'is_paid' => ['type' => 'BOOLEAN'],
                            'interview_questions' => [
                                'type' => 'ARRAY',
                                'items' => ['type' => 'STRING'],
                            ],
                        ],
                        'required' => ['company_name', 'interview_questions'],
                    ],
                ],
            ];

            try {
                $geminiResponse = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'x-goog-api-key' => $apiKey,
                ])->timeout((int) config('services.gemini.timeout', 30))->post($endpoint, $payload);

                if ($geminiResponse->failed()) {
                    Log::error('Gemini API Error Body: ' . $geminiResponse->body());
                }
            } catch (\Exception $e) {
                Log::warning('Gemini API Connection Failed: ' . $e->getMessage());

                return response()->json(['error' => 'AI processing service is unavailable. Please try again later.'], 503);
            }

            if ($geminiResponse->failed()) {
                Log::warning('Gemini API Error: ' . $geminiResponse->body());

                return response()->json(['error' => 'Failed to process extracted text with AI service.'], 500);
            }

            $geminiData = $geminiResponse->json();
            $parsedData = $geminiData['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$parsedData) {
                Log::warning('No data returned from Gemini');

                return response()->json(['error' => 'Failed to extract internship details from the image.'], 500);
            }

            $decoded = json_decode($parsedData, true);

            if (!is_array($decoded)) {
                Log::warning('Gemini returned non-JSON payload');

                return response()->json(['error' => 'AI returned an unexpected payload.'], 500);
            }

            if ($user) {
                $user->forceFill([
                    'ai_ocr_uses' => (int) $user->ai_ocr_uses + 1,
                    'ai_ocr_used_at' => now(),
                ])->saveQuietly();
            }

            return response()->json([
                'success' => true,
                'message' => 'Image processed successfully!',
                'data' => $decoded,
            ], 200);
        } catch (\Exception $e) {
            Log::critical('Gateway Failure: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json(['error' => 'An unexpected server error occurred. Please try again.'], 500);
        }
    }
}
