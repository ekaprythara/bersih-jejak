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
import { Eye } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const ShowTransactionDialog = ({
    transaction,
}: {
    transaction: TransactionType;
}) => {
    const handleSendWhatsAppMsg = (e) => {
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

        // 3. Susun pesan WhatsApp
        const message = `Halo ${transaction.customer?.name || "Pelanggan"}, berikut adalah tautan invoice untuk transaksi #${transaction.invoice_number}:\n${invoiceUrl}`;

        // 4. Buat URL wa.me
        const waUrl = new URL(`https://wa.me/${phoneNumber}`);
        waUrl.searchParams.set("text", message);

        // 5. Buka tab baru ke WhatsApp
        window.open(waUrl.toString(), "_blank", "noopener,noreferrer");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Eye />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                {/* Bagian Rincian menggunakan Teks Rapi */}
                <div className="space-y-4 py-2 text-sm">
                    {/* Baris 1: Invoice & Tanggal */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                No. Invoice
                            </span>
                            <span className="font-semibold text-foreground">
                                {transaction.invoice_number || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Tanggal Transaksi
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.transaction_date || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Baris 2: Pelanggan & No. Telepon */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Nama Pelanggan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.customer?.name || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                No. Telepon Pelanggan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.customer?.phone_number || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Baris 3: Layanan & Jumlah Sepatu */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Layanan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.service?.name || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Jumlah Sepatu
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.shoe_count || 0} Pasang
                            </span>
                        </div>
                    </div>

                    {/* Baris 4: Diskon & Total Biaya */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Diskon
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.discount
                                    ? formatRupiah(transaction.discount)
                                    : "Rp 0"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Total Biaya
                            </span>
                            <span className="font-semibold text-primary">
                                {formatRupiah(transaction.total_amount || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Baris 5: Tanggal Pengambilan & Metode Pembayaran */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Tanggal Pengambilan
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.pickup_date || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Metode Pembayaran
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.payment_method?.name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Baris 6: Status Bayar & Status Transaksi */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-lg">
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Status Bayar
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.payment_status?.name || "-"}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-muted-foreground">
                                Status Transaksi
                            </span>
                            <span className="font-medium text-foreground">
                                {transaction.transaction_status?.name || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Baris 7: Cabang */}
                    <div className="p-3 bg-muted/40 rounded-lg">
                        <span className="block text-xs font-medium text-muted-foreground">
                            Cabang
                        </span>
                        <span className="font-medium text-foreground">
                            {transaction.branch?.name
                                ? `${transaction.branch.name} - ${transaction.branch.address}`
                                : "-"}
                        </span>
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
