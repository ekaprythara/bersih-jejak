<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            font-weight: bold; /* Menebalkan seluruh teks dasar */
            color: #111;
            margin: 0;
            padding: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #444; /* Garis lebih tegas */
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
            border: 1px solid #333; /* Garis border tabel lebih hitam/jelas */
            padding: 6px 7px;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold; /* Menebalkan isi sel tabel */
        }
        .table th {
            background-color: #dcdcdc; /* Background header sedikit lebih kontras */
            font-weight: bold;
            font-size: 11px;
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
            border-bottom: 2px solid #111; /* Garis tanda tangan lebih tebal */
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
                <th class="text-center" style="width: 4%;">No</th>
                <th style="width: 11%;">Tanggal</th>
                <th style="width: 13%;">Cabang</th>
                <th style="width: 14%;">Pelanggan</th>
                <th style="width: 14%;">Layanan</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 10%;">Bayar</th>
                <th style="width: 5%; text-align: center; border-right: none;"></th>
                <th class="text-right" style="width: 12%; border-left: none;">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $index => $trx)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($trx->transaction_date ?? $trx->created_at)->format('Y-m-d') }}</td>
                    <td>{{ $trx->branch->name ?? '-' }}</td>
                    <td>{{ $trx->customer->name ?? '-' }}</td>
                    <td>{{ $trx->service->name ?? '-' }}</td>
                    <td>{{ $trx->transactionStatus->name ?? '-' }}</td>
                    <td>{{ $trx->paymentStatus->name ?? '-' }}</td>
                    <td style="text-align: center; border-right: none;">Rp.</td>
                    <td class="text-right" style="border-left: none;">{{ number_format($trx->total_amount ?? $trx->amount ?? 0, 0, '.', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 15px; color: #333;">
                        Tidak ada data transaksi.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if(count($transactions) > 0)
            <tfoot>
                <tr class="total-row">
                    <td colspan="7" class="text-center">TOTAL</td>
                    <td style="text-align: center; border-right: none;">Rp.</td>
                    <td class="text-right" style="border-left: none;">
                        {{ number_format($transactions->sum(fn($t) => $t->total_amount ?? $t->amount ?? 0), 0, '.', '.') }}
                    </td>
                </tr>
            </tfoot>
        @endif
    </table>

</body>
</html>