import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, PenTool, Sparkles, BookOpen, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { InterviewQuestion, InterviewQuestionCategory, Internship } from '../../types/internship';

interface InterviewPrepTabProps {
    internship: Internship;
}

const CATEGORY_LABELS: InterviewQuestionCategory[] = ['Technical', 'Behavioral', 'General'];

export default function InterviewPrepTab({ internship }: InterviewPrepTabProps) {
    const [questions, setQuestions] = useState<InterviewQuestion[]>(internship.interview_questions || []);
    const [expandedQId, setExpandedQId] = useState<number | null>(null);
    const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});
    const [showCreate, setShowCreate] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newCategory, setNewCategory] = useState<InterviewQuestionCategory>('General');
    const [newTip, setNewTip] = useState('');
    const [newTalkingPoints, setNewTalkingPoints] = useState('');

    useEffect(() => {
        setQuestions(internship.interview_questions || []);
        setExpandedQId(null);
        setDraftNotes({});
        setShowCreate(false);
        setNewQuestion('');
        setNewCategory('General');
        setNewTip('');
        setNewTalkingPoints('');
    }, [internship.id, internship.interview_questions]);

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const reloadInternships = () => {
        router.reload();
    };

    const saveQuestion = async (question: InterviewQuestion, updates: Partial<InterviewQuestion>) => {
        const response = await fetch(route('interview_questions.update', [internship.id, question.id]), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            toast.error('Failed to save interview question.');
            return;
        }

        reloadInternships();
    };

    const togglePracticed = async (question: InterviewQuestion) => {
        setQuestions((prev) =>
            prev.map((item) =>
                item.id === question.id ? { ...item, is_practiced: !item.is_practiced } : item,
            ),
        );
        await saveQuestion(question, { is_practiced: !question.is_practiced });
    };

    const handleNoteBlur = async (question: InterviewQuestion) => {
        const next = draftNotes[question.id] ?? question.answer_notes ?? '';
        if (next === (question.answer_notes ?? '')) return;
        await saveQuestion(question, { answer_notes: next || null });
    };

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        const response = await fetch(route('interview_questions.store', internship.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: newQuestion.trim(),
                category: newCategory,
                strategic_tip: newTip.trim() || null,
                talking_points: newTalkingPoints
                    .split('\n')
                    .map((point) => point.trim())
                    .filter(Boolean),
                source: 'manual',
            }),
        });

        if (!response.ok) {
            toast.error('Failed to add question.');
            return;
        }

        toast.success('Question added to this application.');
        reloadInternships();
    };

    const deleteQuestion = async (question: InterviewQuestion) => {
        if (!confirm('Delete this question?')) return;

        const response = await fetch(route('interview_questions.delete', [internship.id, question.id]), {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken(),
                Accept: 'application/json',
            },
        });

        if (!response.ok && response.status !== 204) {
            toast.error('Failed to delete question.');
            return;
        }

        toast.success('Question removed.');
        reloadInternships();
    };

    const percentComplete = useMemo(() => {
        return questions.length > 0
            ? Math.round((questions.filter((q) => q.is_practiced).length / questions.length) * 100)
            : 0;
    }, [questions]);

    const getCategoryBadgeColor = (category: InterviewQuestionCategory) => {
        switch (category) {
            case 'Technical':
                return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40';
            case 'Behavioral':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900/40';
            default:
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/15 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Preparation readiness</h4>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                            {questions.filter((q) => q.is_practiced).length} of {questions.length} questions practiced
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{percentComplete}% complete</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    Role-aligned questions for <span className="text-indigo-600 dark:text-indigo-400 ml-1 italic font-semibold">{internship.position}</span>
                </h3>
                <button
                    onClick={() => setShowCreate((prev) => !prev)}
                    className="inline-flex items-center text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-755"
                >
                    <Plus className="h-4 w-4 mr-0.5" />
                    Add question
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreateQuestion} className="rounded-xl border border-indigo-150 p-4 bg-indigo-50/15 dark:border-indigo-900/40 dark:bg-indigo-950/10 space-y-3.5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Question</label>
                        <input
                            type="text"
                            required
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            placeholder="Add a question for this application"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Category</label>
                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as InterviewQuestionCategory)}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            >
                                {CATEGORY_LABELS.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Strategic tip</label>
                            <input
                                type="text"
                                value={newTip}
                                onChange={(e) => setNewTip(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Talking points, one per line</label>
                        <textarea
                            rows={3}
                            value={newTalkingPoints}
                            onChange={(e) => setNewTalkingPoints(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="rounded-md bg-indigo-650 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-755">
                            Save question
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3.5">
                {questions.map((question) => {
                    const isExpanded = expandedQId === question.id;
                    const userNote = draftNotes[question.id] ?? question.answer_notes ?? '';

                    return (
                        <div
                            key={question.id}
                            className={`rounded-xl border transition-all duration-200 ${
                                isExpanded
                                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/5 dark:bg-indigo-950/5 ring-1 ring-indigo-350/10'
                                    : 'border-gray-150 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900/50'
                            }`}
                        >
                            <div className="flex items-center justify-between p-4 cursor-pointer select-none" onClick={() => setExpandedQId(isExpanded ? null : question.id)}>
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePracticed(question);
                                        }}
                                        className={`flex-shrink-0 focus:outline-none transition-colors ${
                                            question.is_practiced
                                                ? 'text-emerald-500 dark:text-emerald-450 hover:text-emerald-600'
                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                                        }`}
                                        title={question.is_practiced ? 'Mark as unpracticed' : 'Mark as practiced'}
                                    >
                                        <CheckCircle2 className={`h-5 w-5 ${question.is_practiced ? 'fill-emerald-50/50 dark:fill-emerald-950/20' : ''}`} />
                                    </button>

                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getCategoryBadgeColor(question.category)}`}>
                                                {question.category}
                                            </span>
                                            {question.is_practiced && <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Practiced</span>}
                                        </div>
                                        <p className={`text-xs font-bold mt-1.5 text-gray-900 dark:text-white leading-relaxed ${question.is_practiced ? 'line-through text-gray-450 dark:text-gray-500 font-medium' : ''}`}>
                                            {question.question}
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-850 pt-3 space-y-4 animate-fade-in">
                                    <div className="rounded-lg bg-amber-50/40 border border-amber-100 p-3 dark:bg-amber-950/10 dark:border-amber-900/30">
                                        <div className="flex items-start space-x-2">
                                            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Strategic response angle</span>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed font-semibold">
                                                    {question.strategic_tip || 'Use this space to outline how you would answer the question clearly and directly.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {Array.isArray(question.talking_points) && question.talking_points.length > 0 && (
                                        <div>
                                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-2">Key discussion points</span>
                                            <ul className="space-y-1.5">
                                                {question.talking_points.map((point, index) => (
                                                    <li key={index} className="flex items-start space-x-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 flex items-center">
                                                <PenTool className="h-3 w-3 mr-1 text-indigo-500" />
                                                Your answer scratchpad
                                            </label>
                                            <span className="text-[9px] font-bold text-gray-450 tracking-wide">
                                                {userNote.length} characters
                                            </span>
                                        </div>

                                        <textarea
                                            className="w-full text-xs rounded-lg border border-gray-250 bg-gray-50/50 p-2.5 shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                            placeholder="Draft your STAR bullets or notes here."
                                            rows={4}
                                            value={userNote}
                                            onChange={(e) => setDraftNotes((prev) => ({ ...prev, [question.id]: e.target.value }))}
                                            onBlur={() => handleNoteBlur(question)}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => deleteQuestion(question)}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete question
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
