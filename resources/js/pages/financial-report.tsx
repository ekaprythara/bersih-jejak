import { Head } from "@inertiajs/react";
import { dashboard } from "@/routes";
import Heading from "@/components/heading";
import financial from "@/routes/financial";
import { Separator } from "@/components/ui/separator";

export default function FinancialReport() {
    return (
        <>
            <Head title="Laporan Keuangan" />

            <div className="p-4">
                <Heading
                    title="Laporan Keuangan"
                    description="Halaman untuk melihat laporan keuangan per outlet."
                />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 border border-neutral-200 rounded-lg p-4">
                        <h2>Laporan Laba Bersih</h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex flex-col gap-2">
                                <div>Pendapatan Cash</div>
                                <div>Rp. 2502412134</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div>Pendapatan Transfer</div>
                                <div>-</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div>Total Pengeluaran</div>
                                <div>-</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div>Jumlah Beban Lain-lain</div>
                                <div>-</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 border border-neutral-200 rounded-lg p-4">
                        <h2>Laporan Laba Bersih</h2>
                        <div className="font-bold">Pendapatan</div>
                        <div className="flex flex-col gap-2 pl-4 text-sm">
                            <div className="grid grid-cols-2">
                                <div>Pendapatan Cash</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div>Pendapatan Transfer</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div>Pendapatan QRIS</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                        </div>

                        <Separator />

                        <strong className="grid grid-cols-2">
                            <div>Total Pendapatan</div>
                            <div className="ms-auto">Rp. 2.500.000</div>
                        </strong>

                        <div className="font-bold">Beban</div>
                        <div className="flex flex-col gap-2 pl-4 text-sm">
                            <div className="grid grid-cols-2">
                                <div>Gaji</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div>Utilitas</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div>Lain-Lain</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                        </div>

                        <Separator />

                        <strong className="grid grid-cols-2">
                            <div>Laba Bersih</div>
                            <div className="ms-auto">Rp. 2.500.000</div>
                        </strong>

                        <div className="font-bold">Pendapatan</div>
                        <div className="flex flex-col gap-2 pl-4 text-sm">
                            <div className="grid grid-cols-2">
                                <div>Total Pendapatan</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div>Total Beban</div>
                                <div className="ms-auto">Rp. 500.000</div>
                            </div>
                        </div>

                        <Separator />

                        <strong className="grid grid-cols-2">
                            <div>Total Laba Bersih</div>
                            <div className="ms-auto">Rp. 2.500.000</div>
                        </strong>
                    </div>
                </div>
            </div>
        </>
    );
}

FinancialReport.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Laporan Keuangan",
            href: financial.report.index(),
        },
    ],
};
