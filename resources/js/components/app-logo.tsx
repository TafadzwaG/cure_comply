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
        <div className="flex items-center">
            <img
                src={logoUrl}
                alt={label}
                className="h-14 w-auto max-w-[14rem] object-contain group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:max-w-[2rem]"
            />
        </div>
    );
}
