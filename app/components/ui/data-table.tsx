"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Column<T> {
  accessorKey: string
  header: React.ReactNode
  cell: (props: { row: { original: T; index: number } }) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(0)

  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = React.useMemo(() => {
    const start = currentPage * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell({ 
                        row: { 
                          original: row, 
                          index: rowIndex + currentPage * pageSize 
                        } 
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > pageSize && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 