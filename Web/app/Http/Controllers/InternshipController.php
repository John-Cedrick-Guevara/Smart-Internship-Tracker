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

        $questionsToCreate = $questionPayload ?: $this->defaultInterviewQuestions($validated['position']);

        foreach ($questionsToCreate as $question) {
            if (is_string($question)) {
                $internship->interviewQuestions()->create([
                    'question' => $question,
                    'category' => 'General',
                    'source' => $questionPayload ? 'ocr_import' : 'seeded',
                ]);
                continue;
            }

            $internship->interviewQuestions()->create([
                'question' => $question['question'],
                'category' => $question['category'] ?? 'General',
                'strategic_tip' => $question['strategic_tip'] ?? null,
                'talking_points' => $question['talking_points'] ?? null,
                'source' => $question['source'] ?? ($questionPayload ? 'ocr_import' : 'seeded'),
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
        ]);

        $internship->update($validated);
        $internship->forceFill(['last_activity_at' => now()])->saveQuietly();

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Internship updated successfully!');
        }

        // Handle JSON API requests
        return response()->json($internship);
    }

    private function defaultInterviewQuestions(string $position): array
    {
        $role = strtolower($position);

        if (str_contains($role, 'front') || str_contains($role, 'react') || str_contains($role, 'ui') || str_contains($role, 'ux') || str_contains($role, 'design') || str_contains($role, 'client')) {
            return [
                [
                    'question' => 'How do you optimize the performance of a React application?',
                    'category' => 'Technical',
                    'strategic_tip' => 'Explain rendering cycles, memoization, and network loading assets.',
                    'talking_points' => [
                        'Mention memoization techniques using React.memo, useMemo, and useCallback to avoid unneeded renders.',
                        'Discuss code-splitting, lazy loading, and dynamic imports to reduce bundle sizes.',
                        'Explain rendering optimization: virtualization for long lists, key props, and state colocation.',
                        'Highlight image optimization, lazy loading non-critical resources, and asset compression/CDN delivery.',
                    ],
                ],
                [
                    'question' => 'What is your strategy for maintaining consistent state across complex React layouts?',
                    'category' => 'Technical',
                    'strategic_tip' => 'Contrast local state, context propagation, and global state libraries.',
                    'talking_points' => [
                        'Start with local state and state hoisting where appropriate.',
                        'Explain Context API for compound components and layouts without excessive prop drilling.',
                        'Discuss global state stores for cross-page communications and complex server data caching.',
                        'Mention data-fetching libraries for async server state and cache invalidation.',
                    ],
                ],
                [
                    'question' => 'Tell me about a time you had to balance a gorgeous design mockup with performance constraints.',
                    'category' => 'Behavioral',
                    'strategic_tip' => 'Showcase cross-functional collaboration and compromise.',
                    'talking_points' => [
                        'Detail the design spec and any heavy layout or animation constraints.',
                        'Explain the trade-offs discussed with designers and engineers.',
                        'Focus on outcomes: preserving fidelity while keeping core vitals strong.',
                    ],
                ],
                [
                    'question' => 'Why do you want to join our frontend team for this internship?',
                    'category' => 'General',
                    'strategic_tip' => 'Research the company product or site specifically.',
                    'talking_points' => [
                        'Reference specific features of their website or product.',
                        'Align your learning goals with the team’s tech stack.',
                        'Express excitement for learning from senior engineers and contributing to production design systems.',
                    ],
                ],
            ];
        }

        if (str_contains($role, 'back') || str_contains($role, 'laravel') || str_contains($role, 'php') || str_contains($role, 'api') || str_contains($role, 'server') || str_contains($role, 'database') || str_contains($role, 'sql')) {
            return [
                [
                    'question' => 'How would you design a high-throughput, secure RESTful API in PHP/Laravel?',
                    'category' => 'Technical',
                    'strategic_tip' => 'Focus on request lifecycle, middleware, security, and response caching.',
                    'talking_points' => [
                        'Discuss security: auth, CORS, rate limiting, and request validation.',
                        'Detail caching mechanisms for high-frequency queries.',
                        'Mention database optimization: eager loading and indexing.',
                        'Explain decoupling layers: controllers, services, and resources.',
                    ],
                ],
                [
                    'question' => 'Explain the difference between SQL and NoSQL databases, and how you choose between them.',
                    'category' => 'Technical',
                    'strategic_tip' => 'Focus on schema flexibility, relationship models, scaling capabilities, and transactions.',
                    'talking_points' => [
                        'SQL is relational with ACID compliance and strong joins.',
                        'NoSQL is dynamic and scales horizontally for certain workloads.',
                        'Choose SQL when relational data is dense; choose NoSQL for unstructured, rapid-growth data feeds.',
                    ],
                ],
                [
                    'question' => 'Describe a time when you had to debug a severe, silent performance bottleneck in production.',
                    'category' => 'Behavioral',
                    'strategic_tip' => 'Focus on your systematic diagnostic process and analytical thinking.',
                    'talking_points' => [
                        'Explain how you discovered the bottleneck.',
                        'Describe diagnostic steps and measurements.',
                        'Highlight the final resolution and impact.',
                    ],
                ],
                [
                    'question' => 'What trends or frameworks in backend development are you most excited to explore here?',
                    'category' => 'General',
                    'strategic_tip' => 'Connect your interests to current projects, database scaling, or serverless structures.',
                    'talking_points' => [
                        'Mention serverless computing, containerization, or queues.',
                        'Express interest in database optimizations and distributed systems.',
                        'Link these trends back to scale challenges and how you can support engineering pipelines.',
                    ],
                ],
            ];
        }

        return [
            [
                'question' => 'Tell me about a challenging technical or academic project and how you overcame obstacles.',
                'category' => 'Behavioral',
                'strategic_tip' => 'Use the STAR method with quantified impacts.',
                'talking_points' => [
                    'Situation: Outline the project context.',
                    'Task: Explain the core challenge.',
                    'Action: Detail your contributions.',
                    'Result: Highlight concrete metrics.',
                ],
            ],
            [
                'question' => 'How do you handle working with a teammate who has a different working style or opinion?',
                'category' => 'Behavioral',
                'strategic_tip' => 'Focus on empathy, active listening, and logical compromise.',
                'talking_points' => [
                    'Acknowledge that diverse opinions build healthier products.',
                    'Explain how you identify the real disagreement.',
                    'Detail the outcome and what changed.',
                ],
            ],
            [
                'question' => 'Explain a technical concept you learned recently to someone without an engineering background.',
                'category' => 'Technical',
                'strategic_tip' => 'Use clear analogies and avoid jargon.',
                'talking_points' => [
                    'Select a concept such as APIs, caching, or databases.',
                    'Walk through an analogy that maps to everyday experience.',
                    'Explain why clear communication matters.',
                ],
            ],
            [
                'question' => 'What is your primary goal for this internship, and how can we help you achieve it?',
                'category' => 'General',
                'strategic_tip' => 'Demonstrate initiative and willingness to absorb feedback.',
                'talking_points' => [
                    'Define one or two skills you want to master.',
                    'Express a desire to understand software development patterns.',
                    'Confirm your willingness to iterate on feedback.',
                ],
            ],
        ];
    }
}
