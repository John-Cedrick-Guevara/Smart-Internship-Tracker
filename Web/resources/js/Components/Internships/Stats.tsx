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
            gradient: 'from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500',
            bgGlow: 'rgba(59, 130, 246, 0.15)',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            title: 'Interviews Scheduled',
            value: activeInterviews,
            subtext: activeInterviews > 0 ? 'Ready for the next round!' : 'Keep applying to lock them in',
            gradient: 'from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500',
            bgGlow: 'rgba(168, 85, 247, 0.15)',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: 'Offers Extended',
            value: offersCount,
            subtext: offersCount > 0 ? 'Congratulations! Time to celebrate' : 'You are close, keep pushing!',
            gradient: 'from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500',
            bgGlow: 'rgba(16, 185, 129, 0.15)',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            )
        },
        {
            title: 'Paid Placement Rate',
            value: `${paidPercentage}%`,
            subtext: `${stats.paid_count} paid vs ${stats.unpaid_count} unpaid`,
            gradient: 'from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500',
            bgGlow: 'rgba(245, 158, 11, 0.15)',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 6h4a2 2 0 110 4h-4V6z" />
                </svg>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                    style={{
                        boxShadow: `0 10px 30px -15px ${card.bgGlow}, 0 1px 3px 0 rgba(0, 0, 0, 0.05)`
                    }}
                >
                    {/* Background Subtle Gradient Blob */}
                    <div 
                        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.08] blur-xl`}
                    />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {card.title}
                            </p>
                            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {card.value}
                            </h3>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-indigo-500/10`}>
                            {card.icon}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">{card.subtext}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
