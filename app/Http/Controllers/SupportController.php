<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();

        $quickLinks = [
            ['label' => 'Dashboard', 'href' => route('dashboard'), 'description' => 'Return to your role-specific operating dashboard.'],
            ['label' => 'Update profile', 'href' => route('profile.edit'), 'description' => 'Keep your name, email, and account details current.'],
            ['label' => 'Notifications', 'href' => route('notifications.index'), 'description' => 'Review unread workflow alerts and export updates.'],
        ];

        if ($user?->hasRole('super_admin')) {
            array_splice($quickLinks, 1, 0, [
                ['label' => 'Review tenants', 'href' => route('tenants.index'), 'description' => 'Open tenant approvals, activation status, and workspace records.'],
                ['label' => 'Manage users', 'href' => route('users.index'), 'description' => 'Update user access, lifecycle status, and profile records.'],
                ['label' => 'Reports', 'href' => route('reports.index'), 'description' => 'Generate compliance and training reports across the platform.'],
            ]);
        } elseif ($user?->hasRole('company_admin')) {
            array_splice($quickLinks, 1, 0, [
                ['label' => 'Employees', 'href' => route('employees.index'), 'description' => 'Manage employee records, departments, and training readiness.'],
                ['label' => 'Invitations', 'href' => route('invitations.index'), 'description' => 'Invite tenant users and review queued invitation status.'],
                ['label' => 'Assignments', 'href' => route('assignments.index'), 'description' => 'Track mandatory course assignments and overdue work.'],
                ['label' => 'Reports', 'href' => route('reports.index'), 'description' => 'Generate tenant-scoped compliance and training reports.'],
            ]);
        } elseif ($user?->hasRole('reviewer')) {
            array_splice($quickLinks, 1, 0, [
                ['label' => 'Evidence queue', 'href' => route('evidence.index'), 'description' => 'Review uploaded evidence files and decision history.'],
                ['label' => 'Submissions', 'href' => route('submissions.index'), 'description' => 'Open submissions that need review or scoring attention.'],
            ]);
        } else {
            array_splice($quickLinks, 1, 0, [
                ['label' => 'Continue training', 'href' => route('courses.index'), 'description' => 'Open mandatory and public course workspaces.'],
                ['label' => 'Review assignments', 'href' => route('assignments.index'), 'description' => 'Check due dates, progress, and next actions.'],
                ['label' => 'Open submissions', 'href' => route('submissions.index'), 'description' => 'Find compliance responses assigned to you.'],
                ['label' => 'Certificates', 'href' => route('certificates.index'), 'description' => 'Download earned course and test certificates.'],
            ]);
        }

        return Inertia::render('help/index', [
            'quickLinks' => $quickLinks,
        ]);
    }
}
