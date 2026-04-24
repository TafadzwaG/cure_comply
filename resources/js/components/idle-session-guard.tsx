import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Clock3, LogOut, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const IDLE_LOGOUT_AFTER_MS = 3 * 60 * 1000;
const IDLE_WARNING_AFTER_MS = 2 * 60 * 1000;
const WARNING_COUNTDOWN_SECONDS = Math.floor((IDLE_LOGOUT_AFTER_MS - IDLE_WARNING_AFTER_MS) / 1000);
const ACTIVITY_RESET_THROTTLE_MS = 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'click',
];

export default function IdleSessionGuard() {
    const { auth } = usePage<SharedData>().props;
    const [warningOpen, setWarningOpen] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState(WARNING_COUNTDOWN_SECONDS);
    const warningTimeoutRef = useRef<number | null>(null);
    const logoutTimeoutRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);
    const lastActivityResetRef = useRef(0);
    const warningOpenRef = useRef(false);
    const logoutInProgressRef = useRef(false);

    const clearTimers = useCallback(() => {
        if (warningTimeoutRef.current !== null) {
            window.clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }

        if (logoutTimeoutRef.current !== null) {
            window.clearTimeout(logoutTimeoutRef.current);
            logoutTimeoutRef.current = null;
        }

        if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    const logoutNow = useCallback(() => {
        if (logoutInProgressRef.current) {
            return;
        }

        logoutInProgressRef.current = true;
        clearTimers();
        setWarningOpen(false);

        router.post(route('logout'), {}, {
            preserveState: false,
            preserveScroll: false,
            replace: true,
        });
    }, [clearTimers]);

    const startCountdown = useCallback((logoutAt: number) => {
        if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
        }

        const updateCountdown = () => {
            setCountdownSeconds(Math.max(0, Math.ceil((logoutAt - Date.now()) / 1000)));
        };

        updateCountdown();
        countdownIntervalRef.current = window.setInterval(updateCountdown, 250);
    }, []);

    const scheduleIdleTimers = useCallback(() => {
        clearTimers();

        const logoutAt = Date.now() + IDLE_LOGOUT_AFTER_MS;

        warningTimeoutRef.current = window.setTimeout(() => {
            warningOpenRef.current = true;
            setWarningOpen(true);
            startCountdown(logoutAt);
        }, IDLE_WARNING_AFTER_MS);

        logoutTimeoutRef.current = window.setTimeout(() => {
            logoutNow();
        }, IDLE_LOGOUT_AFTER_MS);
    }, [clearTimers, logoutNow, startCountdown]);

    const resetIdleTimers = useCallback(() => {
        if (logoutInProgressRef.current) {
            return;
        }

        warningOpenRef.current = false;
        setWarningOpen(false);
        setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);
        lastActivityResetRef.current = Date.now();
        scheduleIdleTimers();
    }, [scheduleIdleTimers]);

    useEffect(() => {
        warningOpenRef.current = warningOpen;
    }, [warningOpen]);

    useEffect(() => {
        if (!auth.user) {
            return;
        }

        const handleActivity = () => {
            if (logoutInProgressRef.current || warningOpenRef.current) {
                return;
            }

            const now = Date.now();

            if (now - lastActivityResetRef.current < ACTIVITY_RESET_THROTTLE_MS) {
                return;
            }

            lastActivityResetRef.current = now;
            scheduleIdleTimers();
        };

        lastActivityResetRef.current = Date.now();
        scheduleIdleTimers();

        ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, handleActivity, { passive: true });
        });

        return () => {
            clearTimers();

            ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, handleActivity);
            });
        };
    }, [auth.user, clearTimers, scheduleIdleTimers]);

    if (!auth.user) {
        return null;
    }

    return (
        <Dialog open={warningOpen}>
            <DialogContent
                className="max-w-md overflow-hidden rounded-[28px] border-[#14417A]/15 p-0 shadow-2xl [&>button]:hidden"
                onEscapeKeyDown={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
            >
                <div className="bg-gradient-to-br from-[#001A3A] via-[#002753] to-[#0A3E78] p-6 text-white">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                        <Clock3 className="size-3.5" />
                        Session timeout
                    </div>

                    <DialogHeader className="mt-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                                <ShieldAlert className="size-5 text-white" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-xl font-semibold tracking-tight text-white">
                                    You&apos;ll be logged out soon
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-6 text-white/75">
                                    No activity has been detected. Stay signed in to keep working, or the system will end this session automatically.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                            Automatic logout in
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                            {formatCountdown(countdownSeconds)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                            The inactivity policy is set to 3 minutes total, with this final 60-second warning before logout.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="button"
                            className="flex-1 rounded-xl bg-white text-[#002753] hover:bg-white/90"
                            onClick={resetIdleTimers}
                        >
                            Stay signed in
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                            onClick={logoutNow}
                        >
                            <LogOut className="mr-2 size-4" />
                            Log out now
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function formatCountdown(totalSeconds: number) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
