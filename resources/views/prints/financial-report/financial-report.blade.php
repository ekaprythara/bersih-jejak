<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Laba Rugi</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
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
        .header h2 {
            font-size: 15px;
            font-weight: bold;
            margin: 0 0 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 2px 0;
            color: #333;
            font-size: 10px;
            font-weight: bold;
        }
        .section-title {
            font-weight: bold;
            font-size: 10px;
            background-color: #dcdcdc;
            padding: 5px 7px;
            margin-top: 15px;
            text-transform: uppercase;
            border: 1px solid #333;
            border-bottom: none;
            letter-spacing: 0.5px;
        }
        .table-box {
            border: 1px solid #333;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 5px 7px;
            font-family: 'Courier New', Courier, monospace;
            font-weight: bold;
        }
        .font-mono {
            text-align: right;
        }
        .indent {
            padding-left: 15px;
        }
        .border-top {
            border-top: 1px solid #333;
            background-color: #eaeaea;
        }
        .bold {
            font-weight: bold;
        }
        .total-box {
            margin-top: 20px;
            padding: 8px 10px;
            border: 2px solid #111;
            background-color: #eaeaea;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Laba Rugi</h2>
        <p><strong>Cabang:</strong> {{ $selectedBranchName }} | <strong>Periode Bulan:</strong> {{ $selectedMonthName }}</p>
        <p>Dicetak pada: {{ date('d/m/Y H:i') }}</p>
    </div>

    <!-- PENDAPATAN -->
    <div class="section-title">Pendapatan</div>
    <div class="table-box">
        <table>
            <tr>
                <td class="indent">Pendapatan Tunai (Cash)</td>
                <td class="font-mono">Rp {{ number_format($cashRevenue, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="indent">Pendapatan Transfer</td>
                <td class="font-mono">Rp {{ number_format($transferRevenue, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="indent">Pendapatan QRIS</td>
                <td class="font-mono">Rp {{ number_format($qrisRevenue, 0, ',', '.') }}</td>
            </tr>
            <tr class="border-top bold">
                <td>Total Pendapatan</td>
                <td class="font-mono">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <!-- PENGELUARAN -->
    <div class="section-title">Pengeluaran</div>
    <div class="table-box">
        <table>
            @forelse($expenses as $expense)
                <tr>
                    <td class="indent">{{ $expense['name'] }}</td>
                    <td class="font-mono">Rp {{ number_format($expense['amount'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td class="indent" colspan="2" style="color: #444;"><em>Tidak ada pengeluaran pada periode ini.</em></td>
                </tr>
            @endforelse
            <tr class="border-top bold">
                <td>Total Pengeluaran</td>
                <td class="font-mono">Rp {{ number_format($totalExpense, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    <!-- RINGKASAN AKHIR -->
    <div class="total-box">
        <table style="margin: 0;">
            <tr class="bold" style="font-size: 12px;">
                <td>TOTAL LABA BERSIH ({{ $netProfit >= 0 ? 'PROFIT' : 'LOSS' }})</td>
                <td class="font-mono">Rp {{ number_format($netProfit, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

</body>
</html>