<?php

namespace Database\Factories;

use App\Models\ComplianceFramework;
use App\Models\ComplianceSubmission;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplianceSubmissionFactory extends Factory
{
    protected $model = ComplianceSubmission::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'compliance_framework_id' => ComplianceFramework::factory(),
            'title' => fake()->sentence(3),
            'reporting_period' => '2026-Q1',
            'status' => 'draft',
        ];
    }
}
