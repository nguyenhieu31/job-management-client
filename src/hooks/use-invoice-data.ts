import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/store";
import { mockJobsByCustomer } from "@/lib/mock-data";

/**
 * Hook để toggle giữa mock data và real API
 * Set environment variable NEXT_PUBLIC_USE_MOCK_DATA=true để dùng mock
 */
export function useInvoiceData() {
  const { jobsByCustomer, previewInvoice, loading, error } = useAppSelector(
    (state) => state.invoices
  );
  const [useMockData, setUseMockData] = useState(false);

  // Check environment variable
  useEffect(() => {
    const shouldUseMock =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
    setUseMockData(shouldUseMock);
  }, []);

  // Return mock data if enabled
  if (useMockData) {
    return {
      jobsByCustomer: mockJobsByCustomer,
      previewInvoice: null,
      loading: false,
      error: null,
      useMockData: true,
    };
  }

  return {
    jobsByCustomer,
    previewInvoice,
    loading,
    error,
    useMockData: false,
  };
}

/**
 * Mock invoice data generator
 * Generates a fake invoice with selected jobs
 */
export function generateMockInvoice(
  customerId: number,
  jobIds: number[]
) {
  const customer = mockJobsByCustomer.find(
    (c) => c.customerId === customerId
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  const items = customer.jobs
    .filter((job) => jobIds.includes(job.id))
    .map((job) => ({
      jobId: job.id,
      jobCode: job.code,
      caseName: job.caseName,
      amount: job.totalPrice,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0; // 0% tax for now
  const total = subtotal + tax;

  return {
    id: Math.random(),
    invoiceNumber: `INV-${Date.now()}`,
    customerId: customer.customerId,
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    customerPhone: customer.customerPhone,
    customerCompany: customer.customerCompany,
    items,
    subtotal,
    tax,
    total,
    status: "DRAFT" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: "",
  };
}
