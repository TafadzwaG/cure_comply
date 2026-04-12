<?php

namespace App\Http\Requests\Concerns;

use App\Support\PhoneNumber;

trait NormalizesPhoneNumbers
{
    /**
     * @param  list<string>  $fields
     */
    protected function normalizePhoneInputs(array $fields): void
    {
        $payload = [];

        foreach ($fields as $field) {
            if (! $this->exists($field)) {
                continue;
            }

            $payload[$field] = PhoneNumber::normalize($this->input($field));
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }
}
