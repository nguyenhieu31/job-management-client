import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CustomerInfo, JobResponse } from "@/types/jobs";
import { formatCurrency } from "@/lib/utils";

/**
 * Generates and downloads a professional business PDF invoice for a customer and selected jobs.
 */
export function generatePdfInvoice(
  customer: CustomerInfo,
  selectedJobs: JobResponse[]
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Colors & Styling (Light Orange Accent #F97316)
  const primaryColor = [249, 115, 22]; // Light Orange (#F97316)
  const textColor = [31, 41, 55]; // Dark Slate (#1F2937)
  const mutedTextColor = [107, 114, 128]; // Slate Gray (#6B7280)

  // 1. Top Decorative Accent Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 5, "F");

  // 2. Company Brand & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("PHOTO24H", margin, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  // doc.text("Management System", margin, 25);
  doc.text("Email: realestatephotospro23@gmail.com", margin, 29);

  // Invoice Meta (Top Right)
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const invoiceNumber = `INV-${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - margin, 26, {
    align: "right",
  });
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 31, { align: "right" });

  // Divider line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, 36, pageWidth - margin, 36);

  // 3. Bill To Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text("BILL TO:", margin, 44);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(customer.name || "N/A", margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);

  let yOffset = 55;
  if (customer.company) {
    doc.text(`Company: ${customer.company}`, margin, yOffset);
    yOffset += 5;
  }
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, margin, yOffset);
    yOffset += 5;
  }
  if (customer.phone) {
    doc.text(`Phone: ${customer.phone}`, margin, yOffset);
    yOffset += 5;
  }
  if (customer.customerCode) {
    doc.text(`Customer Code: ${customer.customerCode}`, margin, yOffset);
    yOffset += 5;
  }

  const tableStartY = Math.max(yOffset + 4, 65);

  // 4. Itemized Jobs Table
  const tableData = selectedJobs.map((job, index) => {
    const qty = job.outputNumber ?? 0;
    const price = job.filePrice ?? 0;
    const total = qty * price;
    return [
      (index + 1).toString(),
      job.code || "-",
      job.caseName || "Job Item",
      qty.toString(),
      formatCurrency(price),
      formatCurrency(total),
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Job Code", "Case Name", "Files / Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
      lineWidth: 0.2,
      lineColor: [229, 231, 235],
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55],
      lineWidth: 0.2,
      lineColor: [229, 231, 235],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 32 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 32, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // 5. Total Calculation Summary
  const subtotal = selectedJobs.reduce((sum, job) => {
    const qty = job.outputNumber ?? 0;
    const price = job.filePrice ?? 0;
    return sum + qty * price;
  }, 0);

  // Get y position after table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 40;

  const summaryWidth = 70;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryX, finalY + 6, summaryWidth, 24, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryX, finalY + 6, summaryWidth, 24, 2, 2, "D");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text("Total Jobs Selected:", summaryX + 4, finalY + 13);
  doc.text(`${selectedJobs.length}`, pageWidth - margin - 4, finalY + 13, {
    align: "right",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("TOTAL AMOUNT:", summaryX + 4, finalY + 23);
  doc.text(formatCurrency(subtotal), pageWidth - margin - 4, finalY + 23, {
    align: "right",
  });

  // 6. Footer Notes
  const footerY = pageHeight - 20;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(
    "Thank you for your business! Please process payment according to agreed terms.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // 7. Trigger Browser Download
  const cleanCustomerName = (customer.name || "Customer")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .toLowerCase();
  const fileName = `Invoice_${cleanCustomerName}_${today
    .toISOString()
    .slice(0, 10)}.pdf`;

  doc.save(fileName);
}
