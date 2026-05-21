<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TimelineController extends Controller
{
    //
    public function index(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Timeline events retrieved successfully!');
        }
        return response()->json($internship->timeline);
    }

    public function addTimelineEvent(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'event' => 'required|string|max:255',
            'reminder' => 'nullable|string|max:255',
        ]);

        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $timelineEvent = $internship->timeline()->create($validated);
        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Timeline event added successfully!');
        }
        return response()->json($timelineEvent, 201);
    }

    public function deleteTimelineEvent(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $timelineEvent = $internship->timeline()->findOrFail($request->route('timeline_event'));
        $timelineEvent->delete();

        // Handle Inertia requests
        if ($request->header('X-Inertia') || !$request->wantsJson()) {
            return redirect()->route('internships.list')->with('success', 'Timeline event deleted successfully!');
        }

        return response()->json(null, 204);
    }
}
