import { Button } from "@/components/ui/button";
import { BranchType } from "@/types/data-types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router, useForm } from "@inertiajs/react";
import { index } from "@/routes/expenses";

type SortExpenseFormType = {
    branches: BranchType[];
    filters: {
        branch_id: string;
    };
};

const SortExpenseForm = ({ branches, filters }: SortExpenseFormType) => {
    const form = useForm({
        branch_id: filters?.branch_id || "all",
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

    return (
        <div className="flex gap-2 items-center">
            <form className="flex items-center gap-2">
                <Select
                    value={String(form.data.branch_id)}
                    onValueChange={(value) =>
                        handleFilterChange("branch_id", value)
                    }
                >
                    <SelectTrigger id="branch_id" className="w-[200px]">
                        <SelectValue />
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

                {form.data.branch_id !== "all" && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleFilterChange("branch_id", "all")}
                    >
                        Hapus Sortir
                    </Button>
                )}
            </form>
        </div>
    );
};

export default SortExpenseForm;
