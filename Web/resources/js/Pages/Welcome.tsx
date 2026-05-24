import { useTheme } from '@/hooks/useTheme';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    BriefcaseBusiness,
    Check,
    ClipboardList,
    Database,
    FileQuestion,
    Gauge,
    ImageUp,
    KanbanSquare,
    Moon,
    Network,
    ShieldCheck,
    Sparkles,
    Sun,
    TimerReset,
    WandSparkles,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const benefits = [
    {
        icon: TimerReset,
        title: 'Cut copy-paste work',
        copy: 'Turn job screenshots into structured company, role, deadline, contact, and compensation data without manual form filling.',
        metric: '20+',
        label: 'applications/day without tracker chaos',
    },
    {
        icon: ShieldCheck,
        title: 'Stop losing context',
        copy: 'Preserve the posting details, resume variant, notes, assets, and follow-up history even after the original listing disappears.',
        metric: '1',
        label: 'source of truth per opportunity',
    },
    {
        icon: FileQuestion,
        title: 'Prepare while the lead is warm',
        copy: 'Generate role-specific interview questions from the same posting data so applicants can practice against the actual requirement set.',
        metric: '5',
        label: 'tailored questions generated per role',
    },
];

const pipelineSteps = [
    {
        icon: ImageUp,
        title: 'Drop screenshot',
        copy: 'The applicant uploads a job or internship screenshot from LinkedIn, Facebook, school portals, or company pages.',
    },
    {
        icon: Bot,
        title: 'Parse the layout',
        copy: 'A dedicated OCR service converts messy visual layouts into clean Markdown that downstream AI can reason over cheaply.',
    },
    {
        icon: WandSparkles,
        title: 'Structure the lead',
        copy: 'Gemini maps the posting into strict JSON fields and generates interview prep tied to the role.',
    },
    {
        icon: KanbanSquare,
        title: 'Track to outcome',
        copy: 'The clean opportunity moves into a Kanban pipeline with assets, notes, questions, and follow-up context attached.',
    },
];

