import { Button } from "@/components/ui/button";
import {
    BranchType,
    PaymentMethodType,
    PaymentStatusType,
    ServiceType,
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
import { router, useForm, usePage } from "@inertiajs/react";
import { index, printPdf } from "@/routes/transactions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { id } from "date-fns/locale";

type SortTransactionFormType = {
    branches: BranchType[];
    transactionStatuses: TransactionStatusType[];
    paymentStatuses: PaymentStatusType[];
    paymentMethods: PaymentMethodType[];
    services: ServiceType[];
    filters: {
        min_date?: string | null;
        max_date?: string | null;
        branch_id?: string | number | null;
        service_id?: string | number | null;
        transaction_status_id?: string | number | null;
        payment_status_id?: string | number | null;
        payment_method_id?: string | number | null;
    };
};
const toDate = (value?: string | null): Date | undefined => {
    if (!value) return undefined;

    const date = parseISO(value);
    return isValid(date) ? date : undefined;
};
const SortTransactionForm = ({
    branches,
    services,
    transactionStatuses,
    paymentStatuses,
    paymentMethods,
    filters,
}: SortTransactionFormType) => {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [minDate, setMinDate] = useState<Date | undefined>(
        toDate(filters.min_date),
    );

    const [maxDate, setMaxDate] = useState<Date | undefined>(
        toDate(filters.max_date),
    );

    const form = useForm({
        min_date: filters.min_date ?? "",
        max_date: filters.max_date ?? "",
        branch_id: filters?.branch_id || "all",
        service_id: filters?.service_id || "all",
        transaction_status_id: filters?.transaction_status_id || "all",
        payment_status_id: filters?.payment_status_id || "all",
        payment_method_id: filters?.payment_method_id || "all",
    });

    const toDateString = (value?: Date): string => {
        return value ? format(value, "yyyy-MM-dd") : "";
    };

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
            min_date: "",
            max_date: "",
            branch_id: "all",
            service_id: "all",
            transaction_status_id: "all",
            payment_status_id: "all",
            payment_method_id: "all",
        });

        setMinDate(undefined);
        setMaxDate(undefined);

        router.get(
            index(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };
    const handleMinDateChange = (date?: Date) => {
        setMinDate(date);
        handleFilterChange("min_date", toDateString(date));
    };

    const handleMaxDateChange = (date?: Date) => {
        setMaxDate(date);
        handleFilterChange("max_date", toDateString(date));
    };

    // Cek apakah ada filter yang sedang aktif (tidak "all")
    const isFiltered =
        Boolean(form.data.min_date) ||
        Boolean(form.data.max_date) ||
        form.data.branch_id !== "all" ||
        form.data.service_id !== "all" ||
        form.data.transaction_status_id !== "all" ||
        form.data.payment_status_id !== "all" ||
        form.data.payment_method_id !== "all";

    const handlePrintPdf = (e: React.FormEvent) => {
        e.preventDefault();

        const url = new URL(printPdf.url(), window.location.origin);

        // Secara otomatis mengambil semua field di form.data (branch_id, payment_status_id, dll)
        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.append(key, String(value));
            }
        });

        window.open(url.toString(), "_blank");
    };

    return (
        <div className="flex gap-2 items-center">
            <form
                onSubmit={handlePrintPdf}
                className="flex items-center flex-wrap gap-2"
            >
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-53 justify-between text-left font-normal"
                        >
                            {minDate ? (
                                format(minDate, "yyyy-MM-dd", { locale: id })
                            ) : (
                                <span>Dari Tanggal</span>
                            )}
                            <ChevronDownIcon
                                className="ml-2 size-4"
                                color="#B9B9B9"
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={minDate}
                            onSelect={handleMinDateChange}
                            defaultMonth={maxDate}
                            disabled={(date) =>
                                maxDate ? date < maxDate : false
                            }
                        />
                    </PopoverContent>
                </Popover>

                {/* Tanggal akhir */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-53 justify-between text-left font-normal"
                        >
                            {maxDate ? (
                                format(maxDate, "yyyy-MM-dd", { locale: id })
                            ) : (
                                <span>Sampai Tanggal</span>
                            )}
                            <ChevronDownIcon
                                className="ml-2 size-4"
                                color="#B9B9B9"
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={maxDate}
                            onSelect={handleMaxDateChange}
                            defaultMonth={maxDate}
                            disabled={(date) =>
                                minDate ? date < minDate : false
                            }
                        />
                    </PopoverContent>
                </Popover>
                {currentUser.is_owner && (
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
                                <SelectItem value="all">
                                    Semua Cabang
                                </SelectItem>
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
                )}

                <Select
                    value={String(form.data.service_id)}
                    onValueChange={(value) =>
                        handleFilterChange("service_id", value)
                    }
                >
                    <SelectTrigger id="service_id" className="w-50">
                        <SelectValue placeholder="Semua Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">Semua Layanan</SelectItem>
                            {services.map((service) => (
                                <SelectItem
                                    key={service.id}
                                    value={String(service.id)}
                                >
                                    {service.name}
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

                <Select
                    value={String(form.data.payment_method_id)}
                    onValueChange={(value) =>
                        handleFilterChange("payment_method_id", value)
                    }
                >
                    <SelectTrigger id="payment_method_id" className="w-50">
                        <SelectValue placeholder="Semua Metode Pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">
                                Semua Metode Pembayaran
                            </SelectItem>
                            {paymentMethods.map((paymentMethod) => (
                                <SelectItem
                                    key={paymentMethod.id}
                                    value={String(paymentMethod.id)}
                                >
                                    {paymentMethod.name}
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
                <Button type="submit">Print</Button>
            </form>
        </div>
    );
};

export default SortTransactionForm;
