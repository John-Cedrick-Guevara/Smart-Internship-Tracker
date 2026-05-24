<?php

namespace App\Http\Controllers;

use App\Models\Internship;
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

        set_time_limit(120); // Give the local VPS OCR model time to process tokens

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        try {
            $file = $request->file('image');

            // --- STEP 1: Send Image to FastAPI service for OCR ---
            $fastAPIUrl = 'http://127.0.0.1:8001/extract-text/';

            try {
                $ocrResponse = Http::timeout(60)->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )->post($fastAPIUrl);
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
            Log::info('OCR Response received successfully');

            if (!isset($ocrData['extracted_text']) || empty($ocrData['extracted_text'])) {
                Log::warning('No text extracted from image');
                return response()->json(['error' => 'No text could be extracted from the image. Please try a clearer image.'], 400);
            }

            $extractedText = $ocrData['extracted_text'];

            $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' . env('GEMINI_API_KEY');

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "Analyze this raw text extracted from an internship screenshot. Fix any OCR typos, extract the core details, and output 5 short, single-sentence interview questions:\n\n" . $extractedText]
                        ]
                    ]
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
                                'items' => ['type' => 'STRING']
                            ]
                        ],
                        'required' => ['company_name', 'interview_questions'] // Optional: ensures they exist
                    ]
                ]
            ];

            try {
                $geminiResponse = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(30)->post($geminiUrl, $payload);

                // DEBUG: If it fails, log the actual error message from Google
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

            // Attempt to parse the structured JSON returned by Gemini
            $decoded = json_decode($parsedData, true);

            if (!is_array($decoded)) {
                Log::warning('Gemini returned non-JSON payload');
                return response()->json(['error' => 'AI returned an unexpected payload.'], 500);
            }

            $routeInternship = $request->route('internship');
            $internship = null;

            if ($routeInternship instanceof Internship) {
                $internship = $routeInternship;
            } elseif (!empty($routeInternship)) {
                $internship = $request->user()->internships()->find($routeInternship);
            }

            // Persist interview questions if present and an internship context exists
            if ($internship instanceof Internship && !empty($decoded['interview_questions']) && is_array($decoded['interview_questions'])) {
                try {
                    foreach ($decoded['interview_questions'] as $q) {
                        if (empty($q)) {
                            continue;
                        }
                        $internship->interviewQuestions()->create([
                            'question' => (string) $q,
                            'category' => 'General',
                            'source' => 'ocr_gateway',
                        ]);
                    }
                    $internship->markActivity();
                } catch (\Exception $e) {
                    Log::error('Failed saving interview questions: ' . $e->getMessage());
                }
            }

            // Return success with parsed data
            return response()->json([
                'success' => true,
                'message' => 'Image processed successfully!',
                'data' => $decoded
            ], 200);
        } catch (\Exception $e) {
            Log::critical('Gateway Failure: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'An unexpected server error occurred. Please try again.'], 500);
        }
    }
}
