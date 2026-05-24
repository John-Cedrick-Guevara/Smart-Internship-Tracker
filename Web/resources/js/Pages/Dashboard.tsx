import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ArrowUpRight,
    BriefcaseBusiness,
    ClipboardCheck,
    FileQuestion,
    ImageUp,
} from 'lucide-react';

const stats = [
    {
        label: 'Applications captured',
        value: '0',
        copy: 'Start by dropping a job screenshot into the internship tracker.',
    },
    {
        label: 'Interview questions',
        value: '0',
        copy: 'Generated prep will appear after OCR extraction succeeds.',
    },
    {
        label: 'Follow-ups due',
        value: '0',
        copy: 'Keep warm leads from disappearing into the black hole.',
    },
];

const actions = [
    {
        icon: ImageUp,
        title: 'Capture a posting',
        copy: 'Upload a screenshot and let the OCR pipeline extract the role details.',
    },
    {
        icon: FileQuestion,
        title: 'Prepare from context',
        copy: 'Generate interview questions from the exact posting requirements.',
    },
    {
        icon: ClipboardCheck,
        title: 'Move the lead forward',
        copy: 'Track every opportunity through To Apply, Applied, Interviewing, and Offered.',
    },
];

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Command center</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text)]">
                            Dashboard
                        </h2>
                    </div>
                    <a href={route('internships.list')} className="cta-pill">
                        Open tracker
                        <ArrowUpRight className="size-4" />
                    </a>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
                    <section className="dashboard-card overflow-hidden p-6 sm:p-8">
                        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-strong)_72%,transparent)] px-3 py-2 text-sm font-medium text-[var(--muted-strong)]">
                                    <BriefcaseBusiness className="size-4 text-[var(--accent)]" />
                                    Smart internship and job pipeline
                                </div>
                                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[var(--text)] sm:text-5xl">
                                    Keep every opportunity visible from screenshot to offer.
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-strong)]">
                                    This dashboard is the operating layer for your search: capture postings, preserve context, generate interview prep, and move each application through a clear workflow.
                                </p>
                            </div>
                            <div className="rounded-[26px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] p-4">
                                <div className="grid gap-3">
                                    {['To Apply', 'Applied', 'Interviewing', 'Offered'].map(
                                        (stage, index) => (
                                            <div
                                                key={stage}
                                                className="flex items-center justify-between rounded-2xl bg-[var(--surface-strong)] p-4"
                                            >
                                                <span className="font-medium text-[var(--text)]">
                                                    {stage}
                                                </span>
                                                <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                                                    {index === 0 ? 'Ready' : '0'}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        {stats.map((stat) => (
                            <article key={stat.label} className="dashboard-stat p-5">
                                <div className="text-4xl font-semibold tracking-[-0.07em] text-[var(--text)]">
                                    {stat.value}
                                </div>
                                <h3 className="mt-3 font-semibold text-[var(--text)]">
                                    {stat.label}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                    {stat.copy}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="grid gap-4 lg:grid-cols-3">
                        {actions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <article
                                    key={action.title}
                                    className="dashboard-card p-5"
                                >
                                    <span className="logo-mark">
                                        <Icon className="size-5" />
                                    </span>
                                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                                        {action.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">
                                        {action.copy}
                                    </p>
                                </article>
                            );
                        })}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
