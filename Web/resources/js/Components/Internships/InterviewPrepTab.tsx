import React, { useState, useEffect } from 'react';
import { Internship } from '../../types/internship';
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, PenTool, Sparkles, BookOpen } from 'lucide-react';

interface Question {
    id: string;
    category: 'Technical' | 'Behavioral' | 'General';
    question: string;
    strategicTip: string;
    talkingPoints: string[];
}

interface InterviewPrepTabProps {
    internship: Internship;
}

const FRONTEND_QUESTIONS: Question[] = [
    {
        id: 'fe_1',
        category: 'Technical',
        question: 'How do you optimize the performance of a React application?',
        strategicTip: 'Explain rendering cycles, memoization, and network loading assets.',
        talkingPoints: [
            'Mention memoization techniques using React.memo, useMemo, and useCallback to avoid unneeded renders.',
            'Discuss code-splitting, lazy loading (React.lazy, Suspense), and dynamic imports to reduce bundle sizes.',
            'Explain rendering optimization: virtualization for long lists, using appropriate key props, and state colocation.',
            'Highlight image optimization, lazy loading non-critical resources, and asset compression/CDN delivery.'
        ]
    },
    {
        id: 'fe_2',
        category: 'Technical',
        question: 'What is your strategy for maintaining consistent state across complex React layouts?',
        strategicTip: 'Contrast local state, context propagation, and global state libraries.',
        talkingPoints: [
            'Start with local state (useState, useReducer) and state hoisting where appropriate.',
            'Explain Context API for standard compound components and global layouts without excessive prop drilling.',
            'Discuss global state stores (Redux, Zustand, Recoil) for cross-page communications and complex server data caching.',
            'Mention data-fetching libraries like TanStack Query (React Query) for managing async server states with cache invalidation.'
        ]
    },
    {
        id: 'fe_3',
        category: 'Behavioral',
        question: 'Tell me about a time you had to balance a gorgeous design mockup with performance/development constraints.',
        strategicTip: 'Showcase cross-functional collaborative communication and compromise.',
        talkingPoints: [
            'Detail the design spec: complex animations, large asset payloads, or heavy layout components.',
            'Explain the trade-offs discussed with designers: e.g. replacing complex calculations with responsive CSS layouts.',
            'Focus on outcomes: maintaining high visual fidelity while keeping core vitals (LCP, FID) at optimal premium scores.'
        ]
    },
    {
        id: 'fe_4',
        category: 'General',
        question: 'Why do you want to join our frontend team for this internship?',
        strategicTip: 'Research the company product or site specifically, highlighting their UI/UX decisions.',
        talkingPoints: [
            'Reference specific features of their website or web application that feel refined or premium.',
            'Align your personal learning goals (e.g. mastering accessible forms, high-concurrency UI dashboards) with their tech stack.',
            'Express excitement for learning from their senior engineers and contributing to production design systems.'
        ]
    }
];

