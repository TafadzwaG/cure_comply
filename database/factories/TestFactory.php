<?php

namespace Database\Factories;

use App\Enums\TestStatus;
use App\Models\Course;
use App\Models\Test;
use Illuminate\Database\Eloquent\Factories\Factory;

class TestFactory extends Factory
{
    protected $model = Test::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'pass_mark' => 70,
            'time_limit_minutes' => 30,
            'max_attempts' => 2,
            'status' => TestStatus::Published,
        ];
    }
}
