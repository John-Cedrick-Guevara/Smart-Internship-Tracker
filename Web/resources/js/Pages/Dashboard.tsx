import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Clock,
    FileQuestion,
    ArrowUpRight,
    MapPin,
} from 'lucide-react';

interface DashboardProps {
    dashboardStats: {
        applications: number;
        questions: number;
        followups: number;
    };
    stages: {
        wishlist: number;
        applied: number;
        interviewing: number;
        offer: number;
        rejected: number;
    };
    recentApplications: Array<{
        id: number;
        company_name: string;
        position: string;
        location: string;
        is_paid: boolean;
        status: string;
        created_at: string;
    }>;
}

const STAGE_LABELS: Record<string, string> = {
    wishlist: 'Wishlist',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer Extended',
    rejected: 'Rejected',
};

const STAGE_DOTS: Record<string, string> = {
    wishlist: 'bg-[var(--muted)]',
    applied: 'bg-[var(--accent)]',
    interviewing: 'bg-[var(--accent-soft)]',
    offer: 'bg-[var(--success)]',
    rejected: 'bg-[var(--danger)]',
};

export default function Dashboard({
    dashboardStats,
    stages,
    recentApplications,
}: DashboardProps) {
    const stats = [
        {
            label: 'Applications captured',
            value: dashboardStats.applications,
            icon: BriefcaseBusiness,
            copy: 'Total active job and internship postings parsed in your tracker.',
        },
        {
            label: 'Interview questions',
            value: dashboardStats.questions,
            icon: FileQuestion,
            copy: 'Tailored practice questions generated directly from requirements.',
        },
        {
            label: 'Follow-ups pending',
            value: dashboardStats.followups,
            icon: Clock,
            copy: 'Applications in Applied stage needing active correspondence.',
        },
    ];

    const getDaysAgo = (dateStr: string) => {
        const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
                            Command center
                        </p>
                        <h2 className="mt-1 text-3xl font-extrabold tracking-tight uppercase text-[var(--text)] sm:text-4xl">
                            DASHBOARD
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={route('internships.list')} className="cta-pill px-4 py-2.5 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-[0.98]">
                            Open Tracker
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-8">
                    {/* Metrics Banner */}
                    <section className="grid gap-6 md:grid-cols-3">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <article key={stat.label} className="dashboard-card p-6 flex flex-col justify-between gap-4 hover:shadow-sm transition">
                                    <div className="flex items-start justify-between">
                                        <span className="font-mono text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                                            {stat.label}
                                        </span>
                                        <span className="logo-mark size-8 rounded-lg flex items-center justify-center">
                                            <Icon className="size-4" />
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-[var(--muted-strong)] leading-relaxed">
                                            {stat.copy}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {/* Breakdown section */}
                    <div className="grid gap-6 lg:grid-cols-12 items-start">
                        {/* Recent applications list */}
                        <section className="dashboard-card p-6 lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text)]">
                                    Recent captures
                                </h3>
                                <Link
                                    href={route('internships.list')}
                                    className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition underline underline-offset-4"
                                >
                                    View all
                                </Link>
                            </div>

                            {recentApplications.length === 0 ? (
                                <div className="subtle-empty rounded-2xl p-8 text-center border border-dashed border-[var(--line)]">
                                    <p className="text-sm text-[var(--muted)]">
                                        No opportunities tracked yet. Navigate to Internships to capture your first opening screenshot.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                                                <th className="pb-3">Company & Role</th>
                                                <th className="pb-3 hidden sm:table-cell">Location</th>
                                                <th className="pb-3 text-right">Compensation</th>
                                                <th className="pb-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--line)] text-sm">
                                            {recentApplications.map((item) => (
                                                <tr key={item.id} className="group hover:bg-[var(--surface-strong)] transition-colors">
                                                    <td className="py-3.5 pr-3">
                                                        <div>
                                                            <Link
                                                                href={route('internships.list')}
                                                                className="font-bold text-[var(--text)] hover:text-[var(--accent)] transition-colors block"
                                                            >
                                                                {item.company_name}
                                                            </Link>
                                                            <span className="text-xs text-[var(--muted)] block">
                                                                {item.position}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 hidden sm:table-cell text-[var(--muted-strong)]">
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <MapPin className="size-3.5 text-[var(--muted)]" />
                                                            <span>{item.location}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 text-right font-medium">
                                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                            item.is_paid 
                                                                ? 'bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]' 
                                                                : 'bg-[color-mix(in_srgb,var(--accent-soft)_10%,transparent)] text-[var(--accent-soft)]'
                                                        }`}>
                                                            {item.is_paid ? 'Paid' : 'Unpaid'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 text-right font-semibold text-xs">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <span className={`size-2 rounded-full ${STAGE_DOTS[item.status] || 'bg-slate-400'}`} />
                                                            <span className="uppercase text-[10px] tracking-wider text-[var(--muted-strong)]">
                                                                {STAGE_LABELS[item.status] || item.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* Pipeline stages summary */}
                        <section className="dashboard-card p-6 lg:col-span-4 space-y-6">
                            <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text)]">
                                Pipeline breakdown
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(STAGE_LABELS).map(([key, label]) => {
                                    const count = stages[key as keyof typeof stages] || 0;
                                    const total = dashboardStats.applications || 1;
                                    const percentage = Math.round((count / total) * 100);

                                    return (
                                        <div key={key} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[var(--muted-strong)]">
                                                    <span className={`size-2.5 rounded-full ${STAGE_DOTS[key]}`} />
                                                    <span>{label}</span>
                                                </div>
                                                <span className="font-mono font-bold text-[var(--text)]">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-[var(--surface-strong)] overflow-hidden border border-[var(--line)]">
                                                <div
                                                    className={`h-full rounded-full ${STAGE_DOTS[key]}`}
                                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
