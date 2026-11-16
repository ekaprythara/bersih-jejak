<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10px; /* Dikecilkan sedikit agar muat untuk tambahan kolom diskon */
            font-weight: bold;
            color: #111;
            margin: 0;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #444;
            padding-bottom: 8px;
        }
        .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 0;
            color: #333;
            font-size: 10px;
            font-weight: bold;
        }
        .meta {
            margin-bottom: 10px;
            font-size: 11px;
            font-weight: bold;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .table th, .table td {
            border: 1px solid #333;
            padding: 5px 4px;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
        }
        .table th {
            background-color: #dcdcdc;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row {
            font-weight: bold;
            background-color: #eaeaea;
        }
        .footer {
            margin-top: 30px;
            width: 100%;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
        }
        .signature-table td {
            text-align: center;
            vertical-align: bottom;
            height: 60px;
        }
        .signature-line {
            border-bottom: 2px solid #111;
            width: 130px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Transaksi Operasional</h1>
        <p>Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('Y-m-d H:i') }}</p>
    </div>

    <div class="meta">
        <strong>Cabang:</strong> {{ isset($selectedBranch) && $selectedBranch ? $selectedBranch->name : 'Semua Cabang' }} | 
        <strong>Total Transaksi:</strong> {{ count($transactions) }}
    </div>

    <table class="table">
        <thead>
            <tr>
                <th class="text-center" style="width: 3%;">No</th>
                <th style="width: 11%;">No. Invoice</th>
                <th style="width: 8%;">Tanggal</th>
                <th style="width: 9%;">Cabang</th>
                <th style="width: 10%;">Pelanggan</th>
                <th style="width: 10%;">Layanan</th>
                <th style="width: 8%;">Status</th>
                <th style="width: 8%;">Bayar</th>
                <th style="width: 8%;">Kasir</th>
                <th class="text-right" style="width: 9%;">Subtotal</th>
                <th class="text-right" style="width: 8%;">Diskon</th>
                <th class="text-right" style="width: 10%;">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $trx)
                @php
                    $servicePrice = $trx->service->price ?? 0;
                    $shoeCount = $trx->shoe_count ?? 1;
                    $subtotal = $servicePrice * $shoeCount;
                    $discount = $trx->discount ?? 0;
                    $finalAmount = $trx->total_amount ?? $trx->amount ?? ($subtotal - $discount);
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $trx->invoice_number }}</td>
                    <td>{{ \Carbon\Carbon::parse($trx->transaction_date ?? $trx->created_at)->format('Y-m-d') }}</td>
                    <td>{{ $trx->branch->name ?? '-' }}</td>
                    <td>{{ $trx->customer->name ?? '-' }}</td>
                    <td>{{ $trx->service->name ?? '-' }}</td>
                    <td>{{ $trx->transactionStatus->name ?? '-' }}</td>
                    <td>{{ $trx->paymentStatus->name ?? '-' }}</td>
                    <td>{{ $trx->user->name ?? '-' }}</td>
                    <td class="text-right">{{ number_format($subtotal, 0, '.', '.') }}</td>
                    <td class="text-right">{{ $discount > 0 ? number_format($discount, 0, '.', '.') : '-' }}</td>
                    <td class="text-right">{{ number_format($finalAmount, 0, '.', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="12" class="text-center" style="padding: 15px; color: #333;">Tidak ada data transaksi.</td>
                </tr>
            @endforelse
        </tbody>
        @if(count($transactions) > 0)
            @php
                $totalSubtotal = $transactions->sum(fn($t) => ($t->service->price ?? 0) * ($t->shoe_count ?? 1));
                $totalDiscount = $transactions->sum(fn($t) => $t->discount ?? 0);
                $totalAmountSum = $transactions->sum(fn($t) => $t->total_amount ?? $t->amount ?? 0);
            @endphp
            <tfoot>
                <tr class="total-row">
                    <td colspan="9" class="text-center">TOTAL KESELURUHAN</td>
                    <td class="text-right">{{ number_format($totalSubtotal, 0, '.', '.') }}</td>
                    <td class="text-right">{{ number_format($totalDiscount, 0, '.', '.') }}</td>
                    <td class="text-right">{{ number_format($totalAmountSum, 0, '.', '.') }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
</body>
</html>