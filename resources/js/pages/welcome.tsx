import privacyCureLogo from '@/images/privacycure-logo.png';
import { type SharedData } from '@/types';
import {
    BarChart3,
    BookOpen,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    CloudUpload,
    FileSpreadsheet,
    FileText,
    FolderCog,
    Gauge,
    GraduationCap,
    Lock,
    ShieldCheck,
    User,
    UserCog,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    /* Scroll-reveal observer */
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
            { threshold: 0.12 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <>
            <Head title="Privacy Cure Compliance | Command-Grade Compliance Platform">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
                <style>{`
                    /* ── Reset / Base ── */
                    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                    html { scroll-behavior: smooth; }

                    body, .wc-root {
                        font-family: 'Rubik', Arial, Helvetica, sans-serif;
                        background: #f7f9fb;
                        color: #191c1e;
                    }

                    /* ── Scroll-reveal ── */
                    [data-reveal] {
                        opacity: 0;
                        transform: translateY(36px);
                        transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                                    transform 0.7s cubic-bezier(0.16,1,0.3,1);
                    }
                    [data-reveal].revealed { opacity: 1; transform: translateY(0); }
                    [data-reveal][data-delay="1"] { transition-delay: 0.1s; }
                    [data-reveal][data-delay="2"] { transition-delay: 0.2s; }
                    [data-reveal][data-delay="3"] { transition-delay: 0.32s; }
                    [data-reveal][data-delay="4"] { transition-delay: 0.44s; }

                    /* ── Keyframes ── */
                    @keyframes heroFadeUp {
                        from { opacity:0; transform:translateY(40px); }
                        to   { opacity:1; transform:translateY(0);    }
                    }
                    @keyframes float1 {
                        0%,100% { transform: translateY(0px) rotate(0deg);   }
                        50%     { transform: translateY(-18px) rotate(3deg);  }
                    }
                    @keyframes float2 {
                        0%,100% { transform: translateY(0px) rotate(0deg);   }
                        50%     { transform: translateY(-12px) rotate(-4deg); }
                    }
                    @keyframes float3 {
                        0%,100% { transform: translateY(0px);  }
                        60%     { transform: translateY(-22px); }
                    }
                    @keyframes scanLine {
                        0%   { top: -4%;   opacity: 0;   }
                        10%  { opacity: 0.5; }
                        90%  { opacity: 0.5; }
                        100% { top: 104%;  opacity: 0;   }
                    }
                    @keyframes gridPulse {
                        0%,100% { opacity: 0.07; }
                        50%     { opacity: 0.13; }
                    }
                    @keyframes ringPulse {
                        0%   { transform: scale(1);   opacity: 0.6; }
                        100% { transform: scale(2.2); opacity: 0;   }
                    }
                    @keyframes ticker {
                        from { transform: translateX(0);    }
                        to   { transform: translateX(-50%); }
                    }
                    @keyframes barGrow {
                        from { width: 0;    }
                        to   { width: var(--w); }
                    }
                    @keyframes blinkDot {
                        0%,100% { opacity: 1;   }
                        50%     { opacity: 0.2; }
                    }
                    @keyframes countUp {
                        from { opacity: 0; transform: translateY(8px); }
                        to   { opacity: 1; transform: translateY(0);   }
                    }
                    @keyframes shimmer {
                        0%   { background-position: -200% center; }
                        100% { background-position:  200% center; }
                    }

                    /* ── Hero ── */
                    .hero-section {
                        background: #002753;
                        position: relative;
                        overflow: hidden;
                        min-height: 100vh;                       
                        flex-direction: column;
                        justify-content: center;
                    }
                    .hero-grid {
                        position: absolute;
                        inset: 0;
                        background-image:
                            linear-gradient(rgba(0,218,243,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,218,243,0.06) 1px, transparent 1px);
                        background-size: 60px 60px;
                        animation: gridPulse 4s ease-in-out infinite;
                    }
                    .hero-radial {
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(ellipse 80% 70% at 65% 50%, rgba(8,61,119,0.6) 0%, transparent 70%);
                    }
                    .hero-scan {
                        position: absolute;
                        left: 0; right: 0;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, rgba(0,218,243,0.5), transparent);
                        animation: scanLine 5s linear infinite;
                        pointer-events: none;
                    }

                    /* Floating compliance cards */
                    .float-card {
                        position: absolute;
                        background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(0,218,243,0.15);
                        border-radius: 12px;
                        backdrop-filter: blur(6px);
                        padding: 14px 18px;
                        white-space: nowrap;
                    }
                    .fc-1 { top: 12%; right: 4%;  animation: float1 6s ease-in-out infinite; }
                    .fc-2 { top: 42%; right: 2%;  animation: float2 7s ease-in-out infinite 1s; }
                    .fc-3 { bottom: 18%; right: 8%; animation: float3 8s ease-in-out infinite 0.5s; }
                    .fc-4 { top: 22%; right: 26%; animation: float1 9s ease-in-out infinite 2s; display:none; }

                    @media (min-width: 1024px) {
                        .fc-4 { display: block; }
                    }

                    .fc-label {
                        font-family: 'Rubik', sans-serif;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                        color: rgba(0,218,243,0.6);
                        margin-bottom: 4px;
                    }
                    .fc-value {
                        font-family: 'Rubik', sans-serif;
                        font-size: 22px;
                        font-weight: 900;
                        color: #fff;
                    }
                    .fc-sub {
                        font-family: 'Rubik', sans-serif;
                        font-size: 10px;
                        color: rgba(255,255,255,0.4);
                        margin-top: 2px;
                    }
                    .fc-dot {
                        display: inline-block;
                        width: 7px; height: 7px;
                        border-radius: 50%;
                        background: #00daf3;
                        margin-right: 6px;
                        animation: blinkDot 2s ease-in-out infinite;
                    }

                    /* Shield ring */
                    .shield-ring {
                        position: absolute;
                        border-radius: 50%;
                        border: 1px solid rgba(0,218,243,0.25);
                        animation: ringPulse 3s ease-out infinite;
                    }

                    /* Hero text */
                    .hero-tag-anim  { opacity:0; animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
                    .hero-h1-anim   { opacity:0; animation: heroFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards; }
                    .hero-sub-anim  { opacity:0; animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.42s forwards; }
                    .hero-cta-anim  { opacity:0; animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.56s forwards; }
                    .hero-stat-anim { opacity:0; animation: heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards;  }

                    /* Ticker */
                    .ticker-wrap  { overflow: hidden; }
                    .ticker-inner {
                        display: flex;
                        white-space: nowrap;
                        animation: ticker 32s linear infinite;
                    }
                    .ticker-inner:hover { animation-play-state: paused; }

                    /* Progress bars */
                    .pbar-fill { animation: barGrow 1.3s cubic-bezier(0.16,1,0.3,1) 1.1s both; }

                    /* Card hover */
                    .card-lift {
                        transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                                    box-shadow 0.3s ease;
                    }
                    .card-lift:hover {
                        transform: translateY(-6px);
                        box-shadow: 0 28px 56px -16px rgba(0,39,83,0.18);
                    }

                    /* Shimmer button */
                    .btn-primary {
                        background: #00daf3;
                        color: #002753;
                        font-family: 'Rubik', sans-serif;
                        font-weight: 900;
                        border-radius: 9999px;
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .btn-primary::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
                        background-size: 200%;
                        animation: shimmer 2.5s ease-in-out infinite;
                    }
                    .btn-primary:hover { transform: scale(1.05); box-shadow: 0 12px 32px rgba(0,218,243,0.35); }

                    .btn-outline {
                        border: 2px solid rgba(255,255,255,0.2);
                        color: #fff;
                        font-family: 'Rubik', sans-serif;
                        font-weight: 700;
                        border-radius: 9999px;
                        transition: border-color 0.2s, background 0.2s;
                    }
                    .btn-outline:hover { border-color: #00daf3; background: rgba(0,218,243,0.08); }

                    /* Section labels */
                    .sec-label {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .sec-label-line { width: 32px; height: 2px; background: #00daf3; }
                    .sec-label-text {
                        font-family: 'Rubik', sans-serif;
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.2em;
                        text-transform: uppercase;
                        color: #00b9ce;
                    }

                    /* Bento tiles */
                    .bento-dark  { background: #002753; color: #fff; border-radius: 20px; }
                    .bento-cyan  { background: #00daf3; border-radius: 20px; }
                    .bento-light { background: #f2f4f6; border-radius: 20px; }
                    .bento-mid   { background: #083d77; color: #fff; border-radius: 20px; }

                    /* Step connector */
                    .step-line {
                        position: absolute;
                        top: 52px;
                        left: calc(50% + 52px);
                        right: calc(-50% + 52px);
                        height: 1px;
                        background: linear-gradient(90deg, rgba(0,39,83,0.25), rgba(0,39,83,0.05));
                    }

                    /* Nav underline */
                    .nav-link { position: relative; }
                    .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: -4px; left: 0;
                        width: 0; height: 2px;
                        background: #00daf3;
                        transition: width 0.25s ease;
                    }
                    .nav-link:hover::after { width: 100%; }

                    /* Dot grid overlay */
                    .dot-overlay {
                        background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
                        background-size: 22px 22px;
                    }

                    @media (max-width: 1023px) {
                        .welcome-section {
                            padding-top: 88px !important;
                            padding-bottom: 88px !important;
                        }
                        .hero-content-wrap {
                            transform: none !important;
                            padding-bottom: 88px !important;
                        }
                        .hero-stat-row {
                            gap: 20px !important;
                        }
                        .hero-stat-item {
                            border-right: none !important;
                            margin-right: 0 !important;
                            padding-right: 0 !important;
                            min-width: calc(50% - 10px);
                        }
                        .product-bento {
                            grid-template-columns: 1fr !important;
                        }
                        .product-bento > div {
                            grid-column: span 1 !important;
                        }
                        .product-reporting-mini {
                            grid-template-columns: 1fr !important;
                        }
                        .workflow-grid {
                            grid-template-columns: 1fr !important;
                            gap: 24px !important;
                        }
                        .role-intro-grid {
                            grid-template-columns: 1fr !important;
                            gap: 24px !important;
                        }
                        .role-cards-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .reporting-main-grid {
                            grid-template-columns: 1fr !important;
                            gap: 40px !important;
                        }
                        .reporting-stats-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .cta-panel {
                            padding: 56px 28px !important;
                        }
                    }

                    @media (max-width: 767px) {
                        .welcome-header-shell {
                            flex-direction: row !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            gap: 12px !important;
                        }
                        .welcome-header-actions {
                            width: auto;
                            flex: 0 0 auto;
                            min-width: 0;
                        }
                        .welcome-header-cta {
                            flex: 0 0 auto;
                            min-width: 0;
                            gap: 10px !important;
                        }
                        .welcome-header-brand-text {
                            display: none;
                        }
                        .welcome-footer-shell {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            justify-content: flex-start !important;
                            gap: 20px !important;
                        }
                        .welcome-footer-links {
                            width: 100%;
                            gap: 16px !important;
                        }
                        .welcome-footer-links a {
                            font-size: 10px !important;
                            letter-spacing: 0.08em !important;
                        }
                        .float-card,
                        .shield-ring {
                            display: none !important;
                        }
                        .hero-section {
                            min-height: auto !important;
                            padding-top: 72px !important;
                        }
                        .hero-tag-anim {
                            margin-bottom: 20px !important;
                        }
                        .hero-h1-anim {
                            font-size: clamp(38px, 12vw, 64px) !important;
                            line-height: 0.98 !important;
                            max-width: 100% !important;
                            margin-bottom: 20px !important;
                        }
                        .hero-sub-anim {
                            max-width: 100% !important;
                            font-size: 15px !important;
                            margin-bottom: 28px !important;
                        }
                        .hero-cta-anim {
                            flex-direction: column !important;
                            align-items: stretch !important;
                            margin-bottom: 40px !important;
                        }
                        .hero-cta-anim > a {
                            width: 100%;
                            text-align: center;
                        }
                        .hero-stat-item {
                            min-width: 100%;
                        }
                        .product-intro,
                        .role-intro-grid,
                        .reporting-main-grid {
                            gap: 20px !important;
                        }
                        .bento-card,
                        .role-card,
                        .reporting-card {
                            padding: 24px !important;
                        }
                        .workflow-step {
                            gap: 16px !important;
                        }
                        .workflow-step-badge {
                            width: 88px !important;
                            height: 88px !important;
                        }
                        .cta-copy {
                            max-width: 100% !important;
                        }
                        .cta-panel > div:last-of-type a {
                            width: 100%;
                            text-align: center;
                        }
                    }

                    @media (max-width: 479px) {
                        .hero-content-wrap,
                        .welcome-section,
                        .welcome-header-shell,
                        .welcome-footer-shell {
                            padding-left: 20px !important;
                            padding-right: 20px !important;
                        }
                        .welcome-header-cta a:last-child {
                            padding-left: 16px !important;
                            padding-right: 16px !important;
                        }
                        .hero-stat-row {
                            padding-top: 24px !important;
                        }
                        .cta-panel {
                            padding: 40px 20px !important;
                            border-radius: 22px !important;
                        }
                    }

                    /* ── Dark Mode ── */
                    .dark body, .dark .wc-root {
                        background: #0d1117;
                        color: #e5e7eb;
                    }
                    .dark .welcome-header {
                        background: rgba(13,17,23,0.92) !important;
                        border-bottom-color: rgba(45,55,72,0.4) !important;
                    }
                    .dark .welcome-header-brand-text { color: #f8fafc !important; }
                    .dark .nav-link { color: #9ca3af !important; }
                    .dark .nav-link:hover { color: #f8fafc !important; }
                    .dark .welcome-header-cta a:not(.btn-primary) { color: #f8fafc !important; }
                    .dark .hero-bottom-fade {
                        background: linear-gradient(to bottom, transparent, #0d1117) !important;
                    }
                    .dark .bento-cyan {
                        background: #0f172a !important;
                        color: #f8fafc !important;
                    }
                    .dark .bento-cyan h3 {
                        color: #f8fafc !important;
                    }
                    .dark .bento-cyan p {
                        color: #cbd5e1 !important;
                    }
                    .dark .bento-cyan > div:first-child {
                        color: rgba(248,250,252,0.08) !important;
                    }
                    .dark .bento-cyan > div:nth-child(2) {
                        background: rgba(148,163,184,0.14) !important;
                    }
                    .dark .bento-cyan > div:nth-child(2) svg {
                        color: #f8fafc !important;
                        stroke: #f8fafc !important;
                    }
                    .dark .bento-light {
                        background: #1c2333 !important;
                        color: #e5e7eb;
                    }
                    .dark .bento-light h3 { color: #e5e7eb !important; }
                    .dark .bento-light p { color: #9ca3af !important; }
                    .dark .workflow-bg {
                        background: #111827 !important;
                    }
                    .dark .workflow-step-badge {
                        background: #1c2333 !important;
                        border-color: #111827 !important;
                        box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important;
                    }
                    .dark .step-icon-wrap {
                        background: #1c2333 !important;
                        color: #7cb3e8 !important;
                    }
                    .dark .role-card {
                        background: #161b2e !important;
                        border-color: rgba(45,55,72,0.5) !important;
                    }
                    .dark .welcome-footer {
                        background: #0d1117 !important;
                        border-top-color: rgba(45,55,72,0.3) !important;
                    }
                    .dark .role-card h4,
                    .dark .workflow-step h4,
                    .dark .welcome-footer span {
                        color: #f8fafc !important;
                    }
                    .dark .role-card p,
                    .dark .workflow-step p,
                    .dark .welcome-footer a,
                    .dark .welcome-footer p {
                        color: #cbd5e1 !important;
                    }
                    .dark .role-card > div:last-child {
                        border-top-color: rgba(148,163,184,0.18) !important;
                    }
                    .dark .role-card > div:last-child > div {
                        color: #f8fafc !important;
                    }
                    .dark .platform-intro-copy,
                    .dark .role-intro-copy {
                        color: #e2e8f0 !important;
                    }
                    .dark .welcome-footer a:hover {
                        color: #f8fafc !important;
                    }
                    /* Text color overrides via attribute selectors */
                    .dark [style*="color: #002753"] { color: #f8fafc !important; }
                    .dark [style*="color: #434750"] { color: #cbd5e1 !important; }
                    .dark [style*="color: #083d77"] { color: #e2e8f0 !important; }
                    .dark [style*="background: #f2f4f6"] { background: #111827 !important; }
                    .dark [style*="background: #fff"] { background: #0d1117 !important; }
                    .dark [style*="background: white"] { background: #0d1117 !important; }
                    .dark [style*="background: '#fff'"] { background: #0d1117 !important; }
                    .dark [style*="color: rgba(0,39,83"] { color: #9ca3af !important; }
                    .dark [style*="background: #d6e3ff"] { background: #1c2333 !important; }
                `}</style>
            </Head>

            <div className="wc-root">

                {/* ─── HEADER ─────────────────────────────────────────────── */}
                <header
                    className="welcome-header"
                    style={{
                        position: 'sticky', top: 0, zIndex: 50,
                        background: 'rgba(247,249,251,0.92)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(195,198,209,0.2)',
                    }}
                >
                    <div
                        className="welcome-header-shell px-6 lg:px-16"
                        style={{
                            maxWidth: 1440, margin: '0 auto',
                            paddingTop: 18,
                            paddingBottom: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                    >
                        <div className="welcome-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={privacyCureLogo} alt="Privacy Cure" style={{ height: 40, width: 'auto' }} />
                            <span className="welcome-header-brand-text" style={{ fontWeight: 700, fontSize: 15, color: '#002753', letterSpacing: '-0.01em' }}>
                                Privacy Cure
                            </span>
                        </div>

                        <nav className="hidden lg:flex" style={{ gap: 40, alignItems: 'center' }}>
                            {['Product', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="nav-link"
                                    style={{ fontSize: 13, fontWeight: 500, color: '#434750', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#002753')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#434750')}
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        <div className="welcome-header-cta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    style={{ fontSize: 13, fontWeight: 500, color: '#002753', textDecoration: 'none' }}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    style={{ fontSize: 13, fontWeight: 500, color: '#002753', textDecoration: 'none' }}
                                >
                                    Sign in
                                </Link>
                            )}
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="btn-primary"
                                style={{ padding: '10px 22px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}
                            >
                                {auth.user ? 'Open dashboard' : 'Get started'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main>
                    {/* ─── HERO ───────────────────────────────────────────── */}
                    <section className="hero-section" style={{ paddingTop: 100, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
                        {/* Animated background layers */}
                        <div className="hero-grid" />
                        <div className="hero-radial" />
                        <div className="hero-scan" />

                        {/* Pulsing shield rings */}
                        <div
                            className="shield-ring"
                            style={{ width: 400, height: 400, top: '50%', left: '58%', marginTop: -200, marginLeft: -200 }}
                        />
                        <div
                            className="shield-ring"
                            style={{ width: 400, height: 400, top: '50%', left: '58%', marginTop: -200, marginLeft: -200, animationDelay: '1s' }}
                        />
                        <div
                            className="shield-ring"
                            style={{ width: 400, height: 400, top: '50%', left: '58%', marginTop: -200, marginLeft: -200, animationDelay: '2s' }}
                        />

                        {/* Central shield icon */}
                        <div
                            className="hidden lg:flex"
                            style={{
                                position: 'absolute',
                                top: '50%', left: '58%',
                                transform: 'translate(-50%, -50%)',
                                width: 96, height: 96,
                                background: 'rgba(0,218,243,0.1)',
                                border: '2px solid rgba(0,218,243,0.4)',
                                borderRadius: '50%',
                                alignItems: 'center', justifyContent: 'center',
                                zIndex: 2,
                            }}
                        >
                            <ShieldCheck size={40} color="#00daf3" />
                        </div>

                        {/* Floating compliance cards */}
                        <div className="float-card fc-1" style={{ zIndex: 3 }}>
                            <div className="fc-label">
                                <span className="fc-dot" />
                                Training Score
                            </div>
                            <div className="fc-value">94%</div>
                            <div className="fc-sub">Up 8% this month</div>
                        </div>

                        <div className="float-card fc-2" style={{ zIndex: 3 }}>
                            <div className="fc-label">
                                <span className="fc-dot" style={{ animationDelay: '0.5s' }} />
                                Evidence Filed
                            </div>
                            <div className="fc-value">1,248</div>
                            <div className="fc-sub">Across 12 entities</div>
                        </div>

                        <div className="float-card fc-3" style={{ zIndex: 3 }}>
                            <div className="fc-label">
                                <span className="fc-dot" style={{ animationDelay: '1s' }} />
                                Compliance Health
                            </div>
                            <div className="fc-value">82%</div>
                            <div className="fc-sub">Global average</div>
                        </div>

                        <div className="float-card fc-4" style={{ zIndex: 3 }}>
                            <div className="fc-label">
                                <span className="fc-dot" style={{ animationDelay: '1.5s' }} />
                                Controls Active
                            </div>
                            <div className="fc-value">450+</div>
                            <div className="fc-sub">SOC 2 / GDPR / ISO</div>
                        </div>

                        {/* Content */}
                        <div className="hero-content-wrap px-6 lg:px-16" style={{ maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 4, paddingBottom: 120, transform: 'translateX(-24px)' }}>

                            <div className="hero-tag-anim" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ width: 40, height: 2, background: '#00daf3' }} />
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
                                    textTransform: 'uppercase', color: 'rgba(0,218,243,0.7)',
                                }}>
                                    Enterprise Compliance Infrastructure
                                </span>
                            </div>

                            <h1
                                className="hero-h1-anim"
                                style={{
                                    fontFamily: "'Rubik', sans-serif",
                                    fontWeight: 700,
                                    fontSize: 'clamp(48px, 7.5vw, 100px)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.03em',
                                    color: '#fff',
                                    maxWidth: 780,
                                    marginBottom: 32,
                                }}
                            >
                                Your compliance<br />
                                <span style={{ color: '#00daf3' }}>command</span><br />
                                centre.
                            </h1>

                            <p
                                className="hero-sub-anim"
                                style={{
                                    fontSize: 16, lineHeight: 1.7, color: 'rgba(214,227,255,0.7)',
                                    maxWidth: 480, marginBottom: 40,
                                }}
                            >
                                From fragmented spreadsheets to a unified platform. Automate evidence
                                collection, deploy training, and prove compliance in real time.
                            </p>

                            <div className="hero-cta-anim" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 64 }}>
                                <Link
                                    href={auth.user ? route('dashboard') : route('register')}
                                    className="btn-primary"
                                    style={{ padding: '16px 32px', fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
                                >
                                    {auth.user ? 'Open dashboard' : 'Create workspace'}
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="btn-outline"
                                    style={{ padding: '16px 32px', fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
                                >
                                    See a demo
                                </Link>
                            </div>

                            {/* Hero bottom stats row */}
                            <div
                                className="hero-stat-anim hero-stat-row"
                                style={{
                                    display: 'flex', flexWrap: 'wrap', gap: 0,
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                    paddingTop: 32,
                                }}
                            >
                                {[
                                    { v: '450+', l: 'Active Controls' },
                                    { v: '4',    l: 'Role Dashboards' },
                                    { v: '99.9%',l: 'Uptime SLA'      },
                                    { v: '10+',  l: 'Core Modules'    },
                                ].map((s, i) => (
                                    <div
                                        key={s.l}
                                        className="hero-stat-item"
                                        style={{
                                            padding: '0 40px 0 0',
                                            marginRight: 40,
                                            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: 32, color: '#00daf3', letterSpacing: '-0.02em' }}>
                                            {s.v}
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>
                                            {s.l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero bottom gradient into next section */}
                        <div className="hero-bottom-fade" style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                            background: 'linear-gradient(to bottom, transparent, #f7f9fb)',
                            pointerEvents: 'none',
                        }} />
                    </section>

                    {/* ─── TICKER ─────────────────────────────────────────── */}
                    <div className="ticker-wrap" style={{ background: '#002753', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 0' }}>
                        <div className="ticker-inner">
                            {[0, 1].map((idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                                    {[
                                        { v: 'SOC 2',   l: 'Ready'             },
                                        { v: 'GDPR',    l: 'Framework'         },
                                        { v: '450+',    l: 'Controls'          },
                                        { v: '4',       l: 'Role Dashboards'   },
                                        { v: '10+',     l: 'Modules'           },
                                        { v: '99.9%',   l: 'Uptime SLA'       },
                                        { v: '1-click', l: 'Export'            },
                                        { v: 'ISO 27001',l:'Alignment'         },
                                    ].map((item, j) => (
                                        <div key={`${idx}-${j}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 28px' }}>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#00daf3' }}>{item.v}</span>
                                            <span style={{ fontWeight: 500, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>{item.l}</span>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(0,218,243,0.25)', marginLeft: 20 }} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ─── PLATFORM (BENTO) ───────────────────────────────── */}
                    <section id="product" style={{ padding: '120px 0' }} className="welcome-section px-6 lg:px-16">
                        <div style={{ maxWidth: 1440, margin: '0 auto' }}>

                            <div data-reveal className="product-intro" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 56 }}>
                                <div>
                                    <div className="sec-label">
                                        <div className="sec-label-line" />
                                        <span className="sec-label-text">01 - Platform</span>
                                    </div>
                                    <h2 style={{ fontWeight: 700, fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#002753' }}>
                                        The Architecture<br />of Trust
                                    </h2>
                                </div>
                                <p className="platform-intro-copy" style={{ maxWidth: 300, fontSize: 14, lineHeight: 1.7, color: '#434750' }}>
                                    A modular platform designed to scale with your organization's
                                    security and privacy maturity.
                                </p>
                            </div>

                            {/* Bento grid */}
                            <div
                                className="product-bento grid-cols-1 md:grid-cols-2"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(12, 1fr)',
                                    gap: 16,
                                }}
                            >
                                {/* Tile 1 */}
                                <div data-reveal data-delay="1" className="bento-card card-lift bento-dark" style={{ gridColumn: 'span 5', padding: 40, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: 120, color: '#fff', opacity: 0.04, position: 'absolute', top: -16, right: 8, lineHeight: 1, userSelect: 'none' }}>01</div>
                                    <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                        <Building2 size={24} color="#fff" />
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 12 }}>Tenant Workspaces</h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(214,227,255,0.6)' }}>
                                        Dedicated environments with isolated data and specific security protocols for every business unit.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
                                        {['Data Isolation', 'Role-Based Access', 'Audit Trails'].map((t) => (
                                            <span key={t} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>{t}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Tile 2 */}
                                <div data-reveal data-delay="2" className="bento-card card-lift bento-cyan" style={{ gridColumn: 'span 4', padding: 40, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: 120, color: '#002753', opacity: 0.05, position: 'absolute', top: -16, right: 8, lineHeight: 1, userSelect: 'none' }}>02</div>
                                    <div style={{ width: 52, height: 52, background: 'rgba(0,39,83,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                        <GraduationCap size={24} color="#002753" />
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: '#002753', marginBottom: 12 }}>Training Delivery</h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(0,39,83,0.55)' }}>
                                        Automated assignment of privacy modules with built-in assessments and certificates.
                                    </p>
                                </div>

                                {/* Tile 3 */}
                                <div data-reveal data-delay="3" className="bento-card card-lift bento-light" style={{ gridColumn: 'span 3', padding: 32, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: 120, color: '#002753', opacity: 0.04, position: 'absolute', top: -16, right: 8, lineHeight: 1, userSelect: 'none' }}>03</div>
                                    <div style={{ width: 48, height: 48, background: '#00b9ce', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        <ClipboardCheck size={22} color="#fff" />
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: '#002753', marginBottom: 10 }}>Compliance Execution</h3>
                                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#434750' }}>
                                        Centralized evidence repository with automated review cycles.
                                    </p>
                                </div>

                                {/* Tile 4 */}
                                <div data-reveal data-delay="1" className="bento-card card-lift bento-mid" style={{ gridColumn: 'span 7', padding: 40, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 900, fontSize: 120, color: '#fff', opacity: 0.04, position: 'absolute', top: -16, right: 8, lineHeight: 1, userSelect: 'none' }}>04</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ width: 52, height: 52, background: 'rgba(0,218,243,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                                <BarChart3 size={24} color="#00daf3" />
                                            </div>
                                            <h3 style={{ fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 12 }}>Executive Reporting</h3>
                                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(214,227,255,0.6)' }}>
                                                High-level transparency for board members with real-time scoring and gap analysis.
                                            </p>
                                        </div>
                                        <div className="product-reporting-mini" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, marginTop: 28 }}>
                                            {[['Real-time', 'Score tracking'], ['Gap', 'Analysis'], ['Board', 'Ready']].map(([a, b]) => (
                                                <div key={a}>
                                                    <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,218,243,0.5)', marginBottom: 4 }}>{a}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── WORKFLOW ───────────────────────────────────────── */}
                    <section id="solutions" style={{ background: '#f2f4f6', padding: '120px 0' }} className="welcome-section workflow-bg px-6 lg:px-16">
                        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                            <div data-reveal style={{ marginBottom: 72 }}>
                                <div className="sec-label">
                                    <div className="sec-label-line" />
                                    <span className="sec-label-text">02 - Process</span>
                                </div>
                                <h2 style={{ fontWeight: 700, fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#002753' }}>
                                    End-to-end workflow
                                </h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, position: 'relative' }} className="workflow-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { n: '01', icon: <UserPlus size={20} />, title: 'Register',     desc: 'Onboard employees and entities into the secure workspace with ease.' },
                                    { n: '02', icon: <BookOpen size={20} />, title: 'Train',         desc: 'Deploy role-specific training modules to ensure organizational alignment.' },
                                    { n: '03', icon: <CloudUpload size={20} />, title: 'Collect',    desc: 'Upload evidence files and initiate stakeholder review protocols.' },
                                    { n: '04', icon: <FolderCog size={20} />, title: 'Score',        desc: 'Generate compliance scores and audit-ready reports in one click.' },
                                ].map((step, i) => (
                                    <div key={step.n} data-reveal data-delay={`${i + 1}` as any} className="workflow-step" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {i < 3 && <div className="step-line hidden lg:block" />}
                                        <div className="workflow-step-badge" style={{
                                            width: 104, height: 104,
                                            borderRadius: '50%',
                                            background: '#002753',
                                            border: '4px solid #f2f4f6',
                                            boxShadow: '0 16px 40px rgba(0,39,83,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span style={{ fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>{step.n}</span>
                                        </div>
                                        <div>
                                            <div className="step-icon-wrap" style={{ width: 40, height: 40, background: '#d6e3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#083d77' }}>
                                                {step.icon}
                                            </div>
                                            <h4 style={{ fontWeight: 700, fontSize: 20, color: '#002753', letterSpacing: '-0.01em', marginBottom: 8 }}>{step.title}</h4>
                                            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#434750' }}>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── ROLE WORKSPACES ────────────────────────────────── */}
                    <section style={{ padding: '120px 0' }} className="welcome-section px-6 lg:px-16">
                        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                            <div data-reveal style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 64 }} className="role-intro-grid grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <div className="sec-label">
                                        <div className="sec-label-line" />
                                        <span className="sec-label-text">03 - Design System</span>
                                    </div>
                                    <h2 style={{ fontWeight: 700, fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 0.95, letterSpacing: '-0.03em', color: '#002753' }}>
                                        Every role, its own sanctuary
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <p className="role-intro-copy" style={{ fontSize: 15, lineHeight: 1.7, color: '#434750' }}>
                                        No clutter - just the data each role needs to act.
                                        Four distinct workspaces, one unified system.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="role-cards-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { icon: <ShieldCheck size={20} />, title: 'Super Admin',    desc: 'Global oversight, workspace creation, and security policy management.', pts: ['Entity Hierarchy', 'Audit Logs'],      accent: '#002753' },
                                    { icon: <UserCog size={20} />,     title: 'Company Admin',  desc: 'Training assignments and entity-level compliance tracking.',           pts: ['Team Performance', 'Deadline Alerts'],  accent: '#083d77' },
                                    { icon: <UsersRound size={20} />,  title: 'Reviewer',       desc: 'Verification of evidence files and compliance score calculation.',     pts: ['Queue Management', 'Evidence Approval'],accent: '#00b9ce' },
                                    { icon: <User size={20} />,        title: 'Employee',       desc: 'Assigned training and simple evidence upload portal.',                pts: ['My Certificates', 'Task Inbox'],        accent: '#00daf3' },
                                ].map((role, i) => (
                                    <div
                                        key={role.title}
                                        data-reveal
                                        data-delay={`${i + 1}` as any}
                                        className="role-card card-lift"
                                        style={{
                                            background: '#fff',
                                            borderRadius: 20,
                                            border: '1px solid rgba(195,198,209,0.25)',
                                            padding: 32,
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: role.accent }} />
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: role.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#fff' }}>
                                            {role.icon}
                                        </div>
                                        <h4 style={{ fontWeight: 700, fontSize: 17, color: '#002753', letterSpacing: '-0.01em', marginBottom: 8 }}>{role.title}</h4>
                                        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#434750' }}>{role.desc}</p>
                                        <div style={{ borderTop: '1px solid rgba(195,198,209,0.2)', marginTop: 24, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {role.pts.map((pt) => (
                                                <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#002753' }}>
                                                    <CheckCircle2 size={15} color="#00b9ce" style={{ flexShrink: 0 }} />
                                                    {pt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── REPORTING ──────────────────────────────────────── */}
                    <section style={{ background: '#002753', padding: '120px 0', color: '#fff' }} className="welcome-section px-6 lg:px-16">
                        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }} className="reporting-main-grid grid-cols-1 lg:grid-cols-2">
                            <div data-reveal>
                                <div className="sec-label">
                                    <div className="sec-label-line" />
                                    <span className="sec-label-text" style={{ color: 'rgba(0,218,243,0.55)' }}>04 - Reporting</span>
                                </div>
                                <h2 style={{ fontWeight: 700, fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 20 }}>
                                    Built for<br />
                                    <span style={{ color: '#00daf3' }}>regulators</span>
                                </h2>
                                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(214,227,255,0.6)', maxWidth: 420, marginBottom: 48 }}>
                                    Don't just be compliant. Prove it with institutional-grade
                                    reports that leave no room for doubt.
                                </p>
                                <div>
                                    {[
                                        { icon: <FileText size={18} />,        title: 'Employee Training Log',    desc: 'Detailed history of completions, scores, and timestamped certificates.' },
                                        { icon: <Gauge size={18} />,           title: 'Test Performance Reports', desc: 'Deep dive into knowledge gaps and module efficacy across entities.' },
                                        { icon: <FileSpreadsheet size={18} />, title: 'Compliance Summary',       desc: 'Aggregated global scores suitable for board meetings and stakeholder updates.' },
                                    ].map((item) => (
                                        <div key={item.title} style={{ display: 'flex', gap: 16, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 0' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,218,243,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00daf3' }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                                                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(214,227,255,0.5)' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div data-reveal data-delay="2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="reporting-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {[{ v: '450+', l: 'Controls Tracked' }, { v: '12', l: 'Countries' }].map((s) => (
                                        <div key={s.l} className="reporting-card" style={{ background: '#083d77', borderRadius: 20, padding: 32 }}>
                                            <div style={{ fontWeight: 700, fontSize: 56, color: '#00daf3', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.v}</div>
                                            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>{s.l}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="reporting-card" style={{ background: 'rgba(8,61,119,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 32 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Live Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00daf3', animation: 'blinkDot 2s ease-in-out infinite' }} />
                                            <span style={{ fontSize: 11, fontWeight: 500, color: '#00daf3' }}>Operational</span>
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 600, fontSize: 20, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                                        Platform currently tracking 450+ compliance controls across 12 countries.
                                    </p>
                                </div>
                                {/* Mini progress bars */}
                                <div style={{ background: '#083d77', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        { l: 'Training Readiness',     v: '76%', pct: 76, c: '#00daf3' },
                                        { l: 'Evidence Approval',       v: '68%', pct: 68, c: '#9cf0ff' },
                                        { l: 'Submission Completion',   v: '91%', pct: 91, c: '#d6e3ff' },
                                    ].map((b) => (
                                        <div key={b.l}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>{b.l}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{b.v}</span>
                                            </div>
                                            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div
                                                    className="pbar-fill"
                                                    style={{ height: '100%', borderRadius: 9999, background: b.c, '--w': b.v } as any}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── CTA ────────────────────────────────────────────── */}
                    <section style={{ padding: '120px 0' }} className="welcome-section px-6 lg:px-16">
                        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
                            <div
                                data-reveal
                                className="cta-panel dot-overlay"
                                style={{
                                    background: '#002753',
                                    borderRadius: 28,
                                    padding: '96px 80px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    gap: 40,
                                }}
                            >
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(0,218,243,0.5)' }}>
                                        Ready to begin?
                                    </span>
                                    <h2 style={{ fontWeight: 700, fontSize: 'clamp(44px,6vw,88px)', lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fff', marginTop: 16 }}>
                                        Secure your<br />
                                        <span style={{ color: '#00daf3' }}>workspace</span><br />
                                        today.
                                    </h2>
                                </div>
                                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
                                    <p className="cta-copy" style={{ maxWidth: 300, fontSize: 14, lineHeight: 1.7, color: 'rgba(214,227,255,0.5)' }}>
                                        Join the architectural sanctuary of modern compliance.
                                        Setup takes less than 10 minutes.
                                    </p>
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="btn-primary"
                                        style={{ padding: '18px 40px', fontSize: 16, textDecoration: 'none', display: 'inline-block' }}
                                    >
                                        {auth.user ? 'Open dashboard' : 'Create tenant workspace'}
                                    </Link>
                                </div>
                                <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: '#00b9ce', opacity: 0.07, filter: 'blur(80px)', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: '#083d77', filter: 'blur(80px)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </section>
                </main>

                {/* ─── FOOTER ─────────────────────────────────────────────── */}
                <footer style={{ background: '#fff', borderTop: '1px solid rgba(195,198,209,0.2)', padding: '48px 0' }} className="welcome-footer px-6 lg:px-16">
                    <div className="welcome-footer-shell" style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" style={{ height: 28, width: 'auto' }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: '#002753' }}>Privacy Cure Compliance</span>
                        </div>
                        <div className="welcome-footer-links" style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                            {['Privacy Policy', 'Terms of Service', 'Support'].map((l) => (
                                <a
                                    key={l}
                                    href="#"
                                    style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#434750', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#002753')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#434750')}
                                >
                                    {l}
                                </a>
                            ))}
                        </div>
                        <p style={{ fontSize: 12, color: '#434750' }}>(c) 2026 Privacy Cure Compliance. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

