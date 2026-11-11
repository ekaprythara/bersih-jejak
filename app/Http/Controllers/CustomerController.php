<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with('transactions')->latest()->get();

        // Hitung statistik untuk Card
        $totalCustomers = $customers->count();

        // Anggota Baru (Dibuat dalam 7 hari terakhir)
        $newCustomers = $customers->filter(function ($customer) {
            return $customer->created_at && Carbon::parse($customer->created_at)->isAfter(now()->subDays(7));
        })->count();

        // Pelanggan Setia (Memiliki total transaksi >= 2)
        $loyalCustomers = $customers->filter(function ($customer) {
            return $customer->transactions->count() >= 5;
        })->count();

        // Rata-rata transaksi per pelanggan
        $totalTransactionsAll = $customers->sum(function ($customer) {
            return $customer->transactions->count();
        });
        $avgTransactions = $totalCustomers > 0 ? round($totalTransactionsAll / $totalCustomers, 1) : 0;

        return inertia('customer', [
            'customers' => $customers,
            'card' => [
                'total_customers' => $totalCustomers,
                'new_customers' => $newCustomers,
                'loyal_customers' => $loyalCustomers,
                'avg_transactions' => $avgTransactions,
            ],
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        Customer::create($request->validated());

        return redirect()->back();
    }

    public function updateStatus(Request $request, Customer $customer)
    {
        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $customer->status = $request->status;
        $customer->save();

        return redirect()->route('customers.index');
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        $customer->save();

        return redirect()->route('customers.index');
    }
}
