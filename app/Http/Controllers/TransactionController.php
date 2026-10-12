<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        return inertia("transaction", [
            "transactions" => Transaction::with(["customer", "service", "transactionStatus", "paymentStatus", "paymentMethod"])->get(),
            "customers" => Customer::get(['id', 'name']),
            "services" => Service::get(['id', 'name', 'price']),
            "paymentMethods" => PaymentMethod::get(['id', 'name']),
            "paymentStatuses" => PaymentStatus::get(['id', 'name'])
        ]);
    }

    public function store(StoreTransactionRequest $request)
    {
        // 1. Ambil data layanan untuk mendapatkan harga (price)
        $service = Service::findOrFail($request->service_id);

        // 2. Hitung total amount otomatis (Harga Layanan * Jumlah Sepatu)
        $totalAmount = $service->price * $request->shoe_count;

        // 3. Tentukan status transaksi awal secara otomatis 
        // Contoh: ID 1 asumsikan sebagai status "Pending" atau "Baru/Proses"
        $defaultTransactionStatusId = 1;

        // 4. Simpan data ke tabel transactions
        Transaction::create([
            'customer_id'             => $request->customer_id,
            'transaction_date'        => $request->transaction_date,
            'pickup_date'             => $request->pickup_date,
            'service_id'              => $request->service_id,
            'shoe_count'              => $request->shoe_count,
            'total_amount'            => $totalAmount,                  // Otomatis dari backend
            'payment_method_id'       => $request->payment_method_id,
            'payment_status_id'       => $request->payment_status_id,
            'transaction_status_id'   => $defaultTransactionStatusId,   // Otomatis dari backend
            'description'             => $request->description,
        ]);

        // 5. Redirect dengan pesan sukses
        return redirect()->route('transactions.index');
    }
}
