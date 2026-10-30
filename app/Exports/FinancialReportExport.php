<?php

namespace App\Exports;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class FinancialReportExport implements FromArray, ShouldAutoSize, WithMapping, WithHeadings, WithEvents, WithCustomStartCell, WithTitle
{
    use Exportable;

    protected string|int|null $month;
    protected string|int|null $branchId;
    protected ?int $authenticatedUserBranch;
    protected array $rowIndices = [];

    public function __construct(string|int|null $month, string|int|null $branchId, ?int $authenticatedUserBranch)
    {
        $this->month = $month;
        $this->branchId = $branchId;
        $this->authenticatedUserBranch = $authenticatedUserBranch;
    }

    public function array(): array
    {
        $transactionQuery = Transaction::query();
        $expenseQuery = Expense::query();

        // 1. Filter Cabang
        if ($this->authenticatedUserBranch) {
            $transactionQuery->where("branch_id", $this->authenticatedUserBranch);
            $expenseQuery->where("branch_id", $this->authenticatedUserBranch);
        } else if ($this->branchId && $this->branchId !== "all") {
            $transactionQuery->where("branch_id", $this->branchId);
            $expenseQuery->where("branch_id", $this->branchId);
        }

        // 2. Filter Bulan
        if ($this->month && $this->month !== 'all') {
            $transactionQuery->whereMonth('transaction_date', $this->month);
            $expenseQuery->whereMonth('expense_date', $this->month);
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

        // 4. Hitung Pengeluaran per Kategori (hanya yang > 0)
        $categories = ExpenseCategory::all();
        $expenses = $categories->map(function ($category) use ($expenseQuery) {
            $amount = (clone $expenseQuery)
                ->where('expense_category_id', $category->id)
                ->sum('amount');

            return [
                'name' => $category->name,
                'amount' => (float) $amount,
            ];
        })->filter(fn($expense) => $expense['amount'] > 0);

        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalRevenue - $totalExpense;

        $rows = [];
        $currentRow = 5; // Data tabel dimulai dari baris ke-5 sesuai startCell 'A5'

        // --- PENDAPATAN ---
        $rows[] = ['type' => 'header', 'label' => 'PENDAPATAN', 'amount' => ''];
        $this->rowIndices['section_header'][] = $currentRow++;

        $rows[] = ['type' => 'item', 'label' => 'Pendapatan Cash', 'amount' => $cashRevenue];
        $currentRow++;
        $rows[] = ['type' => 'item', 'label' => 'Pendapatan Transfer', 'amount' => $transferRevenue];
        $currentRow++;
        $rows[] = ['type' => 'item', 'label' => 'Pendapatan QRIS', 'amount' => $qrisRevenue];
        $currentRow++;

        // TOTAL PENDAPATAN (langsung tanpa space kosong di atasnya)
        $rows[] = ['type' => 'total', 'label' => 'TOTAL PENDAPATAN', 'amount' => $totalRevenue];
        $this->rowIndices['subtotal'][] = $currentRow++;

        // Row Pemisah Antar Kategori (Empty)
        $rows[] = ['type' => 'empty', 'label' => '', 'amount' => ''];
        $currentRow++;

        // --- PENGELUARAN ---
        $rows[] = ['type' => 'header', 'label' => 'PENGELUARAN', 'amount' => ''];
        $this->rowIndices['section_header'][] = $currentRow++;

        if ($expenses->count() > 0) {
            foreach ($expenses as $exp) {
                $rows[] = ['type' => 'item', 'label' => $exp['name'], 'amount' => $exp['amount']];
                $currentRow++;
            }
        } else {
            $rows[] = ['type' => 'empty_item', 'label' => 'Tidak ada data pengeluaran', 'amount' => ''];
            $currentRow++;
        }

        // TOTAL PENGELUARAN (langsung tanpa space kosong di atasnya)
        $rows[] = ['type' => 'total', 'label' => 'TOTAL PENGELUARAN', 'amount' => $totalExpense];
        $this->rowIndices['subtotal'][] = $currentRow++;

        // Row Pemisah Antar Kategori (Empty)
        $rows[] = ['type' => 'empty', 'label' => '', 'amount' => ''];
        $currentRow++;

        // --- RINGKASAN ---
        $rows[] = ['type' => 'header', 'label' => 'RINGKASAN', 'amount' => ''];
        $this->rowIndices['section_header'][] = $currentRow++;

        $rows[] = ['type' => 'ringkasan_item', 'label' => 'Total Pendapatan', 'amount' => $totalRevenue];
        $currentRow++;
        $rows[] = ['type' => 'ringkasan_item', 'label' => 'Total Pengeluaran', 'amount' => $totalExpense];
        $currentRow++;

        // TOTAL LABA BERSIH (langsung tanpa space kosong di atasnya)
        $rows[] = ['type' => 'grand_total', 'label' => 'TOTAL LABA BERSIH', 'amount' => $netProfit];
        $this->rowIndices['grand_total'] = $currentRow++;

        $this->rowIndices['last_row'] = $currentRow - 1;

        return $rows;
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return ['', ''];
    }

    public function map(mixed $row): array
    {
        $rowArray = (array) $row;

        return [
            $rowArray['label'] ?? '',
            isset($rowArray['amount']) && $rowArray['amount'] !== '' ? $rowArray['amount'] : '',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 1. Ambil Nama Cabang & Bulan untuk Header Info
                $selectedBranchName = 'Semua Cabang';
                if ($this->authenticatedUserBranch) {
                    $selectedBranchName = Branch::find($this->authenticatedUserBranch)?->name ?? 'Semua Cabang';
                } else if ($this->branchId && $this->branchId !== 'all') {
                    $selectedBranchName = Branch::find($this->branchId)?->name ?? 'Semua Cabang';
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
                $selectedMonthName = ($this->month && $this->month !== 'all') ? ($monthsList[(int)$this->month] ?? '-') : 'Semua Bulan';

                // 2. Tulis & Merge Center Header Informasi di Baris 1 sampai 3
                $sheet->mergeCells('A1:B1')
                    ->setCellValue('A1', 'LAPORAN LABA BERSIH')
                    ->getStyle('A1')
                    ->applyFromArray([
                        'font' => ['bold' => true, 'size' => 14],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $sheet->mergeCells('A2:B2')
                    ->setCellValue('A2', 'Cabang ' . $selectedBranchName)
                    ->getStyle('A2')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $sheet->mergeCells('A3:B3')
                    ->setCellValue('A3', 'Periode ' . $selectedMonthName)
                    ->getStyle('A3')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $lastRow = $this->rowIndices['last_row'] ?? 35;

                // 3. Format Angka Tanpa Titik (format '0')
                $sheet->getStyle("B5:B{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('0');

                // 4. Indentasi untuk item rincian di Kolom A
                $sheet->getStyle("A5:A{$lastRow}")
                    ->getAlignment()
                    ->setIndent(1);

                // 5. Styling Section Header (PENDAPATAN, PENGELUARAN, RINGKASAN) -> UPPERCASE & BOLD
                if (!empty($this->rowIndices['section_header'])) {
                    foreach ($this->rowIndices['section_header'] as $rowIndex) {
                        $sheet->getStyle("A{$rowIndex}")->applyFromArray([
                            'font' => [
                                'bold' => true,
                                'size' => 11,
                            ],
                        ]);
                        $sheet->getStyle("A{$rowIndex}")->getAlignment()->setIndent(0);
                    }
                }

                // 6. Styling Subtotal (Total Pendapatan & Total Pengeluaran)
                if (!empty($this->rowIndices['subtotal'])) {
                    foreach ($this->rowIndices['subtotal'] as $rowIndex) {
                        $sheet->getStyle("A{$rowIndex}:B{$rowIndex}")->applyFromArray([
                            'font' => [
                                'bold' => true,
                            ],
                        ]);
                        $sheet->getStyle("A{$rowIndex}")->getAlignment()->setIndent(0);
                    }
                }

                // 7. Paksa item di bawah RINGKASAN menjadi tidak tebal (polos)
                $gtRow = $this->rowIndices['grand_total'] ?? 0;
                if ($gtRow > 0) {
                    $ringkasanItemStart = $gtRow - 2;
                    $ringkasanItemEnd = $gtRow - 1;
                    $sheet->getStyle("A{$ringkasanItemStart}:B{$ringkasanItemEnd}")->applyFromArray([
                        'font' => [
                            'bold' => false,
                        ],
                    ]);
                    $sheet->getStyle("B{$ringkasanItemStart}:B{$ringkasanItemEnd}")->applyFromArray([
                        'font' => [
                            'bold' => false,
                        ],
                    ]);
                }

                // 8. Styling Grand Total Laba Bersih - Hanya tebal, tanpa border
                if ($gtRow > 0) {
                    $sheet->getStyle("A{$gtRow}:B{$gtRow}")->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'size' => 11,
                        ],
                    ]);
                    $sheet->getStyle("A{$gtRow}")->getAlignment()->setIndent(0);
                }

                // Alignment kanan untuk semua nilai di Kolom B
                $sheet->getStyle("B5:B{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            },
        ];
    }

    public function title(): string
    {
        return 'Laporan Laba Bersih';
    }
}
