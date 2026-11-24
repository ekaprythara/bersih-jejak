import React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TransactionType } from "@/types/data-types";
import { Eye, Image as ImageIcon } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const ShowTransactionDialog = ({
    transaction,
}: {
    transaction: TransactionType & {
        image_before?: string;
        image_after?: string;
    };
}) => {
    const handleSendWhatsAppMsg = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 1. Membuat full link secara dinamis
        const baseUrl = window.location.origin;
        const invoiceUrl = `${baseUrl}/transactions/${transaction.invoice_number}/invoice`;

        // 2. Format nomor telepon customer (0851... -> 62851... tanpa tanda +)
        let phoneNumber = transaction.customer?.phone_number || "";
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        if (phoneNumber.startsWith("0")) {
            phoneNumber = "62" + phoneNumber.slice(1);
        }

        // 3. Siapkan detail transaksi untuk nota WhatsApp
        const customerName = transaction.customer?.name || "Pelanggan";
        const branchName = transaction.branch?.name || "-";
        const branchAddress = transaction.branch?.address || "";
        const serviceName = transaction.service?.name || "-";
        const shoeCount = transaction.shoe_count || 0;
        const discountText = transaction.discount
            ? formatRupiah(transaction.discount)
            : "Rp 0";
        const totalAmountText = formatRupiah(transaction.total_amount || 0);
        const paymentStatus = transaction.payment_status?.name || "-";
        const paymentMethod = transaction.payment_method?.name || "-";
        const transactionStatus = transaction.transaction_status?.name || "-";

        // 4. Susun pesan nota dengan monospace backtick
        // 4. Susun pesan nota dengan monospace backtick (di-escape dengan \`)
        const receiptBlock = [
            `NOTA TRANSAKSI`,
            `==============================`,
            `Invoice     : ${transaction.invoice_number}`,
            `Tanggal     : ${transaction.transaction_date || "-"}`,
            `Est. Ambil  : ${transaction.pickup_date || "-"}`,
            `Pelanggan   : ${customerName}`,
            `Cabang      : ${branchName}`,
            ...(branchAddress ? [`Alamat      : ${branchAddress}`] : []),
            `------------------------------`,
            `Layanan     : ${serviceName}`,
            `Jumlah      : ${shoeCount} Pasang`,
            `Diskon      : ${discountText}`,
            `------------------------------`,
            `TOTAL BAYAR : ${totalAmountText}`,
            `==============================`,
            `Status Kerja: ${transactionStatus}`,
            `Pembayaran  : ${paymentStatus} (${paymentMethod})`,
            `------------------------------`,
        ]

            .map((line) => `\`${line}\``)
            .join("\n");

        const message = [
            receiptBlock,
            `Nota Digital: ${invoiceUrl}`,
            ``,
            `Terima kasih telah mempercayakan sepatu Anda kepada kami.`,
        ].join("\n");

        // 5. Buat URL wa.me
        const waUrl = new URL(`https://wa.me/${phoneNumber}`);
        waUrl.searchParams.set("text", message);

        // 6. Buka tab baru ke WhatsApp
        window.open(waUrl.toString(), "_blank", "noopener,noreferrer");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="info">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain scrollbar-none sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Rincian Transaksi</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                {/* Bagian Rincian dengan Tampilan Lebih Rapi & Compact */}
                <div className="space-y-4 py-2 text-sm">
                    {/* Grid Informasi Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                No. Invoice
                            </span>
                            <span className="font-semibold text-foreground font-mono">
                                {transaction.invoice_number || "-"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Tanggal Transaksi
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.transaction_date || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Pelanggan & Telepon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Nama Pelanggan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.customer?.name || "-"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                No. Telepon Pelanggan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.customer?.phone_number || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Layanan & Jumlah Sepatu */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Layanan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.service?.name || "-"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Jumlah Sepatu
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.shoe_count || 0} Pasang
                            </span>
                        </div>
                    </div>

                    {/* Diskon & Total Biaya */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Diskon
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.discount
                                    ? formatRupiah(transaction.discount)
                                    : "Rp 0"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Total Biaya
                            </span>
                            <span className="font-bold text-primary font-mono text-base">
                                {formatRupiah(transaction.total_amount || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Tanggal Pengambilan & Metode Pembayaran */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Tanggal Pengambilan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.pickup_date || "-"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Metode Pembayaran
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.payment_method?.name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Status Bayar & Status Transaksi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Status Bayar
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.payment_status?.name || "-"}
                            </span>
                        </div>
                        <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                                Status Transaksi
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.transaction_status?.name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Cabang */}
                    <div className="p-3 bg-muted/30 border rounded-xl flex flex-col justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                            Cabang
                        </span>
                        <span className="font-medium text-foreground">
                            {transaction.branch?.name
                                ? `${transaction.branch.name} - ${transaction.branch.address}`
                                : "-"}
                        </span>
                    </div>

                    {/* Bagian Foto Before & After */}
                    <div className="pt-2">
                        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Dokumentasi Foto Sepatu
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Foto Before */}
                            <div className="p-3 bg-muted/30 border rounded-xl flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Foto Sebelum (Before)
                                </span>
                                {transaction.image_before ? (
                                    <div className="relative w-full h-36 overflow-hidden rounded-lg border bg-background">
                                        <img
                                            src={`/storage/${transaction.image_before}`}
                                            alt="Foto Before"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-36 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20 gap-1">
                                        <ImageIcon className="h-5 w-5 opacity-40" />
                                        <span className="text-xs">
                                            Tidak ada foto
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Foto After */}
                            <div className="p-3 bg-muted/30 border rounded-xl flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Foto Sesudah (After)
                                </span>
                                {transaction.image_after ? (
                                    <div className="relative w-full h-36 overflow-hidden rounded-lg border bg-background">
                                        <img
                                            src={`/storage/${transaction.image_after}`}
                                            alt="Foto After"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-36 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20 gap-1">
                                        <ImageIcon className="h-5 w-5 opacity-40" />
                                        <span className="text-xs">
                                            Tidak ada foto
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSendWhatsAppMsg}>
                        Kirim Invoice ke WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShowTransactionDialog;
