import BrandWatermark from '@/Components/BrandWatermark';
import { useTheme } from '@/hooks/useTheme';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Check,
    ChevronRight,
    FileText,
    Gauge,
    Heart,
    ImageUp,
    Inbox,
    Layers,
    Moon,
    Plus,
    Search,
    Sparkles,
    Sun,
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const benefits = [
    {
        kicker: '01 / THROUGHPUT',
        title: 'Stop Copy-Paste Fatigue',
        copy: 'Bypass manual entry completely. Upload a job posting screenshot from LinkedIn, Facebook, or school portals, and convert messy columns into structured data instantly.',
        metric: '20+',
        label: 'applications tracked per day without data-entry exhaustion',
    },
    {
        kicker: '02 / RETENTION',
        title: 'Prevent Context Bleed',
        copy: 'Keep your posting details, custom resume variants, deadlines, and follow-ups locked in. Preserve the original specification even after the live job listing disappears.',
        metric: '100%',
        label: 'opportunity context preserved in structured storage',
    },
    {
        kicker: '03 / PREPARATION',
        title: 'Actionable Prep on Day One',
        copy: 'Automatically generate 5 hyper-focused, role-specific interview practice questions matching the exact requirements caught by our layout parsing engine.',
        metric: '5',
        label: 'tailored interview questions generated for every parsed role',
    },
];