const BACKEND_QUESTIONS: Question[] = [
    {
        id: 'be_1',
        category: 'Technical',
        question: 'How would you design a high-throughput, secure RESTful API in PHP/Laravel?',
        strategicTip: 'Focus on request lifecycle, middleware, security, and response caching.',
        talkingPoints: [
            'Discuss security: JWT/Sanctum authentication, CORS, rate limiting, and request validation.',
            'Detail caching mechanisms: Redis or Memcached integration for high-frequency queries.',
            'Mention database optimization: Eager loading (preventing N+1 query issue) and indexing.',
            'Explain decoupling layers: Controllers delegating core logic to Service classes and API Resources for formatting.'
        ]
    },
    {
        id: 'be_2',
        category: 'Technical',
        question: 'Explain the difference between SQL and NoSQL databases, and how you choose between them.',
        strategicTip: 'Focus on schema flexibility, relationship models, scaling capabilities, and transactions.',
        talkingPoints: [
            'SQL (Relational): Structured schemas, relational integrity, ACID compliance, good for complex joins (e.g., transactional data).',
            'NoSQL (Non-Relational): Dynamic schemas, horizontal scaling, document/key-value storage, good for high-throughput reads (e.g., logs, sessions).',
            'Decision framework: Choose SQL when relational data is dense; choose NoSQL for unstructured, rapid-growth data feeds.'
        ]
    },
    {
        id: 'be_3',
        category: 'Behavioral',
        question: 'Describe a time when you had to debug a severe, silent performance bottleneck in production.',
        strategicTip: 'Focus on your systematic diagnostic process and analytical thinking.',
        talkingPoints: [
            'Explain how you discovered the bottleneck: APM logs, database slow queries, or customer report.',
            'Describe diagnostic steps: Isolated queries, measured server resource utilization, and checked memory usage.',
            'Highlight resolution: Added missing database indexes, optimized heavy loops, or refactored background queues.'
        ]
    },
    {
        id: 'be_4',
        category: 'General',
        question: 'What trends or frameworks in backend development are you most excited to explore here?',
        strategicTip: 'Connect your interests to their current projects, database scaling, or serverless structures.',
        talkingPoints: [
            'Mention serverless computing, API gateways, or containerization with Docker/Kubernetes.',
            'Express interest in database optimizations, distributed systems, or messaging queues (RabbitMQ, Kafka).',
            'Link these trends back to their scale challenges and how you can support their engineering pipelines.'
        ]
    }
];

const PM_QUESTIONS: Question[] = [
    {
        id: 'pm_1',
        category: 'Technical',
        question: 'How do you prioritize a product backlog with multiple stakeholders requesting features?',
        strategicTip: 'Discuss prioritization frameworks (RICE, MoSCoW) and business metrics alignment.',
        talkingPoints: [
            'Define features based on Reach, Impact, Confidence, and Effort (RICE score).',
            'Explain how you manage stakeholder alignment through transparency, logic, and shared product goals.',
            'Show how you tie product development milestones back to high-level OKRs and business KPIs.'
        ]
    },
    {
        id: 'pm_2',
        category: 'Behavioral',
        question: 'Tell me about a time a product launch failed or missed its core metrics, and what you learned.',
        strategicTip: 'Highlight resilience, analytical retrospectives, and customer feedback mechanisms.',
        talkingPoints: [
            'Provide context on the product concept, what the launch goals were, and where it fell short.',
            'Describe how you ran a blame-free post-mortem to analyze user drops, loading friction, or marketing misalignment.',
            'Share the adjustments made: post-launch hotfixes, design updates, or better telemetry loops for subsequent features.'
        ]
    },
    {
        id: 'pm_3',
        category: 'General',
        question: 'How do you translate complex technical barriers into business trade-offs for executives?',
        strategicTip: 'Explain user-impact focusing, risk mitigation, and scheduling cost considerations.',
        talkingPoints: [
            'Describe how you work closely with lead engineers to fully grasp backend or architectural limitations.',
            'Frame the technical problem in terms of delay risk, financial overhead, or user retention metrics.',
            'Offer constructive paths: MVP releases, staging rollout phases, or temporary workarounds.'
        ]
    }
];

const DEFAULT_QUESTIONS: Question[] = [
    {
        id: 'gen_1',
        category: 'Behavioral',
        question: 'Tell me about a challenging technical or academic project and how you overcame obstacles.',
        strategicTip: 'Use the STAR method (Situation, Task, Action, Result) with quantified impacts.',
        talkingPoints: [
            'Situation: Outline the context of the team project or complex software engineering course assignment.',
            'Task: Explain the core challenge (e.g. deadline pressure, ambiguous API requirements, or performance bugs).',
            'Action: Detail your unique contributions: systematic research, pair programming, or algorithmic optimizations.',
            'Result: Highlight concrete metrics: compiled 2x faster, scored top of the class, or delivered ahead of schedule.'
        ]
    },
    {
        id: 'gen_2',
        category: 'Behavioral',
        question: 'How do you handle working with a team member who has a completely different working style or opinion?',
        strategicTip: 'Focus on empathy, active listening, and logical compromise.',
        talkingPoints: [
            'Acknowledge that diverse opinions build healthier products and robust software architectures.',
            'Explain your method: listening first to identify core technical disagreements or timeline goals.',
            'Detail the outcome: standardizing API specifications or splitting responsibilities based on individual strengths.'
        ]
    },
    {
        id: 'gen_3',
        category: 'Technical',
        question: 'Explain a technical concept you learned recently to someone without an engineering background.',
        strategicTip: 'Use clear, intuitive analogies and avoid jargon to show strong communication.',
        talkingPoints: [
            'Select a concept: e.g. APIs (like restaurant waiters), Caching (like keeping most-used books on the desk), or Databases.',
            'Walk through the analogy, highlighting how it maps directly to physical human experiences.',
            'Explain why clear communication is essential for cross-functional alignment in technical teams.'
        ]
    },
    {
        id: 'gen_4',
        category: 'General',
        question: 'What is your primary goal for this internship, and how can we help you achieve it?',
        strategicTip: 'Demonstrate initiative, ambition, and a willingness to absorb team feedback.',
        talkingPoints: [
            'Define 1-2 core skills you want to master (e.g., test-driven development, database design, agile project ownership).',
            'Express a desire to understand corporate software development patterns and scale operations.',
            'Confirm your willingness to take on feedback actively and iterate on code quality.'
        ]
    }
];

