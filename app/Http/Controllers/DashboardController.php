<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DashboardService $dashboardService): Response
    {
        $user = request()->user();
        $dashboard = $dashboardService->for($user);

        if ($user->isSuperAdmin()) {
            return Inertia::render('dashboards/super-admin', $dashboard);
        }

        if ($user->hasRole('company_admin')) {
            return Inertia::render('dashboards/company-admin', $dashboard);
        }

        if ($user->hasRole('reviewer')) {
            return Inertia::render('dashboards/reviewer', $dashboard);
        }

        return Inertia::render('dashboards/employee', $dashboard);
    }
}
