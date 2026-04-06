<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class CourseAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::ASSIGN_TRAINING);
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer'],
            'assigned_to_user_id' => ['required', 'integer'],
            'due_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }
}
