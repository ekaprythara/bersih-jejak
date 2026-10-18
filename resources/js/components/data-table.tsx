import {
    flexRender,
    useTable,
    tableFeatures,
    columnFilteringFeature,
    globalFilteringFeature,
    createSortedRowModel,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_datetime,
    sortFn_text,
    createFilteredRowModel,
    filterFn_includesString,
} from "@tanstack/react-table";

import type { ColumnDef, RowData } from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "./ui/input";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export const features = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortedRowModel: createSortedRowModel(),
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        datetime: sortFn_datetime,
        text: sortFn_text,
    },
});

type DataTableProps<TData extends RowData> = {
    // Perbaikan tipe ColumnDef agar menerima tipe data TData yang benar
    columns: ColumnDef<typeof features, any>[];
    data: TData[];
};

const DataTable = <TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) => {
    const table = useTable({
        features,
        columns,
        data,
        globalFilterFn: "includesString",
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="w-fit ms-auto relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <Input
                    value={table.state.globalFilter ?? ""}
                    onChange={(e) =>
                        table.setGlobalFilter(String(e.target.value))
                    }
                    placeholder="Cari..."
                    className="pl-8"
                />
            </div>
            <div className="rounded-xl border border-sidebar-border/70 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-b border-sidebar-border/70 hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-11 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? "sortable-header cursor-pointer select-none flex items-center gap-1"
                                                        : ""
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                                title={
                                                    header.column.getCanSort()
                                                        ? header.column.getNextSortingOrder() ===
                                                          "asc"
                                                            ? "Sort ascending"
                                                            : header.column.getNextSortingOrder() ===
                                                                "desc"
                                                              ? "Sort descending"
                                                              : "Clear sort"
                                                        : undefined
                                                }
                                            >
                                                {/* Perbaikan: Gunakan flexRender yang diimport di atas, bukan table.FlexRender */}
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {{
                                                    asc: (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ),
                                                    desc: (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ),
                                                }[
                                                    header.column.getIsSorted() as string
                                                ] ?? null}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody className="divide-y divide-sidebar-border/50">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                                >
                                    {row.getAllCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3.5 text-sm text-foreground/90"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default DataTable;
