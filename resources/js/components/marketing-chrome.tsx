import { useAppearance } from '@/hooks/use-appearance';
import privacyCureLogoWhite from '@/images/privacycure-logo-white.png';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Mail, MapPin, Menu, Moon, Phone, Sun, X } from 'lucide-react';
import { useState } from 'react';

export type MarketingCurrent = 'home' | 'pricing' | 'resources' | 'training' | 'privacy' | 'terms';

type NavItem = { label: string; key: string; hash: string } | { label: string; key: string; route: 'pricing' | 'resources' | 'training.index' };

const navItems: NavItem[] = [
    { label: 'Product', key: 'product', hash: '#product' },
    { label: 'Solutions', key: 'solutions', hash: '#solutions' },
    { label: 'Pricing', key: 'pricing', route: 'pricing' },
    { label: 'Resources', key: 'resources', route: 'resources' },
    { label: 'Training', key: 'training', route: 'training.index' },
];

export const marketingChromeHeaderStyles = `
    /* ────────────────────────────────────────────────────────────────
       Marketing chrome — editorial navy (logo-derived)
       Palette:
         ink          #1a2540   body text / titles
         navy-deep    #0e2a5e   logo dark side, hover state
         navy         #1f4694   logo light side, primary accent
         cornflower   #3d6ec7   lighter accent, links
         sky          #a8c1ed   tints
         slate        #5a6478   secondary text
         steel        #94a3b8   muted
         paper        #f5f7fb   page surface
         paper-2      #eaf0f9   sunken surface
       ──────────────────────────────────────────────────────────────── */

    .welcome-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(245,247,251,0.88);
        backdrop-filter: blur(22px) saturate(140%);
        -webkit-backdrop-filter: blur(22px) saturate(140%);
        border-bottom: 1px solid rgba(14,42,94,0.06);
    }

    .welcome-header-bar {
        max-width: 90rem;
        margin: 0 auto;
        height: 66px;
        padding: 0 1.5rem;
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        position: relative;
        width: 100%;
        gap: 1rem;
    }

    @media (min-width: 1024px) {
        .welcome-header-bar {
            height: 74px;
            padding: 0 2.5rem;
        }
    }

    .welcome-header-brand {
        display: flex !important;
        align-items: center;
        flex-shrink: 0;
        position: relative;
        z-index: 2;
    }

    .welcome-header-brand-link {
        display: inline-flex;
        line-height: 0;
        flex-shrink: 0;
    }

    .welcome-header-brand-link img {
        height: 50px !important;
        width: auto !important;
        max-width: 210px !important;
        max-height: 50px !important;
        object-fit: contain;
    }

    @media (min-width: 1024px) {
        .welcome-header-brand-link img {
            height: 54px !important;
            max-height: 54px !important;
            max-width: 228px !important;
        }
    }

    .welcome-header-logo-light { display: block !important; }
    .welcome-header-logo-dark  { display: none !important; }
    .dark .welcome-header-logo-light { display: none !important; }
    .dark .welcome-header-logo-dark  { display: block !important; }

    .welcome-header-nav {
        display: none !important;
        align-items: center;
        justify-content: center;
        gap: 1.65rem;
        min-width: 0;
    }

    @media (min-width: 1024px) {
        .welcome-header-nav {
            display: flex !important;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }
    }

    .welcome-header-nav-link {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-decoration: none;
        color: #5a6478;
        white-space: nowrap;
        position: relative;
        padding: 6px 0;
        transition: color 0.2s ease;
    }

    .welcome-header-nav-link::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background: #1f4694;
        transform: scaleX(0);
        transform-origin: left center;
        transition: transform 0.25s cubic-bezier(.16,1,.3,1);
    }
    .welcome-header-nav-link:hover,
    .welcome-header-nav-link.is-active { color: #0e2a5e; }
    .welcome-header-nav-link:hover::after,
    .welcome-header-nav-link.is-active::after { transform: scaleX(1); }

    .welcome-header-actions {
        display: flex !important;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        flex-shrink: 0;
        position: relative;
        z-index: 2;
    }

    .welcome-header-menu-btn {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid rgba(14,42,94,0.18);
        background: transparent;
        color: #0e2a5e;
        cursor: pointer;
        transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
    }

    .welcome-header-menu-btn:hover {
        border-color: #1f4694;
        color: #1f4694;
        background: rgba(31,70,148,0.06);
    }

    @media (min-width: 1024px) {
        .welcome-header-menu-btn { display: none !important; }
    }

    .welcome-header-actions-divider {
        display: none;
        width: 1px;
        height: 22px;
        background: rgba(14,42,94,0.18);
        flex-shrink: 0;
    }
    @media (min-width: 768px) { .welcome-header-actions-divider { display: block; } }

    .header-cta-link {
        display: none !important;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        text-decoration: none;
        color: #5a6478;
        padding: 0 4px;
        white-space: nowrap;
        transition: color 0.2s ease;
    }

    @media (min-width: 768px) {
        .header-cta-link {
            display: inline-flex !important;
            align-items: center;
        }
    }

    .header-cta-link:hover { color: #0e2a5e; }

    .header-cta-ghost {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-decoration: none;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 36px;
        padding: 0 14px;
        border-radius: 6px;
        border: 1px solid rgba(14,42,94,0.28);
        color: #0e2a5e;
        background: transparent;
        white-space: nowrap;
        transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
    }

    .header-cta-ghost:hover {
        border-color: #0e2a5e;
        background: rgba(14,42,94,0.06);
        transform: translateY(-1px);
    }

    .header-cta-primary {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-decoration: none;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 36px;
        padding: 0 16px;
        border-radius: 6px;
        background: #0e2a5e;
        color: #f5f7fb;
        white-space: nowrap;
        box-shadow: 0 1px 0 rgba(14,42,94,0.18), 0 8px 24px -10px rgba(14,42,94,0.4);
        transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }

    .header-cta-primary:hover {
        background: #1f4694;
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 1px 0 rgba(14,42,94,0.18), 0 14px 32px -10px rgba(31,70,148,0.5);
    }

    .welcome-header-rule {
        display: none;
    }

    .header-mobile-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(14,42,94,0.14);
    }

    .dark .welcome-header {
        background: rgba(13,17,23,0.88) !important;
        border-bottom-color: rgba(168,193,237,0.10);
    }
    .dark .welcome-header-nav-link { color: rgba(245,247,251,0.62); }
    .dark .welcome-header-nav-link:hover,
    .dark .welcome-header-nav-link.is-active { color: #a8c1ed; }
    .dark .welcome-header-nav-link::after { background: #a8c1ed; }

    .dark .welcome-header-menu-btn {
        color: #e6ecf6;
        border-color: rgba(168,193,237,0.22);
    }
    .dark .welcome-header-menu-btn:hover {
        border-color: #a8c1ed;
        color: #a8c1ed;
        background: rgba(168,193,237,0.08);
    }

    .dark .welcome-header-actions-divider { background: rgba(168,193,237,0.18); }
    .dark .header-cta-link { color: rgba(245,247,251,0.7); }
    .dark .header-cta-link:hover { color: #a8c1ed; }

    .dark .header-cta-ghost {
        color: #e6ecf6;
        border-color: rgba(168,193,237,0.28);
    }
    .dark .header-cta-ghost:hover {
        border-color: #a8c1ed;
        background: rgba(168,193,237,0.08);
    }

    .dark .header-cta-primary {
        background: #1f4694;
        color: #fff;
        box-shadow: 0 1px 0 rgba(0,0,0,0.4), 0 12px 28px -10px rgba(31,70,148,0.6);
    }
    .dark .header-cta-primary:hover {
        background: #3d6ec7;
    }

    .dark .header-mobile-actions { border-top-color: rgba(168,193,237,0.14); }

    @media (max-width: 639px) {
        .header-cta-primary {
            min-height: 36px;
            padding: 0 12px;
            font-size: 10px;
            gap: 8px;
        }

        .welcome-header-bar {
            gap: 0.75rem;
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .welcome-header-brand-link img {
            height: 42px !important;
            max-height: 42px !important;
            max-width: 176px !important;
        }
    }

    .welcome-header-mobile-nav {
        border-top: 1px solid rgba(14,42,94,0.10);
        background: rgba(245,247,251,0.98);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
    }
    .dark .welcome-header-mobile-nav {
        border-top-color: rgba(168,193,237,0.14);
        background: rgba(13,17,23,0.98);
    }

    .welcome-header-mobile-inner {
        max-width: 80rem;
        margin: 0 auto;
        padding: 1.25rem 1.5rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    @media (min-width: 1024px) {
        .welcome-header-mobile-inner { padding-left: 2.5rem; padding-right: 2.5rem; }
    }

    .welcome-header-mobile-inner .welcome-header-nav-link {
        display: block;
        padding: 0.7rem 0;
        font-size: 12px;
    }

    /* Shared .btn-primary used by other marketing pages — now editorial navy pill */
    .btn-primary {
        background: #0e2a5e;
        color: #f5f7fb;
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        border-radius: 999px;
        transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 1px 0 rgba(14,42,94,0.2), 0 10px 28px -12px rgba(14,42,94,0.45);
    }
    .btn-primary::after { display: none; }
    .btn-primary:hover {
        background: #1f4694;
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 1px 0 rgba(14,42,94,0.2), 0 16px 36px -12px rgba(31,70,148,0.55);
    }

    @keyframes marketingShimmer {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
    }

    .welcome-theme-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 60;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid rgba(14,42,94,0.18);
        background: rgba(245,247,251,0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0e2a5e;
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        box-shadow: 0 8px 28px rgba(14,42,94,0.14);
    }

    .welcome-theme-toggle:hover {
        transform: translateY(-2px);
        border-color: rgba(0,218,243,0.45);
        box-shadow: 0 12px 32px rgba(0,39,83,0.16);
        color: #00b9ce;
    }

    .dark .welcome-theme-toggle {
        background: rgba(13,17,23,0.92);
        border-color: rgba(45,55,72,0.55);
        color: #00daf3;
        box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    }

    .dark .welcome-theme-toggle:hover {
        border-color: rgba(0,218,243,0.4);
        color: #9cf0ff;
    }

`;

