import React from 'react';
import { Internship, InternshipStatus } from '../../types/internship';

interface ListViewProps {
    internships: Internship[];
    onSelect: (id: number) => void;
    onEdit: (internship: Internship) => void;
    onDelete: (id: number) => void;
    sortBy: 'company_name' | 'position' | 'created_at';
    sortOrder: 'asc' | 'desc';
    onSortChange: (column: 'company_name' | 'position' | 'created_at') => void;
}

export default function ListView({
    internships,
    onSelect,
    onEdit,
    onDelete,
    sortBy,
    sortOrder,
    onSortChange
}: ListViewProps) {
    const getStatusStyle = (status: InternshipStatus) => {
        switch (status) {
            case 'wishlist':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
            case 'applied':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
            case 'interviewing':
                return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
            case 'offer':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
            case 'rejected':
                return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
            default:
                return 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
        }
    };

    const renderSortArrow = (column: 'company_name' | 'position' | 'created_at') => {
        if (sortBy !== column) return null;
        return (
            <svg 
                className={`ml-1 h-3.5 w-3.5 inline-block transition-transform duration-200 ${
                    sortOrder === 'desc' ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
        );
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                            <th 
                                className="cursor-pointer p-4 transition-colors hover:bg-gray-150 dark:hover:bg-gray-900 select-none"
                                onClick={() => onSortChange('company_name')}
                            >
                                Company {renderSortArrow('company_name')}
                            </th>
                            <th 
                                className="cursor-pointer p-4 transition-colors hover:bg-gray-150 dark:hover:bg-gray-900 select-none"
                                onClick={() => onSortChange('position')}
                            >
                                Position {renderSortArrow('position')}
                            </th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Compensation</th>
                            <th 
                                className="cursor-pointer p-4 transition-colors hover:bg-gray-150 dark:hover:bg-gray-900 select-none"
                                onClick={() => onSortChange('created_at')}
                            >
                                Added {renderSortArrow('created_at')}
                            </th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
                        {internships.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="font-medium text-base text-gray-700 dark:text-gray-300">No applications found</p>
                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your filters or search query.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            internships.map(item => (
                                <tr 
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className="group cursor-pointer hover:bg-gray-50/55 dark:hover:bg-gray-950/20 transition-all duration-150"
                                >
                                    <td className="p-4 font-bold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                                        {item.company_name}
                                    </td>
                                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">
                                        {item.position}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <svg className="mr-1.5 h-4 w-4 shrink-0 text-gray-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate max-w-[150px]">{item.location}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 font-medium">
                                        {item.duration || 'N/A'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                            item.is_paid 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                        }`}>
                                            {item.is_paid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-450 dark:text-gray-500 font-medium">
                                        {new Date(item.created_at).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end space-x-1.5">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-650 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors"
                                                title="Edit Details"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete your application at ${item.company_name}?`)) {
                                                        onDelete(item.id);
                                                    }
                                                }}
                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-650 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors"
                                                title="Delete Application"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
