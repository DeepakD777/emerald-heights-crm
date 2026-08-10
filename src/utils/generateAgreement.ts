import jsPDF from "jspdf";

interface BookingData {
  flatNumber?: string;
  tower?: string;
  floor?: number | string;

  customerName?: string;
  mobile?: string;
  email?: string;
  address?: string;

  aadhar?: string;
  pan?: string;

  bookingAmount?: string | number;
  paymentMode?: string;
  bookingDate?: string;

  remarks?: string;
}

// ======================================================
// Generate Agreement To Sell PDF
// ======================================================

export function generateAgreement(
  booking: BookingData
) {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();

  let y = 20;

  // ====================================================
  // Helper Functions
  // ====================================================

  const addHeading = (
    text: string
  ) => {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);

    pdf.text(
      text,
      20,
      y
    );

    y += 10;
  };

  const addField = (
    label: string,
    value: string
  ) => {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
      `${label}:`,
      20,
      y
    );

    pdf.setFont("helvetica", "normal");

    pdf.text(
      value || "-",
      65,
      y
    );

    y += 7;
  };

  const addParagraph = (
    text: string
  ) => {

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const lines =
      pdf.splitTextToSize(
        text,
        pageWidth - 40
      );

    pdf.text(
      lines,
      20,
      y
    );

    y +=
      lines.length * 5 + 5;
  };

  // ====================================================
  // Header
  // ====================================================

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(18);

  pdf.text(
    "EMERALD HEIGHTS",
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 8;

  pdf.setFontSize(12);

  pdf.text(
    "AGREEMENT TO SELL",
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 15;

  // ====================================================
  // Document Notice
  // ====================================================

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(9);

  pdf.text(
    "Draft generated from CRM booking information.",
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );

  y += 15;

  // ====================================================
  // Booking Information
  // ====================================================

  addHeading(
    "Booking Information"
  );

  addField(
    "Flat Number",
    booking.flatNumber || "-"
  );

  addField(
    "Tower",
    booking.tower || "-"
  );

  addField(
    "Floor",
    String(
      booking.floor ?? "-"
    )
  );

  addField(
    "Booking Date",
    booking.bookingDate || "-"
  );

  addField(
    "Booking Amount",
    `₹ ${Number(
      booking.bookingAmount || 0
    ).toLocaleString("en-IN")}`
  );

  addField(
    "Payment Mode",
    booking.paymentMode || "-"
  );

  y += 5;

  // ====================================================
  // Customer Information
  // ====================================================

  addHeading(
    "Purchaser Information"
  );

  addField(
    "Customer Name",
    booking.customerName || "-"
  );

  addField(
    "Mobile",
    booking.mobile || "-"
  );

  addField(
    "Email",
    booking.email || "-"
  );

  addField(
    "Address",
    booking.address || "-"
  );

  addField(
    "Aadhar",
    booking.aadhar || "-"
  );

  addField(
    "PAN",
    booking.pan || "-"
  );

  y += 5;

  // ====================================================
  // Property Description
  // ====================================================

  addHeading(
    "Property Description"
  );

  addParagraph(
    `The purchaser has expressed their intention to purchase the residential unit bearing Flat Number ${
      booking.flatNumber || "-"
    }, situated in Tower ${
      booking.tower || "-"
    }, Floor ${
      booking.floor ?? "-"
    }, in the Emerald Heights project, subject to the terms and conditions contained in the final Agreement to Sell.`
  );

  // ====================================================
  // Commercial Terms
  // ====================================================

  addHeading(
    "Commercial Details"
  );

  addParagraph(
    `The booking amount recorded in the CRM for the above-mentioned unit is ₹ ${
      Number(
        booking.bookingAmount || 0
      ).toLocaleString("en-IN")
    }. Payment mode recorded is ${
      booking.paymentMode || "-"
    }.`
  );

  // ====================================================
  // Important Legal Note
  // ====================================================

  addHeading(
    "Important Notice"
  );

  addParagraph(
    "This document is a CRM-generated draft containing booking and customer information. It is not intended to replace the legally approved Agreement to Sell. The final agreement, including all legal terms, conditions, obligations, representations, payment schedules, possession terms, cancellation provisions, and other applicable clauses, must be prepared and approved by the authorized legal representative of the project."
  );

  // ====================================================
  // Remarks
  // ====================================================

  if (booking.remarks) {

    addHeading(
      "CRM Remarks"
    );

    addParagraph(
      booking.remarks
    );
  }

  // ====================================================
  // Signature Section
  // ====================================================

  if (y > 245) {

    pdf.addPage();

    y = 20;
  }

  y += 15;

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(10);

  pdf.text(
    "Purchaser Signature",
    30,
    y
  );

  pdf.text(
    "Authorized Signatory",
    135,
    y
  );

  y += 25;

  pdf.line(
    20,
    y,
    80,
    y
  );

  pdf.line(
    125,
    y,
    185,
    y
  );

  y += 15;

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(8);

  pdf.text(
    `Generated on: ${new Date().toLocaleString(
      "en-IN"
    )}`,
    20,
    y
  );

  // ====================================================
  // File Name
  // ====================================================

  const safeCustomerName =
    (booking.customerName ||
      "Customer")
      .replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

  const safeFlatNumber =
    (booking.flatNumber ||
      "Flat")
      .replace(
        /[^a-zA-Z0-9-]/g,
        "_"
      );

  const fileName =
    `Agreement_To_Sell_${safeFlatNumber}_${safeCustomerName}.pdf`;

  // ====================================================
  // Save PDF
  // ====================================================

  pdf.save(fileName);
}