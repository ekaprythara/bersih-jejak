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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import InputError from "@/components/input-error";
import { store } from "@/routes/expenses";
import { BranchType } from "@/pages/branch";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseCategoryType } from "@/types/data-types";

export const CreateExpenseDialog = ({
    branches,
    expenseCategories,
}: {
    branches: BranchType[];
    expenseCategories: ExpenseCategoryType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState<Date>();

    const form = useForm({
        expense_date: "",
        description: "",
        expense_category_id: "",
        amount: "",
        branch_id: "",
    });

    // Handle pemilihan tanggal agar masuk ke form data
    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            // Format ke YYYY-MM-DD agar sesuai dengan tipe date MySQL
            form.setData("expense_date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            form.setData("expense_date", "");
        }
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.post(store.url(), {
            onSuccess: () => {
                toast.success("Pengeluaran berhasil ditambahkan.");
                form.reset();
                setDate(undefined);
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error("Gagal menyimpan data pengeluaran.");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Tambah Pengeluaran</Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengeluaran</DialogTitle>
                        <DialogDescription>
                            Menambahkan pengeluaran baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        {/* Field Tanggal Pengeluaran */}
                        <Field>
                            <Label htmlFor="expense_date">
                                Tanggal Pengeluaran
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!date}
                                        className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground w-full"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            format(date, "PPP")
                                        ) : (
                                            <span>Pilih Tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateSelect}
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={form.errors.expense_date} />
                        </Field>

                        {/* Field Deskripsi */}
                        <Field>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="Pembayaran Listrik & Air"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                            />
                            <InputError message={form.errors.description} />
                        </Field>

                        {/* Field Jumlah Nominal */}
                        <Field>
                            <Label htmlFor="amount">Jumlah Nominal</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                min={0}
                                step={1000}
                                placeholder="250000"
                                value={form.data.amount}
                                onChange={(e) =>
                                    form.setData("amount", e.target.value)
                                }
                            />
                            <InputError message={form.errors.amount} />
                        </Field>

                        {/* Field Kategori */}
                        <Field>
                            <Label htmlFor="expense_category_id">
                                Kategori
                            </Label>
                            <Select
                                value={form.data.expense_category_id}
                                onValueChange={(value) =>
                                    form.setData("expense_category_id", value)
                                }
                            >
                                <SelectTrigger
                                    id="expense_category_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih Kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {expenseCategories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.expense_category_id}
                            />
                        </Field>

                        {/* Field Cabang */}
                        <Field>
                            <Label htmlFor="branch_id">Cabang Penempatan</Label>
                            <Select
                                value={form.data.branch_id}
                                onValueChange={(value) =>
                                    form.setData("branch_id", value)
                                }
                            >
                                <SelectTrigger
                                    id="branch_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih Cabang..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
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
                            <InputError message={form.errors.branch_id} />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Tambah"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
