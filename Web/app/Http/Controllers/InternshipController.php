<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class InternshipController extends Controller
{
    // returns specific internship for the authenticated user
    public function index(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        return response()->json([
            'success' => true,
            'data' => $internship->load(['notes', 'timeline', 'interviewQuestions', 'assets']),
        ]);
    }

    // returns all internships for the authenticated user
    public function list(Request $request)
    {
        // 1. Fetch the data up front so it's available for both responses
        $internships = $request->user()->internships()->with(['notes', 'timeline', 'interviewQuestions', 'assets'])->latest()->get();

        // 2. Handle the Inertia Page view request
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return \Inertia\Inertia::render('Internships/Index', [
                'internships' => $internships //  Fixed: Data injected into your React props!
            ]);
        }

        // 3. Handle the JSON API response
        return response()->json($internships);
    }

    public function addInternship(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|email|max:255',
            'position' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'duration' => 'required|string|max:255',
            'url' => 'nullable|url|max:255',
            'status' => 'required|string|max:255',
            'is_paid' => 'required|boolean',
            'interview_questions' => 'nullable|array',
            'interview_questions.*' => 'string|max:2000',
        ]);

        $questionPayload = $validated['interview_questions'] ?? [];
        unset($validated['interview_questions']);

        $internship = $request->user()->internships()->create($validated);
        $internship->forceFill(['last_activity_at' => now()])->saveQuietly();

        foreach ($questionPayload as $question) {
            if (is_string($question)) {
                $internship->interviewQuestions()->create([
                    'question' => $question,
                    'category' => 'General',
                    'source' => 'ocr_import',
                ]);
                continue;
            }

            $internship->interviewQuestions()->create([
                'question' => $question['question'],
                'category' => $question['category'] ?? 'General',
                'strategic_tip' => $question['strategic_tip'] ?? null,
                'talking_points' => $question['talking_points'] ?? null,
                'source' => $question['source'] ?? 'ocr_import',
            ]);
        }

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Internship added successfully!');
        }

        // Handle JSON API requests
        return response()->json($internship, 201);
    }

    public function deleteInternship(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $internship->delete();

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Internship deleted successfully!');
        }

        // Handle JSON API requests
        return response()->json(null, 204);
    }

    public function updateInternship(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));

        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'company_email' => 'sometimes|required|email|max:255',
            'position' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|nullable|url|max:255',
            'status' => 'sometimes|required|string|max:255',
            'is_paid' => 'sometimes|required|boolean',
            'interview_questions' => 'nullable|array',
            'interview_questions.*' => 'string|max:2000',
        ]);

        $questionPayload = $validated['interview_questions'] ?? [];
        unset($validated['interview_questions']);

        $internship->update($validated);
        $internship->forceFill(['last_activity_at' => now()])->saveQuietly();

        foreach ($questionPayload as $question) {
            if (empty($question)) {
                continue;
            }

            $internship->interviewQuestions()->create([
                'question' => (string) $question,
                'category' => 'General',
                'source' => 'ocr_import',
            ]);
        }

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Internship updated successfully!');
        }

        // Handle JSON API requests
        return response()->json($internship);
    }
}