export const marketingFooterStyles = `
    /* ── Footer ──────────────────────────────────────────────────── */
    .welcome-footer {
        background: #f7f9fb;
        border-top: 1px solid rgba(195,198,209,0.28);
        padding: 0;
        position: relative;
        z-index: 1;
    }

    .welcome-footer-inner {
        max-width: 90rem;
        margin: 0 auto;
        padding: 3rem 1.5rem 0;
    }

    @media (min-width: 1024px) {
        .welcome-footer-inner {
            padding: 3.75rem 2.5rem 0;
        }
    }

    .welcome-footer-intro {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1.5rem 2rem;
        padding-bottom: 2rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid rgba(195,198,209,0.35);
    }

    .welcome-footer-intro-copy {
        max-width: 42rem;
    }

    .welcome-footer-eyebrow {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #00b9ce;
        margin-bottom: 0.875rem;
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
    }

    .welcome-footer-eyebrow::before {
        content: '';
        width: 1.75rem;
        height: 1px;
        background: #00daf3;
    }

    .welcome-footer-title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: clamp(1.75rem, 3.2vw, 2.625rem);
        font-weight: 400;
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: #002753;
        margin: 0;
    }

    .welcome-footer-title em {
        font-style: italic;
        color: #083d77;
    }

    .welcome-footer-intro-note {
        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
        font-size: 14px;
        line-height: 1.7;
        color: #434750;
        max-width: 22rem;
        margin: 0;
    }

    .welcome-footer-main {
        display: grid;
        grid-template-columns: minmax(280px, 1.25fr) minmax(260px, 1fr) minmax(180px, 0.65fr);
        gap: 2rem 3rem;
        align-items: start;
        padding-bottom: 2rem;
    }

    .welcome-footer-brand {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
        min-width: 0;
    }

    .welcome-footer-brand-link {
        display: inline-flex;
        line-height: 0;
        flex-shrink: 0;
    }

    .welcome-footer-brand-link img {
        height: 34px !important;
        width: auto !important;
        max-width: 170px !important;
        max-height: 34px !important;
        object-fit: contain;
    }

    .welcome-footer-logo-light {
        display: block !important;
    }

    .welcome-footer-logo-dark {
        display: none !important;
    }

    .dark .welcome-footer-logo-light {
        display: none !important;
    }

    .dark .welcome-footer-logo-dark {
        display: block !important;
    }

    .welcome-footer-mission {
        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
        font-size: 14px;
        line-height: 1.75;
        color: #434750;
        max-width: 25rem;
        margin: 0;
    }

    .welcome-footer-heading {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #00b9ce;
        margin: 0 0 1.25rem;
    }

    .welcome-footer-contact-list {
        display: flex;
        flex-direction: column;
        gap: 1.125rem;
    }

    .welcome-footer-contact-item {
        display: flex;
        gap: 0.875rem;
        align-items: flex-start;
    }

    .welcome-footer-contact-icon {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 6px;
        background: rgba(0,218,243,0.1);
        border: 1px solid rgba(0,218,243,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00b9ce;
        flex-shrink: 0;
    }

    .welcome-footer-contact-label {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(0,39,83,0.45);
        margin-bottom: 0.25rem;
    }

    .welcome-footer-contact-value {
        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #002753;
        font-weight: 500;
    }

    .welcome-footer-contact-value a {
        color: inherit;
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .welcome-footer-contact-value a:hover {
        color: #00b9ce;
    }

    .welcome-footer-nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .welcome-footer-nav-list a {
        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #434750;
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .welcome-footer-nav-list a:hover {
        color: #002753;
    }

    .welcome-footer-bar {
        border-top: 1px solid rgba(195,198,209,0.35);
        padding: 1rem 0 1.25rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .welcome-footer-bar p {
        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
        font-size: 12px;
        color: #434750;
        margin: 0;
    }

    .welcome-footer-bar-note {
        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 10px;
        letter-spacing: 0.1em;
        color: rgba(0,39,83,0.45);
    }

    .dark .welcome-footer {
        background: #0d1117 !important;
        border-top-color: rgba(45,55,72,0.4) !important;
    }

    .dark .welcome-footer-intro {
        border-bottom-color: rgba(45,55,72,0.4);
    }

    .dark .welcome-footer-title {
        color: #f8fafc;
    }

    .dark .welcome-footer-title em {
        color: #9cf0ff;
    }

    .dark .welcome-footer-intro-note,
    .dark .welcome-footer-mission {
        color: #cbd5e1 !important;
    }

    .dark .welcome-footer-contact-value,
    .dark .welcome-footer-contact-value a {
        color: #f8fafc !important;
    }

    .dark .welcome-footer-contact-value a:hover {
        color: #00daf3 !important;
    }

    .dark .welcome-footer-nav-list a {
        color: #cbd5e1 !important;
    }

    .dark .welcome-footer-nav-list a:hover {
        color: #f8fafc !important;
    }

    .dark .welcome-footer-bar {
        border-top-color: rgba(45,55,72,0.4) !important;
    }

    .dark .welcome-footer-bar p {
        color: #94a3b8 !important;
    }

    .dark .welcome-footer-contact-label,
    .dark .welcome-footer-bar-note {
        color: #64748b !important;
    }

    .dark .welcome-footer-contact-icon {
        background: rgba(0,218,243,0.08) !important;
        border-color: rgba(0,218,243,0.15) !important;
        color: #00daf3 !important;
    }

    .dark .welcome-footer-eyebrow,
    .dark .welcome-footer-heading {
        color: #00daf3 !important;
    }

    .dark .welcome-footer-eyebrow::before {
        background: #00daf3 !important;
    }

    @media (max-width: 1023px) and (min-width: 768px) {
        .welcome-footer-main {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .welcome-footer-brand {
            grid-column: 1 / -1;
            max-width: 34rem;
        }
    }

    @media (max-width: 767px) {
        .welcome-footer-inner {
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
            padding-top: 2.5rem !important;
        }

        .welcome-footer-intro {
            flex-direction: column;
            align-items: flex-start;
            padding-bottom: 2rem;
            margin-bottom: 2rem;
        }

        .welcome-footer-main {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
        }

        .welcome-footer-bar {
            flex-direction: column;
            align-items: flex-start;
        }

        .welcome-theme-toggle {
            bottom: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
        }
    }

    .public-marketing-shell .welcome-footer {
        --footer-bg: #ffffff;
        --footer-bg-soft: #f5f7fb;
        --footer-border: rgba(14,42,94,0.14);
        --footer-ink: #1a2540;
        --footer-muted: #5a6478;
        --footer-accent: #1f4694;
        --footer-icon-bg: rgba(31,70,148,0.08);
        --footer-icon-border: rgba(31,70,148,0.18);

        background: linear-gradient(180deg, var(--footer-bg) 0%, var(--footer-bg-soft) 100%) !important;
        border-top: 1px solid var(--footer-border) !important;
        color: var(--footer-ink) !important;
        overflow: hidden;
    }

    .public-marketing-shell .welcome-footer-inner {
        max-width: 90rem;
        padding: 4rem 1.5rem 0 !important;
    }

    .public-marketing-shell .welcome-footer-intro {
        display: grid !important;
        grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
        align-items: end !important;
        gap: 1.75rem 3.5rem !important;
        padding-bottom: 2.5rem !important;
        margin-bottom: 2.5rem !important;
        border-bottom: 1px solid var(--footer-border) !important;
    }

    .public-marketing-shell .welcome-footer-intro-copy {
        max-width: 48rem;
    }

    .public-marketing-shell .welcome-footer-eyebrow,
    .public-marketing-shell .welcome-footer-heading {
        color: var(--footer-accent) !important;
        font-weight: 700 !important;
    }

    .public-marketing-shell .welcome-footer-eyebrow::before {
        background: currentColor !important;
    }

    .public-marketing-shell .welcome-footer-title {
        color: var(--footer-ink) !important;
        font-size: clamp(2rem, 3.6vw, 3.5rem) !important;
        font-weight: 300 !important;
        letter-spacing: 0 !important;
        line-height: 1 !important;
    }

    .public-marketing-shell .welcome-footer-title em {
        color: var(--footer-accent) !important;
    }

    .public-marketing-shell .welcome-footer-intro-note,
    .public-marketing-shell .welcome-footer-mission,
    .public-marketing-shell .welcome-footer-bar p,
    .public-marketing-shell .welcome-footer-contact-label,
    .public-marketing-shell .welcome-footer-bar-note {
        color: var(--footer-muted) !important;
    }

    .public-marketing-shell .welcome-footer-intro-note,
    .public-marketing-shell .welcome-footer-mission {
        font-size: 15px !important;
        line-height: 1.75 !important;
    }

    .public-marketing-shell .welcome-footer-main {
        display: grid !important;
        grid-template-columns: minmax(280px, 1.15fr) minmax(270px, 1fr) minmax(190px, 0.7fr);
        gap: 2.25rem 3.5rem !important;
        align-items: start !important;
        padding-bottom: 2.5rem !important;
    }

    .public-marketing-shell .welcome-footer-brand {
        gap: 1.125rem !important;
    }

    .public-marketing-shell .welcome-footer-brand-link img {
        height: 54px !important;
        max-height: 54px !important;
        max-width: 230px !important;
    }

    .public-marketing-shell .welcome-footer-contact-icon {
        width: 2.375rem !important;
        height: 2.375rem !important;
        border-radius: 8px !important;
        background: var(--footer-icon-bg) !important;
        border-color: var(--footer-icon-border) !important;
        color: var(--footer-accent) !important;
    }

    .public-marketing-shell .welcome-footer-contact-value,
    .public-marketing-shell .welcome-footer-contact-value a,
    .public-marketing-shell .welcome-footer-nav-list a {
        color: var(--footer-ink) !important;
    }

    .public-marketing-shell .welcome-footer-contact-value a:hover,
    .public-marketing-shell .welcome-footer-nav-list a:hover {
        color: var(--footer-accent) !important;
    }

    .public-marketing-shell .welcome-footer-bar {
        border-top: 1px solid var(--footer-border) !important;
        padding: 1.125rem 0 1.375rem !important;
    }

    .dark .public-marketing-shell .welcome-footer {
        --footer-bg: #0b1220;
        --footer-bg-soft: #111a30;
        --footer-border: rgba(168,193,237,0.16);
        --footer-ink: #e6ecf6;
        --footer-muted: #a8b3c7;
        --footer-accent: #a8c1ed;
        --footer-icon-bg: rgba(168,193,237,0.08);
        --footer-icon-border: rgba(168,193,237,0.18);
    }

    @media (min-width: 1024px) {
        .public-marketing-shell .welcome-footer-inner {
            padding: 4.5rem 2.5rem 0 !important;
        }
    }

    @media (max-width: 1023px) and (min-width: 768px) {
        .public-marketing-shell .welcome-footer-intro,
        .public-marketing-shell .welcome-footer-main {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        }
    }

    @media (max-width: 767px) {
        .public-marketing-shell .welcome-footer-inner {
            padding: 3rem 1.25rem 0 !important;
        }

        .public-marketing-shell .welcome-footer-intro,
        .public-marketing-shell .welcome-footer-main {
            grid-template-columns: 1fr !important;
        }

        .public-marketing-shell .welcome-footer-brand-link img {
            height: 46px !important;
            max-height: 46px !important;
            max-width: 194px !important;
        }
    }
`;

