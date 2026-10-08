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
import { ChangeEvent, SubmitEventHandler, useState } from "react";
import InputError from "@/components/input-error";
import { store } from "@/routes/expenses";
import { BranchType, ExpenseType } from "@/types/data-types";
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
    const today = new Date();
    const [date, setDate] = useState<Date | undefined>(today);
    const [previewImage, setPreviewImage] = useState<string>();

    const form = useForm({
        expense_date: format(today, "yyyy-MM-dd"),
        description: "",
        expense_category_id: "",
        amount: "",
        branch_id: "",
        image: null as File | null,
    });

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            // Format ke YYYY-MM-DD agar sesuai dengan tipe date MySQL
            form.setData("expense_date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            form.setData("expense_date", "");
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            form.setData("image", file);
            setPreviewImage(URL.createObjectURL(file));
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
                                            format(date, "dd-MM-yyyy")
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
                            <Label htmlFor="branch_id">Pilih Cabang...</Label>
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

                        <div className="space-y-1.5">
                            <label
                                htmlFor="image"
                                className="text-xs font-semibold text-gray-700"
                            >
                                Lampiran Nota / Struk (Opsional)
                            </label>

                            <div className="mt-2 w-full">
                                <label
                                    htmlFor="image"
                                    className="group relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-2 text-center transition-all hover:border-gray-400 hover:bg-gray-50"
                                >
                                    {!previewImage ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white shadow-xs transition-colors group-hover:border-gray-400">
                                                <svg
                                                    className="h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-medium text-gray-600">
                                                    Choose image or drag and
                                                    drop it here.
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    PNG, JPG, dan WEBP. Max 5
                                                    MB.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-2">
                                            <img
                                                src={previewImage}
                                                alt="Preview Bukti"
                                                className="h-44 w-full object-contain"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                                                    Klik untuk mengganti
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        id="image"
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {form.errors.image && (
                                <div className="text-red-500 text-xs mt-1">
                                    {form.errors.image}
                                </div>
                            )}
                        </div>
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
