<?php

namespace App\Http\Controllers;

use App\Models\InterviewQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InterviewQuestionController extends Controller
{
  // GET /interview-questions
  public function index(Request $request)
  {
    $perPage = (int) $request->get('per_page', 20);
    $questions = InterviewQuestion::orderBy('created_at', 'desc')->paginate($perPage);

    return response()->json([
      'success' => true,
      'data' => $questions,
    ], 200);
  }

  // POST /interview-questions
  public function store(Request $request)
  {
    $request->validate([
      'question' => 'required|string',
      'company_name' => 'nullable|string',
      'position' => 'nullable|string',
    ]);

    try {
      $q = InterviewQuestion::create([
        'question' => $request->input('question'),
        'company_name' => $request->input('company_name'),
        'position' => $request->input('position'),
        'source' => $request->ip(),
      ]);

      return response()->json(['success' => true, 'data' => $q], 201);
    } catch (\Exception $e) {
      Log::error('Failed to store interview question: ' . $e->getMessage());
      return response()->json(['error' => 'Failed to store interview question.'], 500);
    }
  }
}
