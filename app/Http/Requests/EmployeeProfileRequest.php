<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\NormalizesPhoneNumbers;
use App\Rules\ValidPhoneNumber;
use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class EmployeeProfileRequest extends FormRequest
{
    use NormalizesPhoneNumbers;

    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_USERS);
    }

    protected function prepareForValidation(): void
    {
        $this->normalizePhoneInputs(['phone', 'alternate_phone']);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.($this->route('employeeProfile')?->user_id ?? 'NULL')],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'manager_id' => ['nullable', 'integer', 'exists:users,id'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'risk_level' => ['nullable', 'string', 'max:50'],
            'branch' => ['nullable', 'string', 'max:255'],
            'employee_number' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', new ValidPhoneNumber()],
            'alternate_phone' => ['nullable', new ValidPhoneNumber()],
        ];
    }
}
