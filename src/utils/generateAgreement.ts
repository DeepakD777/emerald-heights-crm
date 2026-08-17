import jsPDF from "jspdf";

// ======================================================
// Types
// ======================================================

interface AssignedEmployee {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface BookingData {
  bookingCode?: string;

  flatNumber?: string;
  tower?: string;
  floor?: number | string;

  customerName?: string;
  mobile?: string;
  email?: string;
  address?: string;

  dob?: string;
  doa?: string;
  profile?: string;

  aadhar?: string;
  pan?: string;

  totalAmount?: string | number;
  discount?: string | number;
  afterDiscountAmount?: string | number;

  plan?: string;

  bookingAmount?: string | number;
  paymentMode?: string;

  chequeNo?: string;
  bankName?: string;

  finance?: string;
  customerNeed?: string;

  bookingDate?: string;

  employeeId?: string | null;

  assignedEmployee?:
    AssignedEmployee | null;

  remarks?: string;
}

// ======================================================
// Helpers
// ======================================================

const formatCurrency = (
  value?: string | number
) => {

  const amount =
    Number(
      value || 0
    );

  return `₹ ${(
    Number.isFinite(amount)
      ? amount
      : 0
  ).toLocaleString(
    "en-IN"
  )}`;
};

const formatDate = (
  value?: string
) => {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    }
  );
};

