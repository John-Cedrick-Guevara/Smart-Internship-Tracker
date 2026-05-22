import React, { useState, useEffect } from 'react';
import { Internship } from '../../types/internship';
import { Link2, Copy, ExternalLink, FileText, Terminal, Briefcase, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationAssetsTabProps {
    internship: Internship;
}

interface Asset {
    id: string;
    label: string;
    url: string;
    status: 'not_added' | 'drafting' | 'ready' | 'submitted';
    type: 'resume' | 'cover_letter' | 'portfolio' | 'github' | 'linkedin' | 'custom';
}

const DEFAULT_ASSETS: Asset[] = [
    { id: '1', label: 'Resume Draft', url: '', status: 'not_added', type: 'resume' },
    { id: '2', label: 'Cover Letter', url: '', status: 'not_added', type: 'cover_letter' },
    { id: '3', label: 'Portfolio Link', url: '', status: 'not_added', type: 'portfolio' },
    { id: '4', label: 'GitHub Repository', url: '', status: 'not_added', type: 'github' },
    { id: '5', label: 'LinkedIn Profile', url: '', status: 'not_added', type: 'linkedin' }
];

export default function ApplicationAssetsTab({ internship }: ApplicationAssetsTabProps) {
    const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
    const [editUrl, setEditUrl] = useState('');
    const [editLabel, setEditLabel] = useState('');
    const [editStatus, setEditStatus] = useState<Asset['status']>('not_added');
    
    // Custom Asset Adder State
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customLabel, setCustomLabel] = useState('');
    const [customUrl, setCustomUrl] = useState('');

    // Load assets from localStorage keyed by internship ID
    useEffect(() => {
        try {
            const savedAssets = localStorage.getItem(`internship_assets_${internship.id}`);
            if (savedAssets) {
                setAssets(JSON.parse(savedAssets));
            } else {
                // Pre-fill links if internship object has URL or if there are generic settings
                setAssets(DEFAULT_ASSETS);
            }
        } catch (e) {
            console.error('Failed to load localStorage assets:', e);
        }
        setEditingAssetId(null);
        setShowAddCustom(false);
    }, [internship.id]);

    const saveAssets = (updated: Asset[]) => {
        setAssets(updated);
        localStorage.setItem(`internship_assets_${internship.id}`, JSON.stringify(updated));
    };

    const handleStartEdit = (asset: Asset) => {
        setEditingAssetId(asset.id);
        setEditUrl(asset.url);
        setEditLabel(asset.label);
        setEditStatus(asset.status);
    };

    const handleSaveEdit = (id: string) => {
        const urlToSave = editUrl.trim();
        // Automatically transition status to ready if a URL is supplied and was not_added
        let computedStatus = editStatus;
        if (urlToSave && editStatus === 'not_added') {
            computedStatus = 'ready';
        } else if (!urlToSave) {
            computedStatus = 'not_added';
        }

        const updated = assets.map(a => 
            a.id === id 
                ? { ...a, label: editLabel.trim() || a.label, url: urlToSave, status: computedStatus }
                : a
        );

        saveAssets(updated);
        setEditingAssetId(null);
        toast.success("Asset details updated successfully!");
    };

    const handleStatusChange = (id: string, status: Asset['status']) => {
        const updated = assets.map(a => 
            a.id === id ? { ...a, status } : a
        );
        saveAssets(updated);
        toast.success("Asset status updated!");
    };

    const handleAddCustomAsset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customLabel.trim()) return;

        const newAsset: Asset = {
            id: Date.now().toString(),
            label: customLabel.trim(),
            url: customUrl.trim(),
            status: customUrl.trim() ? 'ready' : 'not_added',
            type: 'custom'
        };

        const updated = [...assets, newAsset];
        saveAssets(updated);
        setCustomLabel('');
        setCustomUrl('');
        setShowAddCustom(false);
        toast.success("Custom asset added successfully!");
    };

    const handleDeleteAsset = (id: string) => {
        if (confirm("Are you sure you want to delete this custom asset?")) {
            const updated = assets.filter(a => a.id !== id);
            saveAssets(updated);
            toast.success("Asset deleted.");
        }
    };

    const handleCopyLink = (url: string) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        toast.success("Asset link copied to clipboard!");
    };

    const getStatusPillColor = (status: Asset['status']) => {
        switch (status) {
            case 'submitted':
                return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-150/30';
            case 'ready':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-150/30';
            case 'drafting':
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-150/30';
            default:
                return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-450 border-gray-200 dark:border-gray-750';
        }
    };

    const getAssetIcon = (type: Asset['type']) => {
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
            
            {/* Header section with add asset button */}
            <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
                    Linked Resources locker
                </h4>
                
                {!showAddCustom && (
                    <button
                        onClick={() => setShowAddCustom(true)}
                        className="inline-flex items-center text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-755"
                    >
                        <Plus className="h-4 w-4 mr-0.5" />
                        Add custom link
                    </button>
                )}
            </div>

            {/* Custom Asset adder form */}
            {showAddCustom && (
                <form onSubmit={handleAddCustomAsset} className="rounded-xl border border-indigo-150 p-4 bg-indigo-50/15 dark:border-indigo-900/40 dark:bg-indigo-950/10 space-y-3.5 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Resource Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Letter of Recommendation"
                                value={customLabel}
                                onChange={e => setCustomLabel(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">URL (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={customUrl}
                                onChange={e => setCustomUrl(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowAddCustom(false)}
                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-505 hover:bg-gray-100 dark:hover:bg-gray-850"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-650 px-3 py-1.5 text-[11px] font-semibold text-white shadow hover:bg-indigo-755"
                        >
                            Add Asset
                        </button>
                    </div>
                </form>
            )}

            {/* Assets Grid */}
            <div className="grid grid-cols-1 gap-3">
                {assets.map((asset) => {
                    const isEditing = editingAssetId === asset.id;

                    return (
                        <div 
                            key={asset.id}
                            className={`rounded-xl border p-4 transition-all duration-200 ${
                                isEditing 
                                    ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/5 dark:bg-indigo-950/5' 
                                    : 'border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900/50 hover:border-gray-250 dark:hover:border-gray-750'
                            }`}
                        >
                            {isEditing ? (
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            value={editLabel}
                                            onChange={e => setEditLabel(e.target.value)}
                                            className="text-xs font-bold text-gray-950 dark:text-white border-b border-gray-300 dark:border-gray-700 bg-transparent py-0.5 focus:outline-none focus:border-indigo-500"
                                        />
                                        
                                        <div className="flex items-center space-x-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(asset.id)}
                                                className="p-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200"
                                                title="Save Details"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingAssetId(null)}
                                                className="p-1 rounded bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                                                title="Cancel"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Resource link</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={editUrl}
                                            onChange={e => setEditUrl(e.target.value)}
                                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">State status</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(['not_added', 'drafting', 'ready', 'submitted'] as Asset['status'][]).map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setEditStatus(s)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize transition-all ${
                                                        editStatus === s
                                                            ? 'bg-indigo-650 border-indigo-650 text-white dark:bg-indigo-400 dark:border-indigo-400 dark:text-gray-900 shadow-sm'
                                                            : 'bg-white border-gray-250 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-750 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {s.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3.5 min-w-0">
                                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950/80 border border-gray-150 dark:border-gray-850 shrink-0">
                                            {getAssetIcon(asset.type)}
                                        </div>
                                        
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                                    {asset.label}
                                                </h5>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${getStatusPillColor(asset.status)}`}>
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
                                                        {asset.url}
                                                    </a>
                                                ) : (
                                                    'No URL linked yet'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
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
                                            onClick={() => handleStartEdit(asset)}
                                            className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 transition-colors"
                                            title="Edit details"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        {asset.type === 'custom' && (
                                            <button
                                                onClick={() => handleDeleteAsset(asset.id)}
                                                className="p-1 rounded text-gray-405 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 transition-colors"
                                                title="Delete custom resource"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
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
