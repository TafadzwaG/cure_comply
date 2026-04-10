import type { TenantBranding } from '@/types';

const DEFAULT_BRANDING: TenantBranding = {
    tenant_id: null,
    tenant_name: null,
    logo_url: null,
    primary_color: '#083D77',
    primary_foreground: '#FFFFFF',
    primary_hsl: 'hsl(209 88% 25%)',
    soft_color: 'rgba(8, 61, 119, 0.12)',
    soft_border_color: 'rgba(8, 61, 119, 0.22)',
    sidebar_primary: 'hsl(209 88% 25%)',
    sidebar_primary_foreground: '#FFFFFF',
    sidebar_accent: 'rgba(8, 61, 119, 0.12)',
    sidebar_accent_foreground: 'hsl(209 88% 25%)',
    sidebar_border: 'rgba(8, 61, 119, 0.22)',
    ring_color: 'hsl(209 88% 25%)',
    is_customized: false,
};

export function resolveBranding(branding?: TenantBranding | null): TenantBranding {
    return {
        ...DEFAULT_BRANDING,
        ...branding,
    };
}

export function brandingStyleVars(branding?: TenantBranding | null): React.CSSProperties {
    const resolved = resolveBranding(branding);

    return {
        ['--primary' as string]: resolved.primary_hsl,
        ['--primary-foreground' as string]: resolved.primary_foreground,
        ['--ring' as string]: resolved.ring_color,
        ['--sidebar-primary' as string]: resolved.sidebar_primary,
        ['--sidebar-primary-foreground' as string]: resolved.sidebar_primary_foreground,
        ['--sidebar-accent' as string]: resolved.sidebar_accent,
        ['--sidebar-accent-foreground' as string]: resolved.sidebar_accent_foreground,
        ['--sidebar-border' as string]: resolved.sidebar_border,
        ['--sidebar-ring' as string]: resolved.ring_color,
    };
}
