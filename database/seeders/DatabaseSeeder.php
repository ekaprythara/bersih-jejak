<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        Role::factory()->create([
            'name' => 'Owner',
        ]);

        Role::factory()->create([
            'name' => 'Admin',
        ]);

        Branch::factory()->create([
            'name' => 'Pandu',
            'address' => 'Jalan Pandu',
            'phone_number' => '085577775555'
        ]);

        User::factory()->create([
            'name' => 'Owner User',
            'username' => 'owner',
            'address' => 'Jalan Kamboja',
            'phone_number' => '085877775555',
            'email' => 'owner@example.com',
            'role_id' => 1
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'address' => 'Jalan Sandat',
            'phone_number' => '085877775558',
            'email' => 'admin@example.com',
            'role_id' => 2,
            'branch_id' => 1,
        ]);
    }
}
