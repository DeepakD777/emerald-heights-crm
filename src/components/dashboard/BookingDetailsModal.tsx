import { useRef } from "react";
import { generateAgreement } from "../../utils/generateAgreement";
import Modal from "./Modal";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onUpdate: (booking: any) => void;
}

function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onUpdate,
}: BookingDetailsModalProps) {
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const tripartiteInputRef = useRef<HTMLInputElement>(null);

  if (!booking) return null;

  // ======================================================
  // Document Data
  // ======================================================

  const agreement =
    booking.documents?.agreementToSell ?? {
      status: "pending",
    };

  const tripartite =
    booking.documents?.tripartiteAgreement ?? {
      required: false,
      document: {
        status: "pending",
      },
    };

  // ======================================================
  // Status Badge
  // ======================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "given":
      case "completed":
        return "bg-green-100 text-green-700";

      case "generated":
        return "bg-blue-100 text-blue-700";

      case "uploaded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // ======================================================
  // Upload Agreement To Sell
  // ======================================================

  // ======================================================
  // Generate Agreement To Sell
  // ======================================================

  const handleGenerateAgreement = () => {
    generateAgreement(booking);
  };

  const handleAgreementUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF, JPG or PNG file only.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileUrl = reader.result as string;

      const updatedBooking = {
        ...booking,

        documents: {
          ...booking.documents,

          agreementToSell: {
            ...agreement,
            status: "uploaded",
            fileName: file.name,
            fileUrl,
            uploadedAt: new Date().toISOString(),
          },

          tripartiteAgreement: tripartite,
        },
      };

      onUpdate(updatedBooking);

      event.target.value = "";
    };

    reader.onerror = () => {
      alert("Unable to read the selected file.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // ======================================================
  // Upload Tripartite Agreement
  // ======================================================

  const handleTripartiteUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF, JPG or PNG file only.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileUrl = reader.result as string;

      const updatedBooking = {
        ...booking,

        documents: {
          ...booking.documents,

          agreementToSell: agreement,

          tripartiteAgreement: {
            ...tripartite,

            required: true,

            document: {
              ...tripartite.document,
              status: "uploaded",
              fileName: file.name,
              fileUrl,
              uploadedAt: new Date().toISOString(),
            },
          },
        },
      };

      onUpdate(updatedBooking);

      event.target.value = "";
    };

    reader.onerror = () => {
      alert("Unable to read the selected file.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // ======================================================
  // View Document
  // ======================================================

const handleViewDocument = (fileUrl?: string) => {
  if (!fileUrl) {
    alert("Document is not uploaded yet.");
    return;
  }

  try {
    // ==================================================
    // Data URL -> Blob
    // ==================================================

    if (fileUrl.startsWith("data:")) {
      const parts = fileUrl.split(",");

      const mimeMatch =
        parts[0].match(/data:(.*?);base64/);

      const mimeType =
        mimeMatch?.[1] ||
        "application/pdf";

      const byteCharacters = atob(parts[1]);

      const byteNumbers = new Array(
        byteCharacters.length
      );

      for (
        let i = 0;
        i < byteCharacters.length;
        i++
      ) {
        byteNumbers[i] =
          byteCharacters.charCodeAt(i);
      }

      const byteArray =
        new Uint8Array(byteNumbers);

      const blob = new Blob(
        [byteArray],
        {
          type: mimeType,
        }
      );

      const blobUrl =
        URL.createObjectURL(blob);

      window.open(
        blobUrl,
        "_blank"
      );

      // Browser ko document load karne ka time
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);

      return;
    }

    // ==================================================
    // Normal URL
    // ==================================================

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );

  } catch (error) {

    console.error(
      "Document preview error:",
      error
    );

    alert(
      "Unable to open the document."
    );
  }
};
  // ======================================================
  // Agreement - Mark Given
  // ======================================================

  const handleAgreementGiven = () => {
    const updatedBooking = {
      ...booking,

      documents: {
        ...booking.documents,

        agreementToSell: {
          ...agreement,
          status: "given",
          givenAt: new Date().toISOString(),
        },

        tripartiteAgreement: tripartite,
      },
    };

    onUpdate(updatedBooking);
  };

  // ======================================================
  // Agreement - Mark Pending
  // ======================================================

  const handleAgreementPending = () => {
    const updatedBooking = {
      ...booking,

      documents: {
        ...booking.documents,

        agreementToSell: {
          ...agreement,
          status: "pending",
          givenAt: undefined,
        },

        tripartiteAgreement: tripartite,
      },
    };

    onUpdate(updatedBooking);
  };

  // ======================================================
  // Tripartite Required / Not Required
  // ======================================================

  const handleTripartiteRequired = () => {
    const updatedBooking = {
      ...booking,

      documents: {
        ...booking.documents,

        agreementToSell: agreement,

        tripartiteAgreement: {
          ...tripartite,
          required: !tripartite.required,
        },
      },
    };

    onUpdate(updatedBooking);
  };

  // ======================================================
  // Tripartite Complete
  // ======================================================

  const handleTripartiteComplete = () => {
    const updatedBooking = {
      ...booking,

      documents: {
        ...booking.documents,

        agreementToSell: agreement,

        tripartiteAgreement: {
          ...tripartite,

          document: {
            ...tripartite.document,
            status: "completed",
            completedAt: new Date().toISOString(),
          },
        },
      },
    };

    onUpdate(updatedBooking);
  };

  // ======================================================
  // Tripartite Pending
  // ======================================================

  const handleTripartitePending = () => {
    const updatedBooking = {
      ...booking,

      documents: {
        ...booking.documents,

        agreementToSell: agreement,

        tripartiteAgreement: {
          ...tripartite,

          document: {
            ...tripartite.document,
            status: "pending",
            completedAt: undefined,
          },
        },
      },
    };

    onUpdate(updatedBooking);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
    >
      <div className="space-y-6">

        {/* ==================================================
            Flat Information
        ================================================== */}

        <div>
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Flat Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Flat Number
              </p>

              <p className="font-semibold">
                {booking.flatNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Tower
              </p>

              <p className="font-semibold">
                {booking.tower || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Floor
              </p>

              <p className="font-semibold">
                {booking.floor ?? "-"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-gray-500">
                Status
              </p>

              <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold capitalize text-red-700">
                {booking.status || "Booked"}
              </span>
            </div>

          </div>
        </div>

        {/* ==================================================
            Customer Information
        ================================================== */}

        <div>
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Customer Name
              </p>

              <p className="font-semibold">
                {booking.customerName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Mobile Number
              </p>

              <p className="font-semibold">
                {booking.mobile}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-semibold">
                {booking.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Address
              </p>

              <p className="font-semibold">
                {booking.address || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* ==================================================
            Customer KYC
        ================================================== */}

        <div>
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Customer KYC
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Aadhar Number
              </p>

              <p className="font-semibold">
                {booking.aadhar || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                PAN Number
              </p>

              <p className="font-semibold">
                {booking.pan || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* ==================================================
            Payment
        ================================================== */}

        <div>
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Payment Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Booking Amount
              </p>

              <p className="font-semibold text-green-700">
                ₹{" "}
                {Number(
                  booking.bookingAmount || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Mode
              </p>

              <p className="font-semibold">
                {booking.paymentMode || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Booking Date
              </p>

              <p className="font-semibold">
                {booking.bookingDate || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* ==================================================
            Agreement Documents
        ================================================== */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Agreement Documents
          </h3>

          <div className="space-y-4">

            {/* ==================================================
                Agreement To Sell
            ================================================== */}

            <div className="rounded-xl border border-gray-200 p-4">

              <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h4 className="font-bold text-gray-800">
                        Agreement to Sell
                      </h4>

                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                        Mandatory
                      </span>

                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">

                      <span className="text-sm text-gray-500">
                        Status:
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                          agreement.status
                        )}`}
                      >
                        {agreement.status}
                      </span>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={handleGenerateAgreement}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Generate Agreement
                    </button>

                    {agreement.status === "given" ? (

                      <button
                        type="button"
                        onClick={
                          handleAgreementPending
                        }
                        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                      >
                        Mark Pending
                      </button>

                    ) : (

                      <button
                        type="button"
                        onClick={
                          handleAgreementGiven
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Mark as Given
                      </button>

                    )}

                  </div>

                </div>

                {/* File Information */}

                {agreement.fileName && (

                  <div className="rounded-lg bg-green-50 p-3">

                    <p className="text-sm font-medium text-green-800">
                      Uploaded Document
                    </p>

                    <p className="mt-1 truncate text-sm text-gray-600">
                      {agreement.fileName}
                    </p>

                  </div>

                )}

                {/* Actions */}

                <div className="flex flex-wrap gap-2">


                  <input
                    ref={agreementInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={
                      handleAgreementUpload
                    }
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      agreementInputRef.current?.click()
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {agreement.fileUrl
                      ? "Replace Document"
                      : "Upload Document"}
                  </button>

                  {agreement.fileUrl && (

                    <button
                      type="button"
                      onClick={() =>
                        handleViewDocument(
                          agreement.fileUrl
                        )
                      }
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      View Document
                    </button>

                  )}

                </div>

                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPG, PNG. Maximum
                  file size: 10 MB.
                </p>

              </div>

            </div>

            {/* ==================================================
                Tripartite Agreement
            ================================================== */}

            <div className="rounded-xl border border-gray-200 p-4">

              <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h4 className="font-bold text-gray-800">
                        Tripartite Agreement
                      </h4>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${tripartite.required
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {tripartite.required
                          ? "Required"
                          : "Not Required"}
                      </span>

                    </div>

                    {tripartite.required && (

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        <span className="text-sm text-gray-500">
                          Status:
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(
                            tripartite.document
                              ?.status ||
                            "pending"
                          )}`}
                        >
                          {tripartite.document
                            ?.status || "pending"}
                        </span>

                      </div>

                    )}

                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={
                        handleTripartiteRequired
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${tripartite.required
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      {tripartite.required
                        ? "Set Not Required"
                        : "Set Required"}
                    </button>

                    {tripartite.required &&
                      tripartite.document
                        ?.status !==
                      "completed" && (

                        <button
                          type="button"
                          onClick={
                            handleTripartiteComplete
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Mark Completed
                        </button>

                      )}

                    {tripartite.required &&
                      tripartite.document
                        ?.status ===
                      "completed" && (

                        <button
                          type="button"
                          onClick={
                            handleTripartitePending
                          }
                          className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                        >
                          Mark Pending
                        </button>

                      )}

                  </div>

                </div>

                {tripartite.required && (

                  <>

                    {tripartite.document
                      ?.fileName && (

                        <div className="rounded-lg bg-green-50 p-3">

                          <p className="text-sm font-medium text-green-800">
                            Uploaded Document
                          </p>

                          <p className="mt-1 truncate text-sm text-gray-600">
                            {
                              tripartite.document
                                .fileName
                            }
                          </p>

                        </div>

                      )}

                    <div className="flex flex-wrap gap-2">

                      <input
                        ref={
                          tripartiteInputRef
                        }
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        onChange={
                          handleTripartiteUpload
                        }
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          tripartiteInputRef.current?.click()
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {tripartite.document
                          ?.fileUrl
                          ? "Replace Document"
                          : "Upload Document"}
                      </button>

                      {tripartite.document
                        ?.fileUrl && (

                          <button
                            type="button"
                            onClick={() =>
                              handleViewDocument(
                                tripartite.document
                                  .fileUrl
                              )
                            }
                            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                          >
                            View Document
                          </button>

                        )}

                    </div>

                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, JPG, PNG.
                      Maximum file size: 10 MB.
                    </p>

                  </>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            Remarks
        ================================================== */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Remarks
          </h3>

          <div className="rounded-lg bg-gray-50 p-4">

            <p className="text-gray-700">
              {booking.remarks || "No Remarks"}
            </p>

          </div>

        </div>

        {/* ==================================================
            Footer
        ================================================== */}

        <div className="flex justify-end border-t pt-5">

          <button
            onClick={onClose}
            className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Close
          </button>

        </div>

      </div>
    </Modal>
  );
}

export default BookingDetailsModal;