import { Button } from "@/components/ui/button";
import {
    BranchType,
    PaymentStatusType,
    TransactionStatusType,
} from "@/types/data-types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router, useForm } from "@inertiajs/react";
import { index } from "@/routes/transactions";

type SortTransactionForm = {
    branches: BranchType[];
    transactionStatuses: TransactionStatusType[];
    paymentStatuses: PaymentStatusType[];
    filters: {
        branch_id: string;
        transaction_status_id: string;
        payment_status_id: string;
    };
};

const SortTransactionForm = ({
    branches,
    transactionStatuses,
    paymentStatuses,
    filters,
}: SortTransactionForm) => {
    const form = useForm({
        branch_id: filters?.branch_id || "all",
        transaction_status_id: filters?.transaction_status_id || "all",
        payment_status_id: filters?.payment_status_id || "all",
    });

    const handleFilterChange = (field: string, value: string) => {
        form.setData(field, value);

        const updatedData = {
            ...form.data,
            [field]: value,
        };

        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Perbaikan: Reset sekaligus dalam satu request router.get
    const handleReset = () => {
        form.setData({
            branch_id: "all",
            transaction_status_id: "all",
            payment_status_id: "all",
        });

        router.get(
            index(),
            {
                branch_id: "all",
                transaction_status_id: "all",
                payment_status_id: "all",
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Cek apakah ada filter yang sedang aktif (tidak "all")
    const isFiltered =
        form.data.branch_id !== "all" ||
        form.data.transaction_status_id !== "all" ||
        form.data.payment_status_id !== "all";

    return (
        <div className="flex gap-2 items-center">
            <form className="flex items-center gap-2">
                <Select
                    value={String(form.data.branch_id)}
                    onValueChange={(value) =>
                        handleFilterChange("branch_id", value)
                    }
                >
                    <SelectTrigger id="branch_id" className="w-50">
                        <SelectValue placeholder="Pilih Cabang..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">Semua Cabang</SelectItem>
                            {branches.map((branch) => (
                                <SelectItem
                                    key={branch.id}
                                    value={String(branch.id)}
                                >
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select
                    value={String(form.data.transaction_status_id)}
                    onValueChange={(value) =>
                        handleFilterChange("transaction_status_id", value)
                    }
                >
                    <SelectTrigger id="transaction_status_id" className="w-50">
                        <SelectValue placeholder="Status Transaksi..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">
                                Status Transaksi
                            </SelectItem>
                            {transactionStatuses.map((transactionStatus) => (
                                <SelectItem
                                    key={transactionStatus.id}
                                    value={String(transactionStatus.id)}
                                >
                                    {transactionStatus.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select
                    value={String(form.data.payment_status_id)}
                    onValueChange={(value) =>
                        handleFilterChange("payment_status_id", value)
                    }
                >
                    <SelectTrigger id="payment_status_id" className="w-50">
                        <SelectValue placeholder="Status Pembayaran..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">
                                Status Pembayaran
                            </SelectItem>
                            {paymentStatuses.map((paymentStatus) => (
                                <SelectItem
                                    key={paymentStatus.id}
                                    value={String(paymentStatus.id)}
                                >
                                    {paymentStatus.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Perbaikan Kondisi Render & Pemanggilan onClick */}
                {isFiltered && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleReset}
                    >
                        Hapus Sortir
                    </Button>
                )}
            </form>
        </div>
    );
};

export default SortTransactionForm;
