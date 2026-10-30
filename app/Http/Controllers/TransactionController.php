<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Services\CloudinaryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TransactionExport;
use Carbon\Carbon;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;

        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");
        $branchId = $request->input('branch_id', 'all');
        $serviceId = $request->input('service_id', 'all');
        $transactionStatusId = $request->input('transaction_status_id', 'all');
        $paymentStatusId = $request->input('payment_status_id', 'all');
        $paymentMethodId = $request->input('payment_method_id', 'all');

        $today = Carbon::today()->toDateString();

        // Buat base query dengan relasi yang dibutuhkan
        $query = Transaction::with([
            "customer",
            "service",
            "branch",
            "user",
            "transactionStatus",
            "paymentStatus",
            "paymentMethod"
        ]);

        if ($authenticatedUserBranch) {
            $query->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $query->where("branch_id", $branchId);
        }

        // --- PENERAPAN LOGIKA: HARI INI + STATUS PENDING (DEFAULT) ---
        if (($minDate && $minDate !== "") || ($maxDate && $maxDate !== "")) {
            // Jika user memilih filter tanggal secara manual
            if ($minDate) {
                $query->where('transaction_date', ">=", $minDate);
            }
            if ($maxDate) {
                $query->where('transaction_date', "<=", $maxDate);
            }
        } else {
            // Jika user tidak memfilter tanggal (Default):
            // Tampilkan (Transaksi Hari Ini) OR (Status Pending dari kapan pun)
            $query->where(function ($q) use ($today) {
                $q->whereDate('transaction_date', $today) // Hari ini
                    ->orWhereHas('transactionStatus', function ($subQ) {
                        $subQ->where('name', 'like', '%pending%')
                            ->orWhere('name', 'like', '%proses%');
                    }); // ATAU status Pending/Proses dari kapan pun (bulan lalu, tahun lalu, dsb)
            });
        }
        // -------------------------------------------------------------

        if ($serviceId && $serviceId !== 'all') {
            $query->where('service_id', $serviceId);
        }

        if ($transactionStatusId && $transactionStatusId !== 'all') {
            $query->where('transaction_status_id', $transactionStatusId);
        }

        if ($paymentStatusId && $paymentStatusId !== 'all') {
            $query->where('payment_status_id', $paymentStatusId);
        }

        if ($paymentMethodId && $paymentMethodId !== 'all') {
            $query->where('payment_method_id', $paymentMethodId);
        }

        // Total Transaksi dari hasil query filter saat ini
        $totalTransactions = (clone $query)->count();

        // Sukses 
        $successTransactions = (clone $query)->whereHas('transactionStatus', function ($q) {
            $q->where('name', 'like', '%sukses%')
                ->orWhere('name', 'like', '%completed%')
                ->orWhere('name', 'like', '%selesai%');
        })->count();

        // Pending 
        $pendingTransactions = (clone $query)->whereHas('transactionStatus', function ($q) {
            $q->where('name', 'like', '%pending%')
                ->orWhere('name', 'like', '%proses%')
                ->orWhere('name', 'like', '%tertunda%');
        })->count();

        // Total Cash Hari Ini (Berdasarkan metode pembayaran 'Cash' dan tanggal hari ini)
        $totalCashToday = (clone $query)
            ->whereDate('transaction_date', $today)
            ->whereHas('paymentMethod', function ($q) {
                $q->where('name', 'like', '%cash%')
                    ->orWhere('name', 'like', '%tunai%');
            })
            ->sum('total_amount');

        // Total Transfer Hari Ini (Berdasarkan metode pembayaran 'Transfer' dan tanggal hari ini)
        $totalTransferToday = (clone $query)
            ->whereDate('transaction_date', $today)
            ->whereHas('paymentMethod', function ($q) {
                $q->where('name', 'like', '%transfer%')
                    ->orWhere('name', 'like', '%bca%')
                    ->orWhere('name', 'like', '%bank%');
            })
            ->sum('total_amount');

        return inertia("transaction", [
            // Eksekusi query dengan urutan latest dan pagination
            "transactions" => $query->latest('transaction_date')->get(),
            "customers" => Customer::active()->get(['id', 'name']),
            "services" => Service::active()->get(['id', 'name', 'price']),
            "paymentMethods" => PaymentMethod::get(['id', 'name']),
            "paymentStatuses" => PaymentStatus::get(['id', 'name']),
            "transactionStatuses" => TransactionStatus::get(['id', 'name']),
            "branches" => Branch::active()->get(['id', 'name']),
            "serviceOptions" => Service::get(['id', 'name', 'status']),
            "branchOptions" => Branch::get(['id', 'name', 'status']),

            // Opsi khusus untuk form Create yang kita bahas sebelumnya
            "dropdownOptionCreate" => [
                "customers" => Customer::active()->get(['id', 'name']),
                "services" => Service::active()->get(['id', 'name', 'price']),
                "branches" => Branch::active()->get(['id', 'name']),
                "paymentMethods" => PaymentMethod::get(['id', 'name']),
                "paymentStatuses" => PaymentStatus::get(['id', 'name']),
            ],

            "card" => [
                "total_transactions" => $totalTransactions,
                "success_transactions" => $successTransactions,
                "pending_transactions" => $pendingTransactions,
                "total_cash_today" => $totalCashToday,
                "total_transfer_today" => $totalTransferToday,
            ], // <-- Perbaikan: Ditambahkan koma di sini agar tidak syntax error

            "filters" => $request->only([
                'min_date',
                'max_date',
                'branch_id',
                'service_id',
                'transaction_status_id',
                'payment_status_id',
                'payment_method_id',
            ]),
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
                'user_id'                 => Auth::id(),
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
        $this->authorize('update', $transaction);

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

    public function printPdf(Request $request)
    {
        // dd($request->all());
        $authenticatedUserBranch = Auth::user()->branch_id;

        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");
        $branchId = $request->input('branch_id', 'all');
        $serviceId = $request->input('service_id', 'all');
        $transactionStatusId = $request->input('transaction_status_id', 'all');
        $paymentStatusId = $request->input('payment_status_id', 'all');
        $paymentMethodId = $request->input('payment_method_id', 'all');

        // Query dengan relasi lengkap
        $query = Transaction::with([
            "customer",
            "service",
            "branch",
            "user",
            "transactionStatus",
            "paymentStatus",
            "paymentMethod"
        ]);

        if ($authenticatedUserBranch) {
            $query->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $query->where("branch_id", $branchId);
        }

        if ($minDate && $minDate !== "") {
            $query->where('transaction_date', ">=", $minDate);
        }
        if ($maxDate && $maxDate !== "") {
            $query->where('transaction_date', "<=", $maxDate);
        }

        if ($serviceId && $serviceId !== 'all') {
            $query->where('service_id', $serviceId);
        }

        if ($transactionStatusId && $transactionStatusId !== 'all') {
            $query->where('transaction_status_id', $transactionStatusId);
        }

        if ($paymentStatusId && $paymentStatusId !== 'all') {
            $query->where('payment_status_id', $paymentStatusId);
        }

        if ($paymentMethodId && $paymentMethodId !== 'all') {
            $query->where('payment_method_id', $paymentMethodId);
        }

        if ($authenticatedUserBranch) {
            $selectedBranch = Branch::find($authenticatedUserBranch);
        } else if ($branchId) {
            $selectedBranch = Branch::find($branchId);
        }


        $transactions = $query->oldest('transaction_date')->get();

        $pdf = Pdf::loadView('prints.transaction.transaction-report', compact('transactions', 'selectedBranch'))
            ->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-transaksi.pdf');
    }

    public function printTransaction(Request $request, Transaction $transaction)
    {
        $customPaper = [0, 0, 226.77, 800]; // 80mm x menyesuaikan panjang konten
        $pdf = Pdf::loadView('prints.transaction.transaction-notes', compact('transaction'))
            ->setPaper($customPaper, 'portrait');

        return $pdf->stream('nota-transaksi-' . date('Y-m-d') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;

        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");
        $branchId = $request->input('branch_id', 'all');
        $serviceId = $request->input('service_id', 'all');
        $transactionStatusId = $request->input('transaction_status_id', 'all');
        $paymentStatusId = $request->input('payment_status_id', 'all');
        $paymentMethodId = $request->input('payment_method_id', 'all');

        $fileName = 'Laporan Transaksi ' . date('Y-m-d') . '.xlsx';

        return Excel::download(
            new TransactionExport(
                $branchId,
                $authenticatedUserBranch,
                $serviceId,
                $transactionStatusId,
                $paymentStatusId,
                $paymentMethodId,
                $minDate,
                $maxDate
            ),
            $fileName
        );
    }
}
