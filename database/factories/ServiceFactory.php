<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Tambahkan definisi data di sini agar factory tahu cara mengisi kolomnya
            'name' => $this->faker->randomElement(['Express Clean', 'Premium Wash', 'Care Shoe Treatment', 'Leather Care', 'Upholstery Clean']) . ' ' . $this->faker->unique()->numberBetween(1, 100),
            'price' => $this->faker->numberBetween(15, 100) * 1000, // Harga acak kelipatan 1000
            'estimated_days' => $this->faker->numberBetween(1, 5),   // Estimasi 1-5 hari
        ];
    }
}
