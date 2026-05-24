import { useAppearance } from '@/hooks/use-appearance';
import privacyCureLogoWhite from '@/images/privacycure-logo-white.png';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    CalendarClock,
    ClipboardCheck,
    CloudUpload,
    FileText,
    FolderCog,
    Gauge,
    Mail,
    MapPin,
    Menu,
    Moon,
    Phone,
    PlayCircle,
    ScrollText,
    ShieldCheck,
    Sparkles,
    Sun,
    User,
    UserCog,
    UserPlus,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type WelcomeNavItem =
    | { label: string; key: string; hash: string }
    | { label: string; key: string; route: 'pricing' | 'resources' | 'training.index' };

const welcomeNavItems: WelcomeNavItem[] = [
    { label: 'Product', key: 'product', hash: '#product' },
    { label: 'Solutions', key: 'solutions', hash: '#solutions' },
    { label: 'Pricing', key: 'pricing', route: 'pricing' },
    { label: 'Resources', key: 'resources', route: 'resources' },
    { label: 'Training', key: 'training', route: 'training.index' },
];

function welcomeNavHref(item: WelcomeNavItem): string {
    if ('hash' in item) {
        return item.hash;
    }

    if (item.route === 'pricing') {
        return route('pricing');
    }

    if (item.route === 'resources') {
        return route('resources');
    }

    return route('training.index');
}

function WelcomeNavLink({ item, onNavigate }: { item: WelcomeNavItem; onNavigate?: () => void }) {
    const className = 'welcome-header-nav-link';

    if ('hash' in item) {
        return (
            <a href={item.hash} className={className} onClick={onNavigate}>
                {item.label}
            </a>
        );
    }

    return (
        <Link href={welcomeNavHref(item)} className={className} onClick={onNavigate}>
            {item.label}
        </Link>
    );
}

function WelcomeHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="welcome-header">
            <div className="welcome-header-bar">
                <div className="welcome-header-brand">
                    <Link href={route('home')} className="welcome-header-brand-link" onClick={() => setMobileOpen(false)}>
                        <img src={privacyCureLogo} alt="Privacy Cure" className="welcome-header-logo-light" />
                        <img src={privacyCureLogoWhite} alt="Privacy Cure" className="welcome-header-logo-dark" />
                    </Link>
                </div>

                <nav className="welcome-header-nav" aria-label="Primary">
                    {welcomeNavItems.map((item) => (
                        <WelcomeNavLink key={item.label} item={item} />
                    ))}
                </nav>

                <div className="welcome-header-actions">
                    <button
                        type="button"
                        className="welcome-header-menu-btn"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>

                    {isAuthenticated ? (
                        <Link href={route('dashboard')} className="header-cta-primary">
                            Open workspace
                            <ArrowRight className="size-3.5 shrink-0" strokeWidth={2.25} />
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="header-cta-link">
                                Log in
                            </Link>
                            <span className="welcome-header-actions-divider" aria-hidden="true" />
                            <Link href={route('register')} className="header-cta-primary">
                                Get started
                                <ArrowRight className="size-3.5 shrink-0" strokeWidth={2.25} />
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {mobileOpen ? (
                <nav className="welcome-header-mobile-nav" aria-label="Mobile primary">
                    <div className="welcome-header-mobile-inner">
                        {welcomeNavItems.map((item) => (
                            <WelcomeNavLink key={item.label} item={item} onNavigate={() => setMobileOpen(false)} />
                        ))}
                        {!isAuthenticated ? (
                            <div className="header-mobile-actions">
                                <Link href={route('login')} className="header-cta-ghost" onClick={() => setMobileOpen(false)}>
                                    Log in
                                </Link>
                                <Link href={route('register')} className="header-cta-primary" onClick={() => setMobileOpen(false)}>
                                    Get started
                                    <ArrowRight className="size-3.5 shrink-0" strokeWidth={2.25} />
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </nav>
            ) : null}
        </header>
    );
}

function WelcomeFooter() {
    return (
        <footer className="welcome-footer">
            <div className="welcome-footer-inner">
                <div className="welcome-footer-lede">
                    <span className="welcome-footer-kicker">Compliance studio</span>
                    <h2 className="welcome-footer-title">
                        Compliance, <em>kept honest</em> from the first artefact onward.
                    </h2>
                    <p>
                        Training, evidence, controls, and reviews in one operating layer, aligned to the Zimbabwean Cyber and Data Protection Act
                        [Chapter 12:07].
                    </p>
                </div>

                <div className="welcome-footer-grid">
                    <div className="welcome-footer-brand">
                        <Link href={route('home')} className="welcome-footer-logo-link">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="welcome-footer-logo-light" />
                            <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="welcome-footer-logo-dark" />
                        </Link>
                        <p>
                            Data protection safeguards sensitive information from unauthorized access, breaches, and misuse while keeping your
                            organisation aligned with local regulation and international frameworks.
                        </p>
                    </div>

                    <div className="welcome-footer-panel">
                        <h3>Contact</h3>
                        <ul className="welcome-footer-contact-list">
                            <li>
                                <span className="welcome-footer-contact-icon">
                                    <Phone size={15} />
                                </span>
                                <span>
                                    <strong>Hotline</strong>
                                    <a href="tel:+263782903276">+263 782 903 276</a>
                                </span>
                            </li>
                            <li>
                                <span className="welcome-footer-contact-icon">
                                    <Mail size={15} />
                                </span>
                                <span>
                                    <strong>Email</strong>
                                    <a href="mailto:dpo@privacycure.com">dpo@privacycure.com</a>
                                </span>
                            </li>
                            <li>
                                <span className="welcome-footer-contact-icon">
                                    <MapPin size={15} />
                                </span>
                                <span>
                                    <strong>Address</strong>
                                    <span>6th Floor Batanai Gardens, Cnr Jason Moyo Avenue / First Street, Harare</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="welcome-footer-panel">
                        <h3>Legal &amp; support</h3>
                        <nav className="welcome-footer-links" aria-label="Footer">
                            <Link href={route('privacy-policy')}>Privacy Policy</Link>
                            <Link href={route('terms-and-conditions')}>Terms of Service</Link>
                            <Link href={route('pricing')}>Pricing</Link>
                            <Link href={route('resources')}>Resources</Link>
                            <Link href={route('training.index')}>Training</Link>
                        </nav>
                    </div>
                </div>

                <div className="welcome-footer-bottom">
                    <p>&copy; 2026 Privacy Cure Compliance. All rights reserved.</p>
                    <span>Cyber &amp; Data Protection Act [Chapter 12:07]</span>
                </div>
            </div>
        </footer>
    );
}

function WelcomeThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <button
            type="button"
            className="welcome-theme-toggle"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        const els = document.querySelectorAll('[data-reveal]');
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        (e.target as HTMLElement).classList.add('revealed');
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.14 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <>
            <Head title="Privacy Cure Compliance — Compliance, measured with care">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:300,400,500,600,700|instrument-sans:400,500,600|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <style>{`
                    /* ────────────────────────────────────────────────────────────
                       Cure — editorial welcome (navy palette derived from logo)
                       Layout inspired by curedev.online, colors from PrivacyCure logo.
                       ──────────────────────────────────────────────────────────── */
                    .cure-welcome {
                        --paper:     #f5f7fb;  /* cool off-white */
                        --paper-2:   #eaf0f9;  /* sunken paper */
                        --cream:     #ffffff;
                        --ink:       #1a2540;  /* deep charcoal-navy body text */
                        --ink-2:     #2a3656;  /* slightly lighter body */
                        --sand:      #1f4694;  /* primary accent — logo navy */
                        --sand-2:    #3d6ec7;  /* lighter cornflower */
                        --stone:     #5a6478;  /* secondary text */
                        --pine:      #0e2a5e;  /* deep navy — logo dark */
                        --sky:       #a8c1ed;  /* soft tint */
                        --rust:      #b8593b;  /* alarm only */
                        --muted:     #6b7488;

                        background: var(--paper);
                        color: var(--ink);
                        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                        font-feature-settings: 'ss01','cv11';
                        position: relative;
                        overflow-x: hidden;
                    }

                    .cure-welcome ::selection { background: rgba(31,70,148,0.22); color: var(--pine); }

                    .cure-welcome h1,
                    .cure-welcome h2,
                    .cure-welcome h3,
                    .cure-welcome h4,
                    .cure-display {
                        font-family: 'Fraunces', 'Cormorant Garamond', ui-serif, Georgia, serif;
                        letter-spacing: -0.01em;
                        color: var(--ink);
                    }
                    .cure-mono,
                    .cure-kicker,
                    .cure-eyebrow {
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                    }

                    /* paper texture — very subtle navy grain */
                    .cure-welcome::before {
                        content: '';
                        position: fixed;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        background-image:
                            radial-gradient(rgba(14,42,94,0.05) 1px, transparent 1px),
                            radial-gradient(rgba(31,70,148,0.04) 1px, transparent 1px);
                        background-position: 0 0, 3px 4px;
                        background-size: 4px 4px, 11px 11px;
                        opacity: 0.55;
                    }
                    .cure-welcome > main,
                    .cure-welcome > footer,
                    .cure-welcome > header { position: relative; z-index: 1; }
                    .cure-welcome > header.welcome-header { z-index: 50; background: rgba(245,247,251,0.9) !important; }

                    .welcome-header {
                        position: sticky;
                        top: 0;
                        z-index: 50;
                        background: rgba(245,247,251,0.9);
                        border-bottom: 1px solid rgba(14,42,94,0.08);
                        backdrop-filter: blur(18px) saturate(140%);
                        -webkit-backdrop-filter: blur(18px) saturate(140%);
                    }
                    .welcome-header-bar {
                        max-width: 1280px;
                        height: 68px;
                        margin: 0 auto;
                        padding: 0 28px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                    }
                    .welcome-header-brand,
                    .welcome-header-actions,
                    .welcome-header-brand-link {
                        display: flex;
                        align-items: center;
                        min-width: 0;
                    }
                    .welcome-header-brand-link {
                        line-height: 0;
                    }
                    .welcome-header-brand-link img {
                        width: auto !important;
                        height: 50px !important;
                        max-width: 210px !important;
                        max-height: 50px !important;
                        object-fit: contain;
                    }
                    .welcome-header-logo-light { display: block !important; }
                    .welcome-header-logo-dark { display: none !important; }
                    .dark .welcome-header-logo-light { display: none !important; }
                    .dark .welcome-header-logo-dark { display: block !important; }
                    .welcome-header-nav {
                        display: none;
                        align-items: center;
                        justify-content: center;
                        gap: 26px;
                    }
                    .welcome-header-nav-link {
                        color: var(--stone);
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        line-height: 1;
                        padding: 8px 0;
                        position: relative;
                        text-decoration: none;
                        text-transform: uppercase;
                        white-space: nowrap;
                    }
                    .welcome-header-nav-link::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 1px;
                        background: var(--sand);
                        transform: scaleX(0);
                        transform-origin: left center;
                        transition: transform .22s cubic-bezier(.16,1,.3,1);
                    }
                    .welcome-header-nav-link:hover {
                        color: var(--pine);
                    }
                    .welcome-header-nav-link:hover::after {
                        transform: scaleX(1);
                    }
                    .welcome-header-actions {
                        justify-content: flex-end;
                        gap: 12px;
                        flex-shrink: 0;
                    }
                    .welcome-header-menu-btn {
                        width: 38px;
                        height: 38px;
                        border: 1px solid rgba(14,42,94,0.18);
                        border-radius: 6px;
                        background: transparent;
                        color: var(--pine);
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .welcome-header-actions-divider {
                        display: none;
                        width: 1px;
                        height: 22px;
                        background: rgba(14,42,94,0.18);
                    }
                    .header-cta-link {
                        display: none;
                        color: var(--stone);
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        text-decoration: none;
                        text-transform: uppercase;
                        white-space: nowrap;
                    }
                    .header-cta-link:hover {
                        color: var(--pine);
                    }
                    .header-cta-primary,
                    .header-cta-ghost {
                        min-height: 38px;
                        border-radius: 6px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 0 16px;
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        line-height: 1;
                        text-decoration: none;
                        text-transform: uppercase;
                        white-space: nowrap;
                    }
                    .header-cta-primary {
                        background: var(--pine);
                        color: var(--paper);
                        box-shadow: 0 10px 24px -14px rgba(14,42,94,0.55);
                    }
                    .header-cta-primary:hover {
                        background: var(--sand);
                        color: #fff;
                    }
                    .header-cta-ghost {
                        border: 1px solid rgba(14,42,94,0.22);
                        color: var(--pine);
                    }
                    .header-mobile-actions {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-top: 14px;
                        padding-top: 14px;
                        border-top: 1px solid rgba(14,42,94,0.14);
                    }
                    .welcome-header-mobile-nav {
                        border-top: 1px solid rgba(14,42,94,0.1);
                        background: rgba(245,247,251,0.98);
                    }
                    .welcome-header-mobile-inner {
                        max-width: 1280px;
                        margin: 0 auto;
                        padding: 16px 28px 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                    }
                    .welcome-header-mobile-inner .welcome-header-nav-link {
                        padding: 12px 0;
                    }

                    .welcome-footer {
                        --footer-bg: #ffffff;
                        --footer-bg-soft: #f5f7fb;
                        --footer-border: rgba(14,42,94,0.14);
                        --footer-ink: #1a2540;
                        --footer-muted: #5a6478;
                        --footer-accent: #1f4694;
                        --footer-icon-bg: rgba(31,70,148,0.08);
                        --footer-icon-border: rgba(31,70,148,0.18);

                        background:
                            linear-gradient(180deg, var(--footer-bg) 0%, var(--footer-bg-soft) 100%);
                        border-top: 1px solid var(--footer-border);
                        color: var(--footer-ink);
                        overflow: hidden;
                    }
                    .welcome-footer-inner {
                        max-width: 1280px;
                        margin: 0 auto;
                        padding: 64px 28px 0;
                    }
                    .welcome-footer-lede {
                        display: grid;
                        grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
                        gap: 28px 56px;
                        align-items: end;
                        padding-bottom: 40px;
                        border-bottom: 1px solid var(--footer-border);
                    }
                    .welcome-footer-kicker,
                    .welcome-footer-panel h3,
                    .welcome-footer-contact-list strong,
                    .welcome-footer-bottom span {
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        text-transform: uppercase;
                    }
                    .welcome-footer-kicker {
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        color: var(--footer-accent);
                        font-size: 10px;
                        font-weight: 600;
                        letter-spacing: 0.18em;
                        margin-bottom: 18px;
                    }
                    .welcome-footer-kicker::before {
                        content: '';
                        width: 32px;
                        height: 1px;
                        background: currentColor;
                    }
                    .welcome-footer-title {
                        max-width: 760px;
                        margin: 0;
                        color: var(--footer-ink);
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(2rem, 3.5vw, 3.75rem);
                        font-weight: 300;
                        line-height: 1;
                    }
                    .welcome-footer-title em {
                        color: var(--footer-accent);
                        font-style: italic;
                    }
                    .welcome-footer-lede p,
                    .welcome-footer-brand p {
                        margin: 0;
                        color: var(--footer-muted);
                        font-size: 15px;
                        line-height: 1.75;
                    }
                    .welcome-footer-grid {
                        display: grid;
                        grid-template-columns: minmax(280px, 1.15fr) minmax(280px, 1fr) minmax(190px, 0.7fr);
                        gap: 36px 56px;
                        align-items: start;
                        padding: 40px 0;
                    }
                    .welcome-footer-brand,
                    .welcome-footer-panel {
                        min-width: 0;
                    }
                    .welcome-footer-brand {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 18px;
                    }
                    .welcome-footer-logo-link {
                        display: inline-flex;
                        line-height: 0;
                    }
                    .welcome-footer-logo-link img {
                        width: auto !important;
                        height: 54px !important;
                        max-width: 230px !important;
                        max-height: 54px !important;
                        object-fit: contain;
                    }
                    .welcome-footer-logo-light { display: block !important; }
                    .welcome-footer-logo-dark { display: none !important; }
                    .dark .welcome-footer-logo-light { display: none !important; }
                    .dark .welcome-footer-logo-dark { display: block !important; }
                    .welcome-footer-panel h3 {
                        margin: 0 0 18px;
                        color: var(--footer-accent);
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.18em;
                    }
                    .welcome-footer-contact-list {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        margin: 0;
                        padding: 0;
                        list-style: none;
                    }
                    .welcome-footer-contact-list li {
                        display: flex;
                        align-items: flex-start;
                        gap: 14px;
                    }
                    .welcome-footer-contact-icon {
                        width: 38px;
                        height: 38px;
                        border-radius: 8px;
                        border: 1px solid var(--footer-icon-border);
                        background: var(--footer-icon-bg);
                        color: var(--footer-accent);
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        flex: 0 0 auto;
                    }
                    .welcome-footer-contact-list li > span:last-child {
                        display: grid;
                        gap: 4px;
                        min-width: 0;
                    }
                    .welcome-footer-contact-list strong {
                        color: var(--footer-muted);
                        font-size: 9px;
                        font-weight: 600;
                        letter-spacing: 0.14em;
                    }
                    .welcome-footer-contact-list a,
                    .welcome-footer-contact-list span span,
                    .welcome-footer-links a {
                        color: var(--footer-ink);
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 1.5;
                        text-decoration: none;
                    }
                    .welcome-footer-contact-list a:hover,
                    .welcome-footer-links a:hover {
                        color: var(--footer-accent);
                    }
                    .welcome-footer-links {
                        display: grid;
                        gap: 12px;
                    }
                    .welcome-footer-bottom {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        flex-wrap: wrap;
                        border-top: 1px solid var(--footer-border);
                        padding: 18px 0 22px;
                    }
                    .welcome-footer-bottom p {
                        margin: 0;
                        color: var(--footer-muted);
                        font-size: 12px;
                    }
                    .welcome-footer-bottom span {
                        color: var(--footer-muted);
                        font-size: 10px;
                        letter-spacing: 0.1em;
                    }
                    .dark .welcome-footer {
                        --footer-bg: #0b1220;
                        --footer-bg-soft: #111a30;
                        --footer-border: rgba(168,193,237,0.16);
                        --footer-ink: #e6ecf6;
                        --footer-muted: #a8b3c7;
                        --footer-accent: #a8c1ed;
                        --footer-icon-bg: rgba(168,193,237,0.08);
                        --footer-icon-border: rgba(168,193,237,0.18);
                    }
                    .dark .welcome-footer-title,
                    .dark .welcome-footer-contact-list a,
                    .dark .welcome-footer-contact-list span span,
                    .dark .welcome-footer-links a {
                        color: var(--footer-ink);
                    }
                    .dark .welcome-footer-lede p,
                    .dark .welcome-footer-brand p,
                    .dark .welcome-footer-bottom p,
                    .dark .welcome-footer-bottom span,
                    .dark .welcome-footer-contact-list strong {
                        color: var(--footer-muted);
                    }
                    @media (min-width: 1024px) {
                        .welcome-footer-inner {
                            padding-left: 56px;
                            padding-right: 56px;
                        }
                    }
                    @media (max-width: 1023px) {
                        .welcome-footer-lede,
                        .welcome-footer-grid {
                            grid-template-columns: 1fr 1fr;
                        }
                        .welcome-footer-brand {
                            grid-column: 1 / -1;
                            max-width: 46rem;
                        }
                    }
                    @media (max-width: 767px) {
                        .welcome-footer-inner {
                            padding: 44px 20px 0;
                        }
                        .welcome-footer-lede,
                        .welcome-footer-grid {
                            grid-template-columns: 1fr;
                        }
                        .welcome-footer-lede {
                            padding-bottom: 30px;
                        }
                        .welcome-footer-grid {
                            gap: 30px;
                            padding: 32px 0;
                        }
                        .welcome-footer-logo-link img {
                            height: 46px !important;
                            max-width: 194px !important;
                            max-height: 46px !important;
                        }
                        .welcome-footer-bottom {
                            align-items: flex-start;
                            flex-direction: column;
                        }
                    }

                    .welcome-theme-toggle {
                        position: fixed;
                        right: 24px;
                        bottom: 24px;
                        z-index: 60;
                        width: 48px;
                        height: 48px;
                        border: 1px solid rgba(14,42,94,0.18);
                        border-radius: 999px;
                        background: rgba(245,247,251,0.92);
                        color: var(--pine);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 8px 28px rgba(14,42,94,0.14);
                    }
                    @media (min-width: 768px) {
                        .header-cta-link,
                        .welcome-header-actions-divider { display: inline-flex; }
                    }
                    @media (min-width: 1024px) {
                        .welcome-header-bar {
                            height: 72px;
                            padding-left: 56px;
                            padding-right: 56px;
                        }
                        .welcome-header-nav { display: flex; }
                        .welcome-header-menu-btn { display: none; }
                    }
                    @media (max-width: 767px) {
                        .welcome-header-bar {
                            height: 62px;
                            padding-left: 18px;
                            padding-right: 18px;
                        }
                        .welcome-header-brand-link img {
                            height: 42px !important;
                            max-width: 176px !important;
                            max-height: 42px !important;
                        }
                        .header-cta-primary {
                            min-height: 36px;
                            padding: 0 12px;
                            font-size: 10px;
                        }
                        .welcome-header-mobile-inner {
                            padding-left: 18px;
                            padding-right: 18px;
                        }
                        .welcome-theme-toggle {
                            right: 16px;
                            bottom: 16px;
                            width: 44px;
                            height: 44px;
                        }
                    }

                    /* welcome-scoped pill button override */
                    .cure-welcome .btn-primary {
                        background: var(--pine) !important;
                        color: var(--paper) !important;
                        border-radius: 999px !important;
                        font-family: 'JetBrains Mono', ui-monospace, monospace !important;
                        letter-spacing: 0.14em;
                        font-size: 11px !important;
                        text-transform: uppercase;
                        padding: 14px 26px !important;
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        box-shadow: 0 1px 0 rgba(14,42,94,0.2), 0 12px 30px -12px rgba(14,42,94,0.5);
                        transition: background .2s, transform .2s, box-shadow .2s;
                    }
                    .cure-welcome .btn-primary:hover {
                        background: var(--sand) !important;
                        transform: translateY(-1px);
                        box-shadow: 0 1px 0 rgba(14,42,94,0.2), 0 18px 38px -12px rgba(31,70,148,0.55);
                    }
                    .cure-welcome .btn-primary::after { display: none !important; }

                    /* Reveal */
                    [data-reveal] {
                        opacity: 0;
                        transform: translateY(28px);
                        transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);
                    }
                    [data-reveal].revealed { opacity: 1; transform: translateY(0); }
                    [data-reveal][data-delay='1'] { transition-delay: .08s; }
                    [data-reveal][data-delay='2'] { transition-delay: .16s; }
                    [data-reveal][data-delay='3'] { transition-delay: .24s; }
                    [data-reveal][data-delay='4'] { transition-delay: .32s; }
                    [data-reveal][data-delay='5'] { transition-delay: .40s; }

                    @keyframes cureFadeUp { from { opacity:0; transform:translateY(28px);} to { opacity:1; transform:translateY(0);} }
                    @keyframes cureSlow { from { transform: translateY(0);} to { transform: translateY(-6px);} }
                    @keyframes cureBlink { 0%,100% { opacity: 1;} 50% { opacity: .25; } }

                    /* ── Shared bits ──────────────────────────────────────── */
                    .cure-shell { max-width: 1280px; margin: 0 auto; padding-left: 28px; padding-right: 28px; }
                    @media (min-width: 1024px) { .cure-shell { padding-left: 56px; padding-right: 56px; } }

                    .cure-section { padding-top: 128px; padding-bottom: 128px; position: relative; }
                    @media (max-width: 800px) { .cure-section { padding-top: 80px; padding-bottom: 80px; } }

                    .cure-section.cure-hero {
                        padding-top: 32px;
                        padding-bottom: 80px;
                    }
                    @media (max-width: 800px) {
                        .cure-section.cure-hero {
                            padding-top: 24px;
                            padding-bottom: 64px;
                        }
                    }

                    .cure-rule { height: 1px; background: rgba(37,38,39,0.12); }
                    .cure-divider { display:flex; align-items:center; gap: 14px; }
                    .cure-divider-line { flex:1; height:1px; background: rgba(37,38,39,0.14); }

                    .cure-eyebrow {
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.22em;
                        color: var(--stone);
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .cure-eyebrow .dash { width: 28px; height: 1px; background: var(--ink); display:inline-block; }

                    .cure-italic {
                        font-style: italic;
                        font-family: 'Fraunces', Georgia, serif;
                        color: var(--sand);
                        font-weight: 400;
                    }

                    .cure-btn-ghost {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 26px;
                        border: 1px solid var(--ink);
                        border-radius: 999px;
                        color: var(--ink);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        text-decoration: none;
                        background: transparent;
                        transition: background .2s, color .2s, border-color .2s, transform .2s;
                    }
                    .cure-btn-ghost:hover { background: var(--ink); color: var(--paper); transform: translateY(-1px); }

                    .cure-btn-link {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--ink);
                        border-bottom: 1px solid var(--ink);
                        padding-bottom: 4px;
                        text-decoration: none;
                        transition: color .2s, border-color .2s;
                    }
                    .cure-btn-link:hover { color: var(--pine); border-color: var(--pine); }

                    /* ── Hero ─────────────────────────────────────────────── */
                    .cure-hero {
                        padding-top: 0;
                        padding-bottom: 0;
                        position: relative;
                        overflow: hidden;
                        isolation: isolate;
                        background: var(--paper);
                        border-bottom: 1px solid rgba(14, 42, 94, 0.08);
                    }
                    .cure-hero-backdrop {
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        overflow: hidden;
                    }
                    .cure-hero-backdrop-photo {
                        position: absolute;
                        inset: 0;
                        background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80&auto=format&fit=crop');
                        background-position: right center;
                        background-size: cover;
                        background-repeat: no-repeat;
                        transform: scale(1.03);
                    }
                    .cure-hero-backdrop-overlay {
                        position: absolute;
                        inset: 0;
                        background:
                            radial-gradient(ellipse 90% 70% at 100% -5%, rgba(31, 70, 148, 0.14), transparent 60%),
                            radial-gradient(ellipse 75% 60% at -8% 100%, rgba(0, 218, 243, 0.1), transparent 55%),
                            linear-gradient(
                                to right,
                                rgba(245, 247, 251, 0.98) 0%,
                                rgba(245, 247, 251, 0.94) 34%,
                                rgba(245, 247, 251, 0.72) 58%,
                                rgba(245, 247, 251, 0.42) 100%
                            );
                    }
                    .cure-hero-backdrop-grain {
                        position: absolute;
                        inset: 0;
                        opacity: 0.55;
                        background-image:
                            radial-gradient(rgba(14, 42, 94, 0.06) 1px, transparent 1px),
                            radial-gradient(rgba(31, 70, 148, 0.04) 1px, transparent 1px);
                        background-position: 0 0, 3px 4px;
                        background-size: 4px 4px, 11px 11px;
                    }
                    .cure-hero-backdrop-grid {
                        position: absolute;
                        inset: 0;
                        opacity: 0.32;
                        background-image:
                            linear-gradient(to right, rgba(0, 218, 243, 0.07) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 39, 83, 0.05) 1px, transparent 1px);
                        background-size: 56px 56px;
                        mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
                    }
                    .cure-hero .cure-shell {
                        position: relative;
                        z-index: 1;
                    }
                    .cure-hero .cure-hero-side {
                        position: absolute;
                        z-index: 1;
                    }
                    .cure-hero-grid {
                        display: grid;
                        grid-template-columns: 1.4fr 1fr;
                        gap: 80px;
                        align-items: end;
                    }
                    @media (max-width: 980px) {
                        .cure-hero-grid { grid-template-columns: 1fr; gap: 56px; }
                    }

                    .cure-hero-h1 {
                        font-size: clamp(54px, 9vw, 132px);
                        line-height: 0.92;
                        font-weight: 300;
                        letter-spacing: -0.025em;
                    }
                    .cure-hero-h1 em { font-style: italic; color: var(--sand); font-weight: 400; }
                    .cure-hero-h1 strong { font-weight: 500; }

                    .cure-hero-sub {
                        font-size: 18px;
                        line-height: 1.6;
                        color: var(--ink-2);
                        max-width: 460px;
                        font-weight: 400;
                    }

                    .cure-hero-quote {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-weight: 300;
                        font-size: 22px;
                        line-height: 1.45;
                        color: var(--ink);
                        border-left: 1px solid var(--ink);
                        padding: 8px 0 8px 22px;
                    }
                    .cure-hero-quote-author {
                        display:block;
                        margin-top: 14px;
                        font-style: normal;
                        font-size: 11px;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }

                    .cure-hero-metrics {
                        margin-top: 96px;
                        border-top: 1px solid rgba(37,38,39,0.14);
                        padding-top: 36px;
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0,1fr));
                        gap: 28px;
                    }
                    @media (max-width: 760px) {
                        .cure-hero-metrics { grid-template-columns: repeat(2,1fr); }
                    }
                    .cure-metric .num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-weight: 400;
                        font-size: 44px;
                        line-height: 1;
                        color: var(--ink);
                        letter-spacing: -0.02em;
                    }
                    .cure-metric .num em { font-style: italic; color: var(--sand); font-weight: 400; }
                    .cure-metric .label {
                        margin-top: 12px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--stone);
                        line-height: 1.5;
                    }

                    /* sidebar mark on hero */
                    .cure-hero-side {
                        position: absolute;
                        left: 18px;
                        top: 72px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.24em;
                        text-transform: uppercase;
                        color: var(--stone);
                        writing-mode: vertical-rl;
                        transform: rotate(180deg);
                        display: none;
                    }
                    @media (min-width: 1280px) { .cure-hero-side { display: block; } }

                    /* ── Manifesto / Commitments ──────────────────────────── */
                    .cure-manifesto {
                        background: var(--paper-2);
                        border-top: 1px solid rgba(37,38,39,0.10);
                        border-bottom: 1px solid rgba(37,38,39,0.10);
                        position: relative;
                        overflow: hidden;
                        padding-top: 96px;
                        padding-bottom: 96px;
                    }
                    @media (max-width: 800px) {
                        .cure-manifesto { padding-top: 72px; padding-bottom: 72px; }
                    }
                    .cure-manifesto-watermark {
                        position: absolute;
                        top: -0.12em;
                        right: -0.04em;
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(9rem, 18vw, 16rem);
                        font-weight: 300;
                        line-height: 1;
                        letter-spacing: -0.04em;
                        color: rgba(14,42,94,0.04);
                        pointer-events: none;
                        user-select: none;
                    }
                    .dark .cure-manifesto-watermark {
                        color: rgba(168,193,237,0.05);
                    }
                    .cure-manifesto-grid {
                        display: grid;
                        grid-template-columns: minmax(280px, 0.95fr) minmax(0, 1.05fr);
                        gap: 56px 72px;
                        align-items: start;
                        position: relative;
                        z-index: 1;
                    }
                    @media (max-width: 960px) {
                        .cure-manifesto-grid { grid-template-columns: 1fr; gap: 40px; }
                    }
                    .cure-manifesto-rail {
                        position: sticky;
                        top: 96px;
                    }
                    @media (max-width: 960px) {
                        .cure-manifesto-rail { position: static; }
                    }
                    .cure-manifesto-ledger {
                        margin-top: 28px;
                        padding: 22px 24px;
                        border-left: 3px solid var(--sand);
                        background: rgba(255,255,255,0.55);
                        border-radius: 0 12px 12px 0;
                        box-shadow: inset 0 0 0 1px rgba(14,42,94,0.06);
                    }
                    .dark .cure-manifesto-ledger {
                        background: rgba(24,35,63,0.65);
                        box-shadow: inset 0 0 0 1px rgba(168,193,237,0.1);
                        border-left-color: var(--sand-2);
                    }
                    .cure-manifesto-ledger p {
                        margin: 0;
                        font-size: 15px;
                        line-height: 1.75;
                        color: var(--ink-2);
                    }
                    .cure-manifesto-ledger strong {
                        color: var(--ink);
                        font-weight: 600;
                    }
                    .cure-manifesto-tension {
                        margin-top: 32px;
                        display: flex;
                        align-items: center;
                        gap: 0;
                    }
                    .cure-manifesto-tension-line {
                        flex: 1;
                        height: 1px;
                        background: linear-gradient(90deg, var(--sand), rgba(31,70,148,0.15));
                    }
                    .cure-manifesto-tension-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 999px;
                        border: 1.5px solid var(--sand);
                        background: var(--paper-2);
                        flex-shrink: 0;
                    }
                    .cure-manifesto-tension-dot.is-active {
                        background: var(--sand);
                        box-shadow: 0 0 0 4px rgba(31,70,148,0.12);
                    }
                    .dark .cure-manifesto-tension-dot {
                        background: var(--paper-2);
                        border-color: var(--sand-2);
                    }
                    .dark .cure-manifesto-tension-dot.is-active {
                        background: var(--sand);
                        box-shadow: 0 0 0 4px rgba(168,193,237,0.15);
                    }
                    .cure-section-title {
                        font-size: clamp(36px, 5vw, 68px);
                        line-height: 0.98;
                        font-weight: 300;
                        letter-spacing: -0.02em;
                    }
                    .cure-section-title em { font-style: italic; color: var(--sand); font-weight: 400; }

                    .cure-manifesto-cards {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        position: relative;
                    }
                    .cure-manifesto-spine {
                        position: absolute;
                        left: 23px;
                        top: 28px;
                        bottom: 28px;
                        width: 1px;
                        background: linear-gradient(180deg, transparent, rgba(31,70,148,0.22) 12%, rgba(31,70,148,0.22) 88%, transparent);
                        pointer-events: none;
                    }
                    .dark .cure-manifesto-spine {
                        background: linear-gradient(180deg, transparent, rgba(168,193,237,0.2) 12%, rgba(168,193,237,0.2) 88%, transparent);
                    }
                    @media (max-width: 600px) {
                        .cure-manifesto-spine { display: none; }
                    }
                    .cure-commit-card {
                        display: grid;
                        grid-template-columns: auto 1fr;
                        gap: 20px 24px;
                        padding: 28px 28px 28px 24px;
                        background: var(--cream);
                        border: 1px solid rgba(14,42,94,0.1);
                        border-radius: 16px;
                        position: relative;
                        transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
                    }
                    .cure-commit-card:hover {
                        transform: translateX(4px);
                        border-color: rgba(31,70,148,0.28);
                        box-shadow: 0 16px 40px -24px rgba(14,42,94,0.35);
                    }
                    .dark .cure-commit-card {
                        background: var(--cream);
                        border-color: rgba(168,193,237,0.12);
                    }
                    .dark .cure-commit-card:hover {
                        border-color: rgba(168,193,237,0.28);
                        box-shadow: 0 16px 40px -24px rgba(0,0,0,0.45);
                    }
                    .cure-commit-card-marker {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 12px;
                        padding-top: 2px;
                    }
                    .cure-commit-card-dot {
                        width: 12px;
                        height: 12px;
                        border-radius: 999px;
                        border: 2px solid var(--sand);
                        background: var(--cream);
                        flex-shrink: 0;
                        position: relative;
                        z-index: 1;
                    }
                    .cure-commit-card-num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 22px;
                        line-height: 1;
                        color: var(--sand);
                    }
                    .cure-commit-card-body {
                        min-width: 0;
                    }
                    .cure-commit-card-head {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px 16px;
                        margin-bottom: 10px;
                    }
                    .cure-commit-card-head h3 {
                        font-size: clamp(1.35rem, 2vw, 1.65rem);
                        font-weight: 400;
                        line-height: 1.15;
                        margin: 0;
                        letter-spacing: -0.01em;
                    }
                    .cure-commit-card-tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 12px;
                        border-radius: 999px;
                        border: 1px solid rgba(31,70,148,0.14);
                        background: rgba(31,70,148,0.06);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: var(--sand);
                    }
                    .dark .cure-commit-card-tag {
                        border-color: rgba(168,193,237,0.18);
                        background: rgba(168,193,237,0.08);
                    }
                    .cure-commit-card p {
                        margin: 0;
                        font-size: 15px;
                        line-height: 1.7;
                        color: var(--ink-2);
                        max-width: 36rem;
                    }
                    .cure-commit-card-foot {
                        margin-top: 16px;
                        padding-top: 14px;
                        border-top: 1px solid rgba(14,42,94,0.08);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .dark .cure-commit-card-foot {
                        border-top-color: rgba(168,193,237,0.1);
                    }
                    @media (max-width: 600px) {
                        .cure-commit-card {
                            grid-template-columns: 1fr;
                            gap: 14px;
                            padding: 22px 20px;
                        }
                        .cure-commit-card-marker {
                            flex-direction: row;
                        }
                    }

                    /* ── Four-act method ──────────────────────────────────── */
                    .cure-method {
                        position: relative;
                        overflow: hidden;
                        padding-top: 96px;
                        padding-bottom: 96px;
                    }
                    @media (max-width: 800px) {
                        .cure-method { padding-top: 72px; padding-bottom: 72px; }
                    }
                    .cure-method-watermark {
                        position: absolute;
                        top: -0.08em;
                        left: -0.02em;
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(9rem, 18vw, 16rem);
                        font-weight: 300;
                        line-height: 1;
                        letter-spacing: -0.04em;
                        color: rgba(14,42,94,0.035);
                        pointer-events: none;
                        user-select: none;
                    }
                    .dark .cure-method-watermark {
                        color: rgba(168,193,237,0.045);
                    }
                    .cure-method-header {
                        display: grid;
                        grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
                        gap: 48px 64px;
                        align-items: end;
                        margin-bottom: 56px;
                        position: relative;
                        z-index: 1;
                    }
                    @media (max-width: 900px) {
                        .cure-method-header { grid-template-columns: 1fr; gap: 24px; }
                    }
                    .cure-method-lede {
                        margin: 0;
                        font-size: 16px;
                        line-height: 1.75;
                        color: var(--ink-2);
                        max-width: 28rem;
                    }
                    .cure-method-rhythm {
                        margin-top: 24px;
                        display: inline-flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 8px 10px;
                        padding: 10px 14px;
                        border-radius: 999px;
                        border: 1px solid rgba(14,42,94,0.1);
                        background: rgba(31,70,148,0.05);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .dark .cure-method-rhythm {
                        border-color: rgba(168,193,237,0.14);
                        background: rgba(168,193,237,0.06);
                    }
                    .cure-method-rhythm-arrow {
                        color: var(--sand);
                    }
                    .cure-method-track {
                        position: relative;
                        z-index: 1;
                        margin-bottom: 28px;
                        padding: 0 12px;
                    }
                    .cure-method-track-line {
                        position: absolute;
                        left: 12.5%;
                        right: 12.5%;
                        top: 18px;
                        height: 2px;
                        background: linear-gradient(90deg, rgba(31,70,148,0.12), rgba(31,70,148,0.45) 25%, rgba(31,70,148,0.45) 75%, rgba(31,70,148,0.12));
                        border-radius: 999px;
                    }
                    .dark .cure-method-track-line {
                        background: linear-gradient(90deg, rgba(168,193,237,0.1), rgba(168,193,237,0.35) 25%, rgba(168,193,237,0.35) 75%, rgba(168,193,237,0.1));
                    }
                    .cure-method-track-nodes {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 0;
                        position: relative;
                    }
                    .cure-method-node {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 10px;
                    }
                    .cure-method-node-badge {
                        width: 36px;
                        height: 36px;
                        border-radius: 999px;
                        border: 2px solid var(--sand);
                        background: var(--paper);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 14px;
                        color: var(--sand);
                        position: relative;
                        z-index: 1;
                        box-shadow: 0 0 0 6px var(--paper);
                    }
                    .dark .cure-method-node-badge {
                        background: var(--paper);
                        box-shadow: 0 0 0 6px var(--paper);
                    }
                    .cure-method-node-label {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 9px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--stone);
                        text-align: center;
                    }
                    .cure-method-steps {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 16px;
                        position: relative;
                        z-index: 1;
                    }
                    @media (max-width: 1100px) {
                        .cure-method-track { display: none; }
                        .cure-method-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    }
                    @media (max-width: 600px) {
                        .cure-method-steps { grid-template-columns: 1fr; }
                    }
                    .cure-method-step {
                        background: var(--cream);
                        border: 1px solid rgba(14,42,94,0.1);
                        border-radius: 16px;
                        padding: 24px 22px 20px;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        position: relative;
                        overflow: hidden;
                        transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
                    }
                    .cure-method-step::before {
                        content: '';
                        position: absolute;
                        inset: 0 auto 0 0;
                        width: 3px;
                        background: linear-gradient(180deg, var(--sand), rgba(31,70,148,0.15));
                        opacity: 0;
                        transition: opacity 0.35s ease;
                    }
                    .cure-method-step:hover {
                        transform: translateY(-4px);
                        border-color: rgba(31,70,148,0.24);
                        box-shadow: 0 20px 44px -28px rgba(14,42,94,0.35);
                    }
                    .cure-method-step:hover::before {
                        opacity: 1;
                    }
                    .dark .cure-method-step {
                        background: var(--cream);
                        border-color: rgba(168,193,237,0.12);
                    }
                    .dark .cure-method-step:hover {
                        border-color: rgba(168,193,237,0.28);
                        box-shadow: 0 20px 44px -28px rgba(0,0,0,0.45);
                    }
                    .cure-method-step-top {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                    }
                    .cure-method-step-tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 11px;
                        border-radius: 999px;
                        border: 1px solid rgba(31,70,148,0.12);
                        background: rgba(31,70,148,0.05);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: var(--sand);
                    }
                    .dark .cure-method-step-tag {
                        border-color: rgba(168,193,237,0.16);
                        background: rgba(168,193,237,0.07);
                    }
                    .cure-method-step-index {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 2rem;
                        line-height: 1;
                        color: rgba(31,70,148,0.14);
                    }
                    .dark .cure-method-step-index {
                        color: rgba(168,193,237,0.18);
                    }
                    .cure-method-step h3 {
                        font-size: clamp(1.35rem, 2vw, 1.55rem);
                        font-weight: 400;
                        line-height: 1.1;
                        margin: 0;
                        letter-spacing: -0.01em;
                    }
                    .cure-method-step p {
                        margin: 0;
                        font-size: 14.5px;
                        line-height: 1.68;
                        color: var(--ink-2);
                        flex: 1;
                    }
                    .cure-method-step-foot {
                        margin-top: auto;
                        padding-top: 14px;
                        border-top: 1px solid rgba(14,42,94,0.08);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .dark .cure-method-step-foot {
                        border-top-color: rgba(168,193,237,0.1);
                    }
                    .cure-method-step-pulse {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: var(--sand);
                        animation: cureBlink 2.4s ease-in-out infinite;
                        flex-shrink: 0;
                    }
                    @media (max-width: 1100px) {
                        .cure-method-step-top { display: none; }
                        .cure-method-step-top-mobile {
                            display: inline-flex;
                            align-items: center;
                            gap: 10px;
                            margin-bottom: 4px;
                        }
                        .cure-method-step-index-mobile {
                            font-family: 'Fraunces', Georgia, serif;
                            font-style: italic;
                            font-size: 1.25rem;
                            color: var(--sand);
                        }
                    }
                    @media (min-width: 1101px) {
                        .cure-method-step-top-mobile { display: none; }
                    }

                    /* ── Roles / Lenses ───────────────────────────────────── */
                    .cure-roles {
                        background: linear-gradient(165deg, #0e2a5e 0%, #091833 52%, #061224 100%);
                        color: #e6ecf6;
                        position: relative;
                        overflow: hidden;
                        padding-top: 96px;
                        padding-bottom: 96px;
                    }
                    @media (max-width: 800px) {
                        .cure-roles { padding-top: 72px; padding-bottom: 72px; }
                    }
                    .cure-roles::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background-image:
                            radial-gradient(rgba(168,193,237,0.07) 1px, transparent 1px),
                            radial-gradient(rgba(0,218,243,0.04) 1px, transparent 1px);
                        background-size: 28px 28px, 18px 18px;
                        background-position: 0 0, 12px 12px;
                        pointer-events: none;
                        opacity: 0.55;
                    }
                    .cure-roles-watermark {
                        position: absolute;
                        top: -0.08em;
                        right: -0.02em;
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: clamp(9rem, 18vw, 16rem);
                        font-weight: 300;
                        line-height: 1;
                        letter-spacing: -0.04em;
                        color: rgba(255,255,255,0.04);
                        pointer-events: none;
                        user-select: none;
                        z-index: 0;
                    }
                    .cure-roles-header {
                        display: grid;
                        grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
                        gap: 48px 64px;
                        align-items: end;
                        margin-bottom: 48px;
                        position: relative;
                        z-index: 1;
                    }
                    @media (max-width: 900px) {
                        .cure-roles-header { grid-template-columns: 1fr; gap: 24px; }
                    }
                    .cure-roles h2,
                    .cure-roles h3,
                    .cure-roles h4 { color: #f8fafc; }
                    .cure-roles .cure-eyebrow { color: rgba(168,193,237,0.75); }
                    .cure-roles .cure-eyebrow .dash { background: #00daf3; }
                    .cure-roles .cure-section-title em { color: #9cf0ff; }
                    .cure-roles-lede {
                        margin: 0;
                        font-size: 16px;
                        line-height: 1.75;
                        color: rgba(226,232,240,0.78);
                        max-width: 28rem;
                    }
                    .cure-roles-truth {
                        margin-top: 24px;
                        display: inline-flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 8px 10px;
                        padding: 10px 14px;
                        border-radius: 999px;
                        border: 1px solid rgba(0,218,243,0.18);
                        background: rgba(0,218,243,0.06);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: rgba(168,193,237,0.85);
                    }
                    .cure-roles-truth-core {
                        color: #9cf0ff;
                    }
                    .cure-roles-grid {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 14px;
                        position: relative;
                        z-index: 1;
                    }
                    @media (max-width: 1100px) {
                        .cure-roles-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    }
                    @media (max-width: 600px) {
                        .cure-roles-grid { grid-template-columns: 1fr; }
                    }
                    .cure-lens-card {
                        background: rgba(255,255,255,0.035);
                        border: 1px solid rgba(168,193,237,0.14);
                        border-radius: 16px;
                        padding: 24px 22px 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        min-height: 100%;
                        position: relative;
                        overflow: hidden;
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        transition: transform 0.35s ease, border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
                    }
                    .cure-lens-card::after {
                        content: '';
                        position: absolute;
                        inset: auto 0 0 0;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, rgba(0,218,243,0.55), transparent);
                        opacity: 0;
                        transition: opacity 0.35s ease;
                    }
                    .cure-lens-card:hover {
                        transform: translateY(-4px);
                        background: rgba(255,255,255,0.055);
                        border-color: rgba(0,218,243,0.28);
                        box-shadow: 0 22px 48px -28px rgba(0,0,0,0.55);
                    }
                    .cure-lens-card:hover::after {
                        opacity: 1;
                    }
                    .cure-lens-card-top {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                    }
                    .cure-lens-card-mark {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: rgba(156,240,255,0.85);
                    }
                    .cure-lens-card-icon {
                        width: 40px;
                        height: 40px;
                        border-radius: 999px;
                        border: 1px solid rgba(0,218,243,0.22);
                        background: rgba(0,218,243,0.08);
                        color: #9cf0ff;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }
                    .cure-lens-card h3 {
                        font-size: clamp(1.25rem, 2vw, 1.45rem);
                        font-weight: 400;
                        line-height: 1.12;
                        margin: 0;
                        letter-spacing: -0.01em;
                    }
                    .cure-lens-card p {
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.68;
                        color: rgba(203,213,225,0.82);
                        flex: 1;
                    }
                    .cure-lens-card-foot {
                        margin-top: auto;
                        padding-top: 14px;
                        border-top: 1px solid rgba(168,193,237,0.12);
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: rgba(148,163,184,0.9);
                    }
                    .cure-roles-shared {
                        margin-top: 28px;
                        position: relative;
                        z-index: 1;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px 24px;
                        padding: 16px 20px;
                        border-radius: 12px;
                        border: 1px solid rgba(168,193,237,0.14);
                        background: rgba(6,18,36,0.55);
                    }
                    .cure-roles-shared-label {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: #9cf0ff;
                    }
                    .cure-roles-shared-dot {
                        width: 7px;
                        height: 7px;
                        border-radius: 999px;
                        background: #00daf3;
                        animation: cureBlink 2.4s ease-in-out infinite;
                        flex-shrink: 0;
                    }
                    .cure-roles-shared-items {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px 14px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: rgba(148,163,184,0.95);
                    }
                    .dark .cure-roles {
                        background: linear-gradient(165deg, #050a18 0%, #071222 52%, #030810 100%);
                    }

                    /* ── Numbers, kept honest. ────────────────────────────── */
                    .cure-ledger-layout {
                        display: grid;
                        grid-template-columns: 0.95fr 1.05fr;
                        gap: 56px;
                        align-items: stretch;
                    }
                    @media (max-width: 980px) { .cure-ledger-layout { grid-template-columns: 1fr; gap: 32px; } }

                    .cure-ledger-card {
                        background: var(--cream);
                        border: 1px solid rgba(37,38,39,0.14);
                        border-radius: 18px;
                        padding: 28px;
                    }
                    .cure-ledger-head {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 1px solid rgba(37,38,39,0.10);
                        padding-bottom: 14px;
                        margin-bottom: 18px;
                    }
                    .cure-ledger-stat {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0,1fr));
                        gap: 12px;
                    }
                    .cure-ledger-stat .cell {
                        background: var(--paper);
                        border: 1px solid rgba(37,38,39,0.10);
                        border-radius: 12px;
                        padding: 14px;
                    }
                    .cure-ledger-stat .label {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 9.5px;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .cure-ledger-stat .value {
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: 28px;
                        font-weight: 400;
                        line-height: 1;
                        margin-top: 6px;
                        color: var(--ink);
                    }
                    .cure-ledger-stat .value em { font-style: italic; color: var(--sand); font-weight: 400; }

                    .cure-rows {
                        margin-top: 22px;
                        border-top: 1px solid rgba(37,38,39,0.10);
                        padding-top: 14px;
                    }
                    .cure-row {
                        display: grid;
                        grid-template-columns: 1.2fr 1fr 0.5fr;
                        gap: 12px;
                        padding: 10px 0;
                        align-items: center;
                        font-size: 14px;
                        color: var(--ink);
                        border-bottom: 1px dashed rgba(37,38,39,0.10);
                    }
                    .cure-row:last-child { border-bottom: none; }
                    .cure-row .ent { font-family: 'Fraunces', Georgia, serif; font-size: 16px; }
                    .cure-row .st {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .cure-row .sc { text-align: right; font-family: 'Fraunces', Georgia, serif; font-weight: 500; }

                    .cure-report-list .item {
                        padding: 22px 0;
                        border-bottom: 1px solid rgba(37,38,39,0.14);
                        display: grid;
                        grid-template-columns: 40px 1fr auto;
                        gap: 18px;
                        align-items: center;
                    }
                    .cure-report-list .item:first-child { border-top: 1px solid rgba(37,38,39,0.14); }
                    .cure-report-list .item .num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 26px;
                        color: var(--sand);
                    }
                    .cure-report-list .item h4 {
                        font-size: 22px;
                        font-weight: 400;
                        line-height: 1.15;
                        margin-bottom: 4px;
                    }
                    .cure-report-list .item p {
                        font-size: 14px;
                        line-height: 1.6;
                        color: var(--ink-2);
                    }
                    .cure-report-list .item .go {
                        color: var(--stone);
                        transition: color .2s, transform .2s;
                    }
                    .cure-report-list .item:hover .go { color: var(--ink); transform: translateX(3px); }

                    /* ── Continuum (calendar marquee) ─────────────────────── */
                    .cure-continuum {
                        background: var(--paper-2);
                        border-top: 1px solid rgba(37,38,39,0.10);
                        border-bottom: 1px solid rgba(37,38,39,0.10);
                        padding: 38px 0;
                        overflow: hidden;
                    }
                    .cure-continuum-inner {
                        display: flex;
                        gap: 56px;
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 32px;
                        color: var(--ink);
                        animation: cureTicker 50s linear infinite;
                        white-space: nowrap;
                        font-weight: 300;
                    }
                    .cure-continuum-inner span { color: var(--sand); margin-left: 56px; }
                    @keyframes cureTicker { from { transform: translateX(0);} to { transform: translateX(-50%);} }

                    /* ── Closing invitation ───────────────────────────────── */
                    .cure-invite {
                        text-align: left;
                    }
                    .cure-invite-h {
                        font-size: clamp(48px, 8vw, 120px);
                        line-height: 0.95;
                        font-weight: 300;
                        letter-spacing: -0.025em;
                        max-width: 980px;
                    }
                    .cure-invite-h em { font-style: italic; color: var(--sand); font-weight: 400; }
                    .cure-invite-grid {
                        margin-top: 56px;
                        display: grid;
                        grid-template-columns: 1.2fr 1fr;
                        gap: 60px;
                        align-items: end;
                    }
                    @media (max-width: 900px) { .cure-invite-grid { grid-template-columns: 1fr; gap: 32px; } }
                    .cure-invite-actions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    .cure-invite-side {
                        font-size: 15px;
                        line-height: 1.7;
                        color: var(--ink-2);
                    }
                    .cure-trust {
                        margin-top: 18px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 6px 14px;
                    }
                    .cure-trust span {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.16em;
                        color: var(--stone);
                        border-bottom: 1px solid rgba(37,38,39,0.18);
                        padding-bottom: 2px;
                    }

                    /* ── Dark theme override (navy night) ─────────────────── */
                    .dark .cure-welcome {
                        --paper:    #0b1220;   /* deep night navy */
                        --paper-2:  #111a30;
                        --cream:    #18233f;
                        --ink:      #e6ecf6;
                        --ink-2:    #b9c4d8;
                        --sand:     #a8c1ed;   /* lighter accent for dark */
                        --sand-2:   #7da4dc;
                        --stone:    #94a3b8;
                        --pine:     #0e2a5e;
                        --sky:      #3d6ec7;
                        --muted:    #6b7488;
                    }
                    .dark .cure-welcome::before {
                        opacity: 0.35;
                        background-image:
                            radial-gradient(rgba(168,193,237,0.06) 1px, transparent 1px),
                            radial-gradient(rgba(168,193,237,0.04) 1px, transparent 1px);
                    }
                    .dark .cure-welcome > header.welcome-header { background: rgba(11,18,32,0.92) !important; }
                    .dark .cure-hero {
                        background: var(--paper);
                        border-bottom-color: rgba(168, 193, 237, 0.1);
                    }
                    .dark .cure-hero-backdrop-overlay {
                        background:
                            radial-gradient(ellipse 90% 70% at 100% -5%, rgba(168, 193, 237, 0.16), transparent 60%),
                            radial-gradient(ellipse 75% 60% at -8% 100%, rgba(0, 218, 243, 0.08), transparent 55%),
                            linear-gradient(
                                to right,
                                rgba(11, 18, 32, 0.98) 0%,
                                rgba(11, 18, 32, 0.94) 34%,
                                rgba(11, 18, 32, 0.78) 58%,
                                rgba(11, 18, 32, 0.62) 100%
                            );
                    }
                    .dark .cure-hero-backdrop-grain {
                        opacity: 0.35;
                        background-image:
                            radial-gradient(rgba(168, 193, 237, 0.06) 1px, transparent 1px),
                            radial-gradient(rgba(168, 193, 237, 0.04) 1px, transparent 1px);
                    }
                    .dark .cure-hero-backdrop-grid {
                        opacity: 0.2;
                        background-image:
                            linear-gradient(to right, rgba(168, 193, 237, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 193, 237, 0.05) 1px, transparent 1px);
                    }
                    .dark .welcome-theme-toggle {
                        background: rgba(11,18,32,0.92);
                        border-color: rgba(168,193,237,0.2);
                        color: var(--ink);
                        box-shadow: 0 8px 28px rgba(0,0,0,0.35);
                    }
                    .dark .welcome-header-mobile-nav {
                        background: rgba(11,18,32,0.98);
                        border-top-color: rgba(168,193,237,0.12);
                    }
                    .dark .cure-method-step,
                    .dark .cure-commit-card,
                    .dark .cure-ledger-card,
                    .dark .cure-ledger-stat .cell {
                        background: var(--cream);
                        border-color: rgba(168,193,237,0.14);
                    }
                    .dark .cure-row { border-bottom-color: rgba(168,193,237,0.10); }
                    .dark .cure-rule,
                    .dark .cure-divider-line { background: rgba(168,193,237,0.14); }
                    .dark .cure-manifesto,
                    .dark .cure-continuum {
                        border-top-color: rgba(168,193,237,0.12);
                        border-bottom-color: rgba(168,193,237,0.12);
                    }
                    .dark .cure-welcome .btn-primary {
                        background: var(--sand) !important;
                        color: var(--paper) !important;
                    }
                    .dark .cure-welcome .btn-primary:hover {
                        background: #cddcf3 !important;
                    }
                    .dark .cure-btn-ghost {
                        border-color: rgba(168,193,237,0.4);
                        color: var(--ink);
                    }
                    .dark .cure-btn-ghost:hover {
                        background: var(--sand);
                        color: var(--paper);
                        border-color: var(--sand);
                    }
                `}</style>
            </Head>

            <div className="cure-welcome wc-root">
                <WelcomeHeader isAuthenticated={Boolean(auth.user)} />

                <main>
                    {/* ───────────── HERO ───────────── */}
                    <section className="cure-section cure-hero">
                        <div className="cure-hero-backdrop" aria-hidden="true">
                            <div className="cure-hero-backdrop-photo" />
                            <div className="cure-hero-backdrop-overlay" />
                            <div className="cure-hero-backdrop-grain" />
                            <div className="cure-hero-backdrop-grid" />
                        </div>
                        <div className="cure-hero-side">v 4.0 — public edition · vol. 01 — compliance studio</div>
                        <div className="cure-shell">
                            <div className="cure-divider" style={{ marginBottom: 36 }} data-reveal>
                                <span className="cure-eyebrow">
                                    <span className="dash" />
                                    The Cure Studio · Compliance
                                </span>
                                <span className="cure-divider-line" />
                                <span className="cure-eyebrow" style={{ opacity: 0.7 }}>
                                    Edition · 2026
                                </span>
                            </div>

                            <div className="cure-hero-grid">
                                <div>
                                    <h1 className="cure-hero-h1" data-reveal>
                                        Compliance, <em>measured</em>
                                        <br />
                                        with <strong>care</strong>.
                                    </h1>

                                    <p className="cure-hero-sub" data-reveal data-delay="2" style={{ marginTop: 36 }}>
                                        A patient, evidence-led system for training, audits, controls, and reviews. Built for organisations that want
                                        compliance people actually trust.
                                    </p>

                                    <div data-reveal data-delay="3" style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                        <Link href={auth.user ? route('dashboard') : route('register')} className="btn-primary">
                                            {auth.user ? <Gauge size={14} /> : <UserPlus size={14} />}
                                            {auth.user ? 'Open dashboard' : 'Enter the studio'}
                                            <ArrowRight size={14} />
                                        </Link>
                                        <Link href={route('login')} className="cure-btn-ghost">
                                            <PlayCircle size={13} />
                                            See the method
                                        </Link>
                                    </div>
                                </div>

                                <div data-reveal data-delay="2">
                                    <blockquote className="cure-hero-quote">
                                        "It is quality rather than quantity that matters."
                                        <span className="cure-hero-quote-author">— Lucius Annaeus Seneca</span>
                                    </blockquote>
                                </div>
                            </div>

                            <div className="cure-hero-metrics" data-reveal data-delay="3">
                                {[
                                    { v: '450+', l: 'controls held across frameworks' },
                                    { v: '12', l: 'tenant entities orchestrated' },
                                    { v: '99.9%', l: 'platform uptime, kept honest' },
                                    { v: '4', l: 'role lenses, one source of truth' },
                                ].map((m, i) => (
                                    <div key={m.l} className="cure-metric">
                                        <div className="num">
                                            {i === 0 || i === 2 ? (
                                                <>
                                                    {m.v.replace(/[+%]/g, '')}
                                                    <em>{m.v.match(/[+%]/)?.[0]}</em>
                                                </>
                                            ) : (
                                                m.v
                                            )}
                                        </div>
                                        <div className="label">{m.l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ───────────── MANIFESTO ───────────── */}
                    <section id="product" className="cure-section cure-manifesto">
                        <div className="cure-manifesto-watermark" aria-hidden="true">
                            01
                        </div>
                        <div className="cure-shell">
                            <div className="cure-manifesto-grid">
                                <aside className="cure-manifesto-rail" data-reveal>
                                    <span className="cure-eyebrow">
                                        <span className="dash" />
                                        01 — Manifesto
                                    </span>
                                    <h2 className="cure-section-title" style={{ marginTop: 22 }}>
                                        Three commitments. <em>Held in tension.</em> Never traded.
                                    </h2>
                                    <div className="cure-manifesto-ledger">
                                        <p>
                                            Compliance is the <strong>ledger</strong>, not the last conversation. We capture it as it happens — so when
                                            the audit arrives, the evidence is already in order.
                                        </p>
                                    </div>
                                    <div className="cure-manifesto-tension" aria-hidden="true">
                                        <span className="cure-manifesto-tension-dot is-active" />
                                        <span className="cure-manifesto-tension-line" />
                                        <span className="cure-manifesto-tension-dot is-active" />
                                        <span className="cure-manifesto-tension-line" />
                                        <span className="cure-manifesto-tension-dot is-active" />
                                    </div>
                                </aside>

                                <div className="cure-manifesto-cards">
                                    <div className="cure-manifesto-spine" aria-hidden="true" />
                                    {[
                                        {
                                            num: 'i.',
                                            icon: <ScrollText size={14} strokeWidth={2} />,
                                            tag: 'Artefacts',
                                            title: 'Evidence over recall',
                                            desc: 'Every control traces back to an artefact. Submissions are time-stamped, attributable, and immutable — never reconstructed from memory.',
                                            foot: 'Immutable · Attributed · Time-stamped',
                                        },
                                        {
                                            num: 'ii.',
                                            icon: <ClipboardCheck size={14} strokeWidth={2} />,
                                            tag: 'Calibration',
                                            title: 'Calibrate before crowning',
                                            desc: 'Reviewer queues, distribution guardrails, and second-pair sign-off. Decisions are made with calibration as the default, not the exception.',
                                            foot: 'Queues · Guardrails · Sign-off',
                                        },
                                        {
                                            num: 'iii.',
                                            icon: <Gauge size={14} strokeWidth={2} />,
                                            tag: 'Assurance',
                                            title: 'Numbers, kept honest',
                                            desc: 'Real-time scoring with exception surfacing. Boards see the truth before the regulator does — and stakeholders see the trail behind every figure.',
                                            foot: 'Scoring · Exceptions · Audit trail',
                                        },
                                    ].map((commit, i) => (
                                        <article key={commit.title} className="cure-commit-card" data-reveal data-delay={`${i + 1}` as const}>
                                            <div className="cure-commit-card-marker">
                                                <div className="cure-commit-card-dot" />
                                                <div className="cure-commit-card-num">{commit.num}</div>
                                            </div>
                                            <div className="cure-commit-card-body">
                                                <div className="cure-commit-card-head">
                                                    <h3>{commit.title}</h3>
                                                    <span className="cure-commit-card-tag">
                                                        {commit.icon}
                                                        {commit.tag}
                                                    </span>
                                                </div>
                                                <p>{commit.desc}</p>
                                                <div className="cure-commit-card-foot">{commit.foot}</div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ───────────── FOUR-ACT METHOD ───────────── */}
                    <section id="solutions" className="cure-section cure-method">
                        <div className="cure-method-watermark" aria-hidden="true">
                            02
                        </div>
                        <div className="cure-shell">
                            <header className="cure-method-header" data-reveal>
                                <div>
                                    <span className="cure-eyebrow">
                                        <span className="dash" />
                                        02 — The Method
                                    </span>
                                    <h2 className="cure-section-title" style={{ marginTop: 22 }}>
                                        A <em>four-act</em> path
                                        <br />
                                        from onboard to audit.
                                    </h2>
                                    <div className="cure-method-rhythm" aria-label="Operating rhythm">
                                        <span>Register</span>
                                        <span className="cure-method-rhythm-arrow">→</span>
                                        <span>Train</span>
                                        <span className="cure-method-rhythm-arrow">→</span>
                                        <span>Collect</span>
                                        <span className="cure-method-rhythm-arrow">→</span>
                                        <span>Score</span>
                                    </div>
                                </div>
                                <p className="cure-method-lede">
                                    A guided operating rhythm keeps every stakeholder synchronised — from the first registration to the final risk
                                    score. Each act has its own dashboard, its own rituals, its own evidence trail.
                                </p>
                            </header>

                            <div className="cure-method-track" aria-hidden="true">
                                <div className="cure-method-track-line" />
                                <div className="cure-method-track-nodes">
                                    {['i.', 'ii.', 'iii.', 'iv.'].map((num, i) => (
                                        <div key={num} className="cure-method-node">
                                            <div className="cure-method-node-badge">{num}</div>
                                            <span className="cure-method-node-label">
                                                {['Identity', 'Learning', 'Evidence', 'Assurance'][i]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="cure-method-steps">
                                {[
                                    {
                                        num: 'i.',
                                        tag: 'Identity',
                                        icon: <UserPlus size={14} strokeWidth={2} />,
                                        title: 'Register',
                                        desc: 'Onboard teams and entities, map ownership, define the perimeter of who owns which control.',
                                        foot: 'Tenants · Roles',
                                    },
                                    {
                                        num: 'ii.',
                                        tag: 'Learning',
                                        icon: <BookOpen size={14} strokeWidth={2} />,
                                        title: 'Train',
                                        desc: 'Launch role-based curriculum, monitor completion, issue certificates — training as a continuous discipline.',
                                        foot: 'Cohorts · Scores',
                                    },
                                    {
                                        num: 'iii.',
                                        tag: 'Evidence',
                                        icon: <CloudUpload size={14} strokeWidth={2} />,
                                        title: 'Collect',
                                        desc: 'Submit, verify, and time-stamp operational artefacts. Review queues that close, not pile up.',
                                        foot: 'Artefacts · Queues',
                                    },
                                    {
                                        num: 'iv.',
                                        tag: 'Assurance',
                                        icon: <FolderCog size={14} strokeWidth={2} />,
                                        title: 'Score',
                                        desc: 'Compute readiness, surface exceptions instantly, export board-grade reports without manual rework.',
                                        foot: 'Index · Exceptions',
                                    },
                                ].map((act, i) => (
                                    <article key={act.title} className="cure-method-step" data-reveal data-delay={`${i + 1}` as const}>
                                        <div className="cure-method-step-top-mobile">
                                            <span className="cure-method-step-index-mobile">{act.num}</span>
                                            <span className="cure-method-step-tag">
                                                {act.icon}
                                                {act.tag}
                                            </span>
                                        </div>
                                        <div className="cure-method-step-top">
                                            <span className="cure-method-step-tag">
                                                {act.icon}
                                                {act.tag}
                                            </span>
                                            <span className="cure-method-step-index">{act.num}</span>
                                        </div>
                                        <h3>{act.title}</h3>
                                        <p>{act.desc}</p>
                                        <div className="cure-method-step-foot">
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                <span className="cure-method-step-pulse" />
                                                Act {act.num.replace('.', '')}
                                            </span>
                                            <span>{act.foot}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ───────────── CONTINUUM TICKER ───────────── */}
                    <section className="cure-continuum">
                        <div className="cure-continuum-inner">
                            {[0, 1].map((idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 56 }}>
                                    <span>SOC 2</span> Audit-ready <span>·</span> GDPR Framework <span>·</span> ISO 27001 Alignment <span>·</span>{' '}
                                    450+ controls <span>·</span> Evidence over recall <span>·</span> Calibrate before crowning <span>·</span> Numbers,
                                    kept honest <span>·</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ───────────── ROLES ───────────── */}
                    <section id="roles" className="cure-section cure-roles">
                        <div className="cure-roles-watermark" aria-hidden="true">
                            03
                        </div>
                        <div className="cure-shell">
                            <header className="cure-roles-header" data-reveal>
                                <div>
                                    <span className="cure-eyebrow">
                                        <span className="dash" />
                                        03 — Lenses
                                    </span>
                                    <h2 className="cure-section-title" style={{ marginTop: 22 }}>
                                        One platform.
                                        <br />
                                        <em>Four lenses</em> on the same truth.
                                    </h2>
                                    <div className="cure-roles-truth" aria-label="Shared platform truth">
                                        <span>Four roles</span>
                                        <span>→</span>
                                        <span className="cure-roles-truth-core">One evidence layer</span>
                                    </div>
                                </div>
                                <p className="cure-roles-lede">
                                    Every role sees the same artefacts, but only the actions that belong to them. Calibrated permissions; shared
                                    evidence; no parallel spreadsheets.
                                </p>
                            </header>

                            <div className="cure-roles-grid">
                                {[
                                    {
                                        mark: 'Role · I',
                                        icon: <ShieldCheck size={16} strokeWidth={2} />,
                                        title: 'Super Admin',
                                        desc: 'Global governance, tenant policy enforcement, and the strategic view across the platform.',
                                        foot: 'Policy · Tenants · Oversight',
                                    },
                                    {
                                        mark: 'Role · II',
                                        icon: <UserCog size={16} strokeWidth={2} />,
                                        title: 'Company Admin',
                                        desc: 'Operational delivery — schedules, deadlines, and entity-level readiness for each line of business.',
                                        foot: 'Schedules · Entities · Readiness',
                                    },
                                    {
                                        mark: 'Role · III',
                                        icon: <UsersRound size={16} strokeWidth={2} />,
                                        title: 'Reviewer',
                                        desc: 'Evidence verification, closure decisions, calibration sessions, and submission quality control.',
                                        foot: 'Queues · Calibration · Closure',
                                    },
                                    {
                                        mark: 'Role · IV',
                                        icon: <User size={16} strokeWidth={2} />,
                                        title: 'Employee',
                                        desc: 'Training tasks, assignment completion, and a single personal record of every compliance step.',
                                        foot: 'Training · Tasks · Record',
                                    },
                                ].map((role, i) => (
                                    <article key={role.title} className="cure-lens-card" data-reveal data-delay={`${i + 1}` as const}>
                                        <div className="cure-lens-card-top">
                                            <span className="cure-lens-card-mark">{role.mark}</span>
                                            <span className="cure-lens-card-icon">{role.icon}</span>
                                        </div>
                                        <h3>{role.title}</h3>
                                        <p>{role.desc}</p>
                                        <div className="cure-lens-card-foot">{role.foot}</div>
                                    </article>
                                ))}
                            </div>

                            <div className="cure-roles-shared" data-reveal data-delay="4">
                                <span className="cure-roles-shared-label">
                                    <span className="cure-roles-shared-dot" />
                                    Shared evidence layer
                                </span>
                                <div className="cure-roles-shared-items">
                                    <span>Same artefacts</span>
                                    <span>Calibrated permissions</span>
                                    <span>No parallel spreadsheets</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ───────────── LEDGER / REPORTING ───────────── */}
                    <section id="reporting" className="cure-section">
                        <div className="cure-shell">
                            <div className="cure-method-intro" data-reveal>
                                <div>
                                    <span className="cure-eyebrow">
                                        <span className="dash" />
                                        04 — The Ledger
                                    </span>
                                    <h2 className="cure-section-title" style={{ marginTop: 22 }}>
                                        Numbers,
                                        <br />
                                        <em>kept honest</em>.
                                    </h2>
                                </div>
                                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                                    Exportable summaries, operational dashboards, and a transparent audit trail. The same figure the board reads is
                                    the figure the regulator sees — with the artefact behind it always one click away.
                                </p>
                            </div>

                            <div className="cure-ledger-layout">
                                <div className="cure-report-list" data-reveal data-delay="1">
                                    {[
                                        {
                                            num: 'i.',
                                            icon: <FileText size={18} />,
                                            title: 'Employee Training Log',
                                            desc: 'Completion history, score trends, and certificate timestamps for every individual.',
                                        },
                                        {
                                            num: 'ii.',
                                            icon: <Gauge size={18} />,
                                            title: 'Performance Diagnostics',
                                            desc: 'Control health indicators with exception context broken down by entity and quarter.',
                                        },
                                        {
                                            num: 'iii.',
                                            icon: <ScrollText size={18} />,
                                            title: 'Executive Summary',
                                            desc: 'Board-ready status snapshots in one exportable package, signed and date-stamped.',
                                        },
                                        {
                                            num: 'iv.',
                                            icon: <ClipboardCheck size={18} />,
                                            title: 'Audit Trail Preview',
                                            desc: 'A regulator-facing view of every artefact, reviewer signature, and closure event.',
                                        },
                                    ].map((it, i) => (
                                        <div key={it.title} className="item" data-reveal data-delay={`${i + 1}` as const}>
                                            <span className="num">{it.num}</span>
                                            <div>
                                                <h4>{it.title}</h4>
                                                <p>{it.desc}</p>
                                            </div>
                                            <ArrowUpRight size={18} className="go" />
                                        </div>
                                    ))}
                                </div>

                                <div className="cure-ledger-card" data-reveal data-delay="2">
                                    <div className="cure-ledger-head">
                                        <span className="cure-eyebrow" style={{ color: 'var(--stone)' }}>
                                            <CalendarClock size={13} />
                                            Live Index · Q2
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: 11,
                                                letterSpacing: '0.18em',
                                                textTransform: 'uppercase',
                                                color: 'var(--pine)',
                                            }}
                                        >
                                            <span className="cure-act-dot" /> updating
                                        </span>
                                    </div>

                                    <div className="cure-ledger-stat">
                                        {[
                                            ['Controls', '450', '+'],
                                            ['Coverage', '94', '%'],
                                            ['Entities', '12', ''],
                                        ].map(([label, value, suf]) => (
                                            <div className="cell" key={label}>
                                                <div className="label">{label}</div>
                                                <div className="value">
                                                    {value}
                                                    <em>{suf}</em>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cure-rows">
                                        <div className="cure-row" style={{ color: 'var(--stone)' }}>
                                            <span className="st">Entity</span>
                                            <span className="st">Status</span>
                                            <span className="st" style={{ textAlign: 'right' }}>
                                                Score
                                            </span>
                                        </div>
                                        {[
                                            ['Operations Group', 'Audit-ready', '91'],
                                            ['Finance Cluster', 'Review queue', '82'],
                                            ['Customer Unit', 'Open actions', '74'],
                                            ['Engineering', 'Calibrating', '88'],
                                        ].map(([ent, st, sc]) => (
                                            <div className="cure-row" key={ent}>
                                                <span className="ent">{ent}</span>
                                                <span className="st">{st}</span>
                                                <span className="sc">
                                                    {sc}
                                                    <em
                                                        style={{
                                                            fontFamily: 'Fraunces',
                                                            fontStyle: 'italic',
                                                            color: 'var(--sand)',
                                                        }}
                                                    >
                                                        %
                                                    </em>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ───────────── CLOSING INVITATION ───────────── */}
                    <section id="cta" className="cure-section cure-manifesto">
                        <div className="cure-shell">
                            <div className="cure-divider" style={{ marginBottom: 40 }} data-reveal>
                                <span className="cure-eyebrow">
                                    <Sparkles size={13} />
                                    Begin a cycle
                                </span>
                                <span className="cure-divider-line" />
                                <span className="cure-eyebrow" style={{ opacity: 0.65 }}>
                                    Finale · Vol. 01
                                </span>
                            </div>

                            <div className="cure-invite">
                                <h2 className="cure-invite-h" data-reveal>
                                    Build an <em>audit-ready</em>
                                    <br />
                                    compliance rhythm.
                                </h2>

                                <div className="cure-invite-grid" data-reveal data-delay="2">
                                    <div>
                                        <div className="cure-invite-actions">
                                            <Link href={auth.user ? route('dashboard') : route('register')} className="btn-primary">
                                                {auth.user ? <Gauge size={14} /> : <UserPlus size={14} />}
                                                {auth.user ? 'Open dashboard' : 'Begin a cycle'}
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link href={route('login')} className="cure-btn-ghost">
                                                <PlayCircle size={13} />
                                                See a demo
                                            </Link>
                                        </div>
                                        <div className="cure-trust">
                                            <span>SOC 2 aligned</span>
                                            <span>GDPR ready</span>
                                            <span>ISO-friendly exports</span>
                                            <span>Immutable history</span>
                                        </div>
                                    </div>
                                    <p className="cure-invite-side">
                                        Start a secure workspace in minutes. Move your teams off spreadsheets and into a single, evidence-led rhythm —
                                        measured, calibrated, and kept honest.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <WelcomeFooter />
                <WelcomeThemeToggle />
            </div>
        </>
    );
}
