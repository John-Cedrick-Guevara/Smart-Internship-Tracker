import React, { useState, useEffect } from 'react';
import { Internship } from '../../types/internship';
import { Mail, Copy, Check, ExternalLink, AlertTriangle, Calendar, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FollowUpCopilotTabProps {
    internship: Internship;
}

type ToneType = 'professional' | 'enthusiastic' | 'direct';

export default function FollowUpCopilotTab({ internship }: FollowUpCopilotTabProps) {
    const [recruiterName, setRecruiterName] = useState('');
    const [customDetail, setCustomDetail] = useState('');
    const [tone, setTone] = useState<ToneType>('professional');
    const [copied, setCopied] = useState(false);

    // Compute staleness (days since last update)
    const updatedDate = new Date(internship.updated_at);
    const diffTime = Math.abs(Date.now() - updatedDate.getTime());
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const isStale = diffDays >= 7;

    // Load template settings from localStorage
    useEffect(() => {
        try {
            const savedRecruiter = localStorage.getItem(`internship_recruiter_${internship.id}`);
            const savedDetail = localStorage.getItem(`internship_detail_${internship.id}`);
            const savedTone = localStorage.getItem(`internship_tone_${internship.id}`);

            if (savedRecruiter) setRecruiterName(savedRecruiter);
            else setRecruiterName('');

            if (savedDetail) setCustomDetail(savedDetail);
            else setCustomDetail('');

            if (savedTone) setTone(savedTone as ToneType);
            else setTone('professional');
        } catch (e) {
            console.error('Failed to load localStorage follow-up settings:', e);
        }
    }, [internship.id]);

    const handleRecruiterChange = (val: string) => {
        setRecruiterName(val);
        localStorage.setItem(`internship_recruiter_${internship.id}`, val);
    };

    const handleDetailChange = (val: string) => {
        setCustomDetail(val);
        localStorage.setItem(`internship_detail_${internship.id}`, val);
    };

    const handleToneChange = (newTone: ToneType) => {
        setTone(newTone);
        localStorage.setItem(`internship_tone_${internship.id}`, newTone);
    };

    // Generate templates dynamically based on status and tone
    const generateEmailContent = () => {
        const recruiter = recruiterName.trim() || 'Hiring Team';
        const detail = customDetail.trim() 
            ? ` ${customDetail.trim()}`
            : (internship.status === 'interviewing' 
                ? ' I really enjoyed speaking with the team and learning about your technical roadmap.' 
                : ' I am incredibly eager to bring my web engineering skills to support your team.');

        let subject = '';
        let body = '';

        switch (internship.status) {
            case 'wishlist':
                subject = `Inquiry regarding ${internship.position} opportunities at ${internship.company_name}`;
                if (tone === 'professional') {
                    body = `Dear ${recruiter},\n\nI hope this email finds you well. I have been following ${internship.company_name}'s recent work and am highly interested in upcoming ${internship.position} openings. I wanted to briefly introduce myself and inquire about opportunities for the upcoming term. ${detail}\n\nI have attached my resume for your consideration. I would be grateful for the chance to connect and discuss how my background aligns with your engineering goals.\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]`;
                } else if (tone === 'enthusiastic') {
                    body = `Hi ${recruiter},\n\nI hope you're having an awesome week! I've been a huge fan of ${internship.company_name} for a long time, and I am incredibly excited about the work you do. I'm reaching out because I would love to contribute to your engineering department as a ${internship.position} intern.${detail}\n\nI've attached my resume showing my project work, and I would jump at the chance to have a quick 10-minute chat about future opportunities!\n\nThanks so much,\n[Your Name]`;
                } else {
                    body = `Hello ${recruiter},\n\nI hope you are well. I'm reaching out to express interest in the ${internship.position} role at ${internship.company_name}. I've been following your progress and want to see if you have any internship openings. ${detail}\n\nMy resume is attached. Let me know if you are open to a brief chat.\n\nBest regards,\n[Your Name]`;
                }
                break;

            case 'applied':
                subject = `Application Update: ${internship.position} - [Your Name]`;
                if (tone === 'professional') {
                    body = `Dear ${recruiter},\n\nI hope you are well. I recently applied for the ${internship.position} internship at ${internship.company_name} and wanted to follow up on the status of my application. ${detail}\n\nI remain highly interested in this role and believe my skills are a strong match for your objectives. Please let me know if there are any additional materials or details I can provide to support my application.\n\nThank you for your time.\n\nSincerely,\n[Your Name]`;
                } else if (tone === 'enthusiastic') {
                    body = `Hi ${recruiter},\n\nHope you're doing great! I wanted to check in on my application for the ${internship.position} position. I am so excited about this opportunity at ${internship.company_name}! ${detail}\n\nI'm ready to hit the ground running and would love to hear if there are any next steps in the review process. Looking forward to hearing from you!\n\nBest,\n[Your Name]`;
                } else {
                    body = `Hello ${recruiter},\n\nI'm following up on my application for the ${internship.position} internship. ${detail} I remain very interested in the role and would appreciate an update on the timeline for next steps.\n\nThank you,\n[Your Name]`;
                }
                break;

            case 'interviewing':
                subject = `Thank you & Follow-up: ${internship.position} interview`;
                if (tone === 'professional') {
                    body = `Dear ${recruiter},\n\nThank you once again for taking the time to interview me for the ${internship.position} internship. ${detail}\n\nOur conversation further confirmed my excitement about ${internship.company_name}. I wanted to check in to see if you have any updates regarding the next stages of the interview process. I am happy to hop on a call or supply further references if required.\n\nSincerely,\n[Your Name]`;
                } else if (tone === 'enthusiastic') {
                    body = `Hi ${recruiter},\n\nI just wanted to send a quick note to say thank you for the wonderful interview experience! I absolutely loved our chat. ${detail}\n\nI am incredibly hyped about the possibility of joining the team and wanted to see if you had any updates on the next steps in the pipeline. Hope you have a fantastic day!\n\nCheers,\n[Your Name]`;
                } else {
                    body = `Hello ${recruiter},\n\nThank you for the interview for the ${internship.position} role. ${detail} I wanted to follow up on the status of the hiring process and see if there are any updates.\n\nBest regards,\n[Your Name]`;
                }
                break;

            case 'offer':
                subject = `Offer Update / Discussion: ${internship.position} - [Your Name]`;
                if (tone === 'professional') {
                    body = `Dear ${recruiter},\n\nThank you very much for offering me the ${internship.position} internship position at ${internship.company_name}. I am honored and very excited about this opportunity. ${detail}\n\nI am currently reviewing the details of the offer and wanted to schedule a brief call to discuss a few aspects of the timeline and benefits before finalizing. Let me know what times work best for you.\n\nSincerely,\n[Your Name]`;
                } else if (tone === 'enthusiastic') {
                    body = `Hi ${recruiter},\n\nThank you so much! I am absolutely thrilled to receive this offer for the ${internship.position} internship! ${detail}\n\nI cannot wait to work with the team at ${internship.company_name}. I'd love to schedule a quick 10-minute call this week to go over the final steps and onboarding details. Let me know when you're free!\n\nBest,\n[Your Name]`;
                } else {
                    body = `Hello ${recruiter},\n\nThank you for the offer for the ${internship.position} internship. I am excited to join ${internship.company_name}. ${detail} I would like to schedule a brief call to finalize details and start dates.\n\nBest regards,\n[Your Name]`;
                }
                break;

            case 'rejected':
                subject = `Feedback Request & Staying in Touch: ${internship.position} - [Your Name]`;
                if (tone === 'professional') {
                    body = `Dear ${recruiter},\n\nThank you for letting me know about your decision regarding the ${internship.position} internship. While I am disappointed, I appreciate the time you and the team spent evaluating my candidacy. ${detail}\n\nIf you have a moment, I would be extremely grateful for any feedback you could share regarding how I can improve my portfolio or technical approach for future roles. I would love to stay in touch for upcoming opportunities.\n\nSincerely,\n[Your Name]`;
                } else if (tone === 'enthusiastic') {
                    body = `Hi ${recruiter},\n\nThank you for reaching out and letting me know the outcome. While I'm sad I won't be joining this term, I wanted to say I had a fantastic time meeting everyone and learning about ${internship.company_name}! ${detail}\n\nI'd love to keep in touch and check back in for future internship cycles. I'd also appreciate any brief tips you have for my resume. Wishing you all the best!\n\nWarmly,\n[Your Name]`;
                } else {
                    body = `Hello ${recruiter},\n\nThank you for the update. While I was hoping for a different outcome, I appreciate the opportunity. ${detail} I would appreciate any feedback on my interview performance and hope to keep in touch for future opportunities.\n\nBest,\n[Your Name]`;
                }
                break;
        }

        return { subject, body };
    };

    const email = generateEmailContent();

    const handleCopy = () => {
        const fullText = `Subject: ${email.subject}\n\n${email.body}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast.success("Email copied to clipboard!");
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
            {/* Staleness Visualizer Card */}
            {isStale ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4 dark:border-amber-900/30 dark:bg-amber-950/15 flex items-start space-x-3 shadow-md animate-pulse">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400">Follow-up Recommended!</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                            Application has been stagnant for {diffDays} days
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 max-w-md leading-relaxed">
                            No updates have been registered since {updatedDate.toLocaleDateString()}. Sending a polite follow-up is an effective way to keep your candidacy fresh in the recruiter's mind.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-150 bg-gray-50/50 p-4 dark:border-gray-850 dark:bg-gray-950/15 flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">Timeline Status</span>
                        <p className="text-xs font-bold text-gray-950 dark:text-white mt-0.5">
                            Last updated {diffDays === 0 ? 'today' : diffDays === 1 ? 'yesterday' : `${diffDays} days ago`}
                        </p>
                    </div>
                </div>
            )}

            {/* Input personalization deck */}
            <div className="space-y-4 rounded-xl border border-gray-150 bg-white p-4 dark:border-gray-850 dark:bg-gray-900/30">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 block">Template Personalization</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Recruiter Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Jane Doe, Hiring Manager"
                            value={recruiterName}
                            onChange={(e) => handleRecruiterChange(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Current Role Status</label>
                        <span className="mt-1.5 block w-full text-xs font-bold text-indigo-650 dark:text-indigo-400 capitalize">
                            {internship.status}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Add Contextual Highlight (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g., I loved seeing your team win the Tech Innovation Award last week."
                        value={customDetail}
                        onChange={(e) => handleDetailChange(e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-250 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    />
                </div>
            </div>

            {/* Tone Selector & Preview */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                        Tone of Voice
                    </span>
                    
                    {/* Switcher pills */}
                    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-950">
                        {(['professional', 'enthusiastic', 'direct'] as ToneType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => handleToneChange(t)}
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

                {/* Live Preview Card */}
                <div className="rounded-xl border border-indigo-150/40 bg-indigo-50/5 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/5 relative group">
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

                    {/* Email Operations Bar */}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-850 mt-4">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center space-x-1 rounded-lg border border-gray-250 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-850"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copied ? 'Copied!' : 'Copy Template'}</span>
                        </button>

                        <a
                            href={getMailtoLink()}
                            className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-indigo-755 transition-colors"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Send via Email Client</span>
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
