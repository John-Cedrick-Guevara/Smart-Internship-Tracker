<?php

use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
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
});

require __DIR__ . '/auth.php';
