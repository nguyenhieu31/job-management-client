import ExcelJS from "exceljs";
import { CustomerInfo, JobResponse } from "@/types/jobs";
import { formatDate } from "@/lib/utils";

/**
 * Generates and downloads a beautifully formatted Excel invoice workbook with custom orange gradient theme.
 */
export async function generateExcelInvoice(
  customer: CustomerInfo,
  selectedJobs: JobResponse[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PHOTO24H";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Invoice", {
    pageSetup: { paperSize: 9, orientation: "portrait" }, // A4
  });

  // Ensure grid lines are visible
  worksheet.views = [{ showGridLines: true }];

  // Color Palette Specification
  const COLOR_HEADER_DARK = "FFD95A0A";  // Header cam đậm
  const COLOR_HEADER_LIGHT = "FFF07B1F"; // Cam chuyển sáng
  const COLOR_BG_CAM_NHAT = "FFFDF2EA";  // Cam nhạt (background)
  const COLOR_TOTAL_ROW = "FFFFF7F2";    // Cam nhạt hơn (Total Row)
  const COLOR_TEXT_ORANGE = "FFD85B12";   // Cam chữ
  const COLOR_BORDER = "FFE7E7E7";        // Viền bảng
  const COLOR_TEXT_BLACK = "FF303030";    // Chữ đen
  const COLOR_TEXT_GRAY = "FF666666";     // Chữ xám
  const COLOR_WHITE = "FFFFFFFF";         // Nền trắng

  // Header Gradient Fill Specification (Start: #D95A0A, End: #F07B1F)
  const headerGradientFill: ExcelJS.Fill = {
    type: "gradient",
    gradient: "angle",
    degree: 90, // Left-to-right gradient
    stops: [
      { position: 0, color: { argb: COLOR_HEADER_DARK } },
      { position: 1, color: { argb: COLOR_HEADER_LIGHT } },
    ],
  };

  // 1. Title Banner (Rows 1 - 2)
  worksheet.mergeCells("A1:G1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "PHOTO24H - INVOICE";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: COLOR_WHITE } };
  titleCell.fill = headerGradientFill;
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 42;

  const today = new Date();
  const dateStr = formatDate(today.toISOString());
  const invoiceNumber = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  worksheet.mergeCells("A2:G2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `Email: realestatephotospro23@gmail.com   |   Invoice No: ${invoiceNumber}   |   Date: ${dateStr}`;
  subTitleCell.font = { name: "Arial", size: 10, italic: true, color: { argb: COLOR_TEXT_ORANGE } };
  subTitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_BG_CAM_NHAT },
  };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 24;

  // Empty Row 3
  worksheet.getRow(3).height = 12;

  // 2. Customer Info Section (Rows 4 - 8)
  worksheet.mergeCells("A4:G4");
  const custHeaderCell = worksheet.getCell("A4");
  custHeaderCell.value = "BILL TO";
  custHeaderCell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLOR_TEXT_ORANGE } };
  custHeaderCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_BG_CAM_NHAT },
  };
  custHeaderCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  worksheet.getRow(4).height = 26;

  const infoLabelStyle = { name: "Arial", size: 10, bold: true, color: { argb: COLOR_TEXT_ORANGE } };
  const infoValueStyle = { name: "Arial", size: 10, color: { argb: COLOR_TEXT_BLACK } };

  // Row 5: Customer Name
  worksheet.getCell("A5").value = "Customer:";
  worksheet.getCell("A5").font = infoLabelStyle;
  worksheet.mergeCells("B5:G5");
  worksheet.getCell("B5").value = customer.name || "N/A";
  worksheet.getCell("B5").font = infoValueStyle;

  // Row 6: Email
  worksheet.getCell("A6").value = "Email:";
  worksheet.getCell("A6").font = infoLabelStyle;
  worksheet.mergeCells("B6:G6");
  worksheet.getCell("B6").value = customer.email || "N/A";
  worksheet.getCell("B6").font = infoValueStyle;

  // Row 7: Company if present
  if (customer.company) {
    worksheet.getCell("A7").value = "Company:";
    worksheet.getCell("A7").font = infoLabelStyle;
    worksheet.mergeCells("B7:G7");
    worksheet.getCell("B7").value = customer.company;
    worksheet.getCell("B7").font = infoValueStyle;
    worksheet.getRow(7).height = 20;
  } else {
    worksheet.getRow(7).height = 5;
  }

  // Border box for customer section
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: COLOR_BORDER } },
    left: { style: "thin", color: { argb: COLOR_BORDER } },
    bottom: { style: "thin", color: { argb: COLOR_BORDER } },
    right: { style: "thin", color: { argb: COLOR_BORDER } },
  };

  for (let r = 4; r <= 7; r++) {
    const row = worksheet.getRow(r);
    row.height = r === 4 ? 26 : 20;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = thinBorder;
    });
  }

  // Empty Row 8
  worksheet.getRow(8).height = 12;

  // 3. Itemized Jobs Table Header (Row 9) - Orange Gradient Header (#D95A0A to #F07B1F)
  const headers = [
    "No.",
    "Date",
    "Job Code",
    "Case Name",
    "File Qty",
    "Unit Price",
    "Total Amount",
  ];

  const headerRow = worksheet.getRow(9);
  headerRow.height = 30;

  headers.forEach((headerText, colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = headerText;
    cell.font = { name: "Arial", size: 10.5, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = headerGradientFill;
    cell.alignment = {
      horizontal: colIdx === 0 || colIdx === 1 ? "center" : colIdx >= 4 ? "right" : "left",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "medium", color: { argb: COLOR_HEADER_DARK } },
      bottom: { style: "medium", color: { argb: COLOR_HEADER_DARK } },
      left: { style: "thin", color: { argb: COLOR_BORDER } },
      right: { style: "thin", color: { argb: COLOR_BORDER } },
    };
  });

  // 4. Data Rows (Starting Row 10)
  const startRow = 10;
  selectedJobs.forEach((job, index) => {
    const rowNum = startRow + index;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    const qty = job.outputNumber ?? 0;
    const price = job.filePrice ?? 0;

    const isEven = index % 2 === 0;
    const rowBg = isEven ? COLOR_WHITE : COLOR_BG_CAM_NHAT;

    // No.
    const cellSTT = row.getCell(1);
    cellSTT.value = index + 1;
    cellSTT.alignment = { horizontal: "center", vertical: "middle" };

    // Date
    const cellDate = row.getCell(2);
    cellDate.value = formatDate(job.createdAt);
    cellDate.alignment = { horizontal: "center", vertical: "middle" };

    // Job Code
    const cellCode = row.getCell(3);
    cellCode.value = job.code || "-";
    cellCode.alignment = { horizontal: "left", vertical: "middle" };

    // Case Name
    const cellName = row.getCell(4);
    cellName.value = job.caseName || "N/A";
    cellName.alignment = { horizontal: "left", vertical: "middle" };

    // File Qty
    const cellQty = row.getCell(5);
    cellQty.value = qty;
    cellQty.numFmt = "#,##0";
    cellQty.alignment = { horizontal: "right", vertical: "middle" };

    // Unit Price
    const cellPrice = row.getCell(6);
    cellPrice.value = price;
    cellPrice.numFmt = '"$"#,##0.00';
    cellPrice.alignment = { horizontal: "right", vertical: "middle" };

    // Total Amount (Excel Formula: =E{rowNum}*F{rowNum})
    const cellTotal = row.getCell(7);
    cellTotal.value = { formula: `E${rowNum}*F${rowNum}`, result: qty * price };
    cellTotal.numFmt = '"$"#,##0.00';
    cellTotal.alignment = { horizontal: "right", vertical: "middle" };
    cellTotal.font = { name: "Arial", size: 10.5, bold: true, color: { argb: COLOR_TEXT_ORANGE } };

    // Apply styles to all cells in the data row
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      if (c !== 7) {
        cell.font = { name: "Arial", size: 10, color: { argb: COLOR_TEXT_BLACK } };
      }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowBg },
      };
      cell.border = {
        top: { style: "thin", color: { argb: COLOR_BORDER } },
        bottom: { style: "thin", color: { argb: COLOR_BORDER } },
        left: { style: "thin", color: { argb: COLOR_BORDER } },
        right: { style: "thin", color: { argb: COLOR_BORDER } },
      };
    }
  });

  const endDataRow = startRow + selectedJobs.length - 1;

  // 5. Total Row
  const totalRowNum = endDataRow + 1;
  const totalRow = worksheet.getRow(totalRowNum);
  totalRow.height = 30;

  worksheet.mergeCells(`A${totalRowNum}:D${totalRowNum}`);
  const totalLabelCell = totalRow.getCell(1);
  totalLabelCell.value = "TOTAL AMOUNT:";
  totalLabelCell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLOR_TEXT_ORANGE } };
  totalLabelCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Quantity Formula
  const totalQtyCell = totalRow.getCell(5);
  totalQtyCell.value = { formula: `SUM(E${startRow}:E${endDataRow})` };
  totalQtyCell.numFmt = "#,##0";
  totalQtyCell.font = { name: "Arial", size: 11, bold: true, color: { argb: COLOR_TEXT_BLACK } };
  totalQtyCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Price Cell (dash)
  const totalUnitPriceCell = totalRow.getCell(6);
  totalUnitPriceCell.value = "-";
  totalUnitPriceCell.alignment = { horizontal: "center", vertical: "middle" };

  // Grand Total Formula
  const grandTotalCell = totalRow.getCell(7);
  grandTotalCell.value = { formula: `SUM(G${startRow}:G${endDataRow})` };
  grandTotalCell.numFmt = '"$"#,##0.00';
  grandTotalCell.font = { name: "Arial", size: 13, bold: true, color: { argb: COLOR_TEXT_ORANGE } };
  grandTotalCell.alignment = { horizontal: "right", vertical: "middle" };

  // Total Row background & borders
  for (let c = 1; c <= 7; c++) {
    const cell = totalRow.getCell(c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_TOTAL_ROW }, // Cam nhạt hơn (Total Row)
    };
    cell.border = {
      top: { style: "medium", color: { argb: COLOR_TEXT_ORANGE } },
      bottom: { style: "double", color: { argb: COLOR_TEXT_ORANGE } },
      left: { style: "thin", color: { argb: COLOR_BORDER } },
      right: { style: "thin", color: { argb: COLOR_BORDER } },
    };
  }

  // 6. Footer Note Row
  const footerRowNum = totalRowNum + 2;
  worksheet.mergeCells(`A${footerRowNum}:G${footerRowNum}`);
  const footerCell = worksheet.getCell(`A${footerRowNum}`);
  footerCell.value = "Thank you for doing business with PHOTO24H!";
  footerCell.font = { name: "Arial", size: 10, italic: true, color: { argb: COLOR_TEXT_GRAY } };
  footerCell.alignment = { horizontal: "center", vertical: "middle" };

  // 7. Auto Adjust Column Widths
  const minWidths = [8, 14, 16, 32, 14, 16, 20];
  worksheet.columns.forEach((col, idx) => {
    let maxLen = minWidths[idx] || 12;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value) : "";
      if (val.length > maxLen && !cell.isMerged) {
        maxLen = Math.min(val.length + 4, 50);
      }
    });
    col.width = maxLen;
  });

  // 8. Generate and Trigger Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const cleanCustomerName = (customer.name || "Customer")
    .replace(/[^a-zA-Z0-9_\-]/g, "_");

  const dateFileStr = today.toISOString().slice(0, 10);
  const fileName = `Invoice_${cleanCustomerName}_${dateFileStr}.xlsx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
