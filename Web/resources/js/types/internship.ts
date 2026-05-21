export type InternshipStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface TimelineEvent {
    id: number;
    internship_id: number;
    date: string; // ISO date or date string
    event: string | null;
    reminder: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Note {
    id: number;
    internship_id: number;
    title: string;
    content: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Internship {
    id: number;
    user_id: number;
    company_name: string;
    company_email: string;
    position: string;
    location: string;
    duration: string;
    url: string | null;
    status: InternshipStatus;
    is_paid: boolean;
    created_at: string;
    updated_at: string;
    notes: Note[];
    timeline: TimelineEvent[];
}

export interface InternshipStats {
    total: number;
    wishlist: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
    paid_count: number;
    unpaid_count: number;
}
