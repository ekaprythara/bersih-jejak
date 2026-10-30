import {
    flexRender,
    useTable,
    tableFeatures,
    columnFilteringFeature,
    globalFilteringFeature,
    createSortedRowModel,
    rowSortingFeature,
    createFilteredRowModel,
    filterFn_includesString,
    rowPaginationFeature,
    createPaginatedRowModel,
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
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    Search,
    X,
} from "lucide-react";
import { Button } from "./ui/button";

export const features = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortedRowModel: createSortedRowModel(),
    rowPaginationFeature,
    paginatedRowModel: createPaginatedRowModel(),
});

type DataTableProps<TData extends RowData> = {
    columns: ColumnDef<typeof features, any>[];
    data: TData[];
};

const DataTable = <TData extends RowData>({
    columns,
    data,
    globalFilter,
    setGlobalFilter,
}: DataTableProps<TData>) => {
    const table = useTable(
        {
            features,
            columns,
            data,
            globalFilterFn: "includesString",
            state: {
                globalFilter,
            },
            onGlobalFilterChange: setGlobalFilter,
        },
        (state) => state,
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Tabel */}
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
                                        className="h-10 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? "cursor-pointer select-none flex items-center gap-1"
                                                        : ""
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {{
                                                    asc: (
                                                        <ChevronUp className="h-3.5 w-3.5" />
                                                    ),
                                                    desc: (
                                                        <ChevronDown className="h-3.5 w-3.5" />
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
                                    className="transition-colors hover:bg-muted/40"
                                >
                                    {row.getAllCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 text-sm py-3 text-foreground/90"
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
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-muted-foreground font-medium text-sm">
                    {`Halaman ${table.state.pagination.pageIndex + 1} dari ${table.getPageCount().toLocaleString()}`}
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.firstPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-3.5 w-3.5 text-neutral-600" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-3.5 w-3.5 text-neutral-600" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => table.lastPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-3.5 w-3.5 text-neutral-600" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
