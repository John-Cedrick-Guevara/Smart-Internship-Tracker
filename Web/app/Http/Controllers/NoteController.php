<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NoteController extends Controller
{
    //
    public function index(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Notes retrieved successfully!');
        }

        return response()->json($internship->notes);
    }

    public function addNote(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $note = $internship->notes()->create($validated);
        $internship->markActivity();
        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Note added successfully!');
        }
        return response()->json($note, 201);
    }

    public function deleteNote(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $note = $internship->notes()->findOrFail($request->route('note'));
        $note->delete();
        $internship->markActivity();

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Internship deleted successfully!');
        }

        return response()->json(null, 204);
    }
}
