import { EmployeePayroll, PayrollSummary } from "@/types/payroll";

// Mock payroll data for October 2024
export const mockPayrollData: EmployeePayroll[] = [
  {
    id: 1,
    payrollPeriod: "2024-10",
    employeeId: 1,
    employeeName: "Nguyễn Văn A",
    employeeEmail: "nguyena@example.com",
    employeePhone: "0901234567",
    items: [
      {
        jobId: 1,
        jobCode: "JOB-001",
        caseName: "Website Development",
        completedDate: new Date("2024-10-05"),
        amount: 1500000, // 1.5M
      },
      {
        jobId: 2,
        jobCode: "JOB-002",
        caseName: "Database Design",
        completedDate: new Date("2024-10-12"),
        amount: 1000000, // 1M
      },
      {
        jobId: 3,
        jobCode: "JOB-003",
        caseName: "API Integration",
        completedDate: new Date("2024-10-18"),
        amount: 800000, // 800k
      },
    ],
    subtotal: 3300000, // 3.3M
    deductions: 300000, // 300k (taxes, insurance, etc.)
    bonus: 200000, // 200k (performance bonus)
    total: 3200000, // 3.2M
    status: "PENDING",
    approvedBy: undefined,
    approvalDate: undefined,
    paidDate: undefined,
    notes: undefined,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: 2,
    payrollPeriod: "2024-10",
    employeeId: 2,
    employeeName: "Trần Thị B",
    employeeEmail: "thib@example.com",
    employeePhone: "0912345678",
    items: [
      {
        jobId: 4,
        jobCode: "JOB-004",
        caseName: "Mobile App UI",
        completedDate: new Date("2024-10-08"),
        amount: 2000000, // 2M
      },
      {
        jobId: 5,
        jobCode: "JOB-005",
        caseName: "App Testing",
        completedDate: new Date("2024-10-15"),
        amount: 1200000, // 1.2M
      },
    ],
    subtotal: 3200000, // 3.2M
    deductions: 250000, // 250k
    bonus: 300000, // 300k
    total: 3250000, // 3.25M
    status: "PENDING",
    approvedBy: undefined,
    approvalDate: undefined,
    paidDate: undefined,
    notes: undefined,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: 3,
    payrollPeriod: "2024-10",
    employeeId: 3,
    employeeName: "Lê Văn C",
    employeeEmail: "levanc@example.com",
    employeePhone: "0923456789",
    items: [
      {
        jobId: 6,
        jobCode: "JOB-006",
        caseName: "QA Testing",
        completedDate: new Date("2024-10-10"),
        amount: 1300000, // 1.3M
      },
      {
        jobId: 7,
        jobCode: "JOB-007",
        caseName: "Bug Fixing",
        completedDate: new Date("2024-10-17"),
        amount: 1100000, // 1.1M
      },
    ],
    subtotal: 2400000, // 2.4M
    deductions: 200000, // 200k
    bonus: 100000, // 100k
    total: 2300000, // 2.3M
    status: "APPROVED", // Approved status
    approvedBy: "Quản lý 1",
    approvalDate: new Date("2024-10-20"),
    paidDate: undefined,
    notes: "Đã duyệt",
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: 4,
    payrollPeriod: "2024-10",
    employeeId: 4,
    employeeName: "Phạm Thị D",
    employeeEmail: "phamd@example.com",
    employeePhone: "0934567890",
    items: [
      {
        jobId: 8,
        jobCode: "JOB-008",
        caseName: "Documentation",
        completedDate: new Date("2024-10-06"),
        amount: 800000, // 800k
      },
      {
        jobId: 9,
        jobCode: "JOB-009",
        caseName: "Code Review",
        completedDate: new Date("2024-10-13"),
        amount: 900000, // 900k
      },
      {
        jobId: 10,
        jobCode: "JOB-010",
        caseName: "Training",
        completedDate: new Date("2024-10-20"),
        amount: 700000, // 700k
      },
    ],
    subtotal: 2400000, // 2.4M
    deductions: 200000, // 200k
    bonus: 150000, // 150k
    total: 2350000, // 2.35M
    status: "PAID", // Paid status
    approvedBy: "Quản lý 1",
    approvalDate: new Date("2024-10-19"),
    paidDate: new Date("2024-10-21"),
    notes: "Đã thanh toán",
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: 5,
    payrollPeriod: "2024-10",
    employeeId: 5,
    employeeName: "Hoàng Văn E",
    employeeEmail: "hoange@example.com",
    employeePhone: "0945678901",
    items: [
      {
        jobId: 11,
        jobCode: "JOB-011",
        caseName: "System Architecture",
        completedDate: new Date("2024-10-07"),
        amount: 2500000, // 2.5M
      },
    ],
    subtotal: 2500000, // 2.5M
    deductions: 250000, // 250k
    bonus: 500000, // 500k (significant bonus)
    total: 2750000, // 2.75M
    status: "PENDING",
    approvedBy: undefined,
    approvalDate: undefined,
    paidDate: undefined,
    notes: undefined,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: 6,
    payrollPeriod: "2024-10",
    employeeId: 6,
    employeeName: "Vũ Thị F",
    employeeEmail: "vuthif@example.com",
    employeePhone: "0956789012",
    items: [
      {
        jobId: 12,
        jobCode: "JOB-012",
        caseName: "Performance Optimization",
        completedDate: new Date("2024-10-09"),
        amount: 1800000, // 1.8M
      },
      {
        jobId: 13,
        jobCode: "JOB-013",
        caseName: "Security Audit",
        completedDate: new Date("2024-10-16"),
        amount: 1400000, // 1.4M
      },
    ],
    subtotal: 3200000, // 3.2M
    deductions: 300000, // 300k
    bonus: 250000, // 250k
    total: 3150000, // 3.15M
    status: "PENDING",
    approvedBy: undefined,
    approvalDate: undefined,
    paidDate: undefined,
    notes: undefined,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-10-22"),
  },
];

// Mock available periods
export const mockPayrollPeriods = ["2024-10", "2024-09", "2024-08"];

// Mock summary for October 2024
export const mockPayrollSummary: PayrollSummary = {
  totalEmployees: 6,
  totalAmount: 16550000, // 16.55M (total of all employees)
  approvedAmount: 2300000, // 2.3M (1 employee approved)
  paidAmount: 2350000, // 2.35M (1 employee paid)
  pendingAmount: 11900000, // 11.9M (4 employees pending)
  averageSalary: 2758333, // ~2.76M
};

// Function to generate mock payroll by period
export const generateMockPayrollByPeriod = () => {
  // For now, return the same mock data for any period
  // In real implementation, this would vary by period
  return mockPayrollData;
};

// Function to calculate mock summary
export const generateMockPayrollSummary = () => {
  const payrolls = generateMockPayrollByPeriod();
  const total = payrolls.reduce((sum, p) => sum + p.total, 0);
  const approvedAmount = payrolls
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.total, 0);
  const paidAmount = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.total, 0);
  const pendingAmount = payrolls
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.total, 0);

  return {
    totalEmployees: payrolls.length,
    totalAmount: total,
    approvedAmount,
    paidAmount,
    pendingAmount,
    averageSalary: Math.round(total / payrolls.length),
  };
};
