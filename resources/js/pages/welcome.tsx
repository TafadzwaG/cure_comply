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
                        padding-top: 96px;
                        padding-bottom: 140px;
                        position: relative;
                    }
                    .cure-hero-grid {
                        display: grid;
                        grid-template-columns: 1.4fr 1fr;
                        gap: 80px;
                        align-items: end;
                    }
                    @media (max-width: 980px) {
                        .cure-hero-grid { grid-template-columns: 1fr; gap: 56px; }
                        .cure-hero { padding-bottom: 90px; }
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
                        top: 110px;
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
                    }
                    .cure-manifesto-intro {
                        display: grid;
                        grid-template-columns: 1fr 1.3fr;
                        gap: 60px;
                        margin-bottom: 80px;
                        align-items: end;
                    }
                    @media (max-width: 900px) {
                        .cure-manifesto-intro { grid-template-columns: 1fr; gap: 28px; }
                    }
                    .cure-section-title {
                        font-size: clamp(36px, 5vw, 68px);
                        line-height: 0.98;
                        font-weight: 300;
                        letter-spacing: -0.02em;
                    }
                    .cure-section-title em { font-style: italic; color: var(--sand); font-weight: 400; }

                    .cure-commits {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0,1fr));
                        gap: 0;
                    }
                    @media (max-width: 900px) {
                        .cure-commits { grid-template-columns: 1fr; }
                    }
                    .cure-commit {
                        padding: 36px 36px 36px 0;
                        border-right: 1px solid rgba(37,38,39,0.14);
                    }
                    .cure-commits .cure-commit:nth-child(2) { padding-left: 36px; }
                    .cure-commits .cure-commit:nth-child(3) { padding-left: 36px; border-right: none; }
                    @media (max-width: 900px) {
                        .cure-commit { padding: 28px 0 !important; border-right: none; border-bottom: 1px solid rgba(37,38,39,0.14); }
                        .cure-commits .cure-commit:last-child { border-bottom: none; }
                    }
                    .cure-commit-num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 28px;
                        color: var(--sand);
                        margin-bottom: 16px;
                    }
                    .cure-commit h3 {
                        font-size: 28px;
                        font-weight: 400;
                        line-height: 1.1;
                        margin-bottom: 14px;
                    }
                    .cure-commit p {
                        font-size: 15px;
                        line-height: 1.65;
                        color: var(--ink-2);
                    }

                    /* ── Four-act method ──────────────────────────────────── */
                    .cure-method-intro {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 60px;
                        margin-bottom: 64px;
                        align-items: end;
                    }
                    @media (max-width: 900px) {
                        .cure-method-intro { grid-template-columns: 1fr; gap: 28px; }
                    }

                    .cure-acts {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0,1fr));
                        gap: 20px;
                    }
                    @media (max-width: 1100px) { .cure-acts { grid-template-columns: repeat(2, 1fr); } }
                    @media (max-width: 600px)  { .cure-acts { grid-template-columns: 1fr; } }

                    .cure-act {
                        background: var(--cream);
                        border: 1px solid rgba(37,38,39,0.14);
                        border-radius: 18px;
                        padding: 32px;
                        min-height: 360px;
                        display: flex;
                        flex-direction: column;
                        gap: 18px;
                        transition: transform .35s ease, border-color .35s ease, background .35s ease;
                    }
                    .cure-act:hover {
                        transform: translateY(-4px);
                        border-color: var(--ink);
                    }
                    .cure-act-tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.2em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .cure-act-num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-style: italic;
                        font-size: 60px;
                        line-height: 1;
                        color: var(--sand);
                        font-weight: 400;
                    }
                    .cure-act h3 {
                        font-size: 28px;
                        line-height: 1;
                        font-weight: 400;
                    }
                    .cure-act p {
                        font-size: 14.5px;
                        line-height: 1.65;
                        color: var(--ink-2);
                        margin-top: auto;
                    }
                    .cure-act-foot {
                        margin-top: 14px;
                        padding-top: 14px;
                        border-top: 1px solid rgba(37,38,39,0.10);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--stone);
                    }
                    .cure-act-dot {
                        width: 6px; height: 6px; border-radius: 50%;
                        background: var(--pine);
                        animation: cureBlink 2.4s ease-in-out infinite;
                        display: inline-block;
                        margin-right: 8px;
                    }

                    /* ── Roles / Lenses ───────────────────────────────────── */
                    .cure-roles {
                        background: var(--ink);
                        color: var(--paper);
                    }
                    .cure-roles h2,
                    .cure-roles h3,
                    .cure-roles h4 { color: var(--paper); }
                    .cure-roles .cure-eyebrow { color: rgba(246,242,231,0.65); }
                    .cure-roles .cure-eyebrow .dash { background: var(--sand); }

                    .cure-roles-intro {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 60px;
                        margin-bottom: 64px;
                        align-items: end;
                    }
                    @media (max-width: 900px) { .cure-roles-intro { grid-template-columns: 1fr; gap: 28px; } }
                    .cure-roles-sub {
                        font-size: 16px;
                        line-height: 1.65;
                        color: rgba(246,242,231,0.72);
                    }

                    .cure-role-grid {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0,1fr));
                        gap: 0;
                        border-top: 1px solid rgba(246,242,231,0.16);
                        border-bottom: 1px solid rgba(246,242,231,0.16);
                    }
                    @media (max-width: 1024px) { .cure-role-grid { grid-template-columns: repeat(2,1fr); } }
                    @media (max-width: 560px)  { .cure-role-grid { grid-template-columns: 1fr; } }

                    .cure-role {
                        padding: 36px 28px;
                        border-right: 1px solid rgba(246,242,231,0.16);
                        position: relative;
                        transition: background .3s ease;
                    }
                    .cure-role:last-child { border-right: none; }
                    .cure-role:hover { background: rgba(246,242,231,0.04); }
                    @media (max-width: 1024px) {
                        .cure-role:nth-child(2) { border-right: none; }
                        .cure-role:nth-child(-n+2) { border-bottom: 1px solid rgba(246,242,231,0.16); }
                    }
                    @media (max-width: 560px) {
                        .cure-role { border-right: none; border-bottom: 1px solid rgba(246,242,231,0.16); }
                        .cure-role:last-child { border-bottom: none; }
                    }
                    .cure-role-mark {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        letter-spacing: 0.22em;
                        color: var(--sand);
                        margin-bottom: 22px;
                        text-transform: uppercase;
                    }
                    .cure-role-icon {
                        width: 44px; height: 44px;
                        border-radius: 999px;
                        border: 1px solid rgba(246,242,231,0.4);
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--sand);
                        margin-bottom: 22px;
                    }
                    .cure-role h3 {
                        font-size: 26px;
                        font-weight: 400;
                        line-height: 1.05;
                        margin-bottom: 14px;
                    }
                    .cure-role p {
                        font-size: 14px;
                        line-height: 1.65;
                        color: rgba(246,242,231,0.72);
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
                    .dark .cure-act,
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
                    .dark .cure-roles { background: #050a18; }
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
                        <div className="cure-hero-side">v 4.0 — public edition · vol. 01 — compliance studio</div>
                        <div className="cure-shell">
                            <div className="cure-divider" style={{ marginBottom: 56 }} data-reveal>
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
                        <div className="cure-shell">
                            <div className="cure-manifesto-intro" data-reveal>
                                <div>
                                    <span className="cure-eyebrow">
                                        <span className="dash" />
                                        01 — Manifesto
                                    </span>
                                    <h2 className="cure-section-title" style={{ marginTop: 22 }}>
                                        Three commitments. <em>Held in tension.</em> Never traded.
                                    </h2>
                                </div>
                                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                                    Compliance is the ledger, not the last conversation. We capture it as it happens — so when the audit arrives, the
                                    evidence is already in order.
                                </p>
                            </div>

                            <div className="cure-commits">
                                <article className="cure-commit" data-reveal data-delay="1">
                                    <div className="cure-commit-num">i.</div>
                                    <h3>Evidence over recall</h3>
                                    <p>
                                        Every control traces back to an artefact. Submissions are time-stamped, attributable, and immutable — never
                                        reconstructed from memory.
                                    </p>
                                </article>
                                <article className="cure-commit" data-reveal data-delay="2">
                                    <div className="cure-commit-num">ii.</div>
                                    <h3>Calibrate before crowning</h3>
                                    <p>
                                        Reviewer queues, distribution guardrails, and second-pair sign-off. Decisions are made with calibration as the
                                        default, not the exception.
                                    </p>
                                </article>
                                <article className="cure-commit" data-reveal data-delay="3">
                                    <div className="cure-commit-num">iii.</div>
                                    <h3>Numbers, kept honest</h3>
                                    <p>
                                        Real-time scoring with exception surfacing. Boards see the truth before the regulator does — and stakeholders
                                        see the trail behind every figure.
                                    </p>
                                </article>
                            </div>
                        </div>
                    </section>

                    {/* ───────────── FOUR-ACT METHOD ───────────── */}
                    <section id="solutions" className="cure-section">
                        <div className="cure-shell">
                            <div className="cure-method-intro" data-reveal>
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
                                </div>
                                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                                    A guided operating rhythm keeps every stakeholder synchronised — from the first registration to the final risk
                                    score. Each act has its own dashboard, its own rituals, its own evidence trail.
                                </p>
                            </div>

                            <div className="cure-acts">
                                {[
                                    {
                                        num: 'i.',
                                        tag: 'Identity',
                                        icon: <UserPlus size={18} />,
                                        title: 'Register',
                                        desc: 'Onboard teams and entities, map ownership, define the perimeter of who owns which control.',
                                        foot: 'Tenants · Roles',
                                    },
                                    {
                                        num: 'ii.',
                                        tag: 'Learning',
                                        icon: <BookOpen size={18} />,
                                        title: 'Train',
                                        desc: 'Launch role-based curriculum, monitor completion, issue certificates — training as a continuous discipline.',
                                        foot: 'Cohorts · Scores',
                                    },
                                    {
                                        num: 'iii.',
                                        tag: 'Evidence',
                                        icon: <CloudUpload size={18} />,
                                        title: 'Collect',
                                        desc: 'Submit, verify, and time-stamp operational artefacts. Review queues that close, not pile up.',
                                        foot: 'Artefacts · Queues',
                                    },
                                    {
                                        num: 'iv.',
                                        tag: 'Assurance',
                                        icon: <FolderCog size={18} />,
                                        title: 'Score',
                                        desc: 'Compute readiness, surface exceptions instantly, export board-grade reports without manual rework.',
                                        foot: 'Index · Exceptions',
                                    },
                                ].map((act, i) => (
                                    <article key={act.title} className="cure-act" data-reveal data-delay={`${i + 1}` as const}>
                                        <div className="cure-act-tag">
                                            {act.icon}
                                            {act.tag}
                                        </div>
                                        <div className="cure-act-num">{act.num}</div>
                                        <h3>{act.title}</h3>
                                        <p>{act.desc}</p>
                                        <div className="cure-act-foot">
                                            <span>
                                                <span className="cure-act-dot" />
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
                        <div className="cure-shell">
                            <div className="cure-roles-intro" data-reveal>
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
                                </div>
                                <p className="cure-roles-sub">
                                    Every role sees the same artefacts, but only the actions that belong to them. Calibrated permissions; shared
                                    evidence; no parallel spreadsheets.
                                </p>
                            </div>

                            <div className="cure-role-grid">
                                {[
                                    {
                                        mark: 'Role · I',
                                        icon: <ShieldCheck size={18} />,
                                        title: 'Super Admin',
                                        desc: 'Global governance, tenant policy enforcement, and the strategic view across the platform.',
                                    },
                                    {
                                        mark: 'Role · II',
                                        icon: <UserCog size={18} />,
                                        title: 'Company Admin',
                                        desc: 'Operational delivery — schedules, deadlines, and entity-level readiness for each line of business.',
                                    },
                                    {
                                        mark: 'Role · III',
                                        icon: <UsersRound size={18} />,
                                        title: 'Reviewer',
                                        desc: 'Evidence verification, closure decisions, calibration sessions, and submission quality control.',
                                    },
                                    {
                                        mark: 'Role · IV',
                                        icon: <User size={18} />,
                                        title: 'Employee',
                                        desc: 'Training tasks, assignment completion, and a single personal record of every compliance step.',
                                    },
                                ].map((r, i) => (
                                    <article key={r.title} className="cure-role" data-reveal data-delay={`${i + 1}` as const}>
                                        <div className="cure-role-mark">{r.mark}</div>
                                        <div className="cure-role-icon">{r.icon}</div>
                                        <h3>{r.title}</h3>
                                        <p>{r.desc}</p>
                                    </article>
                                ))}
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