export const marketingChromeStyles = marketingChromeHeaderStyles + marketingFooterStyles;

function resolveNavHref(item: NavItem, onHomePage: boolean): string {
    if ('hash' in item) {
        return onHomePage ? item.hash : `${route('home')}${item.hash}`;
    }

    if (item.route === 'pricing') {
        return route('pricing');
    }

    if (item.route === 'resources') {
        return route('resources');
    }

    return route('training.index');
}

function isNavActive(item: NavItem, current?: MarketingCurrent): boolean {
    if (item.key === 'pricing') {
        return current === 'pricing';
    }

    if (item.key === 'resources') {
        return current === 'resources';
    }

    if (item.key === 'training') {
        return current === 'training';
    }

    return false;
}

function navLinkClassName(isActive: boolean): string {
    return `welcome-header-nav-link${isActive ? ' is-active' : ''}`;
}

function MarketingNavLink({
    item,
    onHomePage,
    current,
    onNavigate,
}: {
    item: NavItem;
    onHomePage: boolean;
    current?: MarketingCurrent;
    onNavigate?: () => void;
}) {
    const href = resolveNavHref(item, onHomePage);
    const className = navLinkClassName(isNavActive(item, current));

    if ('hash' in item && onHomePage) {
        return (
            <a key={item.label} href={item.hash} className={className} onClick={onNavigate}>
                {item.label}
            </a>
        );
    }

    return (
        <Link key={item.label} href={href} className={className} onClick={onNavigate}>
            {item.label}
        </Link>
    );
}

