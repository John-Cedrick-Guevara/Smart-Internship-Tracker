import React, { useMemo, useState } from 'react';
import { Mail, Copy, Check, ExternalLink, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Internship } from '../../types/internship';

interface FollowUpCopilotTabProps {
    internship: Internship;
}

type ToneType = 'professional' | 'enthusiastic' | 'direct';

export default function FollowUpCopilotTab({ internship }: FollowUpCopilotTabProps) {
    const [recruiterName, setRecruiterName] = useState('');
    const [customDetail, setCustomDetail] = useState('');
    const [tone, setTone] = useState<ToneType>('professional');
    const [copied, setCopied] = useState(false);

    const activityDate = useMemo(() => {
        return new Date(internship.last_activity_at || internship.created_at);
    }, [internship.last_activity_at, internship.created_at]);

    const diffTime = Math.abs(Date.now() - activityDate.getTime());
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const isStale = diffDays >= 7;

    const generateEmailContent = () => {
        const recruiter = recruiterName.trim() || 'Hiring Team';
        const detail = customDetail.trim()
            ? ` ${customDetail.trim()}`
            : internship.status === 'interviewing'
                ? ' I really enjoyed speaking with the team and learning about your technical roadmap.'
                : ' I am eager to bring my web engineering skills to support your team.';

        let subject = '';
        let body = '';

        switch (internship.status) {
            case 'wishlist':
                subject = `Inquiry regarding ${internship.position} opportunities at ${internship.company_name}`;
                body = tone === 'enthusiastic'
                    ? `Hi ${recruiter},\n\nI've been following ${internship.company_name} and would love to contribute as a ${internship.position} intern.${detail}\n\nI've attached my resume and would welcome a quick conversation if there is interest.\n\nThanks,\n[Your Name]`
                    : tone === 'direct'
                        ? `Hello ${recruiter},\n\nI'm reaching out about ${internship.position} opportunities at ${internship.company_name}.${detail}\n\nPlease let me know if there is an opening to discuss.\n\nBest,\n[Your Name]`
                        : `Dear ${recruiter},\n\nI hope this email finds you well. I am interested in upcoming ${internship.position} opportunities at ${internship.company_name}.${detail}\n\nI would appreciate the chance to connect and discuss fit.\n\nSincerely,\n[Your Name]`;
                break;
            case 'applied':
                subject = `Application Follow-up: ${internship.position}`;
                body = tone === 'enthusiastic'
                    ? `Hi ${recruiter},\n\nI wanted to follow up on my application for ${internship.position} at ${internship.company_name}. I remain very excited about the opportunity.${detail}\n\nPlease let me know if there is anything else I can share.\n\nBest,\n[Your Name]`
                    : tone === 'direct'
                        ? `Hello ${recruiter},\n\nI'm following up on my ${internship.position} application at ${internship.company_name}.${detail}\n\nCould you share any update on the timeline?\n\nBest,\n[Your Name]`
                        : `Dear ${recruiter},\n\nI hope you are well. I recently applied for the ${internship.position} role at ${internship.company_name} and wanted to follow up on the status of my application.${detail}\n\nThank you for your time.\n\nSincerely,\n[Your Name]`;
                break;
            case 'interviewing':
                subject = `Thank you & Follow-up: ${internship.position} interview`;
                body = tone === 'enthusiastic'
                    ? `Hi ${recruiter},\n\nThank you again for the interview. I enjoyed speaking with the team and am very excited about the next steps at ${internship.company_name}.${detail}\n\nPlease let me know if I can provide anything else.\n\nCheers,\n[Your Name]`
                    : tone === 'direct'
                        ? `Hello ${recruiter},\n\nThank you for the interview for the ${internship.position} role.${detail} Could you share any update on next steps?\n\nBest,\n[Your Name]`
                        : `Dear ${recruiter},\n\nThank you once again for taking the time to interview me for the ${internship.position} internship. ${detail}\n\nI appreciate your consideration and would be glad to provide any additional information.\n\nSincerely,\n[Your Name]`;
                break;
            case 'offer':
                subject = `Offer Discussion: ${internship.position}`;
                body = tone === 'enthusiastic'
                    ? `Hi ${recruiter},\n\nThank you for the offer for the ${internship.position} role at ${internship.company_name}. I am excited to review the details and discuss the next steps.${detail}\n\nBest,\n[Your Name]`
                    : tone === 'direct'
                        ? `Hello ${recruiter},\n\nThank you for the offer.${detail} I would like to schedule a brief call to discuss the timeline and final details.\n\nBest,\n[Your Name]`
                        : `Dear ${recruiter},\n\nThank you very much for offering me the ${internship.position} internship at ${internship.company_name}. ${detail}\n\nI would appreciate a brief call to discuss the offer details before finalizing.\n\nSincerely,\n[Your Name]`;
                break;
            default:
                subject = `Feedback Request: ${internship.position}`;
                body = tone === 'enthusiastic'
                    ? `Hi ${recruiter},\n\nThank you for letting me know the outcome. I enjoyed learning about ${internship.company_name} and would appreciate any feedback you can share.${detail}\n\nI would love to keep in touch for future opportunities.\n\nWarmly,\n[Your Name]`
                    : tone === 'direct'
                        ? `Hello ${recruiter},\n\nThank you for the update. ${detail} I would appreciate any feedback and hope to stay in touch.\n\nBest,\n[Your Name]`
                        : `Dear ${recruiter},\n\nThank you for the update regarding the ${internship.position} role. While I am disappointed, I appreciate your time and consideration.${detail}\n\nIf possible, I would be grateful for any feedback.\n\nSincerely,\n[Your Name]`;
                break;
        }

        return { subject, body };
    };

    const email = generateEmailContent();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
        setCopied(true);
        toast.success('Email copied to clipboard.');
        setTimeout(() => setCopied(false), 2000);
    };

    const getMailtoLink = () => {
        const recipient = encodeURIComponent(internship.company_email);
        const subject = encodeURIComponent(email.subject);
        const body = encodeURIComponent(email.body);
        return `mailto:${recipient}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800 dark:text-gray-200">
            {isStale ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4 dark:border-amber-900/30 dark:bg-amber-950/15 flex items-start space-x-3 shadow-md">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Follow-up recommended</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                            This application has been inactive for {diffDays} days
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 max-w-md leading-relaxed">
                            Last meaningful activity was on {activityDate.toLocaleDateString()}. A polite follow-up can keep the application visible.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-gray-950/15 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Timeline status</span>
                        <p className="text-xs font-bold text-gray-950 dark:text-white mt-0.5">
                            Last active {diffDays === 0 ? 'today' : diffDays === 1 ? 'yesterday' : `${diffDays} days ago`}
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4 rounded-xl border border-gray-150 bg-white p-4 dark:border-gray-850 dark:bg-gray-900/30">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 block">Template personalization</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Recruiter name</label>
                        <input
                            type="text"
                            placeholder="e.g. Jane Doe, Hiring Manager"
                            value={recruiterName}
                            onChange={(e) => setRecruiterName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Current status</label>
                        <span className="mt-1.5 block w-full text-xs font-bold text-indigo-650 dark:text-indigo-400 capitalize">
                            {internship.status}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Add context (optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. I enjoyed learning about your team’s roadmap."
                        value={customDetail}
                        onChange={(e) => setCustomDetail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                        Tone of voice
                    </span>

                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-950">
                        {(['professional', 'enthusiastic', 'direct'] as ToneType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                                    tone === t
                                        ? 'bg-white text-indigo-650 shadow-sm dark:bg-gray-850 dark:text-indigo-455'
                                        : 'text-gray-550 hover:text-gray-700 dark:text-gray-400'
                                }`}
                            >
                                {t === 'professional' ? 'Professional' : t === 'enthusiastic' ? 'Enthusiastic' : 'Direct'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-indigo-150/40 bg-indigo-50/5 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/5">
                    <div className="border-b border-gray-150 dark:border-gray-850 pb-2 mb-3.5">
                        <p className="text-[11px] text-gray-450 leading-relaxed font-semibold">
                            <span className="font-bold text-gray-400">To:</span> {internship.company_email}
                        </p>
                        <p className="text-[11px] text-gray-450 leading-relaxed font-semibold mt-1">
                            <span className="font-bold text-gray-400">Subject:</span> {email.subject}
                        </p>
                    </div>

                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed break-words">
                        {email.body}
                    </pre>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-850 mt-4">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center space-x-1 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-850"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copied ? 'Copied!' : 'Copy template'}</span>
                        </button>

                        <a
                            href={getMailtoLink()}
                            className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-indigo-755 transition-colors"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Send via email client</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
