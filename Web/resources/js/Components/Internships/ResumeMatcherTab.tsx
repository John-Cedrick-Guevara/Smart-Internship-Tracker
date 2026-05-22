import React, { useState, useEffect } from 'react';
import { Internship } from '../../types/internship';
import { UploadCloud, Sparkles, CheckCircle, AlertTriangle, FileText, RefreshCw, TrendingUp, ListTodo } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeMatcherTabProps {
    internship: Internship;
}

interface MatchResult {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    gaps: string[];
    recommendations: string[];
}

export default function ResumeMatcherTab({ internship }: ResumeMatcherTabProps) {
    const [resumeText, setResumeText] = useState('');
    const [fileName, setFileName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [result, setResult] = useState<MatchResult | null>(null);

    // Load saved alignment analysis from localStorage
    useEffect(() => {
        try {
            const savedText = localStorage.getItem(`internship_resume_text_${internship.id}`);
            const savedFile = localStorage.getItem(`internship_resume_file_${internship.id}`);
            const savedResult = localStorage.getItem(`internship_resume_result_${internship.id}`);

            if (savedText) setResumeText(savedText);
            if (savedFile) setFileName(savedFile);
            if (savedResult) {
                setResult(JSON.parse(savedResult));
                setIsAnalyzed(true);
            } else {
                setResult(null);
                setIsAnalyzed(false);
            }
        } catch (e) {
            console.error('Failed to load localStorage resume data:', e);
        }
    }, [internship.id]);

    // Handle dummy file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        // Simulate reading text from file
        const dummyText = `EXPERIENCE\nSoftware Engineer Intern candidate with strong interest in ${internship.position} roles at ${internship.company_name}.\nProficient in web development technologies, git collaboration, agile practices, and problem solving.`;
        setResumeText(dummyText);
        localStorage.setItem(`internship_resume_file_${internship.id}`, file.name);
        localStorage.setItem(`internship_resume_text_${internship.id}`, dummyText);
        
        toast.success(`Selected resume: ${file.name}`);
    };

    // Perform high-fidelity analysis
    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeText.trim()) {
            toast.error("Please paste your resume text or select a PDF/Word file first.");
            return;
        }

        setIsAnalyzing(true);

        // Simulate analytical scan
        setTimeout(() => {
            const pos = internship.position.toLowerCase();
            let score = 55; // Base starting score
            let matchedKeywordsList: string[] = [];
            let missingKeywordsList: string[] = [];
            let strengthsList: string[] = [];
            let gapsList: string[] = [];
            let recommendationsList: string[] = [];

            // Simple rules depending on role
            if (pos.includes('front') || pos.includes('react') || pos.includes('ui') || pos.includes('ux') || pos.includes('design')) {
                const kw = ['React', 'CSS', 'HTML', 'Git', 'JavaScript', 'TypeScript', 'Tailwind', 'Figma', 'Responsive Design'];
                kw.forEach(k => {
                    if (resumeText.toLowerCase().includes(k.toLowerCase())) {
                        matchedKeywordsList.push(k);
                        score += 5;
                    } else {
                        missingKeywordsList.push(k);
                    }
                });

                strengthsList = [
                    "Identified strong match for modern Javascript structures.",
                    "Active usage of responsive design terminology.",
                    "Demonstrated knowledge of collaborative tools like Git."
                ];

                gapsList = [
                    "Missing core UI/UX prototyping tools like Figma.",
                    "No explicit mention of state management frameworks (e.g. Redux, Zustand).",
                    "CSS layouts/design system tokens are underrepresented."
                ];

                recommendationsList = [
                    `Incorporate projects highlighting React and TypeScript explicitly near the top.`,
                    `Under experience, replace passive words with high-impact action bullets (e.g., 'Engineered high-fidelity responsive components using Tailwind CSS').`,
                    `Add a dedicated 'Skills Matrix' separating languages (TypeScript) from designer tools (Figma).`
                ];
            } else if (pos.includes('back') || pos.includes('laravel') || pos.includes('php') || pos.includes('api') || pos.includes('database')) {
                const kw = ['PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST API', 'Git', 'Database Design', 'Redis', 'Docker', 'MVC'];
                kw.forEach(k => {
                    if (resumeText.toLowerCase().includes(k.toLowerCase())) {
                        matchedKeywordsList.push(k);
                        score += 5;
                    } else {
                        missingKeywordsList.push(k);
                    }
                });

                strengthsList = [
                    "Back-end foundational terminology is robust.",
                    "Proper mapping of relational model structures (SQL).",
                    "Strong database lifecycle awareness."
                ];

                gapsList = [
                    "No reference to containerization tools (Docker/Kubernetes).",
                    "API testing protocols (Postman, Pest, PHPUnit) are not featured.",
                    "High-performance caching (Redis) is omitted."
                ];

                recommendationsList = [
                    `Refactor your project achievements using the STAR methodology, mentioning Laravel models and performance metrics.`,
                    `Detail how you secure endpoints (JWT, Laravel Sanctum) to show a mature backend philosophy.`,
                    `Add a technical project demonstrating schema design, eager loading, and indexes.`
                ];
            } else {
                // Default general engineering/business checklist
                const kw = ['Communication', 'Teamwork', 'Git', 'Problem Solving', 'Data', 'Project Management', 'Agile', 'SQL', 'Python'];
                kw.forEach(k => {
                    if (resumeText.toLowerCase().includes(k.toLowerCase())) {
                        matchedKeywordsList.push(k);
                        score += 5;
                    } else {
                        missingKeywordsList.push(k);
                    }
                });

                strengthsList = [
                    "Clean layout with clear functional highlights.",
                    "Strong alignment with team collaboration objectives.",
                    "Mentions fundamental analytic and problem-solving capacities."
                ];

                gapsList = [
                    "Agile workflows and SCRUM metrics are not emphasized.",
                    "SQL database access queries or coding repositories are missing.",
                    "Lacks concrete results metrics (e.g., '%' optimization, time saved)."
                ];

                recommendationsList = [
                    `Quantify your accomplishments: Add numbers, dates, and sizes (e.g. 'Coordinated a team of 4 to deliver X, improving loading times by 15%').`,
                    `Explicitly state familiarity with Agile project tracking tools like Jira or Trello.`,
                    `Create a concise summary paragraph tailored specifically to internship positions at ${internship.company_name}.`
                ];
            }

            // Cap the simulated score
            score = Math.min(score, 98);

            const mockResult: MatchResult = {
                score,
                matchedKeywords: matchedKeywordsList,
                missingKeywords: missingKeywordsList,
                strengths: strengthsList,
                gaps: gapsList,
                recommendations: recommendationsList
            };

            setResult(mockResult);
            setIsAnalyzed(true);
            setIsAnalyzing(false);

            localStorage.setItem(`internship_resume_result_${internship.id}`, JSON.stringify(mockResult));
            localStorage.setItem(`internship_resume_text_${internship.id}`, resumeText);
            
            toast.success("Resume alignment report generated!");
        }, 1800);
    };

    // Reset analyzer state
    const handleReset = () => {
        setResumeText('');
        setFileName('');
        setIsAnalyzed(false);
        setResult(null);
        localStorage.removeItem(`internship_resume_text_${internship.id}`);
        localStorage.removeItem(`internship_resume_file_${internship.id}`);
        localStorage.removeItem(`internship_resume_result_${internship.id}`);
        toast.info("Cleared resume analyzer draft.");
    };

    // Circular SVG progress score calculator
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = result ? circumference - (result.score / 100) * circumference : circumference;

    const getScoreColorClass = (score: number) => {
        if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
        if (score >= 60) return 'text-amber-500 stroke-amber-500';
        return 'text-rose-500 stroke-rose-500';
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            {!isAnalyzed ? (
                // Setup paste / upload state
                <form onSubmit={handleAnalyze} className="space-y-5">
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/20 p-6 text-center hover:bg-gray-50/50 dark:hover:bg-gray-950/10 transition-colors relative">
                        <input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.txt"
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
                                    Supports PDF, DOCX, or TXT (Max 5MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-150 dark:border-gray-850" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-extrabold tracking-wide">
                            <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 text-[10px]">Or Paste Resume Text</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 block">Resume Contents</label>
                        <textarea
                            className="w-full text-xs rounded-xl border border-gray-250 bg-white p-3 shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                            placeholder="Paste the full raw text of your resume here to analyze matches and optimization suggestions..."
                            rows={8}
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !resumeText.trim()}
                        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-750 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isAnalyzing ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Scanning & Compiling Alignment Metrics...</span>
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
                // Analysis report display
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Score Summary Card */}
                    <div className="rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/40 p-5 dark:bg-gray-950/10 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            {/* Radial SVG Gauge */}
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={radius}
                                        className="stroke-gray-200 dark:stroke-gray-800"
                                        strokeWidth="6"
                                        fill="transparent"
                                    />
                                    {result && (
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
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-base font-extrabold text-gray-900 dark:text-white">
                                        {result?.score}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Match score</h4>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                    {result && result.score >= 80 ? 'Strong Alignment!' : result && result.score >= 60 ? 'Moderate Alignment' : 'Needs Optimization'}
                                </p>
                                <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                                    Comparison with the target role <span className="font-semibold text-indigo-650 dark:text-indigo-400">{internship.position}</span>.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-250 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-350 dark:hover:bg-gray-850"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Re-Analyze</span>
                        </button>
                    </div>

                    {/* Keywords Locker Grid */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                            <ListTodo className="h-3.5 w-3.5 mr-1" />
                            Core Keyword Comparison
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/10 p-3.5 dark:border-emerald-950/20 dark:bg-emerald-950/5">
                                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Matched ({result?.matchedKeywords.length})
                                </span>
                                {result?.matchedKeywords.length === 0 ? (
                                    <span className="text-[11px] text-gray-400">None detected</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {result?.matchedKeywords.map((k, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-150/20">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-amber-100 bg-amber-50/10 p-3.5 dark:border-amber-955/20 dark:bg-amber-955/5">
                                <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400 block mb-2 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Missing ({result?.missingKeywords.length})
                                </span>
                                {result?.missingKeywords.length === 0 ? (
                                    <span className="text-[11px] text-emerald-600 font-semibold">Perfect keyword alignment!</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {result?.missingKeywords.map((k, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-150/20">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Strengths & Recommendations Details */}
                    <div className="space-y-4">
                        {/* Strengths Card */}
                        <div className="rounded-xl border border-gray-150 bg-white p-4 dark:border-gray-850 dark:bg-gray-900/50">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 block mb-2 flex items-center">
                                <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                Resume High Points
                            </span>
                            <ul className="space-y-2">
                                {result?.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start space-x-2 text-xs leading-relaxed text-gray-700 dark:text-gray-350">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Gaps / Advice Card */}
                        <div className="rounded-xl border border-indigo-150 bg-indigo-50/5 p-4 dark:border-indigo-950/10">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-650 dark:text-indigo-400 block mb-2 flex items-center">
                                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                                Match Optimization Roadmap
                            </span>
                            
                            <ul className="space-y-2.5">
                                {result?.recommendations.map((rec, i) => (
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