export function MarketingHeader({ current }: { current?: MarketingCurrent }) {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const homePath = route('home');
    const onHomePage = page.url === homePath || page.url === '/' || current === 'home';

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
                    {navItems.map((item) => (
                        <MarketingNavLink key={item.label} item={item} onHomePage={onHomePage} current={current} />
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

                    {auth.user ? (
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

            <div className="welcome-header-rule" aria-hidden="true" />

            {mobileOpen ? (
                <nav className="welcome-header-mobile-nav" aria-label="Mobile primary">
                    <div className="welcome-header-mobile-inner">
                        {navItems.map((item) => (
                            <MarketingNavLink
                                key={item.label}
                                item={item}
                                onHomePage={onHomePage}
                                current={current}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        ))}
                        {!auth.user ? (
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

export function MarketingFooter() {
    return (
        <footer className="welcome-footer">
            <div className="welcome-footer-inner">
                <div className="welcome-footer-intro">
                    <div className="welcome-footer-intro-copy">
                        <div className="welcome-footer-eyebrow">Compliance studio</div>
                        <h2 className="welcome-footer-title">
                            Compliance, <em>kept honest</em> from the first artefact onward.
                        </h2>
                    </div>
                    <p className="welcome-footer-intro-note">
                        Training, evidence, controls, and reviews in one operating layer — aligned to the Zimbabwean Cyber and Data Protection Act
                        [Chapter 12:07].
                    </p>
                </div>

                <div className="welcome-footer-main">
                    <div className="welcome-footer-brand">
                        <Link href={route('home')} className="welcome-footer-brand-link">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="welcome-footer-logo-light" />
                            <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="welcome-footer-logo-dark" />
                        </Link>
                        <p className="welcome-footer-mission">
                            Data protection safeguards sensitive information from unauthorized access, breaches, and misuse while keeping your
                            organisation aligned with local regulation and international frameworks.
                        </p>
                    </div>

                    <div className="welcome-footer-contact">
                        <div className="welcome-footer-heading">Contact info</div>
                        <div className="welcome-footer-contact-list">
                            <div className="welcome-footer-contact-item">
                                <div className="welcome-footer-contact-icon">
                                    <Phone size={15} />
                                </div>
                                <div>
                                    <div className="welcome-footer-contact-label">Hotline</div>
                                    <div className="welcome-footer-contact-value">
                                        <a href="tel:+263782903276">+263 782 903 276</a>
                                    </div>
                                </div>
                            </div>
                            <div className="welcome-footer-contact-item">
                                <div className="welcome-footer-contact-icon">
                                    <Mail size={15} />
                                </div>
                                <div>
                                    <div className="welcome-footer-contact-label">Email</div>
                                    <div className="welcome-footer-contact-value">
                                        <a href="mailto:dpo@privacycure.com">dpo@privacycure.com</a>
                                    </div>
                                </div>
                            </div>
                            <div className="welcome-footer-contact-item">
                                <div className="welcome-footer-contact-icon">
                                    <MapPin size={15} />
                                </div>
                                <div>
                                    <div className="welcome-footer-contact-label">Address</div>
                                    <div className="welcome-footer-contact-value">
                                        6th Floor Batanai Gardens, Cnr Jason Moyo Avenue / First Street, Harare
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="welcome-footer-nav">
                        <div className="welcome-footer-heading">Legal &amp; support</div>
                        <nav className="welcome-footer-nav-list" aria-label="Footer">
                            <Link href={route('privacy-policy')}>Privacy Policy</Link>
                            <Link href={route('terms-and-conditions')}>Terms of Service</Link>
                            <Link href={route('pricing')}>Pricing</Link>
                            <Link href={route('resources')}>Resources</Link>
                            <Link href={route('training.index')}>Training</Link>
                        </nav>
                    </div>
                </div>

                <div className="welcome-footer-bar">
                    <p>&copy; 2026 Privacy Cure Compliance. All rights reserved.</p>
                    <span className="welcome-footer-bar-note">Cyber &amp; Data Protection Act [Chapter 12:07]</span>
                </div>
            </div>
        </footer>
    );
}

export function MarketingThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const isDark =
        appearance === 'dark' ||
        (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleTheme = () => updateAppearance(isDark ? 'light' : 'dark');

    return (
        <button
            type="button"
            className="welcome-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}

export function MarketingFooterStyles() {
    return <style>{marketingFooterStyles}</style>;
}

export function MarketingChromeStyles() {
    return <style>{marketingChromeStyles}</style>;
}
