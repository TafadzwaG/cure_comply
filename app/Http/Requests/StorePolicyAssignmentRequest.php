<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePolicyAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::ASSIGN_POLICIES);
    }

    public function rules(): array
    {
        return [
            'library_file_id' => ['required', 'integer', Rule::exists('library_files', 'id')],
            'assigned_to_user_ids' => ['nullable', 'array'],
            'assigned_to_user_ids.*' => ['integer', Rule::exists('users', 'id')],
            'department_ids' => ['nullable', 'array'],
            'department_ids.*' => ['integer', Rule::exists('departments', 'id')],
            'due_date' => ['required', 'date', 'after_or_equal:today'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $userIds = collect($this->input('assigned_to_user_ids', []))->filter();
            $departmentIds = collect($this->input('department_ids', []))->filter();

            if ($userIds->isEmpty() && $departmentIds->isEmpty()) {
                $validator->errors()->add('assigned_to_user_ids', 'Select at least one user or department.');
            }
        });
    }
}
