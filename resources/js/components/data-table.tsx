import { flexRender, tableFeatures, useTable } from "@tanstack/react-table";

import type { ColumnDef, RowData } from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const features = tableFeatures({});

type DataTableProps<TData extends RowData> = {
    columns: ColumnDef<typeof features, TData>[];
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
    });

    return (
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
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
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
    );
};

export default DataTable;
