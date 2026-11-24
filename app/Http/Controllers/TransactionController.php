<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
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
use App\Http\Requests\UpdateTransactionRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

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

        // Base query utama untuk tabel transaksi
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

        // --- LOGIKA UTAMA: HARI INI + PENDING/PROSES + UPDATED_AT HARI INI ---
        if (($minDate && $minDate !== "") || ($maxDate && $maxDate !== "")) {
            if ($minDate) {
                $query->where('transaction_date', ">=", $minDate);
            }
            if ($maxDate) {
                $query->where('transaction_date', "<=", $maxDate);
            }
        } else {
            $query->where(function ($q) use ($today) {
                $q->whereDate('transaction_date', $today)
                    ->orWhereHas('transactionStatus', function ($subQ) {
                        $subQ->where('name', 'like', '%pending%')
                            ->orWhere('name', 'like', '%proses%');
                    })
                    ->orWhereDate('updated_at', $today);
            });
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

        // --- PERHITUNGAN CARD MENGGUNAKAN LOGIKA YANG DISAMAKAN ---

        // --- PERHITUNGAN CARD MENGGUNAKAN LOGIKA YANG 100% SAMA DENGAN TABEL ---

        // 1. Total Transaksi (Berdasarkan cakupan filter/default tabel)
        $totalTransactions = (clone $query)->count();

        // 2. Sukses (Berdasarkan status transaksi 'selesai')
        $successTransactions = (clone $query)->whereHas('transactionStatus', function ($q) {
            $q->where('name', 'selesai');
        })->count();

        // 3. Pending (Berdasarkan status transaksi 'pending' atau 'proses')
        $pendingTransactions = (clone $query)->whereHas('transactionStatus', function ($q) {
            $q->whereIn('name', ['pending', 'proses']);
        })->count();

        // 4. Total Cash (Metode 'Cash' dan status pembayaran 'lunas' dari cakupan data saat ini)
        $totalCashToday = (clone $query)
            ->whereHas('paymentMethod', function ($q) {
                $q->where('name', 'Cash');
            })
            ->whereHas('paymentStatus', function ($q) {
                $q->where('name', 'lunas');
            })
            ->sum('total_amount');

        // 5. Total Transfer / Digital (Metode 'Transfer Bank' atau 'QRIS' dan status pembayaran 'lunas' dari cakupan data saat ini)
        $totalTransferToday = (clone $query)
            ->whereHas('paymentMethod', function ($q) {
                $q->whereIn('name', ['Transfer Bank', 'QRIS']);
            })
            ->whereHas('paymentStatus', function ($q) {
                $q->where('name', 'lunas');
            })
            ->sum('total_amount');

        return inertia("transaction", [
            "transactions" => $query->latest('created_at')->get(),
            "customers" => Customer::active()->get(['id', 'name']),
            "services" => Service::active()->get(['id', 'name', 'price', 'estimated_days']),
            "paymentMethods" => PaymentMethod::get(['id', 'name']),
            "paymentStatuses" => PaymentStatus::get(['id', 'name']),
            "transactionStatuses" => TransactionStatus::get(['id', 'name']),
            "branches" => Branch::active()->get(['id', 'name']),
            "serviceOptions" => Service::get(['id', 'name', 'status']),
            "branchOptions" => Branch::get(['id', 'name', 'status']),

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
            ],

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

    public function store(StoreTransactionRequest $request)
    {
        // 1. Generate unique invoice_number dengan awalan TRX
        $datePart = date('Ymd');
        do {
            $invoiceNumber = 'TRX-' . $datePart . mt_rand(1000, 9999);
        } while (Transaction::where('invoice_number', $invoiceNumber)->exists());

        // 2. Ambil data layanan untuk mendapatkan harga (price)
        $service = Service::findOrFail($request->service_id);

        // 3. Hitung subtotal (Harga Layanan * Jumlah Sepatu)
        $subtotal = $service->price * $request->shoe_count;

        // 4. Ambil nilai diskon, pastikan tidak melebihi subtotal
        $discount = min($subtotal, $request->input('discount', 0));

        // 5. Hitung total amount akhir
        $totalAmount = $subtotal - $discount;

        // 6. Tentukan status transaksi awal secara otomatis (misal: ID 1 untuk Status Baru/Proses)
        $defaultTransactionStatusId = 1;

        // 7. Tentukan metode pembayaran & status pembayaran otomatis:
        // Jika payment_method_id terisi -> Lunas (ID 2), jika kosong -> Belum Lunas (ID 1)
        $paymentMethodId = $request->filled('payment_method_id')
            ? $request->input('payment_method_id')
            : null;
        $paymentStatusId = $paymentMethodId ? 2 : 1;

        // 8. Handle upload foto "Before" ke LocalStorage (public disk)
        $imageBeforePath = null;
        if ($request->hasFile('image_before')) {
            $imageBeforePath = $request->file('image_before')->store('transactions/before', 'public');
        }

        // 9. Simpan data ke database
        Transaction::create(array_merge(
            $request->validated(),
            [
                'invoice_number' => $invoiceNumber,
                'user_id' => Auth::id(),
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'payment_status_id' => $paymentStatusId,
                'payment_method_id' => $paymentMethodId,
                'transaction_status_id' => $defaultTransactionStatusId,
                'image_before' => $imageBeforePath,
                // Sesuai dengan kolom migration
                'image_after' => null,
            ]
        ));

        // 10. Redirect dengan pesan sukses
        return redirect()->route('transactions.index')->with('success', 'Transaksi berhasil ditambahkan!');
    }


    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $validatedData = $request->validated();
        $validatedData['payment_method_id'] = $request->input('payment_method_id');
        $validatedData['payment_status_id'] = $request->input('payment_status_id', 1);

        // 1. Hitung ulang total_amount jika service_id atau shoe_count ikut diperbarui
        if ($request->has('service_id') || $request->has('shoe_count')) {
            $serviceId = $request->service_id ?? $transaction->service_id;
            $shoeCount = $request->shoe_count ?? $transaction->shoe_count;
            $service = Service::findOrFail($serviceId);
            $validatedData['total_amount'] = $service->price * $shoeCount;
        }

        // --- PERHITUNGAN DISKON & TOTAL AMOUNT ---
        $currentTotal = $validatedData['total_amount'] ?? ($transaction->total_amount + ($transaction->discount ?? 0));
        $discount = $request->has('discount') ? ($request->input('discount') ?? 0) : ($transaction->discount ?? 0);
        $subtotalKotor = $currentTotal;
        $discount = min($subtotalKotor, $discount);
        $validatedData['discount'] = $discount;
        $validatedData['total_amount'] = max(0, $subtotalKotor - $discount);
        // -----------------------------------------

        // 2. Handle update Foto Before
        if ($request->hasFile('image_before')) {
            if ($transaction->image_before && Storage::disk('public')->exists($transaction->image_before)) {
                Storage::disk('public')->delete($transaction->image_before);
            }
            $validatedData['image_before'] = $request->file('image_before')->store('transactions/before', 'public');
        } else {
            unset($validatedData['image_before']);
        }

        // 3. Handle update Foto After
        if ($request->hasFile('image_after')) {
            if ($transaction->image_after && Storage::disk('public')->exists($transaction->image_after)) {
                Storage::disk('public')->delete($transaction->image_after);
            }
            $validatedData['image_after'] = $request->file('image_after')->store('transactions/after', 'public');
        } else {
            unset($validatedData['image_after']);
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
