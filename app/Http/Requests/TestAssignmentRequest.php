<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class TestAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) ($this->user()?->hasRole('company_admin') || $this->user()?->can(Permissions::MANAGE_TESTS));
    }

    public function rules(): array
    {
        return [
            'assigned_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'assigned_to_user_ids' => ['nullable', 'array', 'min:1'],
            'assigned_to_user_ids.*' => ['integer', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $singleAssignee = $this->filled('assigned_to_user_id');
            $multipleAssignees = filled($this->input('assigned_to_user_ids')) && is_array($this->input('assigned_to_user_ids'));

            if (! $singleAssignee && ! $multipleAssignees) {
                $validator->errors()->add('assigned_to_user_ids', 'Select at least one employee.');
            }
        });
    }
}
