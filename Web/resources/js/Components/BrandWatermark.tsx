import { Link } from '@inertiajs/react';

interface BrandWatermarkProps {
    variant?: 'footer' | 'inline';
    className?: string;
}

const PORTFOLIO_URL = 'https://guevix.vercel.app';
const AUTHOR_NAME = 'John Cedrick Guevara';

export default function BrandWatermark({
    variant = 'footer',
    className = '',
}: BrandWatermarkProps) {
    if (variant === 'inline') {
        return (
            <p className={`brand-watermark brand-watermark--inline ${className}`.trim()}>
                Personal AI project by{' '}
                <a
                    href={PORTFOLIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-watermark__link"
                >
                    {AUTHOR_NAME}
                </a>
            </p>
        );
    }

    return (
        <footer className={`brand-watermark ${className}`.trim()}>
            <p className="brand-watermark__title">Personal AI Engineering Project</p>
            <p className="brand-watermark__copy">
                Built by{' '}
                <a
                    href={PORTFOLIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-watermark__link"
                >
                    {AUTHOR_NAME}
                </a>
                . AI features are lifetime-limited to prevent API abuse.
            </p>
            <p className="brand-watermark__meta">
                <Link href="/" className="brand-watermark__link">
                    Anti Mahinang Nilalang
                </Link>
                {' · '}
                <a
                    href={PORTFOLIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-watermark__link"
                >
                    guevix.vercel.app
                </a>
            </p>
        </footer>
    );
}
