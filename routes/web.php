<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FinancialReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');

Route::redirect('/', 'dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('admin/create', [UserController::class, 'store'])->name("admin.store");
    Route::patch('admin/{admin}/status', [UserController::class, 'updateStatus'])->name("admin.updateStatus");
    Route::patch('admin/{admin}/edit', [UserController::class, 'update'])->name("admin.update");

    Route::get('transactions', [TransactionController::class, 'index'])->name("transactions.index");
    Route::post('transactions/create', [TransactionController::class, 'store'])->name("transactions.store");
    Route::patch('transactions/{transaction}/edit', [TransactionController::class, 'update'])->name('transactions.update');
    Route::get('transactions/print', [TransactionController::class, 'printPdf'])->name('transactions.printPdf');
    Route::get('transactions/{transaction}/print-transaction', [TransactionController::class, 'printTransaction'])->name('transactions.printTransaction');
    Route::get('transactions/export', [TransactionController::class, 'exportExcel'])->name('transactions.exportExcel');


    Route::get('customers', [CustomerController::class, 'index'])->name("customers.index");
    Route::post('customers/create', [CustomerController::class, 'store'])->name("customers.store");
    Route::patch('customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customers.updateStatus');
    Route::patch('customers/{customer}/edit', [CustomerController::class, 'update'])->name('customers.update');

    Route::middleware(['owner'])->group(function () {
        Route::get('services', [ServiceController::class, 'index'])->name("services.index");
        Route::post('services/create', [ServiceController::class, 'store'])->name("services.store");
        Route::patch('services/{service}/status', [ServiceController::class, 'updateStatus'])->name('services.updateStatus');
        Route::patch('services/{service}/edit', [ServiceController::class, 'update'])->name('services.update');

        //* Admin & Cabang
        Route::get('branches', [BranchController::class, 'index'])->name("branches.index");
        Route::post('branches/create', [BranchController::class, 'store'])->name("branches.store");
        Route::patch('branches/{branch}/status', [BranchController::class, 'updateStatus'])->name("branches.updateStatus");
        Route::patch('branches/{branch}/edit', [BranchController::class, 'update'])->name('branches.update');

        Route::get('financial-report', [FinancialReportController::class, 'index'])->name("financial.report.index");
        Route::get('financial-report/print', [FinancialReportController::class, 'printPdf'])->name("financial.report.printPdf");
        Route::get('financial-report/export', [FinancialReportController::class, 'exportExcel'])->name('financial-report.exportExcel');
    });

    Route::get('expenses', [ExpenseController::class, 'index'])->name("expenses.index");
    Route::post('expenses/create', [ExpenseController::class, 'store'])->name("expenses.store");
    Route::patch('expenses/{expense}/status', [ExpenseController::class, 'updateStatus'])->name("expenses.updateStatus");
    Route::patch('expenses/{expense}/edit', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::get('expenses/print', [ExpenseController::class, 'printPdf'])->name('expenses.printPdf');
    Route::get('expenses/export', [ExpenseController::class, 'exportExcel'])->name('expenses.exportExcel');
});

require __DIR__ . '/settings.php';
