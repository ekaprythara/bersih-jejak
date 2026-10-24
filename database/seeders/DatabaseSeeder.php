<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Expense;
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
        Role::factory()->create([
            'name' => 'Owner',
        ]);
        Role::factory()->create([
            'name' => 'Admin',
        ]);

        Branch::factory()->create([
            'name' => 'Pandu',
            'address' => 'Jalan Pandu No. 12, Sumerta Kelod, Denpasar, Bali',
            'phone_number' => '0881082058766'
        ]);
        Branch::factory()->create([
            'name' => 'Tukad Badung',
            'address' => 'Jalan Tukad Badung XX No. 8A, Dauh Puri Kelod, Denpasar, Bali',
            'phone_number' => '0881080498066'
        ]);

        User::factory()->create([
            'name' => 'Mahayana',
            'username' => 'mahayana',
            'address' => 'Jalan Mawar No. 10',
            'phone_number' => '085877775555',
            'email' => 'mahayana@example.com',
            'role_id' => 1 // Owner
        ]);
        User::factory()->create([
            'name' => 'Yudi',
            'username' => 'yudi',
            'address' => 'Jalan Sandat',
            'phone_number' => '085877775558',
            'email' => 'yudi@example.com',
            'role_id' => 2, // Admin
            'branch_id' => 1, // Pandu
        ]);
        User::factory()->create([
            'name' => 'Chandra',
            'username' => 'chandra',
            'address' => 'Jalan Nangka',
            'phone_number' => '085877775557',
            'email' => 'chandra@example.com',
            'role_id' => 2, // Admin
            'branch_id' => 2, // Tukad Badung
        ]);

        ExpenseCategory::factory()->create([
            "name" => "Air & Listrik"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Pemasaran"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Internet"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Pemeliharaan"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Tranportasi"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Sewa Tempat"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Administrasi"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Gaji"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Retribusi"
        ]);
        ExpenseCategory::factory()->create([
            "name" => "Lainnya"
        ]);

        // 5. Services (Layanan, Harga, & Estimasi Hari Pengerjaan)
        Service::factory()->create([
            'name' => 'Regular Clean',
            'price' => 20000,
            'estimated_days' => 2
        ]);
        Service::factory()->create([
            'name' => 'Deep Clean',
            'price' => 35000,
            'estimated_days' => 3
        ]);
        Service::factory()->create([
            'name' => 'Hard Deep Clean',
            'price' => 40000,
            'estimated_days' => 3
        ]);

        Customer::factory()->create([
            'name' => 'Budi Santoso',
            'phone_number' => '081234567890',
            'email' => 'budi@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Siti Aminah',
            'phone_number' => '081234567891',
            'email' => 'siti@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Ahmad Fauzi',
            'phone_number' => '081234567892',
            'email' => 'ahmad@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Dewi Lestari',
            'phone_number' => '081234567893',
            'email' => 'dewi@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Kadek Arta',
            'phone_number' => '081234567894',
            'email' => 'kadek@example.com',
            'status' => false,
        ]);
        Customer::factory()->create([
            'name' => 'Rina Wijaya',
            'phone_number' => '081234567895',
            'email' => 'rina@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Eko Prasetyo',
            'phone_number' => '081234567896',
            'email' => 'eko@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Siska Melina',
            'phone_number' => '081234567897',
            'email' => 'siska@example.com',
            'status' => false,
        ]);
        Customer::factory()->create([
            'name' => 'Doni Setiawan',
            'phone_number' => '081234567898',
            'email' => 'doni@example.com',
            'status' => true,
        ]);
        Customer::factory()->create([
            'name' => 'Putri Utami',
            'phone_number' => '081234567899',
            'email' => 'putri@example.com',
            'status' => true,
        ]);

        TransactionStatus::factory()->create(['name' => 'Pending']);
        TransactionStatus::factory()->create(['name' => 'Proses']);
        TransactionStatus::factory()->create(['name' => 'Selesai']);

        PaymentStatus::factory()->create(['name' => 'Belum Lunas']);
        PaymentStatus::factory()->create(['name' => 'Lunas']);

        PaymentMethod::factory()->create(['name' => 'Transfer Bank']);
        PaymentMethod::factory()->create(['name' => 'QRIS']);
        PaymentMethod::factory()->create(['name' => 'Cash']);

        Expense::factory()->count(15)->create();

        Transaction::factory()->count(20)->create();
    }
}
