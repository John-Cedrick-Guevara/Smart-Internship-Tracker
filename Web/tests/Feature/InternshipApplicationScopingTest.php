<?php

use App\Models\User;
use App\Models\Internship;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('creating an internship stores interview questions for that internship', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/internships', [
        'company_name' => 'Acme',
        'company_email' => 'hr@acme.test',
        'position' => 'Frontend Intern',
        'location' => 'Remote',
        'duration' => '3 months',
        'url' => 'https://acme.test/jobs/frontend-intern',
        'status' => 'wishlist',
        'is_paid' => true,
        'interview_questions' => [
            'What do you optimize first in a React application?',
            'Tell me about a time you balanced design and performance.',
        ],
    ]);

    $response->assertCreated();

    $internshipId = $response->json('id');

    $this->assertDatabaseHas('interview_questions', [
        'internship_id' => $internshipId,
        'question' => 'What do you optimize first in a React application?',
    ]);

    $this->assertDatabaseHas('internships', [
        'id' => $internshipId,
    ]);

    $this->assertNotNull(Internship::findOrFail($internshipId)->last_activity_at);

    $this->actingAs($user)
        ->getJson("/internships/{$internshipId}/interview-questions")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('application assets can be uploaded and stored on disk', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $internship = $user->internships()->create([
        'company_name' => 'Acme',
        'company_email' => 'hr@acme.test',
        'position' => 'Backend Intern',
        'location' => 'Remote',
        'duration' => '3 months',
        'status' => 'applied',
        'is_paid' => true,
    ]);

    $response = $this->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post("/internships/{$internship->id}/assets", [
        'label' => 'Resume Draft',
        'asset_type' => 'resume',
        'asset_kind' => 'file',
        'status' => 'drafting',
        'file' => UploadedFile::fake()->create('resume.pdf', 120, 'application/pdf'),
    ]);

    $response->assertCreated();

    $assetId = $response->json('data.id');
    $asset = $internship->assets()->findOrFail($assetId);

    Storage::disk('public')->assertExists($asset->file_path);
    $this->assertDatabaseHas('application_assets', [
        'id' => $assetId,
        'internship_id' => $internship->id,
        'label' => 'Resume Draft',
    ]);
    $this->assertNotNull($internship->fresh()->last_activity_at);
});

test('resume matcher proxy stores the latest result on the internship', function () {
    $user = User::factory()->create();
    $internship = $user->internships()->create([
        'company_name' => 'Acme',
        'company_email' => 'hr@acme.test',
        'position' => 'Backend Intern',
        'location' => 'Remote',
        'duration' => '3 months',
        'status' => 'applied',
        'is_paid' => true,
    ]);

    Config::set('services.resume_matcher.url', 'https://resume-matcher.test/analyze');
    Config::set('services.resume_matcher.timeout', 10);

    Http::fake([
        'https://resume-matcher.test/analyze' => Http::response([
            'data' => [
                'score' => 91,
                'matchedKeywords' => ['PHP', 'Laravel'],
                'missingKeywords' => ['Docker'],
                'strengths' => ['Strong backend foundation.'],
                'gaps' => ['No containerization mentioned.'],
                'recommendations' => ['Add Docker experience to the summary.'],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user)->postJson("/internships/{$internship->id}/resume-match", [
        'resume_text' => 'PHP Laravel MySQL Git problem solving',
        'file_name' => 'resume.pdf',
    ]);

    $response->assertOk()->assertJsonPath('data.result.score', 91);

    $fresh = $internship->fresh();
    expect($fresh->resume_match_result)->toBeArray();
    expect($fresh->resume_match_result['score'])->toBe(91);
    expect($fresh->resume_match_analyzed_at)->not->toBeNull();
    expect($fresh->last_activity_at)->not->toBeNull();
});
