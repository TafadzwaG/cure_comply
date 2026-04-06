<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EvidenceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::REVIEW_EVIDENCE);
    }

    public function rules(): array
    {
        return [
            'review_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'review_comment' => ['nullable', 'string'],
        ];
    }
}
