<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');

Route::redirect('/', 'dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('admin/create', [UserController::class, 'store'])->name("admin.store");
    Route::patch('admin/{admin}/status', [UserController::class, 'updateStatus'])->name("admin.updateStatus");
    Route::patch('admin/{admin}/edit', [UserController::class, 'update'])->name("admin.update");

    Route::get('customers', [CustomerController::class, 'index'])->name("customers.index");
    Route::post('customers/create', [CustomerController::class, 'store'])->name("customers.store");
    Route::patch('customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customers.updateStatus');
    Route::patch('customers/{customer}/edit', [CustomerController::class, 'update'])->name('customers.update');

    Route::get('services', [ServiceController::class, 'index'])->name("services.index");
    Route::post('services/create', [ServiceController::class, 'store'])->name("services.store");
    Route::patch('services/{service}/status', [ServiceController::class, 'updateStatus'])->name('services.updateStatus');
    Route::patch('services/{service}/edit', [ServiceController::class, 'update'])->name('services.update');

    Route::get('expenses', [ExpenseController::class, 'index'])->name("expenses.index");
    Route::post('expenses/create', [ExpenseController::class, 'store'])->name("expenses.store");
    Route::patch('expenses/{expense}/status', [ExpenseController::class, 'updateStatus'])->name("expenses.updateStatus");
    Route::patch('expenses/{expense}/edit', [ExpenseController::class, 'update'])->name('expenses.update');

    Route::get('branches', [BranchController::class, 'index'])->name("branches.index");
    Route::post('branches/create', [BranchController::class, 'store'])->name("branches.store");
    Route::patch('branches/{branch}/status', [BranchController::class, 'updateStatus'])->name("branches.updateStatus");
    Route::patch('branches/{branch}/edit', [BranchController::class, 'update'])->name('branches.update');
});

require __DIR__ . '/settings.php';
