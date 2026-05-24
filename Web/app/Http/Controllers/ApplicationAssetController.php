<?php

namespace App\Http\Controllers;

use App\Models\ApplicationAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationAssetController extends Controller
{
    public function index(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));

        return response()->json([
            'success' => true,
            'data' => $internship->assets()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));

        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'asset_type' => 'required|string|max:50',
            'asset_kind' => 'required|in:link,file',
            'status' => 'required|in:not_added,drafting,ready,submitted',
            'url' => 'nullable|url|max:2048',
            'file' => 'nullable|file|max:10240',
        ]);

        $payload = [
            'label' => $validated['label'],
            'asset_type' => $validated['asset_type'],
            'asset_kind' => $validated['asset_kind'],
            'status' => $validated['status'],
            'url' => $validated['url'] ?? null,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store("internships/{$internship->id}/assets", 'public');

            $payload['asset_kind'] = 'file';
            $payload['status'] = $payload['status'] === 'not_added' ? 'drafting' : $payload['status'];
            $payload['file_name'] = $file->getClientOriginalName();
            $payload['file_path'] = $path;
            $payload['mime_type'] = $file->getMimeType();
            $payload['file_size'] = $file->getSize();
            $payload['url'] = Storage::disk('public')->url($path);
        }

        $asset = $internship->assets()->create($payload);
        $internship->markActivity();

        return response()->json([
            'success' => true,
            'data' => $asset,
        ], 201);
    }

    public function update(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $asset = $internship->assets()->findOrFail($request->route('asset'));

        $validated = $request->validate([
            'label' => 'sometimes|required|string|max:255',
            'asset_type' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|in:not_added,drafting,ready,submitted',
            'url' => 'nullable|url|max:2048',
        ]);

        $asset->update($validated);
        $internship->markActivity();

        return response()->json([
            'success' => true,
            'data' => $asset->fresh(),
        ]);
    }

    public function destroy(Request $request)
    {
        $internship = $request->user()->internships()->findOrFail($request->route('internship'));
        $asset = $internship->assets()->findOrFail($request->route('asset'));

        if ($asset->file_path) {
            Storage::disk('public')->delete($asset->file_path);
        }

        $asset->delete();
        $internship->markActivity();

        return response()->json(null, 204);
    }
}
