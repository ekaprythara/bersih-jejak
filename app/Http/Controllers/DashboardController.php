<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Expense;
use App\Models\Service;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id ?? null;

        // Ambil input branch_id dari request, default 'all' (semua cabang)
        $branchId = $request->input('branch_id', 'all');

        // Jika user yang login adalah admin cabang tertentu, paksa gunakan cabang miliknya
        if ($authenticatedUserBranch) {
            $branchId = $authenticatedUserBranch;
        }

        // Tentukan rentang waktu: Bulan ini dan 1 bulan sebelumnya
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        $previousMonthDate = Carbon::now()->subMonth();
        $prevMonth = $previousMonthDate->month;
        $prevYear = $previousMonthDate->year;

        // Query dasar transaksi bulan ini (untuk kartu keuangan)
        $monthlyQuery = Transaction::with(['transactionStatus', 'paymentMethod', 'service', 'branch'])
            ->whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear);

        if ($branchId && $branchId !== 'all') {
            $monthlyQuery->where("branch_id", $branchId);
        }

        // 1. Kartu Keuangan (Card)
        $totalRevenue = (clone $monthlyQuery)->sum('total_amount');

        $totalCash = (clone $monthlyQuery)
            ->whereHas('paymentMethod', function ($query) {
                $query->where('name', 'LIKE', '%cash%')
                    ->orWhere('name', 'LIKE', '%tunai%');
            })
            ->sum('total_amount');

        $totalTransfer = (clone $monthlyQuery)
            ->whereHas('paymentMethod', function ($query) {
                $query->where('name', 'LIKE', '%transfer%')
                    ->orWhere('name', 'LIKE', '%bca%')
                    ->orWhere('name', 'LIKE', '%bank%');
            })
            ->sum('total_amount');

        $expenseQuery = Expense::whereMonth('expense_date', $currentMonth)
            ->whereYear('expense_date', $currentYear);

        if ($branchId && $branchId !== 'all' && Schema::hasColumn('expenses', 'branch_id')) {
            $expenseQuery->where('branch_id', $branchId);
        }
        $totalExpense = $expenseQuery->sum('amount');

        $netProfit = $totalRevenue - $totalExpense;

        // 2. Grafik Status Pengerjaan (Bulan ini)
        $statusPengerjaanRaw = (clone $monthlyQuery)
            ->select('transaction_status_id', DB::raw('count(*) as total'))
            ->groupBy('transaction_status_id')
            ->with('transactionStatus')
            ->get();

        $statusPengerjaan = $statusPengerjaanRaw->map(function ($item) {
            $name = $item->transactionStatus->name ?? 'Unknown';
            $lowerName = strtolower($name);

            $color = '#f59e0b'; // Oranye
            if (str_contains($lowerName, 'selesai') || str_contains($lowerName, 'sukses') || str_contains($lowerName, 'completed')) {
                $color = '#10b981'; // Hijau
            } elseif (str_contains($lowerName, 'pending') || str_contains($lowerName, 'batal') || str_contains($lowerName, 'cancel')) {
                $color = '#ef4444'; // Merah
            }

            return [
                'name' => $name,
                'value' => $item->total,
                'color' => $color,
            ];
        });

        // 3. Grafik Layanan Terlaris (Bulan Sekarang + 1 Bulan Sebelumnya)
        $layananTerlaris = Service::withCount(['transactions' => function ($q) use ($currentMonth, $currentYear, $prevMonth, $prevYear, $branchId) {
            $q->where(function ($subQ) use ($currentMonth, $currentYear, $prevMonth, $prevYear) {
                $subQ->where(function ($q1) use ($currentMonth, $currentYear) {
                    $q1->whereMonth('transaction_date', $currentMonth)
                        ->whereYear('transaction_date', $currentYear);
                })->orWhere(function ($q2) use ($prevMonth, $prevYear) {
                    $q2->whereMonth('transaction_date', $prevMonth)
                        ->whereYear('transaction_date', $prevYear);
                });
            });

            if ($branchId && $branchId !== 'all') {
                $q->where('branch_id', $branchId);
            }
        }])
            ->having('transactions_count', '>', 0)
            ->orderBy('transactions_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($service) {
                return [
                    'name' => $service->name,
                    'total' => $service->transactions_count,
                ];
            });

        // 4. Grafik Pendapatan Bulanan (Dinamis 5 bulan terakhir)
        // Jika branch_id 'all', ambil semua cabang. Jika spesifik, ambil cabang itu saja.
        $branches = ($branchId && $branchId !== 'all')
            ? Branch::where('id', $branchId)->get()
            : Branch::all();

        $pendapatanBulanan = [];
        for ($i = 4; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $m = $date->month;
            $y = $date->year;
            $monthName = $date->translatedFormat('M');

            $row = ['month' => $monthName];

            foreach ($branches as $branch) {
                $revenuePerBranch = Transaction::whereMonth('transaction_date', $m)
                    ->whereYear('transaction_date', $y)
                    ->where('branch_id', $branch->id)
                    ->sum('total_amount');

                $row[$branch->name] = (int) $revenuePerBranch;
            }

            $pendapatanBulanan[] = $row;
        }

        return Inertia::render('dashboard', [
            'card' => [
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'net_profit' => $netProfit,
                'total_cash' => $totalCash,
                'total_transfer' => $totalTransfer,
            ],
            'charts' => [
                'status_pengerjaan' => $statusPengerjaan,
                'layanan_terlaris' => $layananTerlaris,
                'pendapatan_bulanan' => $pendapatanBulanan,
            ],
            'branches' => Branch::get(['id', 'name']),
            'filters' => [
                'branch_id' => $branchId,
            ],
        ]);
    }
}
