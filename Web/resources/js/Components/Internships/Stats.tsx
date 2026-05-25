import React from 'react';
import { InternshipStats } from '../../types/internship';

interface StatsProps {
    stats: InternshipStats;
}

export default function Stats({ stats }: StatsProps) {
    const activeInterviews = stats.interviewing;
    const offersCount = stats.offer;

    // Calculate paid ratio percentage safely
    const paidPercentage = stats.total > 0 ? Math.round((stats.paid_count / stats.total) * 100) : 0;

    const cards = [
        {
            title: 'Total Applications',
            value: stats.total,
            subtext: `${stats.applied} active submission${stats.applied === 1 ? '' : 's'}`,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: 'Interviews Scheduled',
            value: activeInterviews,
            subtext: activeInterviews > 0 ? 'Ready for the next round!' : 'Keep applying to lock them in',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: 'Offers Extended',
            value: offersCount,
            subtext: offersCount > 0 ? 'Congratulations! Time to celebrate' : 'You are close, keep pushing!',
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            )
        },
        {
            title: 'Paid Placement Rate',
            value: `${paidPercentage}%`,
            subtext: `${stats.paid_count} paid vs ${stats.unpaid_count} unpaid`,
            icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 6h4a2 2 0 110 4h-4V6z" />
                </svg>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((stat, idx) => (
                <article key={idx} className="dashboard-card p-6 flex flex-col justify-between gap-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                            {stat.title}
                        </span>
                        <span className="logo-mark size-8 rounded-lg flex items-center justify-center">
                            {stat.icon}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
                            {stat.value}
                        </div>
                        <p className="text-xs text-[var(--muted-strong)] leading-relaxed">
                            {stat.subtext}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}