const formatRole = (
  role?: string
) => {

  if (!role) {
    return "-";
  }

  return role
    .replace(
      /_/g,
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};

// ======================================================
// Generate Agreement To Sell PDF
// ======================================================

export function generateAgreement(
  booking: BookingData
) {

  const pdf =
    new jsPDF();

  const pageWidth =
    pdf.internal.pageSize
      .getWidth();

  const pageHeight =
    pdf.internal.pageSize
      .getHeight();

  const leftMargin =
    20;

  const rightMargin =
    20;

  const contentWidth =
    pageWidth -
    leftMargin -
    rightMargin;

  let y =
    20;

  // ====================================================
  // Page Management
  // ====================================================

  const ensureSpace = (
    requiredHeight = 15
  ) => {

    if (
      y +
        requiredHeight >
      pageHeight -
        20
    ) {

      pdf.addPage();

      y =
        20;
    }
  };

  // ====================================================
  // Heading
  // ====================================================

  const addHeading = (
    text: string
  ) => {

    ensureSpace(
      18
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      14
    );

    pdf.text(
      text,
      leftMargin,
      y
    );

    y +=
      4;

    pdf.setDrawColor(
      190
    );

    pdf.line(
      leftMargin,
      y,
      pageWidth -
        rightMargin,
      y
    );

    y +=
      8;
  };

  // ====================================================
  // Field
  // ====================================================

  const addField = (
    label: string,
    value:
      string |
      number |
      null |
      undefined
  ) => {

    const displayValue =
      value === null ||
      value === undefined ||
      String(value)
        .trim() === ""
        ? "-"
        : String(
            value
          );

    const valueLines =
      pdf.splitTextToSize(
        displayValue,
        pageWidth -
          85 -
          rightMargin
      );

    const lineCount =
      Math.max(
        valueLines.length,
        1
      );

    ensureSpace(
      lineCount *
        5 +
        4
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.text(
      `${label}:`,
      leftMargin,
      y
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.text(
      valueLines,
      70,
      y
    );

    y +=
      Math.max(
        lineCount *
          5,
        7
      );
  };

  // ====================================================
  // Paragraph
  // ====================================================

  const addParagraph = (
    text: string
  ) => {

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      10
    );

    const lines =
      pdf.splitTextToSize(
        text,
        contentWidth
      );

    const requiredHeight =
      lines.length *
        5 +
      8;

    ensureSpace(
      requiredHeight
    );

    pdf.text(
      lines,
      leftMargin,
      y
    );

    y +=
      lines.length *
        5 +
      7;
  };

  // ====================================================
  // Header
  // ====================================================

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    18
  );

  pdf.text(
    "EMERALD HEIGHTS",
    pageWidth /
      2,
    y,
    {
      align:
        "center",
    }
  );

  y +=
    8;

  pdf.setFontSize(
    12
  );

  pdf.text(
    "AGREEMENT TO SELL",
    pageWidth /
      2,
    y,
    {
      align:
        "center",
    }
  );

  y +=
    10;

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    9
  );

  pdf.text(
    "Draft generated from CRM booking information.",
    pageWidth /
      2,
    y,
    {
      align:
        "center",
    }
  );

  y +=
    15;

  // ====================================================
  // Booking Information
  // ====================================================

  addHeading(
    "Booking Information"
  );

  addField(
    "Booking No.",
    booking.bookingCode
  );

  addField(
    "Booking Date",
    formatDate(
      booking.bookingDate
    )
  );

  addField(
    "Flat Number",
    booking.flatNumber
  );

  addField(
    "Tower / Block",
    booking.tower
  );

  addField(
    "Floor",
    booking.floor
  );

  y +=
    4;

  // ====================================================
  // Purchaser Information
  // ====================================================

  addHeading(
    "Purchaser Information"
  );

  addField(
    "Customer Name",
    booking.customerName
  );

  addField(
    "Mobile",
    booking.mobile
  );

  addField(
    "Email",
    booking.email
  );

  addField(
    "Profile",
    booking.profile
  );

  addField(
    "DOB",
    formatDate(
      booking.dob
    )
  );

  addField(
    "DOA",
    formatDate(
      booking.doa
    )
  );

  addField(
    "Address",
    booking.address
  );

  y +=
    4;

  // ====================================================
  // Customer KYC
  // ====================================================

  addHeading(
    "Customer KYC"
  );

  addField(
    "Aadhar Number",
    booking.aadhar
  );

  addField(
    "PAN Number",
    booking.pan
  );

  y +=
    4;

  // ====================================================
  // Commercial Details
  // ====================================================

  addHeading(
    "Commercial Details"
  );

  addField(
    "Total Amount",
    formatCurrency(
      booking.totalAmount
    )
  );

  addField(
    "Discount",
    formatCurrency(
      booking.discount
    )
  );

  addField(
    "After Discount Amount",
    formatCurrency(
      booking.afterDiscountAmount
    )
  );

  addField(
    "Booking Amount",
    formatCurrency(
      booking.bookingAmount
    )
  );

  addField(
    "Plan",
    booking.plan
  );

  addField(
    "Payment Mode",
    booking.paymentMode
  );

  addField(
    "Cheque No.",
    booking.chequeNo
  );

  addField(
    "Bank Name",
    booking.bankName
  );

  y +=
    4;

  // ====================================================
  // Finance & Customer Requirement
  // ====================================================

  addHeading(
    "Finance & Customer Requirement"
  );

  addField(
    "Finance",
    booking.finance
  );

  addField(
    "Customer Need",
    booking.customerNeed
  );

  y +=
    4;

  // ====================================================
  // Relationship Manager
  // ====================================================

  addHeading(
    "Relationship Manager"
  );

  addField(
    "Name",
    booking
      .assignedEmployee
      ?.name ||
      "Unassigned"
  );

  if (
    booking
      .assignedEmployee
      ?.role
  ) {

    addField(
      "Designation",
      formatRole(
        booking
          .assignedEmployee
          .role
      )
    );
  }

  if (
    booking
      .assignedEmployee
      ?.phone
  ) {

    addField(
      "Mobile",
      booking
        .assignedEmployee
        .phone
    );
  }

  if (
    booking
      .assignedEmployee
      ?.email
  ) {

    addField(
      "Email",
      booking
        .assignedEmployee
        .email
    );
  }

  y +=
    4;

  // ====================================================
  // Property Description
  // ====================================================

  addHeading(
    "Property Description"
  );

  addParagraph(
    `The purchaser has expressed their intention to purchase the unit bearing Flat Number ${
      booking.flatNumber ||
      "-"
    }, situated in Tower / Block ${
      booking.tower ||
      "-"
    }, Floor ${
      booking.floor ??
      "-"
    }, in the Emerald Heights project, subject to the terms and conditions contained in the final Agreement to Sell.`
  );

  // ====================================================
  // Commercial Terms
  // ====================================================

  addHeading(
    "Commercial Terms"
  );

  addParagraph(
    `The total amount recorded in the CRM for the above-mentioned unit is ${formatCurrency(
      booking.totalAmount
    )}. A discount of ${formatCurrency(
      booking.discount
    )} has been recorded, resulting in an after-discount amount of ${formatCurrency(
      booking.afterDiscountAmount
    )}. The booking amount received or recorded is ${formatCurrency(
      booking.bookingAmount
    )}. The payment mode recorded is ${
      booking.paymentMode ||
      "-"
    }, and the selected plan is ${
      booking.plan ||
      "-"
    }.`
  );

  // ====================================================
  // Finance / Requirement Note
  // ====================================================

  if (
    booking.finance ||
    booking.customerNeed
  ) {

    addHeading(
      "Customer Requirement"
    );

    addParagraph(
      `Finance details recorded: ${
        booking.finance ||
        "-"
      }. Customer requirement recorded: ${
        booking.customerNeed ||
        "-"
      }.`
    );
  }

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

  if (
    booking.remarks
  ) {

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

  ensureSpace(
    65
  );

  y +=
    10;

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    10
  );

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

  y +=
    25;

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

  y +=
    15;

  // ====================================================
  // Generated Date
  // ====================================================

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    8
  );

  pdf.text(
    `Generated on: ${new Date().toLocaleString(
      "en-IN"
    )}`,
    leftMargin,
    y
  );

  // ====================================================
  // File Name
  // ====================================================

  const safeCustomerName =
    (
      booking.customerName ||
      "Customer"
    ).replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );

  const safeFlatNumber =
    (
      booking.flatNumber ||
      "Flat"
    ).replace(
      /[^a-zA-Z0-9-]/g,
      "_"
    );

  const safeBookingCode =
    (
      booking.bookingCode ||
      "Booking"
    ).replace(
      /[^a-zA-Z0-9-]/g,
      "_"
    );

  const fileName =
    `Agreement_To_Sell_${safeBookingCode}_${safeFlatNumber}_${safeCustomerName}.pdf`;

  // ====================================================
  // Save PDF
  // ====================================================

  pdf.save(
    fileName
  );
}