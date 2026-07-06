<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InterviewQuestionController extends Controller
{
    private function ownedInternship(Request $request)
    {
        return $request->user()->internships()->findOrFail($request->route('internship'));
    }

    public function index(Request $request)
    {
        $internship = $this->ownedInternship($request);

        return response()->json([
            'success' => true,
            'data' => $internship->interviewQuestions()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $internship = $this->ownedInternship($request);

        $validated = $request->validate([
            'question' => 'required|string|max:2000',
            'category' => 'nullable|in:Technical,Behavioral,General',
            'strategic_tip' => 'nullable|string|max:5000',
            'talking_points' => 'nullable|array',
            'talking_points.*' => 'string|max:1000',
            'is_practiced' => 'nullable|boolean',
            'answer_notes' => 'nullable|string|max:5000',
            'source' => 'nullable|string|max:255',
        ]);

        try {
            $question = $internship->interviewQuestions()->create([
                'question' => $validated['question'],
                'category' => $validated['category'] ?? 'General',
                'strategic_tip' => $validated['strategic_tip'] ?? null,
                'talking_points' => $validated['talking_points'] ?? null,
                'is_practiced' => $validated['is_practiced'] ?? false,
                'answer_notes' => $validated['answer_notes'] ?? null,
                'source' => $validated['source'] ?? 'manual',
            ]);

            $internship->markActivity();

            return response()->json(['success' => true, 'data' => $question], 201);
        } catch (\Throwable $e) {
            Log::error('Failed to store interview question: ' . $e->getMessage());

            return response()->json(['error' => 'Failed to store interview question.'], 500);
        }
    }

    public function update(Request $request)
    {
        $internship = $this->ownedInternship($request);
        $question = $internship->interviewQuestions()->findOrFail($request->route('question'));

        $validated = $request->validate([
            'question' => 'sometimes|required|string|max:2000',
            'category' => 'sometimes|required|in:Technical,Behavioral,General',
            'strategic_tip' => 'nullable|string|max:5000',
            'talking_points' => 'nullable|array',
            'talking_points.*' => 'string|max:1000',
            'is_practiced' => 'sometimes|boolean',
            'answer_notes' => 'nullable|string|max:5000',
        ]);

        $question->update($validated);
        $internship->markActivity();

        return response()->json([
            'success' => true,
            'data' => $question->fresh(),
        ]);
    }

    public function destroy(Request $request)
    {
        $internship = $this->ownedInternship($request);
        $question = $internship->interviewQuestions()->findOrFail($request->route('question'));
        $question->delete();
        $internship->markActivity();

        return response()->json(null, 204);
    }
}