const stack = [
    {
        icon: BriefcaseBusiness,
        title: 'Laravel + React gateway',
        copy: 'Secure upload handling, validation boundaries, persistence, and a responsive Inertia interface for the application pipeline.',
    },
    {
        icon: Network,
        title: 'FastAPI OCR worker',
        copy: 'A dedicated vision service keeps heavy layout parsing away from the web app so the user experience remains responsive.',
    },
    {
        icon: Database,
        title: 'Lean structured storage',
        copy: 'Images stay in object/file storage while the database keeps paths, parsed fields, questions, and pipeline state.',
    },
];

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const rootRef = useRef<HTMLDivElement>(null);
    const { theme, toggleTheme } = useTheme();

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
                    transform: 'translateY(18px) scale(0.98)',
                    duration: 0.72,
                    ease: 'power3.out',
                    stagger: 0.055,
                });

                gsap.to('[data-float]', {
                    transform: 'translateY(-10px)',
                    duration: 2.8,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    stagger: 0.18,
                });

                gsap.from('[data-flow-node]', {
                    opacity: 0,
                    transform: 'scale(0.94)',
                    duration: 0.5,
                    ease: 'power3.out',
                    stagger: 0.08,
                    delay: 0.35,
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
            <div ref={rootRef} className="page-shell">
                <div className="page-noise absolute inset-0" />
                <div className="page-orb page-orb-a absolute -left-32 top-10 h-80 w-80" />
                <div className="page-orb page-orb-b absolute right-0 top-48 h-96 w-96" />

                <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-5 sm:px-8 lg:gap-20 lg:px-10">
                    <header className="topbar" data-animate>
                        <Link
                            href="/"
                            className="flex items-center gap-3 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            aria-label="Anti Mahinang Nilalang home"
                        >
                            <span className="logo-mark">
                                <Sparkles className="size-5" />
                            </span>
                            <span>
                                <span className="brand-kicker block">
                                    Anti Mahinang Nilalang
                                </span>
                                <span className="brand-subtitle block">
                                    Smart application tracker
                                </span>
                            </span>
                        </Link>

                        <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <a href="#pipeline" className="nav-pill">
                                How it works
                            </a>
                            <a href="#value" className="nav-pill">
                                Value
                            </a>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle"
                                aria-label={`Switch to ${
                                    theme === 'dark' ? 'light' : 'dark'
                                } mode`}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                                {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                            {auth.user ? (
                                <Link href={route('dashboard')} className="cta-pill">
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="ghost-pill">
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="cta-pill"
                                    >
                                        Start tracking
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="grid min-h-[calc(100dvh-7.5rem)] items-center gap-8 py-2 lg:grid-cols-[1fr_0.88fr]">
                        <div className="hero-copy">
                            <div className="eyebrow" data-animate>
                                Built for job seekers who treat applications like a pipeline
                            </div>
                            <div className="space-y-6">
                                <h1 className="hero-title" data-animate>
                                    Your job hunt is not a spreadsheet. It is a revenue pipeline for your career.
                                </h1>
                                <p className="hero-text" data-animate>
                                    Anti Mahinang Nilalang turns chaotic job and internship hunting into an automated, data-driven system: upload a posting screenshot, extract the opportunity, generate interview prep, and move every lead through a clean Kanban workflow.
                                </p>
                            </div>
                            <div
                                className="flex flex-col gap-3 sm:flex-row"
                                data-animate
                            >
                                <Link
                                    href={
                                        auth.user
                                            ? route('dashboard')
                                            : route('register')
                                    }
                                    className="cta-pill cta-pill-large"
                                >
                                    Build my pipeline
                                    <ArrowRight className="size-5" />
                                </Link>
                                <a
                                    href="#pipeline"
                                    className="ghost-pill cta-pill-large"
                                >
                                    See the workflow
                                </a>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3" data-animate>
                                {['OCR extraction', 'JSON fields', 'Interview prep'].map(
                                    (item) => (
                                        <span key={item} className="mini-stat">
                                            <Check className="size-4 text-[var(--accent)]" />
                                            {item}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>

                        <aside className="hero-panel" data-animate data-float>
                            <div className="hero-panel__top">
                                <div>
                                    <div className="panel-kicker">Live pipeline</div>
                                    <h2 className="panel-title">
                                        Screenshot to interview-ready lead
                                    </h2>
                                </div>
                                <span className="live-chip">
                                    <span className="live-dot" />
                                    Parsing
                                </span>
                            </div>

                            <div className="stack-preview">
                                <div className="stack-preview__card stack-preview__card--tall">
                                    <div className="card-head">
                                        <ImageUp className="size-4 text-[var(--accent)]" />
                                        Raw posting screenshot
                                    </div>
                                    <div className="mt-4 rounded-[22px] border bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] p-4">
                                        <div className="h-3 w-32 rounded-full bg-[var(--accent)]/40" />
                                        <div className="mt-5 grid gap-2">
                                            <div className="h-3 rounded-full bg-slate-400/20" />
                                            <div className="h-3 w-10/12 rounded-full bg-slate-400/20" />
                                            <div className="h-3 w-7/12 rounded-full bg-slate-400/20" />
                                        </div>
                                        <div className="mt-5 grid grid-cols-3 gap-2">
                                            <div className="h-16 rounded-2xl bg-[var(--accent)]/15" />
                                            <div className="h-16 rounded-2xl bg-slate-400/15" />
                                            <div className="h-16 rounded-2xl bg-slate-400/15" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="metric-block">
                                        <div className="metric-value">~100</div>
                                        <div className="metric-label">
                                            text tokens sent after OCR, not expensive image tokens
                                        </div>
                                    </div>
                                    <div className="metric-block">
                                        <div className="metric-value">4 stages</div>
                                        <div className="metric-label">
                                            To Apply, Applied, Interviewing, Offered
                                        </div>
                                    </div>
                                </div>

                                <div className="stack-preview__card">
                                    <div className="card-head">
                                        <ClipboardList className="size-4 text-[var(--accent)]" />
                                        Generated application record
                                    </div>
                                    <div className="card-body">
                                        {[
                                            ['Company', 'Frontend Intern at Acme Studio'],
                                            ['Prep', '5 role-specific interview questions'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="board-row">
                                                <span className="board-row__id">
                                                    {label.slice(0, 1)}
                                                </span>
                                                <span>
                                                    <span className="board-row__title block">
                                                        {label}
                                                    </span>
                                                    <span className="board-row__copy block">
                                                        {value}
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section id="value" className="grid gap-8">
                        <div className="max-w-3xl space-y-4" data-animate>
                            <div className="eyebrow">Business value</div>
                            <h2 className="section-title">
                                More throughput, less leakage, better interview readiness.
                            </h2>
                            <p className="section-copy">
                                The product gives applicants the same operational advantage businesses use in sales CRMs: every opportunity is captured, enriched, tracked, and prepared against before it goes cold.
                            </p>
                        </div>

                        <div className="bento-grid">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;

                                return (
                                    <article
                                        key={benefit.title}
                                        className={`bento-card ${
                                            index === 0
                                                ? 'bento-card--wide'
                                                : 'md:col-span-6'
                                        }`}
                                        data-animate
                                    >
                                        <div className="flex h-full flex-col justify-between gap-8">
                                            <div className="space-y-4">
                                                <span className="logo-mark">
                                                    <Icon className="size-5" />
                                                </span>
                                                <div className="bento-copy">
                                                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                                                        {benefit.title}
                                                    </h3>
                                                    <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">
                                                        {benefit.copy}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-5xl font-semibold tracking-[-0.08em] text-[var(--text)]">
                                                    {benefit.metric}
                                                </div>
                                                <div className="mt-2 text-sm text-[var(--muted)]">
                                                    {benefit.label}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section id="pipeline" className="story-layout">
                        <div className="story-layout__intro space-y-4" data-animate>
                            <div className="eyebrow">How it works</div>
                            <h2 className="section-title">
                                A distributed AI workflow your users only experience as one upload.
                            </h2>
                            <p className="section-copy">
                                The system separates orchestration, visual parsing, and structural mapping so the frontend stays fast while the AI work remains accurate and cost-aware.
                            </p>
                        </div>

                        <div className="story-rail">
                            {pipelineSteps.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <article
                                        key={step.title}
                                        className="story-step"
                                        data-animate
                                        data-flow-node
                                    >
                                        <span className="story-step__index">
                                            0{index + 1}
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <Icon className="size-5 text-[var(--accent)]" />
                                                <h3 className="story-step__title">
                                                    {step.title}
                                                </h3>
                                            </div>
                                            <p className="story-step__copy mt-2">
                                                {step.copy}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="stack-section">
                        <div className="max-w-3xl space-y-4" data-animate>
                            <div className="eyebrow">Architecture users can trust</div>
                            <h2 className="section-title">
                                Built to avoid slow, expensive, everything-in-one AI calls.
                            </h2>
                        </div>

                        <div className="stack-grid">
                            {stack.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        key={item.title}
                                        className={`stack-tile stack-tile--${index + 1}`}
                                        data-animate
                                        data-float={index === 1 ? true : undefined}
                                    >
                                        <span className="logo-mark">
                                            <Icon className="size-5" />
                                        </span>
                                        <h3>{item.title}</h3>
                                        <p>{item.copy}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="closing-band mb-10" data-animate>
                        <div className="max-w-2xl">
                            <div className="eyebrow">The practical promise</div>
                            <h2 className="closing-title mt-3">
                                If the market is a numbers game, stop playing it with missing data.
                            </h2>
                            <p className="section-copy mt-4">
                                Capture more roles, follow up with context, and walk into interviews with preparation generated from the exact posting.
                            </p>
                        </div>
                        <Link
                            href={auth.user ? route('dashboard') : route('register')}
                            className="cta-pill cta-pill-large shrink-0"
                        >
                            Open the tracker
                            <Gauge className="size-5" />
                        </Link>
                    </section>
                </main>
            </div>
        </>
    );
}
