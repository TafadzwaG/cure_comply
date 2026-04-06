<?php

namespace App\Http\Requests;

use App\Models\Department;
use App\Models\Tenant;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EmployeeInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::INVITE_EMPLOYEES);
    }

    public function rules(): array
    {
        $isSuperAdmin = (bool) $this->user()?->isSuperAdmin();
        $isPlatformAdmin = $this->boolean('is_platform_admin');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'department_id' => ['nullable', 'integer'],
            'tenant_id' => [
                Rule::requiredIf($isSuperAdmin && ! $isPlatformAdmin),
                'nullable',
                'integer',
                Rule::exists(Tenant::class, 'id'),
            ],
            'is_platform_admin' => ['nullable', 'boolean'],
            'role' => [
                Rule::requiredIf(! $isPlatformAdmin),
                'nullable',
                Rule::in($isSuperAdmin ? ['employee', 'reviewer', 'company_admin', 'super_admin'] : ['employee', 'reviewer', 'company_admin']),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_platform_admin' => $this->boolean('is_platform_admin'),
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $isSuperAdmin = (bool) $this->user()?->isSuperAdmin();
            $isPlatformAdmin = $this->boolean('is_platform_admin');
            $tenantId = $this->input('tenant_id');
            $departmentId = $this->input('department_id');
            $role = $this->input('role');

            if ($isPlatformAdmin) {
                if (! $isSuperAdmin) {
                    $validator->errors()->add('is_platform_admin', 'Only super admins can invite platform administrators.');
                }

                return;
            }

            if (! $role) {
                $validator->errors()->add('role', 'Please select a role for the invitation.');
            }

            if ($departmentId) {
                $department = Department::query()
                    ->withoutGlobalScopes()
                    ->find($departmentId);

                if (! $department) {
                    $validator->errors()->add('department_id', 'The selected department is invalid.');

                    return;
                }

                $expectedTenantId = $isSuperAdmin ? (int) $tenantId : (int) $this->user()?->tenant_id;

                if (! $expectedTenantId || (int) $department->tenant_id !== $expectedTenantId) {
                    $validator->errors()->add('department_id', 'The selected department does not belong to the selected company.');
                }
            }
        });
    }
}
