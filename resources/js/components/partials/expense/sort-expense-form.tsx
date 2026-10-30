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
import { exportExcel, index, printPdf } from "@/routes/expenses";
import {
    CalendarIcon,
    ChevronDownIcon,
    Download,
    Printer,
    Search,
    X,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";

type SortExpenseFormType = {
    branches: BranchType[];
    expenseCategories: ExpenseCategoryType[];
    filters: {
        min_date?: string | null;
        max_date?: string | null;
        branch_id?: string | number | null;
        expense_category_id?: string | number | null;
    };
    globalFilter?: string;
    setGlobalFilter?: (value: string) => void;
};

const toDate = (value?: string | null): Date | undefined => {
    if (!value) return undefined;
    const date = parseISO(value);
    return isValid(date) ? date : undefined;
};

const SortExpenseForm = ({
    branches,
    expenseCategories,
    filters,
    globalFilter,
    setGlobalFilter,
}: SortExpenseFormType) => {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: toDate(filters.min_date),
        to: toDate(filters.max_date),
    });

    const form = useForm({
        min_date: filters.min_date ?? "",
        max_date: filters.max_date ?? "",
        branch_id: String(filters.branch_id ?? "all"),
        expense_category_id: String(filters.expense_category_id ?? "all"),
    });

    const handleFilterChange = (updatedFields: Record<string, any>) => {
        const updatedData = {
            ...form.data,
            ...updatedFields,
        };

        form.setData(updatedData as any);

        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);

        const fromStr = range?.from ? format(range.from, "yyyy-MM-dd") : "";
        const toStr = range?.to ? format(range.to, "yyyy-MM-dd") : "";

        handleFilterChange({
            min_date: fromStr,
            max_date: toStr,
        });
    };

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

        setDateRange(undefined);

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

    const handleExportExcel = () => {
        const url = new URL(exportExcel.url(), window.location.origin);

        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });

        window.location.href = url.toString();
    };

    const handlePrintPdf = () => {
        const url = new URL(printPdf.url(), window.location.origin);

        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });

        window.open(url.toString(), "_blank");
    };

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Grid Form Filter */}
            <form
                className={`grid gap-2 w-full grid-cols-1 ${
                    currentUser.is_owner ? "md:grid-cols-3" : "md:grid-cols-2"
                }`}
            >
                {/* 1. Rentang Tanggal */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full justify-between text-left font-normal"
                        >
                            <span className="flex items-center truncate">
                                <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(
                                                dateRange.from,
                                                "yyyy-MM-dd",
                                                { locale: id },
                                            )}{" "}
                                            s/d{" "}
                                            {format(
                                                dateRange.to,
                                                "yyyy-MM-dd",
                                                { locale: id },
                                            )}
                                        </>
                                    ) : (
                                        format(dateRange.from, "yyyy-MM-dd", {
                                            locale: id,
                                        })
                                    )
                                ) : (
                                    <span className="text-muted-foreground">
                                        Pilih Rentang Tanggal
                                    </span>
                                )}
                            </span>
                            <ChevronDownIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                            locale={id}
                        />
                    </PopoverContent>
                </Popover>

                {/* 2. Kategori Pengeluaran */}
                <Select
                    value={form.data.expense_category_id}
                    onValueChange={(value) =>
                        handleFilterChange({ expense_category_id: value })
                    }
                >
                    <SelectTrigger id="expense_category_id" className="w-full">
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

                {/* 3. Cabang (Hanya jika Owner) */}
                {currentUser.is_owner && (
                    <Select
                        value={form.data.branch_id}
                        onValueChange={(value) =>
                            handleFilterChange({ branch_id: value })
                        }
                    >
                        <SelectTrigger id="branch_id" className="w-full">
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
            </form>

            <div className="flex items-center flex-col md:flex-row gap-2">
                <div className="w-full relative flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        value={globalFilter ?? ""}
                        onChange={(e) =>
                            setGlobalFilter?.(String(e.target.value))
                        }
                        placeholder="Cari pengeluaran..."
                        className="pl-8 pr-8 h-9 w-full bg-white"
                    />
                    {globalFilter && (
                        <button
                            type="button"
                            onClick={() => setGlobalFilter?.("")}
                            className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                {isFiltered && (
                    <Button
                        type="button"
                        className="w-full md:w-fit"
                        variant="destructive"
                        onClick={handleReset}
                    >
                        <X strokeWidth={2.5} />
                        <span className="font-semibold">Hapus Filter</span>
                    </Button>
                )}
                <Button
                    type="button"
                    className="w-full md:w-fit"
                    variant="success"
                    onClick={handleExportExcel}
                >
                    <Download className="w-4 h-4 mr-1" />
                    Ekspor
                </Button>

                <Button
                    type="button"
                    className="w-full md:w-fit"
                    variant="outline"
                    onClick={handlePrintPdf}
                >
                    <Printer className="w-4 h-4 mr-1" />
                    Cetak
                </Button>
            </div>
        </div>
    );
};

export default SortExpenseForm;
