<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Branch>
 */
class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'name'         => 'Cabang ' . $this->faker->city(),
            'address'      => $this->faker->address(), // Tambahkan ini
            'phone_number' => $this->faker->phoneNumber(), // Tambahkan ini jika wajib
            'status'       => true,
        ];
    }
}
