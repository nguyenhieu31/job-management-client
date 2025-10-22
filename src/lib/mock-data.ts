import { JobsByCustomer } from "@/types/invoices";

// Mock data for unpaid/partial payment jobs
export const mockJobsByCustomer: JobsByCustomer[] = [
  {
    customerId: 1,
    customerName: "Công Ty ABC",
    customerEmail: "contact@abc.com",
    customerPhone: "0123456789",
    customerCompany: "ABC Corporation",
    totalAmount: 15000000,
    jobs: [
      {
        id: 1,
        code: "JOB-2024-001",
        caseName: "Dịch thuật tài liệu tiếng Anh",
        totalPrice: 3000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 2,
        code: "JOB-2024-002",
        caseName: "Chỉnh sửa video quảng cáo",
        totalPrice: 5000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 3,
        code: "JOB-2024-003",
        caseName: "Thiết kế banner và poster",
        totalPrice: 4000000,
        paymentStatus: "PARTIAL",
      },
      {
        id: 4,
        code: "JOB-2024-004",
        caseName: "Viết nội dung blog marketing",
        totalPrice: 3000000,
        paymentStatus: "UNPAID",
      },
    ],
  },
  {
    customerId: 2,
    customerName: "Công Ty XYZ",
    customerEmail: "billing@xyz.com",
    customerPhone: "0987654321",
    customerCompany: "XYZ Solutions",
    totalAmount: 22500000,
    jobs: [
      {
        id: 5,
        code: "JOB-2024-005",
        caseName: "Phát triển website bán hàng",
        totalPrice: 10000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 6,
        code: "JOB-2024-006",
        caseName: "Thiết kế giao diện ứng dụng",
        totalPrice: 7500000,
        paymentStatus: "PARTIAL",
      },
      {
        id: 7,
        code: "JOB-2024-007",
        caseName: "SEO tối ưu hóa website",
        totalPrice: 5000000,
        paymentStatus: "UNPAID",
      },
    ],
  },
  {
    customerId: 3,
    customerName: "Nhà Hàng Mekong",
    customerEmail: "admin@mekong.vn",
    customerPhone: "0888555666",
    totalAmount: 8500000,
    jobs: [
      {
        id: 8,
        code: "JOB-2024-008",
        caseName: "Sản xuất video menu giới thiệu",
        totalPrice: 5000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 9,
        code: "JOB-2024-009",
        caseName: "Chụp ảnh sản phẩm chuyên nghiệp",
        totalPrice: 3500000,
        paymentStatus: "PARTIAL",
      },
    ],
  },
  {
    customerId: 4,
    customerName: "Công Ty Edu Plus",
    customerEmail: "finance@eduplus.edu.vn",
    customerPhone: "0333777888",
    customerCompany: "Edu Plus Education",
    totalAmount: 18000000,
    jobs: [
      {
        id: 10,
        code: "JOB-2024-010",
        caseName: "Tạo khóa học trực tuyến",
        totalPrice: 8000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 11,
        code: "JOB-2024-011",
        caseName: "Sản xuất video hướng dẫn",
        totalPrice: 6000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 12,
        code: "JOB-2024-012",
        caseName: "Thiết kế tài liệu học tập",
        totalPrice: 4000000,
        paymentStatus: "PARTIAL",
      },
    ],
  },
  {
    customerId: 5,
    customerName: "Startup TechHub",
    customerEmail: "payment@techhub.io",
    customerPhone: "0555999111",
    totalAmount: 12500000,
    jobs: [
      {
        id: 13,
        code: "JOB-2024-013",
        caseName: "Phát triển API backend",
        totalPrice: 8000000,
        paymentStatus: "UNPAID",
      },
      {
        id: 14,
        code: "JOB-2024-014",
        caseName: "Audit và tối ưu code",
        totalPrice: 4500000,
        paymentStatus: "UNPAID",
      },
    ],
  },
];

// Mock invoice data
export const mockInvoice = {
  id: 1,
  invoiceNumber: "INV-2024-001",
  customerId: 1,
  customerName: "Công Ty ABC",
  customerEmail: "contact@abc.com",
  customerPhone: "0123456789",
  customerCompany: "ABC Corporation",
  items: [
    {
      jobId: 1,
      jobCode: "JOB-2024-001",
      caseName: "Dịch thuật tài liệu tiếng Anh",
      amount: 3000000,
    },
    {
      jobId: 2,
      jobCode: "JOB-2024-002",
      caseName: "Chỉnh sửa video quảng cáo",
      amount: 5000000,
    },
  ],
  subtotal: 8000000,
  tax: 0,
  total: 8000000,
  status: "DRAFT" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: "",
};
