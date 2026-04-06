<?php

namespace Database\Factories;

use App\Models\ComplianceQuestion;
use App\Models\ComplianceSection;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplianceQuestionFactory extends Factory
{
    protected $model = ComplianceQuestion::class;

    public function definition(): array
    {
        return [
            'compliance_section_id' => ComplianceSection::factory(),
            'code' => 'DP-'.fake()->unique()->numberBetween(1, 999),
            'question_text' => fake()->sentence().'?',
            'answer_type' => fake()->randomElement(['yes_no_partial', 'text', 'score', 'date']),
            'weight' => fake()->numberBetween(1, 5),
            'requires_evidence' => fake()->boolean(),
            'guidance_text' => fake()->optional()->sentence(),
            'sort_order' => fake()->numberBetween(1, 12),
            'is_active' => true,
        ];
    }
}
