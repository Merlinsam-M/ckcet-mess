// src/services/pdf.js
// Generates a PDF report for a given date's tokens using jsPDF + jspdf-autotable.
// Uses "Rs." instead of "₹" because the default PDF font can't draw the rupee sign.

import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

// jspdf-autotable v5 no longer auto-patches jsPDF on import.
// applyPlugin() attaches .autoTable() to every jsPDF instance.
applyPlugin(jsPDF);
import { fetchAllTokensForDate, formatTokenDateTime } from "./token";

// Format items array into a short readable string for the PDF
function formatItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return items.map((i) => `${i.name} x${i.qty}`).join(", ");
}

// Generate and download the PDF report for a specific date
export async function downloadDayReport(dateStr) {
  // 1. Fetch all tokens for the date from Firestore
  const tokens = await fetchAllTokensForDate(dateStr);

  if (tokens.length === 0) {
    return { empty: true };
  }

  // 2. Build PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CKCET Mess Food Purchase Report", 105, 18, { align: "center" });

  // Date line
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const [y, m, d] = dateStr.split("-");
  const prettyDate = `${d}/${m}/${y}`;
  doc.text(`Date: ${prettyDate}`, 14, 28);

  // 3. Build table rows
  const tableRows = tokens.map((t, i) => {
    const { dateStr: dStr, timeStr: purchaseTime } = formatTokenDateTime(t.createdAt);
    const displayId = (t.displayId || t.id).replace(/^#/, "");
    const status = t.status === "served" ? "Served" : "Active";
    const food = formatItems(t.items);
    const amount = `Rs.${t.amount || 0}`;

    return [
      i + 1,
      t.email || "—",
      displayId,
      food,
      amount,
      status,
    ];
  });

  // 4. Draw table
  doc.autoTable({
    startY: 34,
    head: [["S.No", "Email", "Token ID", "Food", "Amount", "Status"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235], // primary blue
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 12 },  // S.No
      1: { cellWidth: 45 },  // Email
      2: { cellWidth: 22 },  // Token ID
      3: { cellWidth: 50 },  // Food
      4: { cellWidth: 22 },  // Amount
      5: { cellWidth: 20 },  // Status
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Summary section below the table
  const servedCount = tokens.filter((t) => t.status === "served").length;
  const activeCount = tokens.length - servedCount;
  const totalRevenue = tokens.reduce((sum, t) => sum + (t.amount || 0), 0);

  const summaryY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, summaryY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total Orders: ${tokens.length}`, 14, summaryY + 6);
  doc.text(`Served: ${servedCount}`, 14, summaryY + 11);
  doc.text(`Pending (Active): ${activeCount}`, 14, summaryY + 16);
  doc.text(`Total Revenue: Rs.${totalRevenue}`, 14, summaryY + 21);

  // 6. Save the file
  doc.save(`CKCET-Mess-Report-${dateStr}.pdf`);
  return { empty: false, count: tokens.length };
}
