import React, { useState } from 'react';
import { Internship, Note, TimelineEvent } from '../../types/internship';
import { Clock, FileText, HelpCircle, Sparkles, Mail, Paperclip, ArrowLeft, ChevronRight } from 'lucide-react';
import InterviewPrepTab from './InterviewPrepTab';
import ResumeMatcherTab from './ResumeMatcherTab';
import FollowUpCopilotTab from './FollowUpCopilotTab';
import ApplicationAssetsTab from './ApplicationAssetsTab';

interface DetailPanelProps {
    internship: Internship | null;
    onClose: () => void;
    onEdit: (internship: Internship) => void;
    onDelete: (id: number) => void;
    onAddNote: (id: number, title: string, content: string) => void;
    onDeleteNote: (internshipId: number, noteId: number) => void;
    onAddEvent: (id: number, date: string, event: string, reminder: string | null) => void;
    onDeleteEvent: (internshipId: number, eventId: number) => void;
}

export default function DetailPanel({
    internship,
    onClose,
    onEdit,
    onDelete,
    onAddNote,
    onDeleteNote,
    onAddEvent,
    onDeleteEvent
}: DetailPanelProps) {
    if (!internship) return null;

    // Note form state
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);

    // Event form state
    const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
    const [eventName, setEventName] = useState('');
    const [eventReminder, setEventReminder] = useState('');
    const [isAddingEvent, setIsAddingEvent] = useState(false);

    // Active detail tab ('hub' | 'timeline' | 'notes' | 'interview' | 'resume' | 'followup' | 'assets')
    const [activeTab, setActiveTab] = useState<'hub' | 'timeline' | 'notes' | 'interview' | 'resume' | 'followup' | 'assets'>('hub');

    const practicedCount = internship.interview_questions.filter(question => question.is_practiced).length;
    const resumeScore = internship.resume_match_result?.score ?? null;
    const assetsMetrics = {
        total: internship.assets.length,
        ready: internship.assets.filter(asset => asset.status === 'ready' || asset.status === 'submitted').length,
    };

    // Notes handlers
    const handleAddNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteTitle.trim()) return;
        onAddNote(internship.id, noteTitle, noteContent);
        setNoteTitle('');
        setNoteContent('');
        setIsAddingNote(false);
    };

    // Events handlers
    const handleAddEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName.trim()) return;
        onAddEvent(internship.id, eventDate, eventName, eventReminder || null);
        setEventName('');
        setEventReminder('');
        setIsAddingEvent(false);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'wishlist':
                return 'bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] text-[var(--muted-strong)]';
            case 'applied':
                return 'bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]';
            case 'interviewing':
                return 'bg-[color-mix(in_srgb,var(--accent-soft)_14%,transparent)] text-[var(--accent-soft)]';
            case 'offer':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'rejected':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-350';
            default:
                return 'bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] text-[var(--muted-strong)]';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* Dark Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                {/* Main panel container */}
                <div className="flex h-full w-screen max-w-xl flex-col border-l border-[var(--line)] bg-[var(--surface-strong)] shadow-2xl backdrop-blur-xl transition-transform duration-300 animate-slide-in">
                    
                    {/* Header */}
                    <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide mb-2 ${getStatusBadgeColor(internship.status)}`}>
                                    {internship.status}
                                </span>
                                <h2 className="text-2xl font-extrabold leading-snug text-[var(--text)]">
                                    {internship.position}
                                </h2>
                                <p className="mt-1 text-base font-semibold text-[var(--accent)]">
                                    {internship.company_name}
                                </p>
                            </div>
                            
                            <div className="ml-3 flex h-7 items-center space-x-2">
                                <button
                                    onClick={() => onEdit(internship)}
                                    className="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--text)]"
                                    title="Edit"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete this application?`)) {
                                            onDelete(internship.id);
                                        }
                                    }}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-655 dark:hover:bg-gray-850 dark:hover:text-red-400 transition-colors"
                                    title="Delete"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800 hover:text-gray-550 dark:hover:text-gray-300 transition-colors"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close panel</span>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeTab === 'hub' ? (
                            <>
                                {/* Info details grid */}
                                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-150 dark:border-gray-850 p-4 bg-gray-50/30 dark:bg-gray-950/10">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</span>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{internship.location}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duration</span>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{internship.duration || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Compensation</span>
                                        <div className="mt-1">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                                internship.is_paid 
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                            }`}>
                                                {internship.is_paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact Email</span>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 break-all">
                                            <a href={`mailto:${internship.company_email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                {internship.company_email}
                                            </a>
                                        </p>
                                    </div>
                                    {internship.url && (
                                        <div className="col-span-2 border-t border-gray-100 pt-3 dark:border-gray-800/80 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Job Listing URL</span>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                                                <a href={internship.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    <span>{internship.url}</span>
                                                    <svg className="ml-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Hub Playbooks Header */}
                                <div className="pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Application Workspace Tools</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Use these intelligent interactive playbooks to stand out and stay organized.</p>
                                </div>

                                {/* Tools Grid */}
                                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                    {/* Timeline Card */}
                                    <button
                                        onClick={() => setActiveTab('timeline')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-650 dark:group-hover:text-indigo-450 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                Timeline Milestones
                                            </h4>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                                                Log interview callbacks, tasks, and offers.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border border-slate-100 dark:border-slate-900/30">
                                                {internship.timeline.length} Milestones
                                            </span>
                                        </div>
                                    </button>

                                    {/* Notes Card */}
                                    <button
                                        onClick={() => setActiveTab('notes')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                Notes Ledger
                                            </h4>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                                                Review draft cheat sheets, notes, and records.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border border-slate-100 dark:border-slate-900/30">
                                                {internship.notes.length} Notes
                                            </span>
                                        </div>
                                    </button>

                                    {/* Interview Prep Card */}
                                    <button
                                        onClick={() => setActiveTab('interview')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <HelpCircle className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                AI Interview Prep
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Mock interview questions customized for your role.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                practicedCount > 0
                                                    ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-100 dark:border-slate-900/30'
                                                    : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-100 dark:border-slate-900/30'
                                            }`}>
                                                {practicedCount > 0 ? `${practicedCount} Mastered` : 'Not Started'}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Resume Match Card */}
                                    <button
                                        onClick={() => setActiveTab('resume')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                Resume Job Matcher
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Radial alignment scanner and keyword optimizations.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                resumeScore !== null
                                                    ? 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-100 dark:border-slate-900/30'
                                                    : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-100 dark:border-slate-900/30'
                                            }`}>
                                                {resumeScore !== null ? `${resumeScore}% Match` : 'Not Scanned'}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Follow-up Card */}
                                    <button
                                        onClick={() => setActiveTab('followup')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                Follow-up Copilot
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Check application staleness and draft tailored outreach.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            {(() => {
                                                const lastUpdated = new Date(internship.updated_at || internship.created_at).getTime();
                                                const daysStale = Math.floor((Date.now() - lastUpdated) / (1000 * 60 * 60 * 24));
                                                const isStale = daysStale >= 7 && (internship.status === 'applied' || internship.status === 'interviewing');
                                                return (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        isStale
                                                            ? 'bg-slate-50 text-slate-705 dark:bg-slate-950/30 dark:text-slate-400 border-slate-100 dark:border-slate-900/30 animate-pulse'
                                                            : 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-100 dark:border-slate-900/30'
                                                    }`}>
                                                        {isStale ? 'Action Recommended' : 'Up to Date'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </button>

                                    {/* Assets Card */}
                                    <button
                                        onClick={() => setActiveTab('assets')}
                                        className="text-left relative flex flex-col justify-between p-4 rounded-xl border border-gray-150 bg-white dark:border-gray-805 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-200 group"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors absolute right-4 top-4" />
                                        <div>
                                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 text-slate-650 dark:text-slate-400 w-fit mb-3">
                                                <Paperclip className="h-4 w-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-650 dark:group-hover:text-slate-400 transition-colors">
                                                Application Assets
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                                Locker for reference links, cover letters & profiles.
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border border-slate-100 dark:border-slate-900/30">
                                                {assetsMetrics.total > 0 ? `${assetsMetrics.ready}/${assetsMetrics.total} Ready` : '0 Assets'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6 flex flex-col h-full animate-fade-in">
                                {/* Back navigation bar */}
                                <div className="flex items-center space-x-2 pb-4 border-b border-gray-150 dark:border-gray-850 shrink-0">
                                    <button
                                        onClick={() => setActiveTab('hub')}
                                        className="inline-flex items-center space-x-2 text-xs font-extrabold text-indigo-650 dark:text-indigo-450 hover:text-indigo-755 dark:hover:text-indigo-305 transition-colors py-1.5 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-805 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        <span>Back to Workspace Hub</span>
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-700 font-bold">/</span>
                                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                        {activeTab === 'timeline' && 'Milestones Timeline'}
                                        {activeTab === 'notes' && 'Notes Ledger'}
                                        {activeTab === 'interview' && 'AI Interview Prep'}
                                        {activeTab === 'resume' && 'Resume Matcher'}
                                        {activeTab === 'followup' && 'Follow-up Copilot'}
                                        {activeTab === 'assets' && 'Application Assets'}
                                    </span>
                                </div>

                                {/* Active Component rendering */}
                                <div className="flex-1">
                                    {/* Tab Contents: Timeline */}
                                    {activeTab === 'timeline' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Milestones Activity</h3>
                                                {!isAddingEvent && (
                                                    <button
                                                        onClick={() => setIsAddingEvent(true)}
                                                        className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-755"
                                                    >
                                                        <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Add Milestone
                                                    </button>
                                                )}
                                            </div>

                                            {/* Add Event Form */}
                                            {isAddingEvent && (
                                                <form onSubmit={handleAddEventSubmit} className="rounded-xl border border-indigo-150 p-4 bg-indigo-50/15 dark:border-indigo-900/40 dark:bg-indigo-950/10 space-y-3 animate-fade-in">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-550 uppercase">Date</label>
                                                            <input
                                                                type="date"
                                                                required
                                                                value={eventDate}
                                                                onChange={e => setEventDate(e.target.value)}
                                                                className="mt-1 block w-full rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-555 uppercase">Event Title</label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="e.g. Received rejection"
                                                                value={eventName}
                                                                onChange={e => setEventName(e.target.value)}
                                                                className="mt-1 block w-full rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-555 uppercase">Reminder Note (Optional)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Schedule at 10 AM PST"
                                                            value={eventReminder}
                                                            onChange={e => setEventReminder(e.target.value)}
                                                            className="mt-1 block w-full rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingEvent(false)}
                                                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-555 hover:bg-gray-100 dark:hover:bg-gray-850"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="rounded-md bg-indigo-650 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-755"
                                                        >
                                                            Save Milestone
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Timeline list */}
                                            {internship.timeline.length === 0 ? (
                                                <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-805">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">No milestones tracked yet</span>
                                                </div>
                                            ) : (
                                                <div className="flow-root pl-2">
                                                    <ul className="-mb-8">
                                                        {internship.timeline.map((event, idx) => {
                                                            const isLast = idx === internship.timeline.length - 1;
                                                            const isFuture = new Date(event.date).getTime() > Date.now();

                                                            return (
                                                                <li key={event.id}>
                                                                    <div className="relative pb-8">
                                                                        {/* Vertical connection line */}
                                                                        {!isLast && (
                                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                                                                        )}
                                                                        
                                                                        <div className="relative flex space-x-3">
                                                                            <div>
                                                                                <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900 ${
                                                                                    isFuture 
                                                                                        ? 'bg-blue-100 text-blue-650 dark:bg-blue-900/30 dark:text-blue-400' 
                                                                                        : 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400'
                                                                                }`}>
                                                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        {event.reminder ? (
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                                                        ) : (
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                        )}
                                                                                    </svg>
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            <div className="flex min-w-0 flex-1 justify-between items-start pt-1">
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                                                        {event.event}
                                                                                    </p>
                                                                                    {event.reminder && (
                                                                                        <p className="mt-1 text-[11px] font-medium text-amber-750 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100/50 dark:border-amber-950/50">
                                                                                            <span className="font-bold">Reminder: </span>{event.reminder}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                <div className="flex items-center space-x-2 text-right text-[10px] text-gray-400 font-semibold pl-2 shrink-0">
                                                                                    <span>
                                                                                        {new Date(event.date).toLocaleDateString(undefined, {
                                                                                            month: 'short',
                                                                                            day: 'numeric'
                                                                                        })}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={() => onDeleteEvent(internship.id, event.id)}
                                                                                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-450 hover:text-red-500 p-0.5 rounded transition-all"
                                                                                        title="Delete milestone"
                                                                                    >
                                                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Contents: Notes */}
                                    {activeTab === 'notes' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notes ledger</h3>
                                                {!isAddingNote && (
                                                    <button
                                                        onClick={() => setIsAddingNote(true)}
                                                        className="inline-flex items-center text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-755"
                                                    >
                                                        <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Create Note
                                                    </button>
                                                )}
                                            </div>

                                            {/* Create Note Form */}
                                            {isAddingNote && (
                                                <form onSubmit={handleAddNoteSubmit} className="rounded-xl border border-indigo-150 p-4 bg-indigo-50/15 dark:border-indigo-900/40 dark:bg-indigo-950/10 space-y-3 animate-fade-in">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-555 uppercase">Note Title</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="e.g. Technical Assessment Prep"
                                                            value={noteTitle}
                                                            onChange={e => setNoteTitle(e.target.value)}
                                                            className="mt-1 block w-full rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-555 uppercase">Details</label>
                                                        <textarea
                                                            placeholder="Review algorithms, arrays, graphs..."
                                                            rows={3}
                                                            value={noteContent}
                                                            onChange={e => setNoteContent(e.target.value)}
                                                            className="mt-1 block w-full rounded-lg border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingNote(false)}
                                                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-555 hover:bg-gray-100 dark:hover:bg-gray-805"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="rounded-md bg-indigo-650 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-755"
                                                        >
                                                            Save Note
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Notes stack */}
                                            {internship.notes.length === 0 ? (
                                                <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-805">
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">No notes written yet</span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {internship.notes.map(note => (
                                                        <div 
                                                            key={note.id}
                                                            className="group relative rounded-xl border border-gray-150 bg-amber-50/20 p-4 dark:border-gray-850 dark:bg-gray-950/20"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                                                    {note.title}
                                                                </h4>
                                                                <button
                                                                    onClick={() => onDeleteNote(internship.id, note.id)}
                                                                    className="rounded p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-850 dark:hover:text-red-400 transition-all"
                                                                    title="Delete note"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            {note.content && (
                                                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                                                    {note.content}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Contents: Interview Prep */}
                                    {activeTab === 'interview' && (
                                        <InterviewPrepTab internship={internship} />
                                    )}

                                    {/* Tab Contents: Resume Matcher */}
                                    {activeTab === 'resume' && (
                                        <ResumeMatcherTab internship={internship} />
                                    )}

                                    {/* Tab Contents: Follow-up Copilot */}
                                    {activeTab === 'followup' && (
                                        <FollowUpCopilotTab internship={internship} />
                                    )}

                                    {/* Tab Contents: Assets */}
                                    {activeTab === 'assets' && (
                                        <ApplicationAssetsTab internship={internship} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
