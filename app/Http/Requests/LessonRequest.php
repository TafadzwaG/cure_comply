<?php

namespace App\Http\Requests;

use App\Models\Lesson;
use App\Support\Permissions;
use App\Support\TrustedVideoEmbed;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can(Permissions::MANAGE_COURSES);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content_type' => ['required', 'string', Rule::in(['text', 'video', 'file'])],
            'content_body' => ['nullable', 'string'],
            'video_url' => [
                'nullable',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ($this->input('content_type') !== 'video' || blank($value)) {
                        return;
                    }

                    if (! TrustedVideoEmbed::normalize((string) $value)) {
                        $fail('Only trusted YouTube and Vimeo links are supported.');
                    }
                },
            ],
            'file' => ['nullable', 'file', 'max:20480'],
            'remove_file' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', 'string', Rule::in(['draft', 'published'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('content_type');
            $lesson = $this->route('lesson');

            if ($type === 'text' && blank($this->input('content_body'))) {
                $validator->errors()->add('content_body', 'Text lessons require lesson content.');
            }

            if ($type === 'video' && blank($this->input('video_url'))) {
                $validator->errors()->add('video_url', 'Video lessons require a trusted video link.');
            }

            if ($type === 'file') {
                $hasExistingFile = $lesson instanceof Lesson && filled($lesson->file_path) && ! $this->boolean('remove_file');

                if (! $this->hasFile('file') && ! $hasExistingFile) {
                    $validator->errors()->add('file', 'File lessons require an attachment.');
                }

                if ($this->boolean('remove_file') && ! $this->hasFile('file') && $lesson instanceof Lesson) {
                    $validator->errors()->add('file', 'Upload a replacement file before removing the current attachment.');
                }
            }
        });
    }
}
