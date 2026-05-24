import { useEffect, useMemo, useState } from "react";
import {
    Internship,
    InternshipStatus,
    Note,
    TimelineEvent,
    InternshipStats,
} from "../types/internship";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

type InternshipWritePayload = Omit<
    Internship,
    | "id"
    | "user_id"
    | "created_at"
    | "updated_at"
    | "last_activity_at"
    | "resume_match_result"
    | "resume_match_analyzed_at"
    | "notes"
    | "timeline"
    | "interview_questions"
    | "assets"
>;

// Premium high-fidelity mock data to make the UI look stellar immediately

export function useInternships(initialInternships: Internship[]) {
    // 1. Core State
    const [internships, setInternships] =
        useState<Internship[]>(initialInternships);

    useEffect(() => {
        setInternships(initialInternships);
    }, [initialInternships]);

    // 2. Filter, Search and Sorting States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paidFilter, setPaidFilter] = useState<string>("all"); // 'all' | 'paid' | 'unpaid'
    const [sortBy, setSortBy] = useState<
        "company_name" | "position" | "created_at"
    >("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // 3. UI States (Drawer & Modals)
    const [selectedInternshipId, setSelectedInternshipId] = useState<
        number | null
    >(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInternship, setEditingInternship] =
        useState<Internship | null>(null);

    // Get currently selected internship object reactively
    const selectedInternship = useMemo(() => {
        return internships.find((i) => i.id === selectedInternshipId) || null;
    }, [internships, selectedInternshipId]);

    // 4. Computed Statistics
    const stats = useMemo<InternshipStats>(() => {
        const total = internships.length;
        const wishlist =
            internships.filter((i) => i.status === "wishlist").length || 0;
        const applied =
            internships.filter((i) => i.status === "applied").length || 0;
        const interviewing =
            internships.filter((i) => i.status === "interviewing").length || 0;
        const offer =
            internships.filter((i) => i.status === "offer").length || 0;
        const rejected =
            internships.filter((i) => i.status === "rejected").length || 0;
        const paid_count = internships.filter((i) => i.is_paid).length || 0;
        const unpaid_count = total - paid_count;

        return {
            total,
            wishlist,
            applied,
            interviewing,
            offer,
            rejected,
            paid_count,
            unpaid_count,
        };
    }, [internships]);

    // 5. Computed Filtered and Sorted Internships
    const filteredInternships = useMemo(() => {
        return internships
            .filter((internship) => {
                const query = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    internship.company_name.toLowerCase().includes(query) ||
                    internship.position.toLowerCase().includes(query) ||
                    internship.location.toLowerCase().includes(query);

                const matchesStatus =
                    statusFilter === "all" ||
                    internship.status === statusFilter;

                const matchesPaid =
                    paidFilter === "all" ||
                    (paidFilter === "paid" && internship.is_paid) ||
                    (paidFilter === "unpaid" && !internship.is_paid);

                return matchesSearch && matchesStatus && matchesPaid;
            })
            .sort((a, b) => {
                let valueA = a[sortBy];
                let valueB = b[sortBy];

                // Null safety / fallback
                if (valueA === undefined || valueA === null) valueA = "";
                if (valueB === undefined || valueB === null) valueB = "";

                if (typeof valueA === "string" && typeof valueB === "string") {
                    return sortOrder === "asc"
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }

                return sortOrder === "asc"
                    ? valueA > valueB
                        ? 1
                        : -1
                    : valueB > valueA
                      ? 1
                      : -1;
            });
    }, [internships, searchQuery, statusFilter, paidFilter, sortBy, sortOrder]);

    // 6. CRUD Mock Operations (Scaffolded so the user can easily swap with Axios/Inertia requests)

    /**
     * Creates a new internship.
     * Backend hook: POST /internships
     */
    const addInternship = async (data: InternshipWritePayload) => {
        // [Inertia / API integration placeholder]
        // Example: router.post(route('internships.add'), data, { onSuccess: () => ... })

        const newId = Date.now();
        const newInternship: Internship = {
            ...data,
            id: newId, // Local simulated ID
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            resume_match_result: null,
            resume_match_analyzed_at: null,
            notes: [],
            timeline: [
                {
                    id: newId + 1,
                    internship_id: newId,
                    date: new Date().toISOString().split("T")[0],
                    event: `Saved as ${data.status.toUpperCase()}`,
                    reminder: null,
                },
            ],
            interview_questions: [],
            assets: [],
        };

        setInternships((prev) => [newInternship, ...prev]);
        setIsFormOpen(false);

        router.post(route("internships.add"), data, {
            onSuccess: () => {
                toast.success("Internship added successfully!");
            },
            onError: () => {
                toast.error("Failed to add internship!");
            },
        });
    };

    /**
     * Updates an existing internship.
     * Backend hook: PUT /internships/{id}
     */
    const updateInternship = async (
        id: number,
        data: Partial<InternshipWritePayload>,
    ) => {
        // [Inertia / API integration placeholder]
        // Example: router.put(route('internships.update', id), data)

        setInternships((prev) =>
            prev.map((i) =>
                i.id === id
                    ? { ...i, ...data, updated_at: new Date().toISOString() }
                    : i,
            ),
        );
        setIsFormOpen(false);
        setEditingInternship(null);
        router.put(route("internships.update", id), data, {
            onSuccess: () => {
                toast.success("Internship updated successfully!");
            },
            onError: () => {
                toast.error("Failed to update internship!");
            },
        });
    };

    /**
     * Fast status change - Perfect for Kanban column movements.
     * Backend hook: PUT /internships/{id}
     */
    const updateStatus = async (id: number, status: InternshipStatus) => {
        setInternships((prev) =>
            prev.map((i) => {
                if (i.id === id) {
                    const newTimeline: TimelineEvent = {
                        id: Date.now(),
                        internship_id: id,
                        date: new Date().toISOString().split("T")[0],
                        event: `Status updated to ${status.toUpperCase()}`,
                        reminder: null,
                    };
                    return {
                        ...i,
                        status,
                        timeline: [...i.timeline, newTimeline],
                        updated_at: new Date().toISOString(),
                    };
                }
                return i;
            }),
        );

        router.put(
            route("internships.update", id),
            { status },
            {
                onSuccess: () => {
                    toast.success("Status updated successfully!");
                },
                onError: () => {
                    toast.error("Failed to update status!");
                },
            },
        );
    };

    /**
     * Deletes an internship.
     * Backend hook: DELETE /internships/{id}
     */
    const deleteInternship = async (id: number) => {
        // [Inertia / API integration placeholder]
        // Example: router.delete(route('internships.delete', id))

        setInternships((prev) => prev.filter((i) => i.id !== id));
        if (selectedInternshipId === id) {
            setSelectedInternshipId(null);
        }

        router.delete(route("internships.delete", id), {
            onSuccess: () => {
                toast.success("Internship deleted successfully!");
            },
            onError: () => {
                toast.error("Failed to delete internship!");
            },
        });
    };

    // ==========================================
    // Related Models Operations (Notes & Timeline)
    // ==========================================

    /**
     * Adds a note to a specific internship.
     * Backend hook: POST /internships/{id}/notes (or handled in a dedicated notes controller)
     */
    const addNote = async (
        internshipId: number,
        title: string,
        content: string,
    ) => {
        const newNote: Note = {
            id: Date.now(),
            internship_id: internshipId,
            title: title.trim() || "Untitled Note",
            content: content.trim() || null,
        };

        setInternships((prev) =>
            prev.map((i) =>
                i.id === internshipId
                    ? {
                          ...i,
                          notes: [...i.notes, newNote],
                          updated_at: new Date().toISOString(),
                      }
                    : i,
            ),
        );

        router.post(
            route("notes.add", internshipId),
            { title, content },
            {
                onSuccess: () => {
                    toast.success("Note added successfully!");
                },
                onError: () => {
                    toast.error("Failed to add note!");
                },
            },
        );
    };

    /**
     * Deletes a note.
     * Backend hook: DELETE /notes/{noteId}
     */
    const deleteNote = async (internshipId: number, noteId: number) => {
        setInternships((prev) =>
            prev.map((i) =>
                i.id === internshipId
                    ? {
                          ...i,
                          notes: i.notes.filter((n) => n.id !== noteId),
                          updated_at: new Date().toISOString(),
                      }
                    : i,
            ),
        );

        router.delete(route("notes.delete", [internshipId, noteId]), {
            onSuccess: () => {
                toast.success("Note deleted successfully!");
            },
            onError: () => {
                toast.error("Failed to delete note!");
            },
        });
    };

    /**
     * Adds a timeline event.
     * Backend hook: POST /internships/{id}/timeline
     */
    const addTimelineEvent = async (
        internshipId: number,
        date: string,
        event: string,
        reminder: string | null,
    ) => {
        const newEvent: TimelineEvent = {
            id: Date.now(),
            internship_id: internshipId,
            date: date || new Date().toISOString().split("T")[0],
            event: event.trim() || "Milestone Reached",
            reminder: reminder?.trim() || null,
        };

        setInternships((prev) =>
            prev.map((i) =>
                i.id === internshipId
                    ? {
                          ...i,
                          timeline: [...i.timeline, newEvent].sort(
                              (a, b) =>
                                  new Date(a.date).getTime() -
                                  new Date(b.date).getTime(),
                          ),
                          updated_at: new Date().toISOString(),
                      }
                    : i,
            ),
        );

        router.post(
            route("timeline.add", internshipId),
            { date, event, reminder },
            {
                onSuccess: () => {
                    toast.success("Timeline event added successfully!");
                },
                onError: () => {
                    toast.error("Failed to add timeline event!");
                },
            },
        );
    };

    /**
     * Deletes a timeline event.
     * Backend hook: DELETE /timeline/{eventId}
     */
    const deleteTimelineEvent = async (
        internshipId: number,
        eventId: number,
    ) => {
        setInternships((prev) =>
            prev.map((i) =>
                i.id === internshipId
                    ? {
                          ...i,
                          timeline: i.timeline.filter((t) => t.id !== eventId),
                          updated_at: new Date().toISOString(),
                      }
                    : i,
            ),
        );

        router.delete(route("timeline.delete", [internshipId, eventId]), {
            onSuccess: () => {
                toast.success("Timeline event deleted successfully!");
            },
            onError: () => {
                toast.error("Failed to delete timeline event!");
            },
        });
    };

    return {
        // Data & Lists
        internships: filteredInternships,
        allInternshipsRaw: internships, // For metrics and checks
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

        // Drawer & Modal Trigger States
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
    };
}
