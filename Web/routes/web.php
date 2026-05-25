<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\InternshipOcrController;
use App\Http\Controllers\ApplicationAssetController;
use App\Http\Controllers\InterviewQuestionController;
use App\Http\Controllers\ResumeMatchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use Illuminate\Http\Request;
use App\Models\InterviewQuestion;

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    
    $totalApplications = $user->internships()->count();
    
    $totalQuestions = InterviewQuestion::whereHas('internship', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->count();

    $stageCounts = $user->internships()
        ->selectRaw('status, count(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();

    $stages = [
        'wishlist' => $stageCounts['wishlist'] ?? 0,
        'applied' => $stageCounts['applied'] ?? 0,
        'interviewing' => $stageCounts['interviewing'] ?? 0,
        'offer' => $stageCounts['offer'] ?? 0,
        'rejected' => $stageCounts['rejected'] ?? 0,
    ];

    $totalFollowups = $stages['applied'];

    $recentApplications = $user->internships()
        ->latest()
        ->limit(5)
        ->get();

    return Inertia::render('Dashboard', [
        'dashboardStats' => [
            'applications' => $totalApplications,
            'questions' => $totalQuestions,
            'followups' => $totalFollowups,
        ],
        'stages' => $stages,
        'recentApplications' => $recentApplications,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Internship routes
    Route::get('/internships', [\App\Http\Controllers\InternshipController::class, 'list'])->name('internships.list');
    Route::post('/internships', [\App\Http\Controllers\InternshipController::class, 'addInternship'])->name('internships.add');
    Route::get('/internships/{internship}', [\App\Http\Controllers\InternshipController::class, 'index'])->name('internships.index');
    Route::put('/internships/{internship}', [\App\Http\Controllers\InternshipController::class, 'updateInternship'])->name('internships.update');
    Route::delete('/internships/{internship}', [\App\Http\Controllers\InternshipController::class, 'deleteInternship'])->name('internships.delete');

    // Notes routes
    Route::get('/internships/{internship}/notes', [\App\Http\Controllers\NoteController::class, 'index'])->name('notes.index');
    Route::post('/internships/{internship}/notes', [\App\Http\Controllers\NoteController::class, 'addNote'])->name('notes.add');
    Route::delete('/internships/{internship}/notes/{note}', [\App\Http\Controllers\NoteController::class, 'deleteNote'])->name('notes.delete');

    // Timeline routes
    Route::get('/internships/{internship}/timeline', [\App\Http\Controllers\TimelineController::class, 'index'])->name('timeline.index');
    Route::post('/internships/{internship}/timeline', [\App\Http\Controllers\TimelineController::class, 'addTimelineEvent'])->name('timeline.add');
    Route::delete('/internships/{internship}/timeline/{timeline_event}', [\App\Http\Controllers\TimelineController::class, 'deleteTimelineEvent'])->name('timeline.delete');

    // OCR route for processing internship screenshots
    Route::post('/internship/extract', [InternshipOcrController::class, 'processScreenshot'])->name('internships.extract');
    Route::post('/internships/{internship}/extract', [InternshipOcrController::class, 'processScreenshot'])->name('internships.extract.scoped');

    Route::prefix('/internships/{internship}')->group(function () {
        Route::get('/interview-questions', [InterviewQuestionController::class, 'index'])->name('interview_questions.index');
        Route::post('/interview-questions', [InterviewQuestionController::class, 'store'])->name('interview_questions.store');
        Route::patch('/interview-questions/{question}', [InterviewQuestionController::class, 'update'])->name('interview_questions.update');
        Route::delete('/interview-questions/{question}', [InterviewQuestionController::class, 'destroy'])->name('interview_questions.delete');

        Route::get('/assets', [ApplicationAssetController::class, 'index'])->name('application_assets.index');
        Route::post('/assets', [ApplicationAssetController::class, 'store'])->name('application_assets.store');
        Route::patch('/assets/{asset}', [ApplicationAssetController::class, 'update'])->name('application_assets.update');
        Route::delete('/assets/{asset}', [ApplicationAssetController::class, 'destroy'])->name('application_assets.delete');

        Route::get('/resume-match', [ResumeMatchController::class, 'show'])->name('resume_match.show');
        Route::post('/resume-match', [ResumeMatchController::class, 'store'])->name('resume_match.store');
    });
});

require __DIR__ . '/auth.php';
