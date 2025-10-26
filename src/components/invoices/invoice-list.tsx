"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerJobSummary } from "@/types/invoices";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CustomerInfo, JobResponse } from "@/types/jobs";

interface InvoiceListProps {
  jobsByCustomer: CustomerJobSummary[];
  onCreateInvoice: (customer: CustomerInfo, selectedJob: JobResponse[]) => void;
  loading?: boolean;
}

export function InvoiceList({
  jobsByCustomer,
  onCreateInvoice,
  loading = false,
}: InvoiceListProps) {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(
    new Set()
  );
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());

  const toggleCustomer = (customerId: number) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const toggleJobSelect = (jobId: number) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAllJobs = (customerId: number, jobs: JobResponse[]) => {
    const newSelected = new Set(selectedJobs);
    const allJobsInCustomer = jobs.every((job) => newSelected.has(job.id));

    if (allJobsInCustomer) {
      jobs.forEach((job) => newSelected.delete(job.id));
    } else {
      jobs.forEach((job) => newSelected.add(job.id));
    }
    setSelectedJobs(newSelected);
  };

  const getSelectedJobsByCustomer = (customerId: number): number[] => {
    return Array.from(selectedJobs).filter((jobId) => {
      const customer = jobsByCustomer.find((c) => c.customer.id === customerId);
      return customer?.jobs.some((j) => j.id === jobId);
    });
  };

  if (jobsByCustomer.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Không có công việc chưa thanh toán
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobsByCustomer.map((customer, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCustomer(customer.customer.id)}
                  className="h-6 w-6 p-0"
                >
                  {expandedCustomers.has(customer.customer.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{customer.customer.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.customer.email}
                  </p>
                  {customer.customer.company && (
                    <p className="text-sm text-muted-foreground">
                      {customer.customer.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right mr-4">
                <p className="text-lg font-bold">
                  {formatCurrency(customer.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {customer.jobs.length} công việc
                </p>
              </div>
            </div>
          </div>

          {expandedCustomers.has(customer.customer.id) && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={customer.jobs.every((job) =>
                          selectedJobs.has(job.id)
                        )}
                        indeterminate={
                          customer.jobs.some((job) => selectedJobs.has(job.id)) &&
                          !customer.jobs.every((job) => selectedJobs.has(job.id))
                        }
                        onCheckedChange={() =>
                          toggleSelectAllJobs(customer.customer.id, customer.jobs)
                        }
                      />
                    </TableHead>
                    <TableHead>Mã Job</TableHead>
                    <TableHead>Tên Job</TableHead>
                    <TableHead>Trạng Thái Thanh Toán</TableHead>
                    <TableHead className="text-right">Số Tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.has(job.id)}
                          onCheckedChange={() => toggleJobSelect(job.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.code}</TableCell>
                      <TableCell>{job.caseName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            job.paymentStatus === "UNPAID"
                              ? "bg-red-500/10 text-red-700 border-red-500/20"
                              : "bg-orange-500/10 text-orange-700 border-orange-500/20"
                          }
                        >
                          {job.paymentStatus === "UNPAID"
                            ? "Chưa Thanh Toán"
                            : "Thanh Toán Một Phần"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(job.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t p-4 flex justify-end">
                <Button
                  onClick={() => {
                    const selectedJobIds = getSelectedJobsByCustomer(
                      customer.customer.id
                    );
                    if (selectedJobIds.length > 0) {
                      onCreateInvoice(customer.customer, customer.jobs.filter(job => selectedJobIds.includes(job.id)));
                    }
                  }}
                  disabled={
                    getSelectedJobsByCustomer(customer.customer.id).length === 0 ||
                    loading
                  }
                >
                  Tạo Hoá Đơn ({getSelectedJobsByCustomer(customer.customer.id).length})
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
