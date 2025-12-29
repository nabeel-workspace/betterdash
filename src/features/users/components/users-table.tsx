import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
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

import { roles } from '../data/data'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

const route = getRouteApi('/_authenticated/users/')

export function UsersTable() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const usersQuery = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: search.pageSize ?? 10,
          offset: ((search.page ?? 1) - 1) * (search.pageSize ?? 10),
          ...(search.sort && search.sort.length > 0
            ? {
                sortBy: search.sort[0].id,
                sortDirection: search.sort[0].desc ? 'desc' : 'asc',
              }
            : {}),
          ...(search.username
            ? {
                searchValue: search.username,
                searchField: 'name',
                searchOperator: 'contains',
              }
            : {}),
          ...(search.banned && search.banned.length > 0
            ? {
                filterField: 'banned',
                filterValue: search.banned[0],
                filterOperator: 'eq',
              }
            : search.isAnonymous && search.isAnonymous.length > 0
              ? {
                  filterField: 'isAnonymous',
                  filterValue: search.isAnonymous[0],
                  filterOperator: 'eq',
                }
              : search.role && search.role.length > 0
                ? {
                    filterField: 'role',
                    filterValue: search.role[0],
                    filterOperator: 'eq',
                  }
                : {}),
        },
      })
      if (error) throw new Error(error.message)
      return data
    },
    placeholderData: keepPreviousData,
  })

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    banned: false,
    isAnonymous: false,
  })

  const { sort } = search

  const onSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sort || [])
        : updaterOrValue
    navigate({
      search: (prev) => ({ ...prev, sort: newSorting }),
    })
  }

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'banned', searchKey: 'banned', type: 'array' },
      { columnId: 'isAnonymous', searchKey: 'isAnonymous', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  const data = (usersQuery.data?.users as any) ?? []
  const rowCount = usersQuery.data?.total ?? 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    rowCount,
    state: {
      sorting: sort,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4',
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter users..."
        searchKey="username"
        filters={[
          {
            columnId: 'banned',
            title: 'Banned',
            options: [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ],
          },
          {
            columnId: 'isAnonymous',
            title: 'Anonymous',
            options: [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ],
          },
          {
            columnId: 'role',
            title: 'Role',
            options: roles.map((role) => ({ ...role })),
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (header.column.columnDef.meta as any)?.className,
                        (header.column.columnDef.meta as any)?.thClassName,
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
            {usersQuery.isLoading ? (
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
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (cell.column.columnDef.meta as any)?.className,
                        (cell.column.columnDef.meta as any)?.tdClassName,
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
