import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Internship } from '@/types/internship';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import DetailPanel from '../../Components/Internships/DetailPanel';
import InternshipForm from '../../Components/Internships/InternshipForm';
import KanbanBoard from '../../Components/Internships/KanbanBoard';
import ListView from '../../Components/Internships/ListView';
import Stats from '../../Components/Internships/Stats';
import { useInternships } from '../../hooks/useInternships';

export default function Index({ internships }: { internships: Internship[] }) {
    // This will print: "Is it an array? true"
    console.log(internships)
    const {
        // Data & Lists
        stats,

        // Search & Filters
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        paidFilter,
        setPaidFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // Drawer & Modal trigger states
        selectedInternship,
        setSelectedInternshipId,
        isFormOpen,
        setIsFormOpen,
        editingInternship,
        setEditingInternship,

        // Operations
        addInternship,
        updateInternship,
        updateStatus,
        deleteInternship,
        addNote,
        deleteNote,
        addTimelineEvent,
        deleteTimelineEvent,

        // Diagnostics

    } = useInternships(internships);

    // View mode state ('kanban' | 'list')
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // Edit handler (opens the modal with existing internship data)
    const handleEditInitiate = (internship: any) => {
        setEditingInternship(internship);
        setIsFormOpen(true);
    };

    // Form submit dispatcher (handles both creation and update actions)
    const handleFormSubmit = (data: any) => {
        if (editingInternship) {
            updateInternship(editingInternship.id, data);
        } else {
            addInternship(data);
        }
    };

    const handleSortChange = (column: 'company_name' | 'position' | 'created_at') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc'); // Default to descending
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="eyebrow">Application pipeline</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text)] sm:text-4xl">
                            Internships Tracker
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted-strong)]">
                            Track and optimize your internship search workflow in one central workspace.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center space-x-3">


                        <button
                            onClick={() => {
                                setEditingInternship(null);
                                setIsFormOpen(true);
                            }}
                            className="cta-pill px-4 py-2.5 text-sm font-bold active:scale-[0.98]"
                        >
                            <svg className="mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Internship
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Internships Tracker" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Metrics Banner */}
                    <Stats stats={stats} />

                    {/* check if there are any internships data to display */}
                    {internships && internships.length > 0 ? (
                        <>
                            {/* Filter and Control Bar */}
                            <div className="internship-surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">

                                {/* Search and Dropdowns */}
                                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">

                                    {/* Search bar */}
                                    <div className="relative flex-1">
                                        <span className="absolute inset-y-0 left-3 flex items-center text-[var(--muted)]">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search company, position, or location..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="themed-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="sm:w-48">
                                        <select
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                            className="themed-input w-full rounded-xl px-3 py-2.5 text-sm"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="wishlist">Wishlist</option>
                                            <option value="applied">Applied</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="offer">Offer Extended</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    {/* Paid Filter */}
                                    <div className="sm:w-44">
                                        <select
                                            value={paidFilter}
                                            onChange={e => setPaidFilter(e.target.value)}
                                            className="themed-input w-full rounded-xl px-3 py-2.5 text-sm"
                                        >
                                            <option value="all">Paid & Unpaid</option>
                                            <option value="paid">Paid Placements</option>
                                            <option value="unpaid">Unpaid Placements</option>
                                        </select>
                                    </div>
                                </div>

                                {/* View Switcher pills */}
                                <div className="flex shrink-0 items-center justify-between border-t border-[var(--line)] pt-4 lg:border-t-0 lg:pt-0">
                                    <div className="segmented-control inline-flex">
                                        <button
                                            onClick={() => setViewMode('kanban')}
                                            data-active={viewMode === 'kanban'}
                                            className="segmented-option inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                            </svg>
                                            <span>Kanban Board</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            data-active={viewMode === 'list'}
                                            className="segmented-option inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                            <span>List View</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* View Panels */}
                            <div className="min-h-[400px]">
                                {viewMode === 'kanban' ? (
                                    <KanbanBoard
                                        internships={internships}
                                        onSelect={setSelectedInternshipId}
                                        onEdit={handleEditInitiate}
                                        onDelete={deleteInternship}
                                        onStatusChange={updateStatus}
                                    />
                                ) : (
                                    <ListView
                                        internships={internships}
                                        onSelect={setSelectedInternshipId}
                                        onEdit={handleEditInitiate}
                                        onDelete={deleteInternship}
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                        onSortChange={handleSortChange}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="subtle-empty rounded-[28px] p-10 text-center">
                            <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">
                                No opportunities yet
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                                Add your first internship or job lead to start building a searchable, interview-ready pipeline.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Detail Slide-over */}
            <DetailPanel
                internship={selectedInternship}
                onClose={() => setSelectedInternshipId(null)}
                onEdit={handleEditInitiate}
                onDelete={deleteInternship}
                onAddNote={addNote}
                onDeleteNote={deleteNote}
                onAddEvent={addTimelineEvent}
                onDeleteEvent={deleteTimelineEvent}
            />

            {/* Add / Edit Form Modal */}
            <InternshipForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingInternship(null);
                }}
                onSubmit={handleFormSubmit}
                internship={editingInternship}
            />
        </AuthenticatedLayout>
    );
}
