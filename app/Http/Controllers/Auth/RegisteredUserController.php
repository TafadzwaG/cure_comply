<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterTenantRequest;
use App\Services\TenantRegistrationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(protected TenantRegistrationService $tenantRegistrationService)
    {
    }

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterTenantRequest $request): RedirectResponse
    {
        $user = $this->tenantRegistrationService->register($request->validated());

        event(new Registered($user));

        Auth::login($user);

        return to_route('tenant.activation.pending')->with('success', 'Registration submitted successfully. We will notify you when your company is activated.');
    }
}
