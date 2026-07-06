import React, { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { UploadCloud, Sparkles, CheckCircle, AlertTriangle, RefreshCw, TrendingUp, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { Internship, ResumeMatchResult } from '../../types/internship';
import { PageProps } from '../../types';

interface ResumeMatcherTabProps {
    internship: Internship;
}

export default function ResumeMatcherTab({ internship }: ResumeMatcherTabProps) {
    const { ai } = usePage<PageProps>().props;
    const resumeMatchRemaining = ai?.resumeMatchRemaining ?? 0;
    const canAnalyze = resumeMatchRemaining > 0;
    const resumeAssets = useMemo(
        () => (internship.assets || []).filter((asset) => asset.asset_type === 'resume'),
        [internship.assets],
    );
    const [resumeSource, setResumeSource] = useState<'upload' | 'asset' | 'text'>('upload');
    const [resumeText, setResumeText] = useState('');
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ResumeMatchResult | null>(internship.resume_match_result || null);
    const [analyzedAt, setAnalyzedAt] = useState<string | null>(internship.resume_match_analyzed_at);

    useEffect(() => {
        setResult(internship.resume_match_result || null);
        setAnalyzedAt(internship.resume_match_analyzed_at);
        setResumeSource('upload');
        setResumeText('');
        setFileName('');
        setSelectedFile(null);
        setSelectedAssetId('');
    }, [internship.id, internship.resume_match_result, internship.resume_match_analyzed_at]);

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const reloadInternships = () => {
        router.reload();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setSelectedFile(file);

        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            const text = await file.text();
            setResumeText(text);
            return;
        }

        toast.info('Uploaded file selected. It will be sent securely for Gemini analysis.');
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canAnalyze) {
            toast.error('You have used your lifetime AI resume analysis allowance.');
            return;
        }

        if (resumeSource === 'upload' && !selectedFile && !resumeText.trim()) {
            toast.error('Upload a resume file or paste extracted resume text before analyzing.');
            return;
        }

        if (resumeSource === 'asset' && !selectedAssetId) {
            toast.error('Choose a saved resume asset before analyzing.');
            return;
        }

        if (resumeSource === 'text' && !resumeText.trim()) {
            toast.error('Paste resume text before analyzing.');
            return;
        }

        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append('resume_source', resumeSource);

        if (resumeText.trim()) {
            formData.append('resume_text', resumeText.trim());
        }

        if (resumeSource === 'upload' && selectedFile) {
            formData.append('file', selectedFile);
            formData.append('file_name', selectedFile.name);
        }

        if (resumeSource === 'asset') {
            formData.append('asset_id', selectedAssetId);
        }

        const response = await fetch(route('resume_match.store', internship.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
            body: formData,
        });

        setIsAnalyzing(false);

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            toast.error(payload?.error || 'Resume analysis failed.');
            return;
        }

        const payload = await response.json();
        const nextResult = payload?.data?.result as ResumeMatchResult | undefined;

        if (nextResult) {
            setResult(nextResult);
            setAnalyzedAt(payload?.data?.analyzed_at || new Date().toISOString());
        }

        toast.success('Resume alignment report generated.');
        reloadInternships();
    };

    const handleReset = () => {
        setResumeText('');
        setFileName('');
        setSelectedFile(null);
        setSelectedAssetId('');
        setResult(null);
        setAnalyzedAt(null);
        toast.info('Cleared resume analyzer draft.');
    };

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = result ? circumference - (result.score / 100) * circumference : circumference;

    const scoreState = useMemo(() => {
        if (!result) return 'Needs Optimization';
        if (result.score >= 80) return 'Strong Alignment';
        if (result.score >= 60) return 'Moderate Alignment';
        return 'Needs Optimization';
    }, [result]);

    const getScoreColorClass = (score: number) => {
        if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
        if (score >= 60) return 'text-amber-500 stroke-amber-500';
        return 'text-rose-500 stroke-rose-500';
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            <div className={`rounded-xl border px-4 py-3 text-xs ${canAnalyze ? 'border-indigo-200 bg-indigo-50/60 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300' : 'border-amber-200 bg-amber-50/60 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                {canAnalyze
                    ? `${resumeMatchRemaining} lifetime AI resume ${resumeMatchRemaining === 1 ? 'analysis' : 'analyses'} remaining.`
                    : 'You have used your lifetime AI resume analysis allowance.'}
            </div>

            {!result ? (
                <form onSubmit={handleAnalyze} className="space-y-5">
                    <div className="grid grid-cols-3 gap-2">
                        {(['upload', 'asset', 'text'] as const).map((source) => (
                            <button
                                key={source}
                                type="button"
                                onClick={() => setResumeSource(source)}
                                className={`rounded-lg border px-3 py-2 text-[11px] font-bold capitalize transition-colors ${
                                    resumeSource === source
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                        : 'border-gray-250 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900'
                                }`}
                            >
                                {source === 'asset' ? 'Saved asset' : source}
                            </button>
                        ))}
                    </div>

                    {resumeSource === 'upload' && (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/20 p-6 text-center hover:bg-gray-50/50 dark:hover:bg-gray-950/10 transition-colors relative">
                            <input
                                type="file"
                                accept=".txt,.md,.pdf,.docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            <div className="flex flex-col items-center justify-center space-y-2.5">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-650 dark:text-indigo-400">
                                    <UploadCloud className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {fileName ? `Selected file: ${fileName}` : 'Upload Resume Document'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        PDF, DOCX, TXT, or Markdown resumes can be analyzed with Gemini.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {resumeSource === 'asset' && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">Saved Resume Asset</label>
                            <select
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                                className="w-full rounded-xl border border-gray-250 bg-white p-3 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            >
                                <option value="">Choose a saved resume</option>
                                {resumeAssets.map((asset) => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.label}{asset.file_name ? ` - ${asset.file_name}` : ''}
                                    </option>
                                ))}
                            </select>
                            {resumeAssets.length === 0 && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                    Add a resume in Application Assets first, or switch to upload.
                                </p>
                            )}
                        </div>
                    )}

                    {(resumeSource === 'text' || resumeSource === 'upload') && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">
                                {resumeSource === 'upload' ? 'Optional Extracted Text' : 'Resume Contents'}
                            </label>
                            <textarea
                                className="w-full text-xs rounded-xl border border-gray-250 bg-white p-3 shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                placeholder="Paste resume text to improve analysis..."
                                rows={resumeSource === 'upload' ? 4 : 8}
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isAnalyzing || !canAnalyze}
                        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-750 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isAnalyzing ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Scanning & compiling alignment metrics...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span>Analyze Job-to-Resume Alignment</span>
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/40 p-5 dark:bg-gray-950/10 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle cx="40" cy="40" r={radius} className="stroke-gray-200 dark:stroke-gray-800" strokeWidth="6" fill="transparent" />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={radius}
                                        className={`transition-all duration-1000 ${getScoreColorClass(result.score)}`}
                                        strokeWidth="6"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                        {result.score}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Match score</h4>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                    {scoreState}
                                </p>
                                <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                                    Comparison with <span className="font-semibold text-indigo-650 dark:text-indigo-400">{internship.position}</span>.
                                </p>
                                {result.summary && (
                                    <p className="text-[11px] text-gray-600 dark:text-gray-350 mt-2 max-w-md leading-relaxed">
                                        {result.summary}
                                    </p>
                                )}
                                {analyzedAt && (
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Last analyzed {new Date(analyzedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-250 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-350 dark:hover:bg-gray-850"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Re-analyze</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                            <ListTodo className="h-3.5 w-3.5 mr-1" />
                            Core Keyword Comparison
                        </h4>

                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/10 p-3.5 dark:border-emerald-950/20 dark:bg-emerald-950/5">
                                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Matched ({result.matchedKeywords.length})
                                </span>
                                {result.matchedKeywords.length === 0 ? (
                                    <span className="text-[11px] text-gray-400">None detected</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.matchedKeywords.map((k) => (
                                            <span key={k} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-150/20">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-amber-100 bg-amber-50/10 p-3.5 dark:border-amber-955/20 dark:bg-amber-955/5">
                                <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400 block mb-2 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Missing ({result.missingKeywords.length})
                                </span>
                                {result.missingKeywords.length === 0 ? (
                                    <span className="text-[11px] text-emerald-600 font-semibold">Perfect keyword alignment!</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.missingKeywords.map((k) => (
                                            <span key={k} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-150/20">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-150 bg-white p-4 dark:border-gray-850 dark:bg-gray-900/50">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 block mb-2 flex items-center">
                                <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                Resume High Points
                            </span>
                            <ul className="space-y-2">
                                {result.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start space-x-2 text-xs leading-relaxed text-gray-700 dark:text-gray-350">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-xl border border-indigo-150 bg-indigo-50/5 p-4 dark:border-indigo-950/10">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-650 dark:text-indigo-400 block mb-2 flex items-center">
                                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                                Match Optimization Roadmap
                            </span>

                            <ul className="space-y-2.5">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start space-x-2 text-xs leading-relaxed text-gray-700 dark:text-gray-350">
                                        <span className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] font-bold flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5 font-medium">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
