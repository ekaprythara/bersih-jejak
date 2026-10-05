<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');

Route::redirect('/', 'dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('admin/create', [UserController::class, 'store'])->name("admin.store");
    Route::patch('admin/{admin}/status', [UserController::class, 'updateStatus'])->name("admin.updateStatus");
    Route::patch('admin/{admin}/edit', [UserController::class, 'update'])->name("admin.update");

    Route::get('branches', [BranchController::class, 'index'])->name("branches.index");
    Route::post('branches/create', [BranchController::class, 'store'])->name("branches.store");
    Route::patch('branches/{branch}/status', [BranchController::class, 'updateStatus'])->name("branches.updateStatus");
});

require __DIR__ . '/settings.php';
