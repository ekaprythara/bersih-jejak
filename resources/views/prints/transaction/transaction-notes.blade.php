<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota #{{ $transaction->id }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        body {
            font-family: "IBM Plex Mono", 'Courier New', monospace;
            font-weight: 400;
            font-size: 11px;
            color: #111;
            margin: 0;
            padding: 6px 8px;
            width: 72mm; /* Pas di dalam area cetak 80mm thermal */
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        
        .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #333;
            padding-bottom: 6px;
        }
        .header h2 {
            font-size: 13px;
            font-weight: 600;
            margin: 0 0 2px;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
        }

        .section {
            margin-bottom: 8px;
            border-bottom: 1px dashed #333;
            padding-bottom: 6px;
        }

        .info-table, .item-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 2px 0;
            vertical-align: top;
            font-size: 10.5px;
        }
        
        .item-table th, .item-table td {
            padding: 4px 0;
            font-size: 10.5px;
        }
        .item-table th {
            border-bottom: 1px solid #333;
            border-top: 1px solid #333;
            font-size: 10px;
            text-transform: uppercase;
        }

        .totals td {
            padding: 3px 0;
            font-size: 11px;
        }

        .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9.5px;
        }
    </style>
</head>
<body>

    <!-- Header / Info Usaha -->
    <div class="header">
        <h2>Bersih Jejak</h2>
        <p>{{ $transaction->branch->name ?? 'Pusat' }}</p>
        <p>{{ $transaction->branch->address ?? 'Denpasar, Bali' }}</p>
    </div>

    <!-- Informasi Nota & Pelanggan -->
    <div class="section">
        <table class="info-table">
            <tr>
                <td style="width: 36%;">No. Nota</td>
                <td style="width: 4%;">:</td>
                <td><strong>#{{ str_pad($transaction->id, 5, '0', STR_PAD_LEFT) }}</strong></td>
            </tr>
            <tr>
                <td>Tanggal</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($transaction->transaction_date)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Estimasi Ambil</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($transaction->pickup_date)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td>Pelanggan</td>
                <td>:</td>
                <td>{{ $transaction->customer->name ?? 'Umum' }}</td>
            </tr>
            <tr>
                <td>Kasir / Staff</td>
                <td>:</td>
                <td>{{ $transaction->user->name ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <!-- Detail Layanan & Qty -->
    <div class="section">
        <table class="item-table">
            <thead>
                <tr>
                    <th class="text-left" style="width: 50%;">Layanan</th>
                    <th class="text-center" style="width: 20%;">Jml</th>
                    <th class="text-right" style="width: 30%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        {{ $transaction->service->name ?? 'Layanan Cuci Sepatu' }}
                        @if($transaction->description)
                            <br><span style="font-size: 8.5px; color: #333;">({{ $transaction->description }})</span>
                        @endif
                    </td>
                    <td class="text-center">{{ $transaction->shoe_count }} Psg</td>
                    <td class="text-right">Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Rincian Pembayaran -->
    <div class="section">
        <table class="info-table totals">
            <tr>
                <td>Metode Bayar</td>
                <td>:</td>
                <td class="text-right">{{ $transaction->paymentMethod->name ?? 'Tunai' }}</td>
            </tr>
            <tr>
                <td>Status Bayar</td>
                <td>:</td>
                <td class="text-right">{{ $transaction->paymentStatus->name ?? '-' }}</td>
            </tr>
            <tr>
                <td>Status Pengerjaan</td>
                <td>:</td>
                <td class="text-right">{{ $transaction->transactionStatus->name ?? '-' }}</td>
            </tr>
            <tr>
                <td colspan="3" style="border-bottom: 1px dashed #333; padding-top: 3px;"></td>
            </tr>
            <tr>
                <td style="font-size: 12px; padding-top: 4px;"><strong>TOTAL</strong></td>
                <td style="padding-top: 4px;">:</td>
                <td class="text-right" style="font-size: 12px; padding-top: 4px;">
                    <strong>Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</strong>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer Catatan / Terima Kasih -->
    <div class="footer">
        <p>Terima kasih telah mempercayakan<br>perawatan sepatu Anda di Bersih Jejak!</p>
        <p style="margin-top: 8px; font-size: 8.5px;">*Simpan nota ini sebagai bukti pengambilan barang.</p>
    </div>

</body>
</html>