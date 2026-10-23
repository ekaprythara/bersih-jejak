import { Button } from "@/components/ui/button";
import { BranchType, ExpenseCategoryType } from "@/types/data-types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router, useForm, usePage } from "@inertiajs/react";
import { index, printPdf } from "@/routes/expenses";
import { ChevronDownIcon, Printer } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

type SortExpenseFormType = {
    branches: BranchType[];
    expenseCategories: ExpenseCategoryType[];
    filters: {
        min_date?: string | null;
        max_date?: string | null;
        branch_id?: string | number | null;
        expense_category_id?: string | number | null; // Tambahkan ini agar sinkron
    };
};

const toDate = (value?: string | null): Date | undefined => {
    if (!value) return undefined;

    const date = parseISO(value);
    return isValid(date) ? date : undefined;
};

const toDateString = (value?: Date): string => {
    return value ? format(value, "yyyy-MM-dd") : "";
};

const SortExpenseForm = ({
    branches,
    expenseCategories,
    filters,
}: SortExpenseFormType) => {
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
        branch_id: String(filters.branch_id ?? "all"),
        expense_category_id: String(filters.expense_category_id ?? "all"), // Perbaikan: Ambil dari expense_category_id, bukan branch_id
    });

    const isFiltered =
        form.data.min_date !== "" ||
        form.data.max_date !== "" ||
        form.data.branch_id !== "all" ||
        form.data.expense_category_id !== "all";

    const handleReset = () => {
        form.setData({
            min_date: "",
            max_date: "",
            branch_id: "all",
            expense_category_id: "all",
        });

        setMinDate(undefined);
        setMaxDate(undefined);

        router.get(
            index(),
            {}, // Kosongkan objek di sini agar parameter URL ikut terhapus
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleFilterChange = (
        field: "branch_id" | "min_date" | "max_date" | "expense_category_id",
        value: string,
    ) => {
        const updatedData = {
            ...form.data,
            [field]: value,
        };

        form.setData(updatedData);

        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleMinDateChange = (date?: Date) => {
        setMinDate(date);
        handleFilterChange("min_date", toDateString(date));
    };

    const handleMaxDateChange = (date?: Date) => {
        setMaxDate(date);
        handleFilterChange("max_date", toDateString(date));
    };

    const handlePrintPdf = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const url = new URL(printPdf.url(), window.location.origin);

        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });

        window.open(url.toString(), "_blank");
    };

    return (
        <div className="flex items-center gap-2">
            <form
                onSubmit={handlePrintPdf}
                className="flex flex-wrap items-center gap-2"
            >
                {/* Tanggal awal */}
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
                            <ChevronDownIcon className="ml-2 size-4" />
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
                            <ChevronDownIcon className="ml-2 size-4" />
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

                {/* Pilihan Kategori Pengeluaran */}
                <Select
                    value={form.data.expense_category_id}
                    onValueChange={(value) =>
                        handleFilterChange("expense_category_id", value)
                    }
                >
                    <SelectTrigger id="expense_category_id" className="w-50">
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">Semua Kategori</SelectItem>

                            {expenseCategories.map((expenseCategory) => (
                                <SelectItem
                                    key={expenseCategory.id}
                                    value={String(expenseCategory.id)}
                                >
                                    {expenseCategory.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* Pilihan cabang */}
                {currentUser.is_owner && (
                    <Select
                        value={form.data.branch_id}
                        onValueChange={(value) =>
                            handleFilterChange("branch_id", value)
                        }
                    >
                        <SelectTrigger id="branch_id" className="w-50">
                            <SelectValue placeholder="Semua Cabang" />
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

                {isFiltered && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleReset}
                    >
                        Hapus Filter
                    </Button>
                )}

                {/* Cetak PDF */}
                <Button type="submit" variant="success">
                    <Printer />
                    Cetak
                </Button>
            </form>
        </div>
    );
};

export default SortExpenseForm;
