import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardCheck, ShieldCheck } from 'lucide-react';
import privacyCureLogo from '@/images/privacycure-logo.png';
import privacyCureLogoWhite from '@/images/privacycure-logo-white.png';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const authPanelHighlights = [
    { icon: BookOpen, label: 'Training', detail: 'Role-aware learning paths' },
    { icon: ClipboardCheck, label: 'Evidence', detail: 'Review-ready artefacts' },
    { icon: ShieldCheck, label: 'Controls', detail: '450+ mapped frameworks' },
] as const;

const authFormTrustStats = [
    { value: '450+', label: 'controls mapped' },
    { value: '12', label: 'tenant entities' },
    { value: '99.9%', label: 'platform uptime' },
] as const;

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:300,400,500,600,700|instrument-sans:400,500,600|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="auth-split-root relative grid h-dvh grid-cols-1 px-8 sm:px-0 lg:grid-cols-2 lg:px-0">
                <style>{`
                    .auth-split-root {
                        --auth-ink: #f5f7fb;
                        --auth-muted: rgba(168, 193, 237, 0.78);
                        --auth-cyan: #00daf3;
                        --auth-navy: #0e2a5e;
                        --auth-accent: #1f4694;
                    }

                    .auth-split-panel {
                        position: relative;
                        isolation: isolate;
                        overflow: hidden;
                        background: #071428;
                    }

                    .auth-split-backdrop {
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                    }

                    .auth-split-backdrop-photo {
                        position: absolute;
                        inset: 0;
                        background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop');
                        background-position: center;
                        background-size: cover;
                        transform: scale(1.04);
                        opacity: 0.34;
                    }

                    .auth-split-backdrop-overlay {
                        position: absolute;
                        inset: 0;
                        background:
                            radial-gradient(ellipse 85% 55% at 12% -8%, rgba(0, 218, 243, 0.22), transparent 58%),
                            radial-gradient(ellipse 70% 50% at 100% 100%, rgba(31, 70, 148, 0.35), transparent 55%),
                            linear-gradient(
                                165deg,
                                rgba(7, 20, 40, 0.94) 0%,
                                rgba(14, 42, 94, 0.88) 42%,
                                rgba(0, 39, 83, 0.96) 100%
                            );
                    }

                    .auth-split-backdrop-grain {
                        position: absolute;
                        inset: 0;
                        opacity: 0.45;
                        background-image:
                            radial-gradient(rgba(168, 193, 237, 0.07) 1px, transparent 1px),
                            radial-gradient(rgba(0, 218, 243, 0.05) 1px, transparent 1px);
                        background-position: 0 0, 3px 4px;
                        background-size: 4px 4px, 11px 11px;
                    }

                    .auth-split-backdrop-grid {
                        position: absolute;
                        inset: 0;
                        opacity: 0.2;
                        background-image:
                            linear-gradient(to right, rgba(0, 218, 243, 0.12) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 193, 237, 0.08) 1px, transparent 1px);
                        background-size: 56px 56px;
                        mask-image: linear-gradient(to bottom, black 0%, black 65%, transparent 100%);
                    }

                    .auth-split-watermark {
                        position: absolute;
                        right: -0.08em;
                        bottom: -0.12em;
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(9rem, 22vw, 16rem);
                        font-weight: 400;
                        line-height: 0.82;
                        letter-spacing: -0.04em;
                        color: rgba(255, 255, 255, 0.04);
                        pointer-events: none;
                        user-select: none;
                    }

                    .auth-split-side {
                        position: absolute;
                        left: 18px;
                        top: 50%;
                        transform: translateY(-50%) rotate(180deg);
                        writing-mode: vertical-rl;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.24em;
                        text-transform: uppercase;
                        color: rgba(168, 193, 237, 0.45);
                        z-index: 2;
                    }

                    .auth-split-content {
                        position: relative;
                        z-index: 2;
                        display: flex;
                        height: 100%;
                        flex-direction: column;
                        padding: 2.5rem;
                    }

                    .auth-split-eyebrow {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.75rem;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        font-weight: 500;
                        letter-spacing: 0.22em;
                        text-transform: uppercase;
                        color: var(--auth-muted);
                    }

                    .auth-split-eyebrow-dash {
                        width: 28px;
                        height: 1px;
                        background: var(--auth-cyan);
                        opacity: 0.85;
                    }

                    .auth-split-headline {
                        margin-top: 1.25rem;
                        max-width: 28rem;
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(2rem, 3.2vw, 2.75rem);
                        font-weight: 400;
                        line-height: 1.08;
                        letter-spacing: -0.02em;
                        color: var(--auth-ink);
                    }

                    .auth-split-headline em {
                        font-style: italic;
                        color: var(--auth-cyan);
                    }

                    .auth-split-copy {
                        margin-top: 1rem;
                        max-width: 26rem;
                        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                        font-size: 0.9375rem;
                        line-height: 1.75;
                        color: rgba(245, 247, 251, 0.78);
                    }

                    .auth-split-highlights {
                        margin-top: 2rem;
                        display: grid;
                        gap: 0.75rem;
                    }

                    .auth-split-highlight {
                        display: flex;
                        align-items: flex-start;
                        gap: 0.875rem;
                        padding: 0.875rem 1rem;
                        border: 1px solid rgba(168, 193, 237, 0.14);
                        border-radius: 14px;
                        background: rgba(255, 255, 255, 0.04);
                        backdrop-filter: blur(8px);
                    }

                    .auth-split-highlight-icon {
                        display: flex;
                        height: 2rem;
                        width: 2rem;
                        flex-shrink: 0;
                        align-items: center;
                        justify-content: center;
                        border-radius: 10px;
                        background: rgba(0, 218, 243, 0.12);
                        color: var(--auth-cyan);
                    }

                    .auth-split-highlight-label {
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--auth-cyan);
                    }

                    .auth-split-highlight-detail {
                        margin-top: 0.25rem;
                        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                        font-size: 0.8125rem;
                        line-height: 1.5;
                        color: rgba(245, 247, 251, 0.72);
                    }

                    .auth-split-form-kicker {
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        font-weight: 500;
                        letter-spacing: 0.22em;
                        text-transform: uppercase;
                        color: #1f4694;
                    }

                    .dark .auth-split-form-kicker {
                        color: #a8c1ed;
                    }

                    .auth-split-form-col {
                        position: relative;
                        isolation: isolate;
                        display: flex;
                        height: 100%;
                        min-height: 100dvh;
                        overflow-y: auto;
                        background: #f5f7fb;
                    }
                    .dark .auth-split-form-col {
                        background: #0b1220;
                    }
                    .auth-split-form-col::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        z-index: 0;
                        opacity: 0.45;
                        background-image:
                            radial-gradient(rgba(14, 42, 94, 0.05) 1px, transparent 1px),
                            radial-gradient(rgba(31, 70, 148, 0.04) 1px, transparent 1px);
                        background-position: 0 0, 3px 4px;
                        background-size: 4px 4px, 11px 11px;
                    }
                    .dark .auth-split-form-col::before {
                        opacity: 0.25;
                        background-image:
                            radial-gradient(rgba(168, 193, 237, 0.06) 1px, transparent 1px),
                            radial-gradient(rgba(168, 193, 237, 0.04) 1px, transparent 1px);
                    }
                    .auth-split-form-inner {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        width: 100%;
                        min-height: 100%;
                        flex-direction: column;
                        padding: 2rem 0 1.75rem;
                    }
                    @media (min-width: 1024px) {
                        .auth-split-form-col { min-height: 0; }
                        .auth-split-form-inner { padding: 2rem 2rem 1.75rem; }
                    }
                    @media (max-width: 1023px) {
                        .auth-split-form-inner { padding-left: 0; padding-right: 0; }
                    }
                    .auth-split-form-top {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                        text-align: center;
                    }
                    .auth-split-form-access {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.625rem;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.2em;
                        text-transform: uppercase;
                        color: #5a6478;
                    }
                    .dark .auth-split-form-access { color: #9ca3af; }
                    .auth-split-form-access-dash {
                        width: 20px;
                        height: 1px;
                        background: #00daf3;
                        opacity: 0.85;
                    }
                    .auth-split-form-main {
                        display: flex;
                        flex: 1;
                        flex-direction: column;
                        justify-content: center;
                        gap: 1.5rem;
                        padding: 1.75rem 0;
                    }
                    .auth-split-form-intro {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                        text-align: left;
                    }
                    @media (min-width: 640px) {
                        .auth-split-form-intro {
                            align-items: center;
                            text-align: center;
                        }
                    }
                    .auth-split-form-foot {
                        margin-top: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .auth-split-form-stats {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 0.625rem;
                        padding: 0.875rem 1rem;
                        border-radius: 14px;
                        border: 1px solid rgba(14, 42, 94, 0.1);
                        background: rgba(255, 255, 255, 0.72);
                    }
                    .dark .auth-split-form-stats {
                        border-color: rgba(168, 193, 237, 0.12);
                        background: rgba(255, 255, 255, 0.04);
                    }
                    .auth-split-form-stat-value {
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: 1.125rem;
                        line-height: 1;
                        color: #1a2540;
                    }
                    .dark .auth-split-form-stat-value { color: #f5f7fb; }
                    .auth-split-form-stat-label {
                        margin-top: 0.375rem;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 9px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        line-height: 1.4;
                        color: #5a6478;
                    }
                    .dark .auth-split-form-stat-label { color: #9ca3af; }
                    .auth-split-form-legal {
                        text-align: center;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 9px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        line-height: 1.6;
                        color: #5a6478;
                    }
                    .dark .auth-split-form-legal { color: #6b7280; }
                    .auth-split-form-links {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 1rem;
                    }
                    .auth-split-form-link {
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 9px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: #1f4694;
                        text-decoration: none;
                        transition: color 0.2s;
                    }
                    .dark .auth-split-form-link { color: #a8c1ed; }
                    .auth-split-form-link:hover { color: #00daf3; }
                `}</style>

                <div className="auth-split-panel relative hidden h-full flex-col lg:flex dark:border-r dark:border-white/10">
                    <div className="auth-split-backdrop" aria-hidden="true">
                        <div className="auth-split-backdrop-photo" />
                        <div className="auth-split-backdrop-overlay" />
                        <div className="auth-split-backdrop-grain" />
                        <div className="auth-split-backdrop-grid" />
                    </div>

                    <span className="auth-split-watermark" aria-hidden="true">
                        01
                    </span>
                    <span className="auth-split-side" aria-hidden="true">
                        v 4.0 — compliance studio · {name}
                    </span>

                    <div className="auth-split-content">
                        <Link href={route('home')} className="relative z-20 inline-flex items-center">
                            <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="h-11 w-auto" />
                        </Link>

                        <div className="mt-auto space-y-0">
                            <div className="auth-split-eyebrow">
                                <span className="auth-split-eyebrow-dash" aria-hidden="true" />
                                The Cure Studio · Compliance
                            </div>

                            <h2 className="auth-split-headline">
                                Compliance, <em>measured</em> with care.
                            </h2>

                            <p className="auth-split-copy">
                                Training, evidence, controls, and reviews in one operating layer — built for organisations that want compliance people
                                actually trust.
                            </p>

                            <div className="auth-split-highlights">
                                {authPanelHighlights.map(({ icon: Icon, label, detail }) => (
                                    <div key={label} className="auth-split-highlight">
                                        <span className="auth-split-highlight-icon">
                                            <Icon size={16} strokeWidth={1.75} />
                                        </span>
                                        <div>
                                            <div className="auth-split-highlight-label">{label}</div>
                                            <div className="auth-split-highlight-detail">{detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-split-form-col">
                    <div className="auth-split-form-inner mx-auto w-full max-w-[380px] sm:max-w-[400px]">
                        <div className="auth-split-form-top">
                            <p className="auth-split-form-access">
                                <span className="auth-split-form-access-dash" aria-hidden="true" />
                                Secure workspace access
                            </p>
                            <Link href={route('home')} className="relative z-20 inline-flex items-center justify-center">
                                <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-14 w-auto dark:hidden" />
                                <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="hidden h-14 w-auto dark:block" />
                            </Link>
                        </div>

                        <div className="auth-split-form-main">
                            <div className="auth-split-form-intro">
                                <p className="auth-split-form-kicker">Privacy Cure Compliance</p>
                                <h1 className="font-[Fraunces] text-xl font-medium tracking-tight text-[#1a2540] dark:text-[#f5f7fb]">{title}</h1>
                                <p className="text-muted-foreground text-sm text-balance">{description}</p>
                            </div>
                            {children}
                        </div>

                        <div className="auth-split-form-foot">
                            <div className="auth-split-form-stats" aria-label="Platform snapshot">
                                {authFormTrustStats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="auth-split-form-stat-value">{stat.value}</div>
                                        <div className="auth-split-form-stat-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                            <nav className="auth-split-form-links" aria-label="Auth footer">
                                <Link href={route('training.index')} className="auth-split-form-link">
                                    Training
                                </Link>
                                <Link href={route('pricing')} className="auth-split-form-link">
                                    Pricing
                                </Link>
                                <Link href={route('resources')} className="auth-split-form-link">
                                    Resources
                                </Link>
                            </nav>
                            <p className="auth-split-form-legal">Cyber &amp; Data Protection Act · Chapter 12:07</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
