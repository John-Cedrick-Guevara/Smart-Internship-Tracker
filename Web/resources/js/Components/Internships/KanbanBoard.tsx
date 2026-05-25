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
        bgColor: 'bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]',
        textColor: 'text-[var(--muted-strong)]',
        borderColor: 'border-[var(--line)]',
        accentColor: 'bg-[var(--muted)]'
    },
    {
        id: 'applied',
        title: 'Applied',
        bgColor: 'bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]',
        textColor: 'text-[var(--accent)]',
        borderColor: 'border-[color-mix(in_srgb,var(--accent)_20%,var(--line))]',
        accentColor: 'bg-[var(--accent)]'
    },
    {
        id: 'interviewing',
        title: 'Interviewing',
        bgColor: 'bg-[color-mix(in_srgb,var(--accent-soft)_9%,transparent)]',
        textColor: 'text-[var(--accent-soft)]',
        borderColor: 'border-[color-mix(in_srgb,var(--accent-soft)_22%,var(--line))]',
        accentColor: 'bg-[var(--accent-soft)]'
    },
    {
        id: 'offer',
        title: 'Offer',
        bgColor: 'bg-[color-mix(in_srgb,var(--success)_8%,transparent)]',
        textColor: 'text-[var(--success)]',
        borderColor: 'border-[color-mix(in_srgb,var(--success)_20%,var(--line))]',
        accentColor: 'bg-[var(--success)]'
    },
    {
        id: 'rejected',
        title: 'Rejected',
        bgColor: 'bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]',
        textColor: 'text-[var(--danger)]',
        borderColor: 'border-[color-mix(in_srgb,var(--danger)_20%,var(--line))]',
        accentColor: 'bg-[var(--danger)]'
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
                        className={`flex min-h-[500px] flex-col rounded-[24px] border p-4 transition-all duration-200 ${col.bgColor} ${
                            isOver 
                                ? 'scale-[1.01] border-[var(--accent)] ring-2 ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]'
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
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-strong)] text-xs font-semibold text-[var(--muted)] shadow-sm">
                                {columnItems.length}
                            </span>
                        </div>

                        {/* Column Cards */}
                        <div className="flex flex-1 flex-col space-y-3">
                            {columnItems.length === 0 ? (
                                <div className="subtle-empty flex flex-1 flex-col items-center justify-center rounded-xl p-4 text-center">
                                    <span className="text-xs">Drop cards here</span>
                                </div>
                            ) : (
                                columnItems.map(item => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={() => handleDragStart(item.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => onSelect(item.id)}
                                        className={`internship-card group relative cursor-grab overflow-hidden p-4 active:cursor-grabbing ${
                                            draggedId === item.id ? 'opacity-40' : ''
                                        }`}
                                    >
                                        {/* Colored Left Border Accent */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.accentColor}`} />

                                        {/* Card content */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h5 className="line-clamp-1 text-sm font-bold text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                                                    {item.company_name}
                                                </h5>
                                                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[var(--muted)]">
                                                    {item.position}
                                                </p>
                                            </div>
                                            
                                            {/* Paid Badge */}
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                                item.is_paid 
                                                    ? 'bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]' 
                                                    : 'bg-[color-mix(in_srgb,var(--accent-soft)_10%,transparent)] text-[var(--accent-soft)]'
                                            }`}>
                                                {item.is_paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-center text-[11px] text-[var(--muted)]">
                                            <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{item.location}</span>
                                        </p>

                                        {/* Card Bottom: Counts & Timeline */}
                                        <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
                                            <span className="text-[10px] font-medium text-[var(--muted)]">
                                                {getDaysAgo(item.created_at)}
                                            </span>
                                            
                                            <div className="flex items-center space-x-2.5">
                                                {/* Notes Indicator */}
                                                {(item.notes && item.notes.length > 0) && (
                                                    <span className="flex items-center text-[10px] text-[var(--muted)]" title={`${item.notes.length} notes`}>
                                                        <svg className="mr-0.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        {item.notes.length}
                                                    </span>
                                                )}
                                                
                                                {/* Timeline events Indicator */}
                                                {(item.timeline && item.timeline.length > 0)&& (
                                                    <span className="flex items-center text-[10px] text-[var(--muted)]" title={`${item.timeline.length} timeline events`}>
                                                        <svg className="mr-0.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {item.timeline.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons (Shown on Card Hover) */}
                                        <div className="absolute right-2 top-2 hidden items-center space-x-1 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)]/90 p-0.5 shadow-sm backdrop-blur-sm group-hover:flex">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(item);
                                                }}
                                                className="rounded p-1 text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--accent)]"
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
                                                className="rounded p-1 text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] hover:text-[var(--danger)]"
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
