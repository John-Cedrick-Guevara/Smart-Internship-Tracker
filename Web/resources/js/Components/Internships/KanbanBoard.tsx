import React, { useState } from 'react';
import { Internship, InternshipStatus } from '../../types/internship';

interface KanbanBoardProps {
    internships: Internship[];
    onSelect: (id: number) => void;
    onEdit: (internship: Internship) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: InternshipStatus) => void;
}

interface ColumnConfig {
    id: InternshipStatus;
    title: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    accentColor: string;
}

const COLUMNS: ColumnConfig[] = [
    {
        id: 'wishlist',
        title: 'Wishlist',
        bgColor: 'bg-gray-50 dark:bg-gray-950',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-800',
        accentColor: 'bg-gray-400 dark:bg-gray-500'
    },
    {
        id: 'applied',
        title: 'Applied',
        bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-100 dark:border-blue-900/50',
        accentColor: 'bg-blue-500'
    },
    {
        id: 'interviewing',
        title: 'Interviewing',
        bgColor: 'bg-purple-50/50 dark:bg-purple-950/20',
        textColor: 'text-purple-700 dark:text-purple-300',
        borderColor: 'border-purple-100 dark:border-purple-900/50',
        accentColor: 'bg-purple-500'
    },
    {
        id: 'offer',
        title: 'Offer',
        bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-100 dark:border-emerald-900/50',
        accentColor: 'bg-emerald-500'
    },
    {
        id: 'rejected',
        title: 'Rejected',
        bgColor: 'bg-rose-50/50 dark:bg-rose-950/20',
        textColor: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-100 dark:border-rose-900/50',
        accentColor: 'bg-rose-500'
    }
];

export default function KanbanBoard({
    internships,
    onSelect,
    onEdit,
    onDelete,
    onStatusChange
}: KanbanBoardProps) {
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Group internships by column
    const grouped = COLUMNS.reduce(
        (acc, col) => {
            acc[col.id] = internships.filter(item => item.status === col.id);
            return acc;
        },
        {} as Record<InternshipStatus, Internship[]>
    );

    // Calculate days ago helper
    const getDaysAgo = (dateStr: string) => {
        const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    // Drag-and-drop handlers
    const handleDragStart = (id: number) => {
        setDraggedId(id);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDrop = (e: React.DragEvent, targetColumn: InternshipStatus) => {
        e.preventDefault();
        if (draggedId !== null) {
            onStatusChange(draggedId, targetColumn);
        }
        handleDragEnd();
    };

    return (
        <div className="grid grid-cols-1 gap-5 overflow-x-auto pb-4 md:grid-cols-5">
            {COLUMNS.map(col => {
                const columnItems = grouped[col.id] || [];
                const isOver = dragOverColumn === col.id;

                return (
                    <div
                        key={col.id}
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className={`flex min-h-[500px] flex-col rounded-2xl border p-4 transition-all duration-200 ${col.bgColor} ${
                            isOver 
                                ? 'border-indigo-400 ring-2 ring-indigo-500/10 scale-[1.01] dark:border-indigo-500' 
                                : col.borderColor
                        }`}
                    >
                        {/* Column Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${col.accentColor}`} />
                                <h4 className={`font-semibold text-sm tracking-wide ${col.textColor}`}>
                                    {col.title}
                                </h4>
                            </div>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                {columnItems.length}
                            </span>
                        </div>

                        {/* Column Cards */}
                        <div className="flex flex-1 flex-col space-y-3">
                            {columnItems.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-4 text-center dark:border-gray-800">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Drop cards here</span>
                                </div>
                            ) : (
                                columnItems.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={() => handleDragStart(item.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => onSelect(item.id)}
                                        className={`group relative cursor-grab overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-gray-800 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 ${
                                            draggedId === item.id ? 'opacity-40' : ''
                                        }`}
                                    >
                                        {/* Colored Left Border Accent */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.accentColor}`} />

                                        {/* Card content */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h5 className="font-bold text-gray-900 line-clamp-1 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {item.company_name}
                                                </h5>
                                                <p className="mt-0.5 font-medium text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {item.position}
                                                </p>
                                            </div>
                                            
                                            {/* Paid Badge */}
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                                item.is_paid 
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                            }`}>
                                                {item.is_paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                                            <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{item.location}</span>
                                        </p>

                                        {/* Card Bottom: Counts & Timeline */}
                                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                {getDaysAgo(item.created_at)}
                                            </span>
                                            
                                            <div className="flex items-center space-x-2.5">
                                                {/* Notes Indicator */}
                                                {(item.notes && item.notes.length > 0) && (
                                                    <span className="flex items-center text-[10px] text-gray-400 dark:text-gray-500" title={`${item.notes.length} notes`}>
                                                        <svg className="mr-0.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        {item.notes.length}
                                                    </span>
                                                )}
                                                
                                                {/* Timeline events Indicator */}
                                                {(item.timeline && item.timeline.length > 0)&& (
                                                    <span className="flex items-center text-[10px] text-gray-400 dark:text-gray-500" title={`${item.timeline.length} timeline events`}>
                                                        <svg className="mr-0.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {item.timeline.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons (Shown on Card Hover) */}
                                        <div className="absolute right-2 top-2 hidden items-center space-x-1 rounded-lg bg-white/90 p-0.5 shadow-sm group-hover:flex dark:bg-gray-900/90 backdrop-blur-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(item);
                                                }}
                                                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-indigo-400"
                                                title="Edit"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Are you sure you want to delete your application at ${item.company_name}?`)) {
                                                        onDelete(item.id);
                                                    }
                                                }}
                                                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-red-400"
                                                title="Delete"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
