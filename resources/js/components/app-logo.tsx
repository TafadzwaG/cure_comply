import { resolveBranding } from '@/lib/tenant-branding';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import privacyCureLogo from '@/images/privacycure-logo.png';

export default function AppLogo() {
    const { branding, tenant } = usePage<SharedData>().props;
    const resolvedBranding = resolveBranding(branding);
    const logoUrl = resolvedBranding.logo_url || privacyCureLogo;
    const label = tenant?.name ?? 'Cure Compliance';

    return (
        <>
            <div className="flex items-center">
                <img src={logoUrl} alt={label} className="h-8 w-auto max-w-[9rem] object-contain" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{label}</span>
            </div>
        </>
    );
}
