<?php

namespace App\Exports;

use App\Models\Branch;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\PaymentStatus;
use App\Models\PaymentMethod;
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

class TransactionExport implements FromCollection, ShouldAutoSize, WithMapping, WithHeadings, WithEvents, WithCustomStartCell, WithTitle
{
    use Exportable;

    protected string|int|null $branchId;
    protected ?int $authenticatedUserBranch;
    protected string|int|null $serviceId;
    protected string|int|null $transactionStatusId;
    protected string|int|null $paymentStatusId;
    protected string|int|null $paymentMethodId;
    protected string $minDate;
    protected string $maxDate;

    public function __construct(
        $branchId,
        $authenticatedUserBranch,
        $serviceId,
        $transactionStatusId,
        $paymentStatusId,
        $paymentMethodId,
        $minDate,
        $maxDate
    ) {
        $this->branchId = $branchId;
        $this->authenticatedUserBranch = $authenticatedUserBranch;
        $this->serviceId = $serviceId;
        $this->transactionStatusId = $transactionStatusId;
        $this->paymentStatusId = $paymentStatusId;
        $this->paymentMethodId = $paymentMethodId;
        $this->minDate = $minDate;
        $this->maxDate = $maxDate;
    }

    public function collection(): Collection
    {
        $query = Transaction::with([
            "customer",
            "service",
            "branch",
            "user",
            "transactionStatus",
            "paymentStatus",
            "paymentMethod"
        ]);

        if ($this->authenticatedUserBranch) {
            $query->where("branch_id", $this->authenticatedUserBranch);
        } else if ($this->branchId && $this->branchId !== "all") {
            $query->where("branch_id", $this->branchId);
        }

        if ($this->minDate && $this->minDate !== "") {
            $query->where('transaction_date', ">=", $this->minDate);
        }
        if ($this->maxDate && $this->maxDate !== "") {
            $query->where('transaction_date', "<=", $this->maxDate);
        }

        if ($this->serviceId && $this->serviceId !== 'all') {
            $query->where('service_id', $this->serviceId);
        }

        if ($this->transactionStatusId && $this->transactionStatusId !== 'all') {
            $query->where('transaction_status_id', $this->transactionStatusId);
        }

        if ($this->paymentStatusId && $this->paymentStatusId !== 'all') {
            $query->where('payment_status_id', $this->paymentStatusId);
        }

        if ($this->paymentMethodId && $this->paymentMethodId !== 'all') {
            $query->where('payment_method_id', $this->paymentMethodId);
        }

        return $query->oldest('transaction_date')->get();
    }

    public function startCell(): string
    {
        return 'A6'; // Header info memakan baris 1-4, baris 5 kosong
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Pelanggan',
            'Layanan',
            'Jumlah Sepatu',
            'Total Harga',
            'Cabang',
            'Status Transaksi',
            'Status Pembayaran',
            'Metode Pembayaran',
            'Pembuat'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->transaction_date,
            $transaction->customer->name ?? '-',
            $transaction->service->name ?? '-',
            (int) $transaction->shoe_count,
            (float) $transaction->total_amount,
            $transaction->branch->name ?? '-',
            $transaction->transactionStatus->name ?? '-',
            $transaction->paymentStatus->name ?? '-',
            $transaction->paymentMethod->name ?? '-',
            $transaction->user->name ?? '-'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastRow = $sheet->getHighestRow();
                $lastColumn = $sheet->getHighestColumn(); // Sampai kolom J

                // 1. Header Judul Utama di Baris 1 (Merge A sampai J)
                $sheet->mergeCells("A1:{$lastColumn}1")
                    ->setCellValue('A1', 'LAPORAN TRANSAKSI')
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

                $sheet->mergeCells("A2:{$lastColumn}2")
                    ->setCellValue('A2', $branchText)
                    ->getStyle('A2')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);

                // 3. Info Layanan (Baris 3)
                $selectedServiceName = 'Semua Layanan';
                if ($this->serviceId && $this->serviceId !== 'all') {
                    $selectedServiceName = Service::find($this->serviceId)?->name ?? 'Semua Layanan';
                }

                $serviceText = ($selectedServiceName === 'Semua Layanan')
                    ? 'Semua Layanan'
                    : 'Layanan ' . $selectedServiceName;

                $sheet->mergeCells("A3:{$lastColumn}3")
                    ->setCellValue('A3', $serviceText)
                    ->getStyle('A3')
                    ->applyFromArray([
                        'font' => ['bold' => true],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
                    ]);

                // 4. Info Periode (Baris 4)
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

                $sheet->mergeCells("A4:{$lastColumn}4")
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

                // 6. Format Angka Tanpa Titik (Jumlah Sepatu di Kolom D & Total Harga di Kolom E)
                $sheet->getStyle("D7:E{$lastRow}")
                    ->getNumberFormat()
                    ->setFormatCode('0');

                // 7. Border untuk seluruh tabel data
                $sheet->getStyle("A6:{$lastColumn}{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFD1D5DB'],
                        ],
                    ],
                ]);

                // 8. Alignment khusus
                $sheet->getStyle("A7:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // Tanggal
                $sheet->getStyle("D7:D{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // Jumlah Sepatu
                $sheet->getStyle("E7:E{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);  // Total Harga
            },
        ];
    }

    public function title(): string
    {
        return 'Laporan Transaksi';
    }
}
