<?php

namespace App\Rules;

use App\Support\PhoneNumber;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPhoneNumber implements ValidationRule
{
    public function __construct(
        protected bool $required = false,
    ) {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (PhoneNumber::isValid(is_string($value) ? $value : null, $this->required)) {
            return;
        }

        $fail('Enter a valid phone number using the country code dropdown.');
    }
}
