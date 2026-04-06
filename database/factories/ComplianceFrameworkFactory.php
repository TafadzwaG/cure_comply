<?php

namespace Database\Factories;

use App\Models\ComplianceFramework;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplianceFrameworkFactory extends Factory
{
    protected $model = ComplianceFramework::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Data Protection Readiness', 'Cyber Hygiene Baseline']),
            'version' => '1.0',
            'description' => fake()->paragraph(),
            'status' => 'published',
        ];
    }
}
