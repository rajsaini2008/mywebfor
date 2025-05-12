"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "../../../components/ui/data-table"
// Define our own ColumnDef type
import { toast } from "@/components/ui/use-toast"
import { Search, FileText, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth"

// Define our own ColumnDef type
interface ColumnDef<T> {
  accessorKey: string
  header: React.ReactNode
  cell: (props: { row: { original: T; index: number } }) => React.ReactNode
}

interface Payment {
  _id: string
  paymentId: string
  amount: number
  studentId: string
  studentName: string
  paymentDate: string
  paymentMode: string
  paymentStatus: string
  receiptNumber?: string
  paymentFor: string
  courseName?: string
  remarks?: string
  atcId?: string
}

export default function ATCPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const timestamp = new Date().getTime()
      // Add atcId parameter to only get payments for this ATC's students
      const response = await fetch(`/api/payments?atcId=${user?._id}&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Sort payments by date, most recent first
        const sortedPayments = data.data.sort((a: Payment, b: Payment) => {
          return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        })
        
        setPayments(sortedPayments)
        console.log(`Loaded ${data.data.length} payments from database`)
      } else {
        throw new Error(data.message || "Failed to load payments")
      }
    } catch (error) {
      console.error("Error loading payments:", error)
      toast({
        title: "Error loading payments",
        description: "There was a problem loading the payment data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = [...payments]
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        payment =>
          payment.paymentId.toLowerCase().includes(term) ||
          payment.studentName.toLowerCase().includes(term) ||
          payment.studentId.toLowerCase().includes(term) ||
          payment.paymentFor.toLowerCase().includes(term) ||
          (payment.courseName && payment.courseName.toLowerCase().includes(term)) ||
          (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(term))
      )
    }
    
    setFilteredPayments(filtered)
  }

  const refreshData = () => {
    fetchPayments()
    toast({
      title: "Refreshed",
      description: "Payment data has been refreshed",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadReceipt = (paymentId: string) => {
    // This would be implemented to download the receipt
    toast({
      title: "Download Receipt",
      description: "Receipt download functionality will be implemented in a future update.",
    })
  }

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "index",
      header: "SR.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "paymentId",
      header: "PAYMENT ID",
      cell: ({ row }) => row.original.paymentId,
    },
    {
      accessorKey: "studentName",
      header: "STUDENT",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-sm text-gray-500">{row.original.studentId}</div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: "paymentFor",
      header: "PURPOSE",
      cell: ({ row }) => row.original.paymentFor,
    },
    {
      accessorKey: "paymentDate",
      header: "DATE",
      cell: ({ row }) => formatDate(row.original.paymentDate),
    },
    {
      accessorKey: "paymentMode",
      header: "MODE",
      cell: ({ row }) => row.original.paymentMode,
    },
    {
      accessorKey: "paymentStatus",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.original.paymentStatus
        return (
          <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
            ${getStatusBadgeClass(status)}`}>
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={() => downloadReceipt(row.original._id)}
          disabled={row.original.paymentStatus !== "Paid"}
        >
          <FileText className="w-4 h-4 mr-2" />
          Receipt
        </Button>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Payments</h1>

      <div className="flex justify-between mb-6">
        <Button
          onClick={() => {
            toast({
              title: "Add Payment",
              description: "Payment creation functionality will be implemented in a future update.",
            })
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          New Payment
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search payments..."
              className="w-[250px] pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-9"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No payments found matching your criteria."
                : "No payment records available."}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredPayments}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 