export default function InterviewPrepTab({ internship }: InterviewPrepTabProps) {
    const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
    const [expandedQId, setExpandedQId] = useState<string | null>(null);
    const [practicedIds, setPracticedIds] = useState<string[]>([]);
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});

    // 1. Select appropriate questions based on the role title
    useEffect(() => {
        const title = internship.position.toLowerCase();
        if (title.includes('front') || title.includes('react') || title.includes('ui') || title.includes('ux') || title.includes('design') || title.includes('client')) {
            setQuestions(FRONTEND_QUESTIONS);
        } else if (title.includes('back') || title.includes('laravel') || title.includes('php') || title.includes('api') || title.includes('server') || title.includes('database') || title.includes('sql')) {
            setQuestions(BACKEND_QUESTIONS);
        } else if (title.includes('product') || title.includes('project') || title.includes('manager') || title.includes('scrum') || title.includes('agile')) {
            setQuestions(PM_QUESTIONS);
        } else {
            setQuestions(DEFAULT_QUESTIONS);
        }
    }, [internship.position]);

    // 2. Load practiced states and notes from localStorage on mount or internship change
    useEffect(() => {
        try {
            const savedPracticed = localStorage.getItem(`internship_prep_practiced_${internship.id}`);
            if (savedPracticed) {
                setPracticedIds(JSON.parse(savedPracticed));
            } else {
                setPracticedIds([]);
            }

            const savedNotes = localStorage.getItem(`internship_prep_notes_${internship.id}`);
            if (savedNotes) {
                setNotes(JSON.parse(savedNotes));
            } else {
                setNotes({});
            }
        } catch (e) {
            console.error('Failed to load localStorage prep data:', e);
        }
        setExpandedQId(null);
    }, [internship.id]);

    const togglePracticed = (qId: string) => {
        const updated = practicedIds.includes(qId)
            ? practicedIds.filter(id => id !== qId)
            : [...practicedIds, qId];
        
        setPracticedIds(updated);
        localStorage.setItem(`internship_prep_practiced_${internship.id}`, JSON.stringify(updated));
    };

    const handleNoteChange = (qId: string, val: string) => {
        setNotes(prev => ({ ...prev, [qId]: val }));
        setSaveStatus(prev => ({ ...prev, [qId]: 'saving' }));

        // Debounced or simple immediate localStorage update
        const updatedNotes = { ...notes, [qId]: val };
        localStorage.setItem(`internship_prep_notes_${internship.id}`, JSON.stringify(updatedNotes));

        // Simulate a smooth auto-save effect
        setTimeout(() => {
            setSaveStatus(prev => ({ ...prev, [qId]: 'saved' }));
            setTimeout(() => {
                setSaveStatus(prev => ({ ...prev, [qId]: 'idle' }));
            }, 1000);
        }, 600);
    };

    const getCategoryBadgeColor = (category: Question['category']) => {
        switch (category) {
            case 'Technical':
                return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40';
            case 'Behavioral':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900/40';
            default:
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
        }
    };

    const percentComplete = questions.length > 0 
        ? Math.round((questions.filter(q => practicedIds.includes(q.id)).length / questions.length) * 100)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            {/* Header / Stats Panel */}
            <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-950/15 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Preparation Readiness</h4>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                            {questions.filter(q => practicedIds.includes(q.id)).length} of {questions.length} Questions Mastered
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{percentComplete}% Complete</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                            className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${percentComplete}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    Role-Aligned Questions: <span className="text-indigo-600 dark:text-indigo-400 ml-1 italic font-semibold">{internship.position}</span>
                </h3>

                <div className="space-y-3.5">
                    {questions.map((q) => {
                        const isExpanded = expandedQId === q.id;
                        const isPracticed = practicedIds.includes(q.id);
                        const userNote = notes[q.id] || '';
                        const qSave = saveStatus[q.id] || 'idle';

                        return (
                            <div 
                                key={q.id} 
                                className={`rounded-xl border transition-all duration-200 ${
                                    isExpanded 
                                        ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/5 dark:bg-indigo-950/5 ring-1 ring-indigo-350/10' 
                                        : 'border-gray-150 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900/50'
                                }`}
                            >
                                {/* Collapsed Top Bar */}
                                <div className="flex items-center justify-between p-4 cursor-pointer select-none" onClick={() => setExpandedQId(isExpanded ? null : q.id)}>
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePracticed(q.id);
                                            }}
                                            className={`flex-shrink-0 focus:outline-none transition-colors ${
                                                isPracticed 
                                                    ? 'text-emerald-500 dark:text-emerald-450 hover:text-emerald-600' 
                                                    : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'
                                            }`}
                                            title={isPracticed ? 'Mark as unpracticed' : 'Mark as practiced'}
                                        >
                                            <CheckCircle2 className={`h-5 w-5 ${isPracticed ? 'fill-emerald-50/50 dark:fill-emerald-950/20' : ''}`} />
                                        </button>

                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getCategoryBadgeColor(q.category)}`}>
                                                    {q.category}
                                                </span>
                                                {isPracticed && (
                                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Practiced</span>
                                                )}
                                            </div>
                                            <p className={`text-xs font-bold mt-1.5 text-gray-900 dark:text-white leading-relaxed ${isPracticed ? 'line-through text-gray-450 dark:text-gray-500 font-medium' : ''}`}>
                                                {q.question}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </div>

                                {/* Expanded strategic detail block */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-850 pt-3 space-y-4 animate-fade-in">
                                        
                                        {/* Strategic tips */}
                                        <div className="rounded-lg bg-amber-50/40 border border-amber-100 p-3 dark:bg-amber-950/10 dark:border-amber-900/30">
                                            <div className="flex items-start space-x-2">
                                                <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Strategic Response Angle</span>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed font-semibold">
                                                        {q.strategicTip}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bullet strategic outline */}
                                        <div>
                                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block mb-2">Key Discussion Points</span>
                                            <ul className="space-y-1.5">
                                                {q.talkingPoints.map((point, index) => (
                                                    <li key={index} className="flex items-start space-x-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Interactive notepad workspace */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 flex items-center">
                                                    <PenTool className="h-3 w-3 mr-1 text-indigo-500" />
                                                    Your Answer Scratchpad
                                                </label>
                                                
                                                <span className="text-[9px] font-bold text-gray-450 tracking-wide">
                                                    {qSave === 'saving' && <span className="text-indigo-550 dark:text-indigo-400 animate-pulse">Auto-saving...</span>}
                                                    {qSave === 'saved' && <span className="text-emerald-600 dark:text-emerald-450">Saved!</span>}
                                                    {qSave === 'idle' && `${userNote.length} characters`}
                                                </span>
                                            </div>

                                            <textarea
                                                className="w-full text-xs rounded-lg border border-gray-250 bg-gray-50/50 p-2.5 shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                                                placeholder="Draft your key anecdotes, STAR bullets, or conceptual notes here. Auto-saves locally..."
                                                rows={4}
                                                value={userNote}
                                                onChange={(e) => handleNoteChange(q.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
