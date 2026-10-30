<?php

namespace App\Exports;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Support\Collection;

class ExpenseExport implements FromCollection, ShouldAutoSize, WithMapping, WithHeadings, WithEvents, WithCustomStartCell, WithTitle
{
    use Exportable;

    protected string|int|null $branchId;
    protected ?int $authenticatedUserBranch;
    protected string|int|null $expenseCategoryId;
    protected string $minDate;
    protected string $maxDate;

    public function __construct($branchId, $authenticatedUserBranch, $expenseCategoryId, $minDate, $maxDate)
    {
        $this->branchId = $branchId;
        $this->authenticatedUserBranch = $authenticatedUserBranch;
        $this->expenseCategoryId = $expenseCategoryId;
        $this->minDate = $minDate;
        $this->maxDate = $maxDate;
    }

    public function collection(): Collection
    {
        $query = Expense::with(['expenseCategory', 'branch', 'user']);

        if ($this->authenticatedUserBranch) {
            $query->where("branch_id", $this->authenticatedUserBranch);
        } else if ($this->branchId && $this->branchId !== "all") {
            $query->where("branch_id", $this->branchId);
        }

        if ($this->minDate && $this->minDate !== "") {
            $query->where('expense_date', ">=", $this->minDate);
        }
        if ($this->maxDate && $this->maxDate !== "") {
            $query->where('expense_date', "<=", $this->maxDate);
        }

        if ($this->expenseCategoryId && $this->expenseCategoryId !== "all") {
            $query->where('expense_category_id', $this->expenseCategoryId);
        }

        return $query->oldest('expense_date')->get();
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Kategori',
            'Cabang',
            'Jumlah',
            'Keterangan',
            'Pembuat'
        ];
    }

    public function map($expense): array
    {
        return [
            $expense->expense_date,
            $expense->expenseCategory->name ?? '-',
            $expense->branch->name ?? '-',
            (float) $expense->amount,
            $expense->description ?? '-',
            $expense->user->name ?? '-'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $sheet->getHighestRow();
                $lastColumn = $sheet->getHighestColumn(); // Sampai kolom F

                // 1. Header Judul Utama di Baris 1 (Merge A sampai F)
                $sheet->mergeCells('A1:F1')
                    ->setCellValue('A1', 'LAPORAN PENGELUARAN')
                    ->getStyle('A1')
                    ->applyFromArray([
                        'font' => ['bold' => true, 'size' => 14],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                // 2. Info Cabang (Baris 2)
                $selectedBranchName = 'Semua Cabang';
                if ($this->authenticatedUserBranch) {
                    $selectedBranchName = Branch::find($this->authenticatedUserBranch)?->name ?? 'Semua Cabang';
                } else if ($this->branchId && $this->branchId !== 'all') {
                    $selectedBranchName = Branch::find($this->branchId)?->name ?? 'Semua Cabang';
                }

                $branchText = ($selectedBranchName === 'Semua Cabang')
                    ? 'Semua Cabang'
                    : 'Cabang ' . $selectedBranchName;

                $sheet->mergeCells('A2:F2')
                    ->setCellValue('A2', $branchText)
                    ->getStyle('A2')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);

                // 3. Info Kategori (Baris 3)
                $selectedCategoryName = 'Semua Kategori';
                if ($this->expenseCategoryId && $this->expenseCategoryId !== 'all') {
                    $selectedCategoryName = ExpenseCategory::find($this->expenseCategoryId)?->name ?? 'Semua Kategori';
                }

                $categoryText = ($selectedCategoryName === 'Semua Kategori')
                    ? 'Semua Kategori'
                    : 'Kategori ' . $selectedCategoryName;

                $sheet->mergeCells('A3:F3')
                    ->setCellValue('A3', $categoryText)
                    ->getStyle('A3')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);

                // 4. Info Periode (Baris 4) - Diperbarui agar jika tanggal sama, tampil 1 saja
                $periodeText = 'Semua Periode';
                if ($this->minDate && $this->maxDate) {
                    if ($this->minDate === $this->maxDate) {
                        $periodeText = $this->minDate;
                    } else {
                        $periodeText = $this->minDate . ' s/d ' . $this->maxDate;
                    }
                } elseif ($this->minDate) {
                    $periodeText = 'Mulai ' . $this->minDate;
                } elseif ($this->maxDate) {
                    $periodeText = 'Sampai ' . $this->maxDate;
                }

                $sheet->mergeCells('A4:F4')
                    ->setCellValue('A4', $periodeText)
                    ->getStyle('A4')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);

                // 5. Styling Header Tabel (Baris 6) -> Polos, tebal, rata tengah
                $sheet->getStyle("A6:{$lastColumn}6")->applyFromArray([
                    'font' => [
                        'bold' => true,
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // 6. Format Angka untuk Kolom Jumlah (Kolom D mulai baris 7, tanpa pemisah titik)
                $sheet->getStyle("D7:D{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('0');

                // 7. Border untuk seluruh tabel data (dari baris 6 sampai bawah)
                $sheet->getStyle("A6:{$lastColumn}{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFD1D5DB'],
                        ],
                    ],
                ]);

                // 8. Alignment khusus (Kolom Tanggal di-center, Kolom Jumlah di-right)
                $sheet->getStyle("A7:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("D7:D{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            },
        ];
    }

    public function title(): string
    {
        return 'Laporan Pengeluaran';
    }
}
