<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota #{{ $transaction->id }}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            font-weight: bold;
            color: #111;
            margin: 0;
            padding: 4mm 6mm; /* Padding kertas sisi kiri-kanan disesuaikan */
            width: 68mm; /* Lebar area efektif cetak thermal 80mm */
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        
        .header {
            text-align: center;
            margin-bottom: 6px;
            border-bottom: 2px dashed #444;
            padding-bottom: 5px;
        }
        .header h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 1px 0;
            font-size: 10px;
            font-weight: bold;
            color: #333;
        }

        .section {
            margin-bottom: 6px;
            border-bottom: 1px dashed #444;
            padding-bottom: 5px;
        }

        .info-table, .item-table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
        }
        
        /* Mengatur padding kiri dan kanan pada seluruh sel tabel */
        .info-table td {
            padding: 1.5px 4px; 
            vertical-align: top;
            font-size: 10px;
            font-weight: bold;
        }
        
        .item-table th, .item-table td {
            padding: 4px 4px; /* Padding atas-bawah dan kiri-kanan lebih seimbang */
            font-size: 10px;
            font-weight: bold;
        }
        
        .item-table th {
            border-bottom: 1px solid #111;
            border-top: 1px solid #111;
            background-color: #dcdcdc;
            font-size: 9.5px;
            text-transform: uppercase;
            text-align: left;
        }

        .totals td {
            padding: 2px 4px; /* Padding kiri-kanan untuk baris total */
            font-size: 10.5px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 6px;
            font-size: 9.5px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- Header / Info Usaha -->
    <div class="header">
        <h2>Bersih Jejak</h2>
        <p>{{ "Cabang ". $transaction->branch->name ?? '' }}</p>
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
                <td>{{ \Carbon\Carbon::parse($transaction->transaction_date)->format('Y-m-d') }}</td>
            </tr>
            <tr>
                <td>Estimasi Ambil</td>
                <td>:</td>
                <td>{{ \Carbon\Carbon::parse($transaction->pickup_date)->format('Y-m-d') }}</td>
            </tr>
            <tr>
                <td>Pelanggan</td>
                <td>:</td>
                <td>{{ $transaction->customer->name ?? 'Umum' }}</td>
            </tr>
            <tr>
                <td>Admin</td>
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
                    <th style="width: 48%;">Layanan</th>
                    <th class="text-center" style="width: 22%;">Jml</th>
                    <th class="text-right" style="width: 30%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        {{ $transaction->service->name ?? 'Layanan Cuci Sepatu' }}
                        @if($transaction->description)
                            <br><span style="font-size: 8.5px; font-weight: bold; color: #333;">({{ $transaction->description }})</span>
                        @endif
                    </td>
                    <td class="text-center">{{ $transaction->shoe_count }} Psg</td>
                    <td class="text-right">{{ number_format($transaction->total_amount, 0, '.', '.') }}</td>
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
                <td colspan="3" style="border-bottom: 1px dashed #444; padding-top: 2px;"></td>
            </tr>
            <tr>
                <td style="font-size: 11px; padding-top: 4px;"><strong>TOTAL (RP)</strong></td>
                <td style="padding-top: 4px;">:</td>
                <td class="text-right" style="font-size: 11px; padding-top: 4px;">
                    <strong>Rp. {{ number_format($transaction->total_amount, 0, '.', '.') }}</strong>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer Catatan / Terima Kasih -->
    <div class="footer">
        <p>TERIMA KASIH TELAH MEMPERCAYAKAN<br>PERAWATAN SEPATU ANDA DI BERSIH JEJAK!</p>
        <p style="margin-top: 4px; font-size: 8.5px;">*Simpan nota ini sebagai bukti pengambilan barang.</p>
    </div>

</body>
</html>