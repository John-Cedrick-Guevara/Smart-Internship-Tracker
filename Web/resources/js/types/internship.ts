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

export type InterviewQuestionCategory = 'Technical' | 'Behavioral' | 'General';

export interface InterviewQuestion {
    id: number;
    internship_id: number | null;
    question: string;
    category: InterviewQuestionCategory;
    strategic_tip: string | null;
    talking_points: string[] | null;
    is_practiced: boolean;
    answer_notes: string | null;
    source: string | null;
    created_at?: string;
    updated_at?: string;
}

export type ApplicationAssetType = 'resume' | 'cover_letter' | 'portfolio' | 'github' | 'linkedin' | 'custom' | 'file';
export type ApplicationAssetKind = 'link' | 'file';
export type ApplicationAssetStatus = 'not_added' | 'drafting' | 'ready' | 'submitted';

export interface ApplicationAsset {
    id: number;
    internship_id: number;
    label: string;
    asset_type: ApplicationAssetType;
    asset_kind: ApplicationAssetKind;
    status: ApplicationAssetStatus;
    url: string | null;
    file_name: string | null;
    file_path: string | null;
    mime_type: string | null;
    file_size: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface ResumeMatchResult {
    score: number;
    summary: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    gaps: string[];
    recommendations: string[];
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
    last_activity_at: string | null;
    resume_match_result: ResumeMatchResult | null;
    resume_match_analyzed_at: string | null;
    created_at: string;
    updated_at: string;
    notes: Note[];
    timeline: TimelineEvent[];
    interview_questions: InterviewQuestion[];
    assets: ApplicationAsset[];
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
