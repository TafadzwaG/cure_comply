<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeProfileCompletionRequest;
use App\Models\EmployeeProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeProfileCompletionController extends Controller
{
    public function edit(): Response|RedirectResponse
    {
        $user = auth()->user()?->loadMissing('employeeProfile.department');

        abort_unless($user, 403);

        if (! $user->requiresProfileCompletion()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('employees/complete-profile', [
            'employeeProfile' => $user->employeeProfile,
            'role' => $user->display_role,
            'department' => $user->employeeProfile?->department
                ? [
                    'id' => $user->employeeProfile->department->id,
                    'name' => $user->employeeProfile->department->name,
                ]
                : null,
        ]);
    }

    public function update(EmployeeProfileCompletionRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user, 403);

        $payload = $request->validated();

        $user->update([
            'name' => $payload['name'],
        ]);

        $user->employeeProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'tenant_id' => $user->tenant_id,
                'status' => $user->status?->value ?? $user->getRawOriginal('status') ?? 'active',
                'job_title' => $payload['job_title'],
                'branch' => $payload['branch'],
                'phone' => $payload['phone'],
                'alternate_phone' => $payload['alternate_phone'] ?? null,
                'employment_type' => $payload['employment_type'] ?? null,
            ],
        );

        return redirect()->route('dashboard')->with('success', 'Your profile has been completed.');
    }
}
