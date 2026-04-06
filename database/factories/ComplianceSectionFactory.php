<?php

namespace Database\Factories;

use App\Models\ComplianceFramework;
use App\Models\ComplianceSection;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplianceSectionFactory extends Factory
{
    protected $model = ComplianceSection::class;

    public function definition(): array
    {
        return [
            'compliance_framework_id' => ComplianceFramework::factory(),
            'name' => fake()->randomElement(['Governance', 'Data Handling', 'Access Control', 'Incident Response']),
            'description' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(1, 5),
            'weight' => fake()->numberBetween(1, 3),
        ];
    }
}
