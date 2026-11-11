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
import { router, useForm, usePage } from "@inertiajs/react";
import { exportExcel, index, printPdf } from "@/routes/expenses";
import {
    CalendarIcon,
    ChevronDownIcon,
    Download,
    Filter,
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
import { FieldContent, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";

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

    const [isDialogOpen, setIsDialogOpen] = useState(false);
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

    let activeFiltersCount = 0;
    if (filters.min_date) activeFiltersCount++;
    if (filters.branch_id && String(filters.branch_id) !== "all")
        activeFiltersCount++;
    if (
        filters.expense_category_id &&
        String(filters.expense_category_id) !== "all"
    )
        activeFiltersCount++;

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        const fromStr = range?.from ? format(range.from, "yyyy-MM-dd") : "";
        const toStr = range?.to ? format(range.to, "yyyy-MM-dd") : "";
        form.setData({
            ...form.data,
            min_date: fromStr,
            max_date: toStr,
        });
    };

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index(), form.data, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        setIsDialogOpen(false);
    };

    const isFiltered =
        filters.min_date ||
        filters.max_date ||
        (filters.branch_id && String(filters.branch_id) !== "all") ||
        (filters.expense_category_id &&
            String(filters.expense_category_id) !== "all");

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
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleExportExcel = () => {
        const url = new URL(exportExcel.url(), window.location.origin);
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });
        window.location.href = url.toString();
    };

    const handlePrintPdf = () => {
        const url = new URL(printPdf.url(), window.location.origin);
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });
        window.open(url.toString(), "_blank");
    };

    const selectedCategoryName = expenseCategories.find(
        (cat) => String(cat.id) === String(filters.expense_category_id),
    )?.name;
    const selectedBranchName = branches.find(
        (branch) => String(branch.id) === String(filters.branch_id),
    )?.name;

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="p-3 sm:p-4 border border-neutral-200/80 rounded-xl flex flex-col gap-3 bg-white shadow-xs">
                {/* Bagian Atas: Search Bar & Tombol Aksi */}
                <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
                    {/* SearchBar */}
                    <div className="w-full sm:max-w-xs relative flex items-center">
                        <InputGroup className="w-full">
                            <InputGroupInput
                                placeholder="Cari pada tabel..."
                                value={globalFilter ?? ""}
                                onChange={(e) =>
                                    setGlobalFilter?.(String(e.target.value))
                                }
                            />
                            <InputGroupAddon>
                                <Search className="w-4 h-4 text-muted-foreground" />
                            </InputGroupAddon>
                            {globalFilter && (
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        onClick={() => setGlobalFilter?.("")}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                    </div>

                    {/* Kumpulan Tombol: Filter, Ekspor, Cetak (Grid 3 kolom di HP, Flex di Tablet/Desktop) */}
                    <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    className="w-full sm:w-fit gap-1.5 text-xs sm:text-sm px-2 sm:px-4"
                                    variant="outline"
                                >
                                    <Filter className="w-4 h-4 mr-0.5 sm:mr-1 shrink-0" />
                                    <span>Filter</span>
                                    {activeFiltersCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="px-1.5 py-0.5 text-[10px] sm:text-xs font-mono ml-auto sm:ml-0"
                                        >
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm w-[95%] rounded-xl max-h-[90vh] overflow-y-auto">
                                <form onSubmit={handleApplyFilter}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Filter Pengeluaran
                                        </DialogTitle>
                                        <DialogDescription>
                                            Sesuaikan filter data pengeluaran
                                            berdasarkan tanggal, kategori, atau
                                            cabang.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup className="py-4 space-y-3">
                                        <FieldContent>
                                            <Label htmlFor="name-1">
                                                Tanggal
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        type="button"
                                                        className="w-full justify-between text-left font-normal text-xs sm:text-sm"
                                                    >
                                                        <span className="flex items-center truncate">
                                                            <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                                            {dateRange?.from ? (
                                                                dateRange.to ? (
                                                                    <>
                                                                        {format(
                                                                            dateRange.from,
                                                                            "yyyy-MM-dd",
                                                                            {
                                                                                locale: id,
                                                                            },
                                                                        )}{" "}
                                                                        s/d{" "}
                                                                        {format(
                                                                            dateRange.to,
                                                                            "yyyy-MM-dd",
                                                                            {
                                                                                locale: id,
                                                                            },
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    format(
                                                                        dateRange.from,
                                                                        "yyyy-MM-dd",
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    Pilih
                                                                    Rentang
                                                                    Tanggal
                                                                </span>
                                                            )}
                                                        </span>
                                                        <ChevronDownIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="range"
                                                        defaultMonth={
                                                            dateRange?.from
                                                        }
                                                        selected={dateRange}
                                                        onSelect={
                                                            handleDateSelect
                                                        }
                                                        numberOfMonths={1}
                                                        locale={id}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FieldContent>

                                        <FieldContent>
                                            <Label htmlFor="expense_category_id">
                                                Kategori
                                            </Label>
                                            <Select
                                                value={
                                                    form.data
                                                        .expense_category_id
                                                }
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        "expense_category_id",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id="expense_category_id"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Semua Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="all">
                                                            Semua Kategori
                                                        </SelectItem>
                                                        {expenseCategories.map(
                                                            (
                                                                expenseCategory,
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        expenseCategory.id
                                                                    }
                                                                    value={String(
                                                                        expenseCategory.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        expenseCategory.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FieldContent>

                                        {currentUser.is_owner && (
                                            <FieldContent>
                                                <Label htmlFor="branch_id">
                                                    Cabang
                                                </Label>
                                                <Select
                                                    value={form.data.branch_id}
                                                    onValueChange={(value) =>
                                                        form.setData(
                                                            "branch_id",
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="branch_id"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Semua Cabang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="all">
                                                                Semua Cabang
                                                            </SelectItem>
                                                            {branches.map(
                                                                (branch) => (
                                                                    <SelectItem
                                                                        key={
                                                                            branch.id
                                                                        }
                                                                        value={String(
                                                                            branch.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            branch.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FieldContent>
                                        )}
                                    </FieldGroup>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <DialogClose asChild>
                                            <Button
                                                variant="outline"
                                                type="button"
                                                className="w-full sm:w-auto"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto"
                                        >
                                            Terapkan
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button
                            type="button"
                            className="w-full sm:w-fit text-xs sm:text-sm px-2 sm:px-4"
                            variant="success"
                            onClick={handleExportExcel}
                        >
                            <Download className="w-4 h-4 mr-0.5 sm:mr-1 shrink-0" />
                            <span>Ekspor</span>
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-fit text-xs sm:text-sm px-2 sm:px-4"
                            variant="outline"
                            onClick={handlePrintPdf}
                        >
                            <Printer className="w-4 h-4 mr-0.5 sm:mr-1 shrink-0" />
                            <span>Cetak</span>
                        </Button>
                    </div>
                </div>

                {/* Bagian Filter Aktif menggunakan Badge */}
                {isFiltered && (
                    <>
                        <Separator className="border-neutral-200/80 flex mx-auto" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-neutral-500 font-medium mr-1">
                                    Filter Aktif:
                                </span>
                                {filters.min_date && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-normal gap-1"
                                    >
                                        <span>
                                            Tanggal: {filters.min_date}{" "}
                                            {filters.max_date
                                                ? `sampai ${filters.max_date}`
                                                : ""}
                                        </span>
                                    </Badge>
                                )}
                                {filters.expense_category_id &&
                                    String(filters.expense_category_id) !==
                                        "all" &&
                                    selectedCategoryName && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs font-normal gap-1"
                                        >
                                            <span>
                                                Kategori: {selectedCategoryName}
                                            </span>
                                        </Badge>
                                    )}
                                {filters.branch_id &&
                                    String(filters.branch_id) !== "all" &&
                                    selectedBranchName && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs font-normal gap-1"
                                        >
                                            <span>
                                                Cabang: {selectedBranchName}
                                            </span>
                                        </Badge>
                                    )}
                            </div>
                            <button
                                className="text-xs text-red-500 hover:text-red-600 font-semibold hover:cursor-pointer text-left sm:text-right"
                                onClick={handleReset}
                                type="button"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SortExpenseForm;
