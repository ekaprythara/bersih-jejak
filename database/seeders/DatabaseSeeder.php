<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\ExpenseCategory;
use App\Models\PaymentMethod;
use App\Models\Role;
use App\Models\User;
use App\Models\Service;
use App\Models\TransactionStatus;
use App\Models\PaymentStatus;
use App\Models\Transaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        Role::factory()->create([
            'name' => 'Owner',
        ]);

        Role::factory()->create([
            'name' => 'Admin',
        ]);

        // 2. Branch
        Branch::factory()->create([
            'name' => 'Pandu',
            'address' => 'Jalan Pandu',
            'phone_number' => '085577775555'
        ]);

        // 3. Users
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

        // 4. Expense Category
        ExpenseCategory::factory()->create([
            "name" => "Air & Listrik"
        ]);

        // 5. Services (Layanan, Harga, & Estimasi Hari Pengerjaan)
        Service::factory()->create([
            'name' => 'Cuci Reguler',
            'price' => 10000,          // Rp 10.000
            'estimated_days' => 3      // Estimasi 3 hari
        ]);

        Service::factory()->create([
            'name' => 'Cuci Kilat',
            'price' => 20000,          // Rp 20.000
            'estimated_days' => 1      // Estimasi 1 hari
        ]);

        Customer::factory()->create([
            'name' => 'Budi Santoso',
            'phone_number' => '081234567890',
            'email' => 'budi@example.com',
            'status' => true,
        ]);
        // 6. Transaction Statuses (Status transaksi)
        TransactionStatus::factory()->create(['name' => 'Pending']);
        TransactionStatus::factory()->create(['name' => 'Proses']);
        TransactionStatus::factory()->create(['name' => 'Selesai']);

        // 7. Payment Statuses (Status pembayaran)
        PaymentStatus::factory()->create(['name' => 'Belum Lunas']);
        PaymentStatus::factory()->create(['name' => 'Lunas']);

        PaymentMethod::factory()->create(['name' => 'Transfer Bank']);

        PaymentMethod::factory()->create(['name' => 'QRIS']);

        PaymentMethod::factory()->create(['name' => 'Cash']);


        // 8. Sample Transaction (Contoh data transaksi awal)
        Transaction::factory()->create([
            'customer_id' => 1, // Admin User
            'transaction_date' => Carbon::now(),
            'pickup_date' => Carbon::now()->addDays(3), // Tanggal ambil 3 hari kedepan
            'service_id' => 1, // Cuci Reguler
            'transaction_status_id' => 1, // Pending
            'payment_status_id' => 1, // Belum Lunas
            'payment_method_id' => 3, // cash
            'description' => "asdasdasas",
            'before_image_url' => null,
            'before_image_public_id' => null,
            'after_image_url' => null,
            'after_image_public_id' => null,
        ]);
    }
}
