<?php

namespace Database\Factories;

use App\Enums\UserStatus;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeProfileFactory extends Factory
{
    protected $model = EmployeeProfile::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'department_id' => Department::factory(),
            'job_title' => fake()->jobTitle(),
            'branch' => fake()->city(),
            'employee_number' => fake()->bothify('EMP###'),
            'phone' => fake()->phoneNumber(),
            'status' => UserStatus::Active,
        ];
    }
}
