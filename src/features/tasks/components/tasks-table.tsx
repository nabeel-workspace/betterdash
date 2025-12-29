import { useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { priorities, statuses } from '../data/data'
import { getTasksFn, seedTasksFn } from '../server/actions'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { tasksColumns as columns } from './tasks-columns'

const route = getRouteApi('/_authenticated/tasks/')

export function TasksTable() {
  const queryClient = useQueryClient()
  const search = route.useSearch()
  const tasksQuery = useQuery({
    queryKey: ['tasks', search],
    queryFn: () =>
      getTasksFn({
        data: {
          ...search,
          pageIndex: (search.page ?? 1) - 1,
          pageSize: search.pageSize ?? 10,
          title: search.filter ?? undefined,
          sorting: search.sort,
        },
      }),
    placeholderData: keepPreviousData,
  })

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Synced with URL states (updated to match route search schema defaults)
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search,
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'priority', searchKey: 'priority', type: 'array' },
    ],
  })

  const { sort } = search
  const navigate = route.useNavigate()

  const onSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sort || [])
        : updaterOrValue
    navigate({
      search: (prev) => ({ ...prev, sort: newSorting }),
    })
  }

  const seedMutation = useMutation({
    mutationFn: seedTasksFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const data = tasksQuery.data?.data ?? []
  const rowCount = tasksQuery.data?.total ?? 0

  const table = useReactTable({
    data,
    columns,
    rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      sorting: sort,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder="Filter by title or ID..."
          filters={[
            {
              columnId: 'status',
              title: 'Status',
              options: statuses,
            },
            {
              columnId: 'priority',
              title: 'Priority',
              options: priorities,
            },
          ]}
        />
        {data.length < 1 && (
          <Button
            size="sm"
            onClick={() => seedMutation.mutate(undefined)}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending ? 'Seeding...' : 'Seed 100 Tasks'}
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tasksQuery.isLoading ? (
              Array.from({ length: search.pageSize ?? 10 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName,
                      )}
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} />
    </div>
  )
}
