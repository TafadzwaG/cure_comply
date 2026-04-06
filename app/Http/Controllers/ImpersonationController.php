<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Lab404\Impersonate\Services\ImpersonateManager;

class ImpersonationController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected ImpersonateManager $impersonateManager,
    )
    {
    }

    public function start(User $user): RedirectResponse
    {
        abort_unless(request()->user()?->can('impersonate users'), 403);
        abort_if($user->isSuperAdmin(), 403);

        request()->user()->impersonate($user);
        $this->auditLogService->log('impersonation_started', User::class, $user->id);

        return to_route('dashboard')->with('success', 'Impersonation started.');
    }

    public function stop(): RedirectResponse
    {
        $impersonator = $this->impersonateManager->getImpersonator();
        auth()->user()?->leaveImpersonation();

        if ($impersonator) {
            $this->auditLogService->log('impersonation_stopped', User::class, $impersonator->id);
        }

        return to_route('dashboard')->with('success', 'Impersonation stopped.');
    }
}
