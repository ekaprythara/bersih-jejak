<?php

namespace App\Exports;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Carbon\Carbon;
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

class FinancialReportExport implements
    FromArray,
    ShouldAutoSize,
    WithMapping,
    WithHeadings,
    WithEvents,
    WithCustomStartCell,
    WithTitle
{
    use Exportable;

    protected string $startDate;
    protected string $endDate;
    protected string|int|null $branchId;
    protected ?int $authenticatedUserBranch;
    protected array $rowIndices = [];

    public function __construct(
        string $startDate,
        string $endDate,
        string|int|null $branchId = 'all',
        ?int $authenticatedUserBranch = null,
    ) {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->branchId = $branchId;
        $this->authenticatedUserBranch = $authenticatedUserBranch;
    }

    public function array(): array
    {
        $transactionQuery = Transaction::query()
            ->whereBetween('transaction_date', [$this->startDate, $this->endDate]);

        $expenseQuery = Expense::query()
            ->whereBetween('expense_date', [$this->startDate, $this->endDate]);

        // 1. Filter Cabang
        if ($this->authenticatedUserBranch) {
            $transactionQuery->where('branch_id', $this->authenticatedUserBranch);
            $expenseQuery->where('branch_id', $this->authenticatedUserBranch);
        } elseif ($this->branchId && $this->branchId !== 'all') {
            $transactionQuery->where('branch_id', $this->branchId);
            $expenseQuery->where('branch_id', $this->branchId);
        }

        // 2. Hitung Pendapatan & Total Diskon (Lunas = payment_status_id 2)
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

        // 3. Hitung Pengeluaran per Kategori (hanya yang > 0)
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
        // Baris 5 diisi headings(), sehingga data array mulai di baris ke-6
        $currentRow = 6;

        // --- PENDAPATAN ---
        $rows[] = ['type' => 'header', 'label' => 'PENDAPATAN', 'amount' => ''];
        $this->rowIndices['section_header'][] = $currentRow++;

        $rows[] = ['type' => 'item', 'label' => 'Pendapatan Cash', 'amount' => (float) $cashRevenue];
        $currentRow++;

        $rows[] = ['type' => 'item', 'label' => 'Pendapatan Transfer', 'amount' => (float) $transferRevenue];
        $currentRow++;

        $rows[] = ['type' => 'item', 'label' => 'Pendapatan QRIS', 'amount' => (float) $qrisRevenue];
        $currentRow++;

        $rows[] = ['type' => 'item', 'label' => 'Total Diskon Diberikan', 'amount' => (float) $totalDiscount];
        $currentRow++;

        // TOTAL PENDAPATAN
        $rows[] = ['type' => 'total', 'label' => 'TOTAL PENDAPATAN', 'amount' => (float) $totalRevenue];
        $this->rowIndices['subtotal'][] = $currentRow++;

        // Row Pemisah Antar Kategori
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

        // TOTAL PENGELUARAN
        $rows[] = ['type' => 'total', 'label' => 'TOTAL PENGELUARAN', 'amount' => (float) $totalExpense];
        $this->rowIndices['subtotal'][] = $currentRow++;

        // Row Pemisah Antar Kategori
        $rows[] = ['type' => 'empty', 'label' => '', 'amount' => ''];
        $currentRow++;

        // --- RINGKASAN ---
        $rows[] = ['type' => 'header', 'label' => 'RINGKASAN', 'amount' => ''];
        $this->rowIndices['section_header'][] = $currentRow++;

        $rows[] = ['type' => 'ringkasan_item', 'label' => 'Total Pendapatan', 'amount' => (float) $totalRevenue];
        $currentRow++;

        $rows[] = ['type' => 'ringkasan_item', 'label' => 'Total Pengeluaran', 'amount' => (float) $totalExpense];
        $currentRow++;

        // TOTAL LABA BERSIH
        $rows[] = ['type' => 'grand_total', 'label' => 'TOTAL LABA BERSIH', 'amount' => (float) $netProfit];
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

                // 1. Nama Cabang & Label Periode untuk Header Info
                $selectedBranchName = 'Semua Cabang';
                if ($this->authenticatedUserBranch) {
                    $selectedBranchName = Branch::find($this->authenticatedUserBranch)?->name ?? 'Cabang';
                } elseif ($this->branchId && $this->branchId !== 'all') {
                    $selectedBranchName = Branch::find($this->branchId)?->name ?? 'Semua Cabang';
                }

                $periodLabel = $this->startDate === $this->endDate
                    ? Carbon::parse($this->startDate)->translatedFormat('d F Y')
                    : Carbon::parse($this->startDate)->translatedFormat('d M Y') . ' - ' . Carbon::parse($this->endDate)->translatedFormat('d M Y');

                // 2. Tulis & Merge Center Header Informasi di Baris 1 sampai 3
                $sheet->mergeCells('A1:B1')
                    ->setCellValue('A1', 'LAPORAN LABA BERSIH')
                    ->getStyle('A1')->applyFromArray([
                        'font' => ['bold' => true, 'size' => 14],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $sheet->mergeCells('A2:B2')
                    ->setCellValue('A2', 'Cabang: ' . $selectedBranchName)
                    ->getStyle('A2')->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $sheet->mergeCells('A3:B3')
                    ->setCellValue('A3', 'Periode: ' . $periodLabel)
                    ->getStyle('A3')->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                $dataStartRow = 6;
                $lastRow = $this->rowIndices['last_row'] ?? $dataStartRow;

                // 3. Format Angka & Indentasi
                $sheet->getStyle("B{$dataStartRow}:B{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('#,##0');

                $sheet->getStyle("A{$dataStartRow}:A{$lastRow}")
                    ->getAlignment()
                    ->setIndent(1);

                // 4. Styling Section Header
                if (! empty($this->rowIndices['section_header'])) {
                    foreach ($this->rowIndices['section_header'] as $rowIndex) {
                        $sheet->getStyle("A{$rowIndex}")->applyFromArray([
                            'font' => ['bold' => true, 'size' => 11],
                        ]);
                        $sheet->getStyle("A{$rowIndex}")->getAlignment()->setIndent(0);
                    }
                }

                // 5. Styling Subtotal
                if (! empty($this->rowIndices['subtotal'])) {
                    foreach ($this->rowIndices['subtotal'] as $rowIndex) {
                        $sheet->getStyle("A{$rowIndex}:B{$rowIndex}")->applyFromArray([
                            'font' => ['bold' => true],
                        ]);
                        $sheet->getStyle("A{$rowIndex}")->getAlignment()->setIndent(0);
                    }
                }

                // 6. Item di bawah RINGKASAN tetap polos (tidak bold)
                $gtRow = $this->rowIndices['grand_total'] ?? 0;
                if ($gtRow > 0) {
                    $ringkasanItemStart = $gtRow - 2;
                    $ringkasanItemEnd = $gtRow - 1;
                    $sheet->getStyle("A{$ringkasanItemStart}:B{$ringkasanItemEnd}")
                        ->applyFromArray(['font' => ['bold' => false]]);
                }

                // 7. Styling Grand Total Laba Bersih
                if ($gtRow > 0) {
                    $sheet->getStyle("A{$gtRow}:B{$gtRow}")->applyFromArray([
                        'font' => ['bold' => true, 'size' => 11],
                    ]);
                    $sheet->getStyle("A{$gtRow}")->getAlignment()->setIndent(0);
                }

                // Alignment kanan untuk semua nilai di Kolom B
                $sheet->getStyle("B{$dataStartRow}:B{$lastRow}")
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
