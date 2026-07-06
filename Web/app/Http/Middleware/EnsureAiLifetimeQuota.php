<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAiLifetimeQuota
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required.'], 401);
        }

        $limit = match ($feature) {
            'resume_match' => (int) config('services.ai.resume_match_lifetime_limit', 1),
            'ocr' => (int) config('services.ai.ocr_lifetime_limit', 1),
            default => 0,
        };

        $uses = match ($feature) {
            'resume_match' => (int) $user->ai_resume_match_uses,
            'ocr' => (int) $user->ai_ocr_uses,
            default => 0,
        };

        if ($uses >= $limit) {
            $message = match ($feature) {
                'resume_match' => 'You have used your lifetime AI resume analysis allowance.',
                'ocr' => 'You have used your lifetime AI screenshot extraction allowance.',
                default => 'AI feature quota exceeded.',
            };

            return response()->json(['error' => $message], 429);
        }

        return $next($request);
    }
}
