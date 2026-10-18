<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Services\CloudinaryService;
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
            "paymentStatuses" => PaymentStatus::get(['id', 'name']),
            "transactionStatuses" => TransactionStatus::get(['id', 'name'])
        ]);
    }

    public function store(StoreTransactionRequest $request, CloudinaryService $cloudinaryService)
    {
        // 1. Ambil data layanan untuk mendapatkan harga (price)
        $service = Service::findOrFail($request->service_id);

        // 2. Hitung total amount otomatis (Harga Layanan * Jumlah Sepatu)
        $totalAmount = $service->price * $request->shoe_count;

        // 3. Tentukan status transaksi awal secara otomatis (Contoh: ID 1 untuk Pending/Proses)
        $defaultTransactionStatusId = 1;

        // 4. Handle upload gambar jika ada
        $imageUrl = null;
        $imagePublicId = null;
        if ($request->hasFile('image')) {
            $uploadedFile = $cloudinaryService->upload($request->file('image'), 'transactions');

            $imageUrl = $uploadedFile['secure_url'] ?? null;
            $imagePublicId = $uploadedFile['public_id'] ?? null;
        }

        // 5. Simpan data ke database dalam satu kali eksekusi
        Transaction::create(array_merge(
            $request->validated(),
            [
                'total_amount'            => $totalAmount,
                'transaction_status_id'   => $defaultTransactionStatusId,
                'before_image_url'        => $imageUrl,
                'before_image_public_id'  => $imagePublicId,
            ]
        ));

        // 6. Redirect dengan pesan sukses
        return redirect()->route('transactions.index')->with('success', 'Transaksi berhasil ditambahkan!');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction, CloudinaryService $cloudinaryService)
    {
        $validatedData = $request->validated();

        // 1. Hitung ulang total_amount jika service_id atau shoe_count ikut diperbarui
        if ($request->has('service_id') || $request->has('shoe_count')) {
            $serviceId = $request->service_id ?? $transaction->service_id;
            $shoeCount = $request->shoe_count ?? $transaction->shoe_count;

            $service = Service::findOrFail($serviceId);
            $validatedData['total_amount'] = $service->price * $shoeCount;
        }

        // 2. Handle update Foto Before (jika ada file baru yang diunggah)
        if ($request->hasFile('beforeImage')) {
            // (Opsional) Hapus foto lama di Cloudinary jika ada public_id-nya
            // if ($transaction->before_image_public_id) { $cloudinaryService->delete($transaction->before_image_public_id); }

            $uploadedBefore = $cloudinaryService->upload($request->file('beforeImage'), 'transactions/before');
            $validatedData['before_image_url'] = $uploadedBefore['secure_url'] ?? null;
            $validatedData['before_image_public_id'] = $uploadedBefore['public_id'] ?? null;
        }

        // 3. Handle update Foto After (jika ada file baru yang diunggah)
        if ($request->hasFile('afterImage')) {
            // (Opsional) Hapus foto lama di Cloudinary jika ada public_id-nya
            // if ($transaction->after_image_public_id) { $cloudinaryService->delete($transaction->after_image_public_id); }

            $uploadedAfter = $cloudinaryService->upload($request->file('afterImage'), 'transactions/after');
            $validatedData['after_image_url'] = $uploadedAfter['secure_url'] ?? null;
            $validatedData['after_image_public_id'] = $uploadedAfter['public_id'] ?? null;
        }

        // 4. Update data ke database
        $transaction->update($validatedData);

        return redirect()->back()->with('success', 'Transaksi berhasil diperbarui!');
    }
}
