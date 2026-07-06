<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $resumeMatchLimit = (int) config('services.ai.resume_match_lifetime_limit', 1);
        $ocrLimit = (int) config('services.ai.ocr_lifetime_limit', 1);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'ai' => [
                'ocrEnabled' => (bool) config('services.ai.ocr_enabled'),
                'resumeMatchRemaining' => $user
                    ? max(0, $resumeMatchLimit - (int) $user->ai_resume_match_uses)
                    : 0,
                'ocrRemaining' => $user
                    ? max(0, $ocrLimit - (int) $user->ai_ocr_uses)
                    : 0,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
