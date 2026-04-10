import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function TenantStatusActionDialog({
    tenantId,
    tenantName,
    action,
    triggerLabel,
    compact = false,
    triggerClassName,
}: {
    tenantId: number;
    tenantName: string;
    action: 'activate' | 'deactivate';
    triggerLabel?: string;
    compact?: boolean;
    triggerClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isActivate = action === 'activate';
    const Icon = isActivate ? ShieldCheck : ShieldAlert;

    const submit = () => {
        setProcessing(true);

        router.post(
            route(isActivate ? 'tenants.activate' : 'tenants.deactivate', tenantId),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setOpen(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size={compact ? 'sm' : 'default'} variant={isActivate ? 'outline' : 'destructive'} className={triggerClassName}>
                    <Icon className="size-4" />
                    {triggerLabel ?? (isActivate ? 'Activate tenant' : 'Deactivate tenant')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isActivate ? 'Activate tenant' : 'Deactivate tenant'}</DialogTitle>
                    <DialogDescription>
                        {isActivate
                            ? `This will move ${tenantName} to active status and send an activation update to the tenant administrator.`
                            : `This will pause access for ${tenantName} and send a deactivation update to the tenant administrator.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    {isActivate
                        ? 'Use this when the company details have been reviewed and the workspace is ready to open.'
                        : 'Use this when workspace access needs to be paused without deleting the tenant record.'}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="button" variant={isActivate ? 'default' : 'destructive'} onClick={submit} disabled={processing}>
                        <Icon className="size-4" />
                        {processing ? (isActivate ? 'Activating...' : 'Deactivating...') : isActivate ? 'Confirm activation' : 'Confirm deactivation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
