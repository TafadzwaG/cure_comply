<?php

namespace App\Http\Requests;

use App\Enums\ComplianceSubmissionStatus;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ComplianceSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_COMPLIANCE_SUBMISSIONS);
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['nullable', 'integer', 'exists:tenants,id'],
            'compliance_framework_id' => ['required', 'integer', 'exists:compliance_frameworks,id'],
            'title' => ['required', 'string', 'max:255'],
            'reporting_period' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(array_column(ComplianceSubmissionStatus::cases(), 'value'))],
            'assigned_to_user_ids' => ['nullable', 'array'],
            'assigned_to_user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
