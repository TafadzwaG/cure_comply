<?php

namespace Database\Factories;

use App\Enums\TenantStatus;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'registration_number' => fake()->optional()->bothify('REG-####'),
            'industry' => fake()->randomElement(['Finance', 'Healthcare', 'Retail', 'Technology']),
            'company_size' => fake()->randomElement(['1-50', '51-200', '201-500']),
            'contact_name' => fake()->name(),
            'contact_email' => fake()->safeEmail(),
            'contact_phone' => fake()->phoneNumber(),
            'status' => TenantStatus::Active,
        ];
    }
}
