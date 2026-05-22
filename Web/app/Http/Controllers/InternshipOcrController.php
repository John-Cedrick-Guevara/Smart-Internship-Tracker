<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InternshipOcrController extends Controller
{
    //
    public function processScreenshot(Request $request)
    {
        set_time_limit(300);
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:5120', // Max 5MB file size limit
        ]);

        try {
            $file = $request->file('image');

            $fastAPIUrl = env('FAST_API_URL', 'http://127.0.0.1:8001/api/v1/ocr/extract'); // Ensure this is set in your .env file


            $response = Http::timeout(300)->attach(
                'file',
                file_get_contents($file->getRealPath()), // Read the raw temporary image binary bytes
                $file->getClientOriginalName() // Pass along the original filename anchor string
            )->post($fastAPIUrl);

            // Handle structural communication network failure errors safely
            if ($response->failed()) {
                Log::error('FastAPI Connection Failure:', ['body' => $response->body()]);
                $payload = [
                    'success' => false,
                    'message' => 'The AI extraction engine is temporarily unavailable. Please try again later.',
                    'data' => null,
                ];

                if ($request->header('X-Inertia') || !$request->wantsJson()) {
                    $internships = $request->user()->internships()->with(['notes', 'timeline'])->latest()->get();
                    return Inertia::render('Internships/Index', [
                        'internships' => $internships,
                        'aiExtractedData' => $payload,
                    ]);
                }

                return response()->json([
                    'error' => $payload['message']
                ], 502);
            }

            //  Unpack the successfully parsed AI dictionary details layout
            $aiData = $response->json();

            $payload = [
                'success' => true,
                'message' => 'Internship details processed successfully!',
                'data' => $aiData,
            ];

            if ($request->header('X-Inertia') || !$request->wantsJson()) {
                $internships = $request->user()->internships()->with(['notes', 'timeline'])->latest()->get();
                return Inertia::render('Internships/Index', [
                    'internships' => $internships,
                    'aiExtractedData' => $payload,
                ]);
            }

            // Return a successful data block back to the waiting frontend UI view layout
            return response()->json($payload, 200);
        } catch (\Exception $e) {
            // Catch unforeseen application crash issues gracefully
            Log::critical('Laravel Gateway System Crash: ' . $e->getMessage());
            $payload = [
                'success' => false,
                'message' => 'An unexpected server error occurred while analyzing the image document.',
                'data' => null,
            ];

            if ($request->header('X-Inertia') || !$request->wantsJson()) {
                $internships = $request->user()->internships()->with(['notes', 'timeline'])->latest()->get();
                return Inertia::render('Internships/Index', [
                    'internships' => $internships,
                    'aiExtractedData' => $payload,
                ]);
            }

            return response()->json([
                'error' => $payload['message']
            ], 500);
        }
    }
}
