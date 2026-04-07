import privacyCureLogo from '@/images/privacycure-logo.png';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center">
                <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-8 w-auto" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Cure Compliance</span>
            </div>
        </>
    );
}
