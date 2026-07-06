import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    ai: {
        ocrEnabled: boolean;
        resumeMatchRemaining: number;
        ocrRemaining: number;
    };
    ziggy: Config & { location: string };
};
