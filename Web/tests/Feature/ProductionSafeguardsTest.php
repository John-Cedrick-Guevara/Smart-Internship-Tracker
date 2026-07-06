<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('blocks resume match when lifetime quota is exhausted', function () {
    config([
        'services.gemini.key' => 'test-key',
        'services.ai.resume_match_lifetime_limit' => 1,
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'score' => 82,
                                    'summary' => 'Strong alignment.',
                                    'matchedKeywords' => ['Laravel'],
                                    'missingKeywords' => ['Docker'],
                                    'strengths' => ['Backend experience'],
                                    'gaps' => ['Containers'],
                                    'recommendations' => ['Add Docker project'],
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $user = User::factory()->create([
        'ai_resume_match_uses' => 1,
    ]);

    $internship = $user->internships()->create([
        'company_name' => 'Acme',
        'company_email' => 'hr@acme.test',
        'position' => 'Backend Intern',
        'location' => 'Remote',
        'duration' => '3 months',
        'status' => 'applied',
        'is_paid' => true,
    ]);

    $response = $this->actingAs($user)->postJson(route('resume_match.store', $internship), [
        'resume_source' => 'text',
        'resume_text' => 'Experienced Laravel developer with React and PostgreSQL experience.',
    ]);

    $response->assertStatus(429)
        ->assertJson([
            'error' => 'You have used your lifetime AI resume analysis allowance.',
        ]);
});

it('returns forbidden when ocr is disabled', function () {
    config([
        'services.ai.ocr_enabled' => false,
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('internships.extract'), [
        'image' => \Illuminate\Http\UploadedFile::fake()->create('listing.jpg', 100, 'image/jpeg'),
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'error' => 'Screenshot OCR is disabled in this environment.',
        ]);
});

it('prevents accessing interview questions for another users internship', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();

    $internship = $owner->internships()->create([
        'company_name' => 'Acme',
        'company_email' => 'hr@acme.test',
        'position' => 'Backend Intern',
        'location' => 'Remote',
        'duration' => '3 months',
        'status' => 'applied',
        'is_paid' => true,
    ]);

    $response = $this->actingAs($intruder)->getJson(route('interview_questions.index', $internship));

    $response->assertNotFound();
});
