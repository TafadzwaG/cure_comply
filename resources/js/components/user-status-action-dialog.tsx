import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { ShieldAlert, ShieldCheck, UserRoundX } from 'lucide-react';
import { useState } from 'react';

export function UserStatusActionDialog({
    userId,
    userName,
    action,
    triggerLabel,
    compact = false,
}: {
    userId: number;
    userName: string;
    action: 'deactivate' | 'reactivate';
    triggerLabel?: string;
    compact?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isDeactivate = action === 'deactivate';
    const Icon = isDeactivate ? UserRoundX : ShieldCheck;

    const submit = () => {
        setProcessing(true);

        router.patch(
            route(isDeactivate ? 'users.deactivate' : 'users.reactivate', userId),
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
                <Button size={compact ? 'sm' : 'default'} variant={isDeactivate ? 'destructive' : 'outline'}>
                    <Icon className="size-4" />
                    {triggerLabel ?? (isDeactivate ? 'Deactivate user' : 'Reactivate user')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isDeactivate ? 'Deactivate user' : 'Reactivate user'}</DialogTitle>
                    <DialogDescription>
                        {isDeactivate
                            ? `This will pause access for ${userName}, archive the current email, and free that address for reuse.`
                            : `This will restore access for ${userName} once a real login email is set on the account.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    {isDeactivate ? (
                        <>
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <ShieldAlert className="size-4" />
                                Access will be revoked immediately.
                            </div>
                            <p className="mt-2">
                                Existing sessions will be cleared, the account will stay in the audit trail, and the original email can be reused for a new invitation or account.
                            </p>
                        </>
                    ) : (
                        <p>Reactivate only after you have replaced any placeholder email with a real unique address on the user profile.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="button" variant={isDeactivate ? 'destructive' : 'default'} onClick={submit} disabled={processing}>
                        <Icon className="size-4" />
                        {processing ? (isDeactivate ? 'Deactivating...' : 'Reactivating...') : isDeactivate ? 'Confirm deactivation' : 'Confirm reactivation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