const steps = [
    {
        title: 'Capture & Coordinate (React & Laravel Gateway)',
        description: 'React uploads the screenshot file directly to the Laravel backend. Laravel acts as the secure traffic controller, validating limits, managing storage references, and coordinating downstream microservices.',
    },
    {
        title: 'Free layout Parsing (FastAPI OCR Worker)',
        description: 'A dedicated vision microservice reads chaotic screenshot layouts. Using specialized open-source OCR layout instructions, it returns clean Markdown, completely bypassing expensive multimodal image token costs.',
    },
    {
        title: 'Structural enrichment (Google Gemini Flash)',
        description: 'Laravel takes the cheap markdown text (~100 tokens) and streams it to Gemini. Gemini returns a strict JSON object mapping company, role, location, duration, and generates 5 interview questions.',
    },
    {
        title: 'Actionable Pipeline Persistence',
        description: 'Laravel parses the JSON payload, inserts records, attaches the assets, and registers the entry onto your active Kanban board (To Apply ➔ Applied ➔ Interviewing ➔ Offered).',
    },
];

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'applicants' | 'jobs'>('applicants');

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (prefersReducedMotion) {
            return;
        }

        let context: { revert: () => void } | undefined;
        let cancelled = false;

        import('gsap').then(({ gsap }) => {
            if (cancelled || !rootRef.current) {
                return;
            }

            context = gsap.context(() => {
                gsap.from('[data-animate]', {
                    opacity: 0,
                    transform: 'translateY(24px)',
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.08,
                });

                gsap.to('[data-float]', {
                    transform: 'translateY(-6px)',
                    duration: 3,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });

                gsap.from('[data-step-card]', {
                    scrollTrigger: {
                        trigger: '.stepper-container',
                        start: 'top 80%',
                    },
                    opacity: 0,
                    x: -20,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power2.out',
                });
            }, rootRef);
        });

        return () => {
            cancelled = true;
            context?.revert();
        };
    }, []);

    return (
        <>
            <Head title="Smart Application Pipeline" />
            <div ref={rootRef} className="welcome-page">
                {/* Clean Top Navigation Bar */}
                <header className="mx-auto max-w-7xl px-6 py-6 md:px-8">
                    <div className="flex items-center justify-between border-b border-[var(--text)] pb-6">
                        <Link
                            href="/"
                            className="flex items-center gap-3 focus:outline-none"
                            aria-label="Anti Mahinang Nilalang home"
                        >
                            <span className="logo-mark flex items-center justify-center">
                                <Sparkles className="size-5" />
                            </span>
                            <div>
                                <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[var(--text)] block">
                                    ANTI MAHINANG NILALANG
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] block">
                                    Smart Application Pipeline
                                </span>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-4 md:gap-6 font-mono text-xs">
                            <a href="#value" className="hidden sm:inline-block text-[var(--muted-strong)] hover:text-[var(--text)] transition">
                                // VALUE
                            </a>
                            <a href="#architecture" className="hidden sm:inline-block text-[var(--muted-strong)] hover:text-[var(--text)] transition">
                                // SYSTEM
                            </a>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] rounded-full text-[var(--muted-strong)] hover:text-[var(--text)] hover:border-[var(--text)] transition"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="size-3.5" />
                                ) : (
                                    <Moon className="size-3.5" />
                                )}
                                <span className="uppercase text-[10px] tracking-wider font-semibold">
                                    {theme === 'dark' ? 'Light' : 'Dark'}
                                </span>
                            </button>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="cta-pill px-4 py-2 font-bold text-xs uppercase tracking-wider transition"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-[var(--muted-strong)] hover:text-[var(--text)] transition"
                                    >
                                        LOG IN
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="cta-pill px-4 py-2 font-bold text-xs uppercase tracking-wider transition"
                                    >
                                        START
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 md:px-8 py-6 flex flex-col gap-16 md:gap-24">
                    {/* Section 1: Hero Editorial Block & Dashboard Mockup */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Hero copy */}
                        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-8">
                            <div className="space-y-6">
                                <span className="font-mono text-xs font-bold text-[var(--muted)] tracking-widest block uppercase" data-animate>
                                    01 / Core System Mission
                                </span>
                                <h1 className="editorial-title text-5xl md:text-6xl lg:text-7xl" data-animate>
                                    YOUR JOB HUNT IS A SYSTEM ISSUE.
                                </h1>
                                <div className="border-t border-[var(--text)] my-4" data-animate />
                                <p className="editorial-tagline font-bold text-[var(--text)] italic" data-animate>
                                    "Unemployed? It might be your system that's screwing you—not just your skill issue."
                                </p>
                                <p className="text-base text-[var(--muted-strong)] leading-relaxed" data-animate>
                                    Turn chaotic application volume into an automated, highly structured revenue pipeline.
                                    Drop a screenshot of a job posting; our OCR worker extracts the layout, Gemini structures
                                    the lead, and our system generates instant interview preparation.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-4" data-animate>
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="cta-pill px-6 py-3.5 text-sm uppercase tracking-wider font-bold inline-flex items-center gap-2 group transition"
                                    >
                                        Build My Pipeline
                                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                    <a
                                        href="#value"
                                        className="px-6 py-3.5 border border-[var(--text)] text-sm uppercase tracking-wider font-bold inline-flex items-center gap-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition"
                                    >
                                        See System Value
                                    </a>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--line)] pt-6" data-animate>
                                    {[
                                        'OCR Extraction',
                                        'Schema Mapping',
                                        'AI Interview Prep',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-strong)]">
                                            <Check className="size-4 text-[var(--text)]" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Dashboard Mockup (Inspired by Image 1) */}
                        <div className="lg:col-span-7" data-animate data-float>
                            <div className="mock-container">
                                <div className="mock-window">
                                    {/* Mock Topbar */}
                                    <div className="mock-topbar">
                                        <div className="flex items-center gap-2">
                                            <div className="mock-topbar-dot" />
                                            <div className="mock-search-bar">
                                                <Search className="size-3.5" />
                                                <span>Search leads...</span>
                                            </div>
                                            <button className="mock-btn-tab inline-flex items-center gap-1">
                                                <Plus className="size-3.5" />
                                                <span>Create Job</span>
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setActiveTab('applicants')}
                                                className={`mock-btn-tab ${activeTab === 'applicants' ? 'active' : ''}`}
                                            >
                                                <span>Job Postings</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('jobs')}
                                                className={`mock-btn-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                                            >
                                                <span>Product Designer</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mock Body */}
                                    <div className="mock-body">
                                        {/* Mock Sidebar */}
                                        <div className="mock-sidebar">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-2.5">
                                                    NAVIGATE
                                                </span>
                                                <div className="mock-sidebar-item active">
                                                    <Inbox className="size-4 text-slate-600" />
                                                    <span>Applicants</span>
                                                    <span className="ml-auto bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        23
                                                    </span>
                                                </div>
                                                <div className="mock-sidebar-item">
                                                    <BriefcaseBusiness className="size-4 text-slate-400" />
                                                    <span>Job Posts</span>
                                                </div>
                                                <div className="mock-sidebar-item">
                                                    <Layers className="size-4 text-slate-400" />
                                                    <span>Engagements</span>
                                                    <span className="ml-auto bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        5
                                                    </span>
                                                </div>
                                                <div className="mock-sidebar-item">
                                                    <FileText className="size-4 text-slate-400" />
                                                    <span>Invoices</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mock Cards Grid Area */}
                                        <div className="mock-content-grid">
                                            {/* Column 1: Applicants */}
                                            <div className="mock-column">
                                                <div className="mock-column-header">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                                                    <span>Applicants (12)</span>
                                                </div>

                                                <div className="mock-card">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mock-badge-match">84% Match</span>
                                                        <div className="flex -space-x-1">
                                                            <div className="size-5 rounded-full bg-teal-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">ML</div>
                                                        </div>
                                                    </div>
                                                    <div className="mock-card-name">Marley Lubin</div>
                                                    <div className="mock-card-meta">
                                                        <span className="mock-card-meta-label">Role</span>
                                                        <span className="mock-card-meta-val">UI Designer</span>
                                                        <span className="mock-card-meta-label">Location</span>
                                                        <span className="mock-card-meta-val">NY, New York</span>
                                                    </div>
                                                </div>

                                                <div className="mock-card">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mock-badge-match">73% Match</span>
                                                        <div className="flex -space-x-1">
                                                            <div className="size-5 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">CS</div>
                                                        </div>
                                                    </div>
                                                    <div className="mock-card-name">Cheyenne Siphron</div>
                                                    <div className="mock-card-meta">
                                                        <span className="mock-card-meta-label">Role</span>
                                                        <span className="mock-card-meta-val">Product Designer</span>
                                                        <span className="mock-card-meta-label">Location</span>
                                                        <span className="mock-card-meta-val">NY, New York</span>
                                                    </div>
                                                </div>

                                                <div className="mock-card">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mock-badge-match">64% Match</span>
                                                        <div className="flex -space-x-1">
                                                            <div className="size-5 rounded-full bg-purple-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">AC</div>
                                                        </div>
                                                    </div>
                                                    <div className="mock-card-name">Ashlynn Calzoni</div>
                                                    <div className="mock-card-meta">
                                                        <span className="mock-card-meta-label">Role</span>
                                                        <span className="mock-card-meta-val">Product Designer</span>
                                                        <span className="mock-card-meta-label">Location</span>
                                                        <span className="mock-card-meta-val">NY, New York</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 2: Shortlist */}
                                            <div className="mock-column">
                                                <div className="mock-column-header">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                                    <span>Shortlist (2)</span>
                                                </div>

                                                <div className="mock-card">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mock-badge-match">95% Match</span>
                                                        <div className="flex -space-x-1">
                                                            <div className="size-5 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">RS</div>
                                                        </div>
                                                    </div>
                                                    <div className="mock-card-name">Ruben Stanton</div>
                                                    <div className="mock-card-meta">
                                                        <span className="mock-card-meta-label">Role</span>
                                                        <span className="mock-card-meta-val">UI/UX Designer</span>
                                                        <span className="mock-card-meta-label">Location</span>
                                                        <span className="mock-card-meta-val">SF, California</span>
                                                    </div>
                                                </div>

                                                <div className="mock-card">
                                                    <div className="flex items-center justify-between">
                                                        <span className="mock-badge-match">58% Match</span>
                                                        <div className="flex -space-x-1">
                                                            <div className="size-5 rounded-full bg-pink-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">JD</div>
                                                        </div>
                                                    </div>
                                                    <div className="mock-card-name">Jordyn Dorwart</div>
                                                    <div className="mock-card-meta">
                                                        <span className="mock-card-meta-label">Role</span>
                                                        <span className="mock-card-meta-val">Product Designer</span>
                                                        <span className="mock-card-meta-label">Location</span>
                                                        <span className="mock-card-meta-val">NY, New York</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="welcome-divider" />

                    {/* Section 2: Business Value Bento Grid */}
                    <section id="value" className="space-y-12">
                        <div className="space-y-4">
                            <span className="font-mono text-xs font-bold text-[var(--muted)] tracking-widest block uppercase">
                                02 / Business Value
                            </span>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase max-w-4xl leading-tight">
                                MORE THROUGHPUT. ZERO LEAKAGE. IMMEDATE PREPARATION.
                            </h2>
                            <p className="text-[var(--muted-strong)] max-w-2xl text-base leading-relaxed">
                                Treat your career progression like a professional revenue pipeline. Our automation layer acts like an enterprise sales CRM for job seekers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {benefits.map((b) => (
                                <div key={b.title} className="editorial-card flex flex-col justify-between gap-8 hover:shadow-md transition">
                                    <div className="space-y-4">
                                        <span className="font-mono text-xs font-bold text-[var(--muted)] tracking-wider block">
                                            {b.kicker}
                                        </span>
                                        <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text)]">
                                            {b.title}
                                        </h3>
                                        <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
                                            {b.copy}
                                        </p>
                                    </div>
                                    <div className="border-t border-[var(--line)] pt-4">
                                        <span className="text-4xl font-extrabold tracking-tight text-[var(--text)] block">
                                            {b.metric}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mt-1 block">
                                            {b.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="welcome-divider" />

                    {/* Section 3: Tech Architecture & Stepper */}
                    <section id="architecture" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                            <span className="font-mono text-xs font-bold text-[var(--muted)] tracking-widest block uppercase">
                                03 / Engineering Architecture
                            </span>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight">
                                DISTRIBUTED PIPELINE STACK.
                            </h2>
                            <p className="text-base text-[var(--muted-strong)] leading-relaxed">
                                We designed a cost-aware, decentralized architecture to prevent timeouts and optimize token billing.
                                Messy document layout processing runs in Python FastAPI memory, while Gemini Flash maps raw structured text.
                            </p>
                            <div className="p-4 border border-[var(--text)] bg-[var(--surface-strong)] flex items-start gap-3">
                                <Users className="size-5 shrink-0 mt-0.5 text-[var(--text)]" />
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] block">
                                        Token Saving Solution
                                    </span>
                                    <p className="text-xs text-[var(--muted-strong)] mt-1 leading-relaxed">
                                        Instead of sending heavy image binaries directly to Gemini (costing thousands of tokens),
                                        we extract layout text in FastAPI. This drops Gemini's billing down to ~100 tokens per upload.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="stepper-container">
                                {steps.map((s, idx) => (
                                    <div key={idx} className="step-card" data-step-card>
                                        <div className="step-dot" />
                                        <div className="space-y-2 pb-4">
                                            <span className="font-mono text-xs font-bold text-[var(--muted)]">
                                                STAGE 0{idx + 1}
                                            </span>
                                            <h4 className="text-lg font-bold uppercase tracking-tight text-[var(--text)]">
                                                {s.title}
                                            </h4>
                                            <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
                                                {s.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="welcome-divider" />

                    {/* Section 4: Final Call to Action Editorial Block */}
                    <section className="editorial-card text-center space-y-8 py-16">
                        <span className="font-mono text-xs font-bold text-[var(--muted)] tracking-widest uppercase block">
                            04 / Action Step
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase max-w-4xl mx-auto leading-none">
                            IF THE MARKET IS A NUMBERS GAME, STOP PLAYING IT WITH MISSING DATA.
                        </h2>
                        <p className="text-[var(--muted-strong)] max-w-xl mx-auto text-base leading-relaxed">
                            Stop pasting fields manually. Build a highly visible, automated application queue, enrich your leads, and practice for actual interview sets.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="cta-pill px-8 py-4 font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2 group transition"
                            >
                                Start Pipeline Tracker
                                <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </div>
                    </section>
                </main>

                {/* Editorial Minimal Footer */}
                <footer className="mx-auto max-w-7xl px-6 md:px-8 py-12 border-t border-[var(--line)] text-center space-y-6">
                    <Heart className="size-5 mx-auto text-[var(--text)] transition hover:fill-red-500 hover:text-red-500 cursor-pointer" />
                    <div className="space-y-2">
                        <p className="font-mono text-xs font-bold tracking-widest text-[var(--text)] uppercase">
                            A personal AI engineering project by John Cedrick Guevara
                        </p>
                        <p className="text-sm text-[var(--muted-strong)] max-w-2xl mx-auto leading-relaxed">
                            Anti Mahinang Nilalang explores practical Gemini integrations for job-application workflows.
                            AI features are intentionally lifetime-limited to prevent API abuse.
                        </p>
                        <p className="text-[10px] tracking-wider text-[var(--muted)] uppercase">
                            <a
                                href="https://guevix.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[var(--accent)] transition-colors"
                            >
                                guevix.vercel.app
                            </a>
                            {' · '}
                            ANTI MAHINANG NILALANG © 2026
                        </p>
                    </div>
                    <BrandWatermark className="border-0 pt-0" />
                </footer>
            </div>
        </>
    );
}

