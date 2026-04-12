<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\AcceptInvitationRequest;
use App\Http\Requests\EmployeeInvitationRequest;
use App\Models\Department;
use App\Models\Invitation;
use App\Models\Tenant;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvitationController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(protected InvitationService $invitationService)
    {
    }

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Invitation::class);

        $filters = $this->validateIndex($request, ['name', 'role', 'created_at', 'updated_at'], [
            'role' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'department_id' => ['nullable', 'integer'],
        ]);

        $query = Invitation::query()->with(['department', 'inviter']);
        $this->applySearch($query, $filters['search'] ?? null, ['name', 'email']);
        $this->applyFilters($query, $filters, [
            'role' => 'role',
            'department_id' => 'department_id',
            'status' => function ($builder, $value) {
                if ($value === 'accepted') {
                    $builder->whereNotNull('accepted_at');
                } elseif ($value === 'expired') {
                    $builder->whereNull('accepted_at')->where('expires_at', '<', now());
                } elseif ($value === 'pending') {
                    $builder->whereNull('accepted_at')->where('expires_at', '>=', now());
                }
            },
        ]);
        $this->applySort($query, [
            'name' => 'name',
            'role' => 'role',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(function (Invitation $invitation) {
                $status = $invitation->accepted_at ? 'accepted' : ($invitation->expires_at->isPast() ? 'expired' : 'pending');

                return [
                    $invitation->name,
                    $invitation->email,
                    $invitation->role,
                    $invitation->department?->name ?: 'Unassigned',
                    $status,
                ];
            })->all();

            return $this->queueTableExport($request, 'invitations.index', $filters, ['Name', 'Email', 'Role', 'Department', 'Status'], $rows, 'Invitations');
        }

        return Inertia::render('invitations/index', [
            'invitations' => $query->paginate($this->perPage($filters))->withQueryString(),
            'departments' => Department::query()->orderBy('name')->get(),
            'filters' => $filters,
            'stats' => [
                'total' => Invitation::query()->count(),
                'pending' => Invitation::query()->whereNull('accepted_at')->where('expires_at', '>=', now())->count(),
                'accepted' => Invitation::query()->whereNotNull('accepted_at')->count(),
                'expired' => Invitation::query()->whereNull('accepted_at')->where('expires_at', '<', now())->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Invitation::class);

        $user = request()->user();
        $departmentsQuery = Department::query()->orderBy('name');
        $recentInvitationsQuery = Invitation::query()
            ->with(['tenant:id,name', 'department:id,name'])
            ->latest()
            ->limit(8);

        if ($user && ! $user->isSuperAdmin()) {
            $departmentsQuery->where('tenant_id', $user->tenant_id);
            $recentInvitationsQuery->where('tenant_id', $user->tenant_id);
        }

        return Inertia::render('invitations/create', [
            'departments' => $departmentsQuery->get(),
            'tenants' => $user?->isSuperAdmin() ? Tenant::query()->orderBy('name')->get(['id', 'name', 'status']) : [],
            'isSuperAdmin' => (bool) $user?->isSuperAdmin(),
            'recentInvitations' => $recentInvitationsQuery
                ->get()
                ->map(fn (Invitation $invitation) => [
                    'id' => $invitation->id,
                    'name' => $invitation->name,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'tenant' => $invitation->tenant?->name,
                    'department' => $invitation->department?->name,
                    'created_at' => $invitation->created_at?->toISOString(),
                    'expires_at' => $invitation->expires_at?->toISOString(),
                    'accepted_at' => $invitation->accepted_at?->toISOString(),
                    'status' => $invitation->accepted_at ? 'accepted' : ($invitation->expires_at->isPast() ? 'expired' : 'pending'),
                ]),
        ]);
    }

    public function store(EmployeeInvitationRequest $request): RedirectResponse
    {
        $this->authorize('create', Invitation::class);
        $this->invitationService->create($request->validated(), $request->user());

        return back()->with('success', 'Invitation queued for delivery.');
    }

    public function destroy(Invitation $invitation): RedirectResponse
    {
        $this->authorize('delete', $invitation);
        $oldValues = $invitation->toArray();
        $invitation->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('invitation_deleted', $invitation, $oldValues);

        return back()->with('success', 'Invitation deleted.');
    }

    public function acceptShow(string $token): Response
    {
        $invitation = Invitation::query()->where('token', $token)->firstOrFail();
        abort_if($invitation->accepted_at || $invitation->expires_at->isPast(), 403);

        return Inertia::render('invitations/accept', [
            'invitation' => $invitation,
        ]);
    }

    public function accept(AcceptInvitationRequest $request, string $token): RedirectResponse
    {
        $invitation = Invitation::query()->where('token', $token)->firstOrFail();
        abort_if($invitation->accepted_at || $invitation->expires_at->isPast(), 403);

        $user = $this->invitationService->accept($invitation, $request->validated());
        Auth::login($user);

        return to_route('dashboard')->with('success', 'Invitation accepted.');
    }
}
