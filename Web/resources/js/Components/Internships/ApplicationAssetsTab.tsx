import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Link2, Copy, ExternalLink, FileText, Terminal, Briefcase, Plus, Trash2, Edit2, Check, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationAsset, Internship, ApplicationAssetStatus } from '../../types/internship';

interface ApplicationAssetsTabProps {
    internship: Internship;
}

const EMPTY_ASSET = {
    label: '',
    assetType: 'custom',
    assetKind: 'link',
    status: 'not_added' as ApplicationAssetStatus,
    url: '',
};

export default function ApplicationAssetsTab({ internship }: ApplicationAssetsTabProps) {
    const [assets, setAssets] = useState<ApplicationAsset[]>(internship.assets || []);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
    const [draft, setDraft] = useState(EMPTY_ASSET);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setAssets(internship.assets || []);
        setShowCreateForm(false);
        setEditingAssetId(null);
        setDraft(EMPTY_ASSET);
        setSelectedFile(null);
    }, [internship.id, internship.assets]);

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const reloadInternships = () => {
        router.reload();
    };

    const startEdit = (asset: ApplicationAsset) => {
        setEditingAssetId(asset.id);
        setDraft({
            label: asset.label,
            assetType: asset.asset_type,
            assetKind: asset.asset_kind,
            status: asset.status,
            url: asset.url || '',
        });
        setSelectedFile(null);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('label', draft.label.trim());
        formData.append('asset_type', draft.assetType);
        formData.append('asset_kind', draft.assetKind);
        formData.append('status', draft.status);

        if (draft.url.trim()) {
            formData.append('url', draft.url.trim());
        }

        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        const response = await fetch(route('application_assets.store', internship.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            toast.error('Failed to add asset.');
            return;
        }

        toast.success('Asset added successfully.');
        setDraft(EMPTY_ASSET);
        setSelectedFile(null);
        setShowCreateForm(false);
        reloadInternships();
    };

    const handleUpdate = async (assetId: number) => {
        const response = await fetch(route('application_assets.update', [internship.id, assetId]), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                label: draft.label.trim(),
                asset_type: draft.assetType,
                status: draft.status,
                url: draft.url.trim() || null,
            }),
        });

        if (!response.ok) {
            toast.error('Failed to update asset.');
            return;
        }

        toast.success('Asset updated successfully.');
        setEditingAssetId(null);
        reloadInternships();
    };

    const handleDelete = async (assetId: number) => {
        if (!confirm('Delete this asset?')) return;

        const response = await fetch(route('application_assets.delete', [internship.id, assetId]), {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
        });

        if (!response.ok && response.status !== 204) {
            toast.error('Failed to delete asset.');
            return;
        }

        toast.success('Asset deleted.');
        reloadInternships();
    };

    const handleCopyLink = async (url: string | null) => {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        toast.success('Asset link copied to clipboard.');
    };

    const getAssetIcon = (type: string) => {
        switch (type) {
            case 'github':
                return <Terminal className="h-4.5 w-4.5 text-gray-700 dark:text-gray-300" />;
            case 'linkedin':
                return <Briefcase className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />;
            default:
                return <FileText className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-455" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Application assets</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Store links and uploaded files against this internship.</p>
                </div>

                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-755"
                    >
                        <Plus className="h-4 w-4 mr-0.5" />
                        Add asset
                    </button>
                )}
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreate} className="rounded-xl border border-indigo-150 p-4 bg-indigo-50/15 dark:border-indigo-900/40 dark:bg-indigo-950/10 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Label</label>
                            <input
                                type="text"
                                required
                                value={draft.label}
                                onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                placeholder="e.g. Resume Draft"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Asset type</label>
                            <select
                                value={draft.assetType}
                                onChange={(e) => setDraft((prev) => ({ ...prev, assetType: e.target.value }))}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="resume">Resume</option>
                                <option value="cover_letter">Cover Letter</option>
                                <option value="portfolio">Portfolio</option>
                                <option value="github">GitHub</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Asset kind</label>
                            <select
                                value={draft.assetKind}
                                onChange={(e) => setDraft((prev) => ({ ...prev, assetKind: e.target.value as 'link' | 'file' }))}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="link">Link</option>
                                <option value="file">File</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={draft.status}
                                onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as ApplicationAssetStatus }))}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="not_added">Not added</option>
                                <option value="drafting">Drafting</option>
                                <option value="ready">Ready</option>
                                <option value="submitted">Submitted</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">URL or storage preview</label>
                        <input
                            type="url"
                            value={draft.url}
                            onChange={(e) => setDraft((prev) => ({ ...prev, url: e.target.value }))}
                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    {draft.assetKind === 'file' && (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                <UploadCloud className="h-4 w-4" />
                                {selectedFile ? selectedFile.name : 'Choose a PDF, DOC, or DOCX file'}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="sr-only"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-505 hover:bg-gray-100 dark:hover:bg-gray-850"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-650 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-indigo-755"
                        >
                            Save asset
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 gap-3">
                {assets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                        No assets stored for this application yet.
                    </div>
                ) : assets.map((asset) => {
                    const isEditing = editingAssetId === asset.id;

                    return (
                        <div key={asset.id} className="rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900/50 p-4">
                            {isEditing ? (
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <input
                                            type="text"
                                            value={draft.label}
                                            onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))}
                                            className="text-xs font-bold text-gray-950 dark:text-white border-b border-gray-300 dark:border-gray-700 bg-transparent py-0.5 focus:outline-none focus:border-indigo-500 flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleUpdate(asset.id)}
                                            className="p-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <input
                                        type="url"
                                        value={draft.url}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, url: e.target.value }))}
                                        className="block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                    />

                                    <select
                                        value={draft.status}
                                        onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as ApplicationAssetStatus }))}
                                        className="block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                    >
                                        <option value="not_added">Not added</option>
                                        <option value="drafting">Drafting</option>
                                        <option value="ready">Ready</option>
                                        <option value="submitted">Submitted</option>
                                    </select>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setEditingAssetId(null)}
                                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start space-x-3.5 min-w-0">
                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/80 border border-gray-150 dark:border-gray-850 shrink-0">
                                            {getAssetIcon(asset.asset_type)}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                    {asset.label}
                                                </h5>
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                                    {asset.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-1 truncate max-w-[280px]">
                                                {asset.url ? (
                                                    <a
                                                        href={asset.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center"
                                                    >
                                                        <Link2 className="h-3 w-3 mr-0.5 shrink-0" />
                                                        {asset.asset_kind === 'file' ? asset.file_name || asset.url : asset.url}
                                                    </a>
                                                ) : (
                                                    'No URL linked yet'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                                        {asset.url && (
                                            <>
                                                <button
                                                    onClick={() => handleCopyLink(asset.url)}
                                                    className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 transition-colors"
                                                    title="Copy link"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 transition-colors"
                                                    title="Open in new tab"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </>
                                        )}
                                        <button
                                            onClick={() => startEdit(asset)}
                                            className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 transition-colors"
                                            title="Edit details"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 transition-colors"
                                            title="Delete asset"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
