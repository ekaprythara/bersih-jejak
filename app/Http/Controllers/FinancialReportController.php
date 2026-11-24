<?php

namespace App\Http\Controllers;

use App\Exports\FinancialReportExport;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class FinancialReportController extends Controller
{
    /**
     * Helper terpusat untuk menentukan filter & kalkulasi data berdasarkan Role (Owner vs Admin)
     */
    private function getReportData(Request $request): array
    {
        $user = Auth::user();
        $isOwner = (bool) $user->is_owner;
        $today = Carbon::today()->toDateString();

        // 1. Tentukan Filter Tanggal & Cabang berdasarkan Role
        if ($isOwner) {
            $startDate = $request->filled('start_date')
                ? Carbon::parse($request->input('start_date'))->toDateString()
                : $today;
            $endDate = $request->filled('end_date')
                ? Carbon::parse($request->input('end_date'))->toDateString()
                : $startDate;

            if ($startDate > $endDate) {
                [$startDate, $endDate] = [$endDate, $startDate];
            }

            $branchId = $request->input('branch_id', 'all');
        } else {
            // Admin: Kunci ke hari ini dan cabang user
            $startDate = $today;
            $endDate = $today;
            $branchId = $user->branch_id ? (string) $user->branch_id : 'all';
        }

        // 2. Query Dasar Transaksi & Pengeluaran
        $transactionQuery = Transaction::query()
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        $expenseQuery = Expense::query()
            ->whereBetween('expense_date', [$startDate, $endDate]);

        // 3. Terapkan Filter Cabang
        if (! $isOwner && $user->branch_id) {
            $transactionQuery->where('branch_id', $user->branch_id);
            $expenseQuery->where('branch_id', $user->branch_id);
        } elseif ($branchId && $branchId !== 'all') {
            $transactionQuery->where('branch_id', $branchId);
            $expenseQuery->where('branch_id', $branchId);
        }

        // 4. Hitung Pendapatan (Lunas = payment_status_id 2) & Total Diskon
        $paidTransactionQuery = (clone $transactionQuery)->where('payment_status_id', 2);

        $totalDiscount = (clone $paidTransactionQuery)->sum('discount');

        $cashRevenue = (clone $paidTransactionQuery)
            ->whereHas('paymentMethod', fn($q) => $q->whereRaw('LOWER(name) LIKE ?', ['%cash%']))
            ->sum('total_amount');

        $transferRevenue = (clone $paidTransactionQuery)
            ->whereHas('paymentMethod', fn($q) => $q->whereRaw('LOWER(name) LIKE ?', ['%transfer%']))
            ->sum('total_amount');

        $qrisRevenue = (clone $paidTransactionQuery)
            ->whereHas('paymentMethod', fn($q) => $q->whereRaw('LOWER(name) LIKE ?', ['%qris%']))
            ->sum('total_amount');

        $totalRevenue = $cashRevenue + $transferRevenue + $qrisRevenue;

        // 5. Hitung Pengeluaran per Kategori
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
        });

        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalRevenue - $totalExpense;

        // 6. Nama Cabang & Label Periode untuk PDF/Export
        $selectedBranchName = 'Semua Cabang';
        if (! $isOwner && $user->branch_id) {
            $selectedBranchName = Branch::find($user->branch_id)?->name ?? 'Cabang';
        } elseif ($branchId !== 'all') {
            $selectedBranchName = Branch::find($branchId)?->name ?? 'Semua Cabang';
        }

        $periodLabel = $startDate === $endDate
            ? Carbon::parse($startDate)->translatedFormat('d F Y')
            : Carbon::parse($startDate)->translatedFormat('d M Y') . ' - ' . Carbon::parse($endDate)->translatedFormat('d M Y');

        return [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
            ],
            'summary' => [
                'cashRevenue' => (float) $cashRevenue,
                'digitalRevenue' => [
                    'transferRevenue' => (float) $transferRevenue,
                    'qrisRevenue' => (float) $qrisRevenue,
                ],
                'totalDiscount' => (float) $totalDiscount,
                'totalRevenue' => (float) $totalRevenue,
                'expenses' => $expenses,
                'totalExpense' => (float) $totalExpense,
                'netProfit' => (float) $netProfit,
            ],
            'meta' => [
                'selectedBranchName' => $selectedBranchName,
                'periodLabel' => $periodLabel,
            ],
        ];
    }

    public function index(Request $request)
    {
        $data = $this->getReportData($request);

        return inertia('financial-report', [
            'branches' => Branch::get(['id', 'name']),
            'filters' => $data['filters'],
            'summary' => $data['summary'],
        ]);
    }

    public function printPdf(Request $request)
    {
        $data = $this->getReportData($request);

        $pdf = Pdf::loadView('prints.financial-report.financial-report', [
            'cashRevenue' => $data['summary']['cashRevenue'],
            'transferRevenue' => $data['summary']['digitalRevenue']['transferRevenue'],
            'qrisRevenue' => $data['summary']['digitalRevenue']['qrisRevenue'],
            'totalDiscount' => $data['summary']['totalDiscount'],
            'totalRevenue' => $data['summary']['totalRevenue'],
            'expenses' => $data['summary']['expenses']->filter(fn($e) => $e['amount'] > 0),
            'totalExpense' => $data['summary']['totalExpense'],
            'netProfit' => $data['summary']['netProfit'],
            'selectedBranchName' => $data['meta']['selectedBranchName'],
            'selectedPeriodLabel' => $data['meta']['periodLabel'],
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-keuangan-' . $data['filters']['start_date'] . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        $data = $this->getReportData($request);
        $filters = $data['filters'];

        $fileName = $filters['start_date'] === $filters['end_date']
            ? 'Laporan-Keuangan-' . $filters['start_date'] . '.xlsx'
            : 'Laporan-Keuangan-' . $filters['start_date'] . '-sd-' . $filters['end_date'] . '.xlsx';

        return Excel::download(
            new FinancialReportExport($filters['start_date'], $filters['end_date'], $filters['branch_id']),
            $fileName
        );
    }
}
