<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;

        // Set default bulan ke bulan saat ini jika belum ada di request
        $month = $request->input('month', date('m'));
        $branchId = $request->input('branch_id', 'all');

        // Query Dasar Transaksi
        $transactionQuery = Transaction::query();

        // Query Dasar Pengeluaran (Expense)
        $expenseQuery = Expense::query();

        // 1. Filter Cabang
        if ($authenticatedUserBranch) {
            $transactionQuery->where("branch_id", $authenticatedUserBranch);
            $expenseQuery->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $transactionQuery->where("branch_id", $branchId);
            $expenseQuery->where("branch_id", $branchId);
        }

        // 2. Filter Bulan
        if ($month && $month !== 'all') {
            $transactionQuery->whereMonth('transaction_date', $month);
            // Asumsi pada tabel expenses ada kolom 'expense_date' atau 'created_at'
            $expenseQuery->whereMonth('expense_date', $month);
        }

        // 3. Hitung Pendapatan
        $cashRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%cash%']);
        })->sum('total_amount');

        $transferRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%transfer%']);
        })->sum('total_amount');

        $qrisRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%qris%']);
        })->sum('total_amount');

        $totalRevenue = $cashRevenue + $transferRevenue + $qrisRevenue;

        // 4. Hitung Pengeluaran per Kategori
        $categories = ExpenseCategory::all();

        $expenses = $categories->map(function ($category) use ($expenseQuery) {
            $amount = (clone $expenseQuery)
                ->where('expense_category_id', $category->id)
                ->sum('amount'); // Sesuaikan nama kolom jumlah uang pengeluaran ('amount' / 'total')

            return [
                'id' => $category->id,
                'name' => $category->name,
                'amount' => (float) $amount,
            ];
        });

        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalRevenue - $totalExpense;

        return inertia('financial-report', [
            'branches' => Branch::get(['id', 'name']),
            'filters' => [
                'month' => $month,
                'branch_id' => $branchId,
            ],
            'summary' => [
                'cashRevenue' => (float) $cashRevenue,
                'digitalRevenue' => [
                    'transferRevenue' => (float) $transferRevenue,
                    'qrisRevenue' => (float) $qrisRevenue,
                ],
                'totalRevenue' => (float) $totalRevenue,
                'expenses' => $expenses,
                'totalExpense' => (float) $totalExpense,
                'netProfit' => (float) $netProfit,
            ],
        ]);
    }

    public function printPdf(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;

        $month = $request->input('month', date('m'));
        $branchId = $request->input('branch_id', 'all');

        $transactionQuery = Transaction::query();
        $expenseQuery = Expense::query();

        // 1. Filter Cabang
        if ($authenticatedUserBranch) {
            $transactionQuery->where("branch_id", $authenticatedUserBranch);
            $expenseQuery->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $transactionQuery->where("branch_id", $branchId);
            $expenseQuery->where("branch_id", $branchId);
        }

        // 2. Filter Bulan
        if ($month && $month !== 'all') {
            $transactionQuery->whereMonth('transaction_date', $month);
            $expenseQuery->whereMonth('expense_date', $month);
        }

        // 3. Hitung Pendapatan
        $cashRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%cash%']);
        })->sum('total_amount');

        $transferRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%transfer%']);
        })->sum('total_amount');

        $qrisRevenue = (clone $transactionQuery)->whereHas('paymentMethod', function ($q) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%qris%']);
        })->sum('total_amount');

        $totalRevenue = $cashRevenue + $transferRevenue + $qrisRevenue;

        // 4. Hitung Pengeluaran per Kategori
        $categories = ExpenseCategory::all();

        $expenses = $categories->map(function ($category) use ($expenseQuery) {
            $amount = (clone $expenseQuery)
                ->where('expense_category_id', $category->id)
                ->sum('amount');

            return [
                'id' => $category->id,
                'name' => $category->name,
                'amount' => (float) $amount,
            ];
        })->filter(fn($expense) => $expense['amount'] > 0);

        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalRevenue - $totalExpense;

        // Info Cabang & Bulan untuk Header PDF
        $selectedBranchName = 'Semua Cabang';
        if ($authenticatedUserBranch) {
            $selectedBranchName = Branch::find($authenticatedUserBranch)?->name ?? 'Semua Cabang';
        } else if ($branchId !== 'all') {
            $selectedBranchName = Branch::find($branchId)?->name ?? 'Semua Cabang';
        }

        $monthsList = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember'
        ];
        $selectedMonthName = ($month && $month !== 'all') ? ($monthsList[(int)$month] ?? '-') : 'Semua Bulan';

        $pdf = Pdf::loadView('prints.financial-report.financial-report', compact(
            'cashRevenue',
            'transferRevenue',
            'qrisRevenue',
            'totalRevenue',
            'expenses',
            'totalExpense',
            'netProfit',
            'selectedBranchName',
            'selectedMonthName'
        ))->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-keuangan.pdf');
    }
}
