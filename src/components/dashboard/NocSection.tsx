import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    getAuthToken,
} from "../../services/api";

// ======================================================
// Types
// ======================================================

type NocStatus =
    | "PENDING"
    | "IN_PROCESS"
    | "APPROVED"
    | "REJECTED"
    | "ISSUED";

interface NocData {
    id: string;
    nocCode: string;
    bookingId: string;

    isRequired: boolean;
    status: NocStatus;

    requestedAt?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    issuedAt?: string | null;

    remarks?: string | null;

    fileName?: string | null;
    fileUrl?: string | null;
}

interface NocSectionProps {
    bookingId: string;

    readOnly?:
    boolean;
}

// ======================================================
// API
// ======================================================

const NOC_API =
    "http://localhost:5000/api/nocs";

// ======================================================
// Auth Headers
// ======================================================

const getHeaders = (
    includeJson =
        false
): HeadersInit => {

    const token =
        getAuthToken();

    const headers:
        Record<
            string,
            string
        > = {};

    if (
        includeJson
    ) {

        headers[
            "Content-Type"
        ] =
            "application/json";
    }

    if (
        token
    ) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
};

// ======================================================
// Date / Time
// ======================================================

const formatDateTime = (
    value:
        string |
        null |
        undefined
) => {

    if (!value) {
        return "-";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }

    return date
        .toLocaleString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit",
            }
        );
};

// ======================================================
// Status Label
// ======================================================

const getStatusLabel = (
    status:
        NocStatus
) => {

    switch (
    status
    ) {

        case "IN_PROCESS":
            return "In Process";

        case "APPROVED":
            return "Approved";

        case "REJECTED":
            return "Rejected";

        case "ISSUED":
            return "Issued / Given";

        case "PENDING":
        default:
            return "Pending";
    }
};

// ======================================================
// Status Badge
// ======================================================

const getStatusClasses = (
    status:
        NocStatus
) => {

    switch (
    status
    ) {

        case "IN_PROCESS":
            return (
                "bg-blue-100 text-blue-700"
            );

        case "APPROVED":
            return (
                "bg-green-100 text-green-700"
            );

        case "REJECTED":
            return (
                "bg-red-100 text-red-700"
            );

        case "ISSUED":
            return (
                "bg-emerald-100 text-emerald-700"
            );

        case "PENDING":
        default:
            return (
                "bg-yellow-100 text-yellow-700"
            );
    }
};

// ======================================================
// NOC Section
// ======================================================

function NocSection({
    bookingId,
    readOnly =
    false,
}: NocSectionProps) {

    const {
        isAdmin,
    } =
        useAuth();

    const fileInputRef =
        useRef<HTMLInputElement>(
            null
        );

    const [
        noc,
        setNoc,
    ] =
        useState<
            NocData |
            null
        >(
            null
        );

    const [
        loading,
        setLoading,
    ] =
        useState(
            true
        );

    const [
        saving,
        setSaving,
    ] =
        useState(
            false
        );

    const [
        error,
        setError,
    ] =
        useState<
            string |
            null
        >(
            null
        );

    const [
        remarks,
        setRemarks,
    ] =
        useState(
            ""
        );

    const canModify =
        isAdmin &&
        !readOnly;

    // ==================================================
    // Load NOC
    // ==================================================

    const loadNoc =
        async () => {

            if (
                !bookingId
            ) {

                setNoc(
                    null
                );

                setLoading(
                    false
                );

                return;
            }

            try {

                setLoading(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${NOC_API}/booking/${bookingId}`,
                        {
                            headers:
                                getHeaders(),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to load NOC"
                    );
                }

                const loadedNoc:
                    NocData |
                    null =
                    result.data ??
                    null;

                setNoc(
                    loadedNoc
                );

                setRemarks(
                    loadedNoc
                        ?.remarks ??
                    ""
                );

            } catch (
            error
            ) {

                console.error(
                    "Load NOC error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to load NOC"
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    useEffect(
        () => {

            void loadNoc();

        },
        [
            bookingId,
        ]
    );

    // ==================================================
    // Create / Set Required
    // ==================================================

    const handleSetRequired =
        async () => {

            if (
                !canModify
            ) {
                return;
            }

            try {

                setSaving(
                    true
                );

                setError(
                    null
                );

                // --------------------------------------
                // Existing NOC was previously
                // marked Not Required
                // --------------------------------------

                if (
                    noc
                ) {

                    const response =
                        await fetch(
                            `${NOC_API}/${noc.id}`,
                            {
                                method:
                                    "PUT",

                                headers:
                                    getHeaders(
                                        true
                                    ),

                                body:
                                    JSON.stringify({
                                        isRequired:
                                            true,

                                        status:
                                            "PENDING",

                                        remarks,
                                    }),
                            }
                        );

                    const result =
                        await response
                            .json();

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Failed to set NOC as required"
                        );
                    }

                    await loadNoc();

                    return;
                }

                // --------------------------------------
                // First time NOC
                // --------------------------------------

                const response =
                    await fetch(
                        NOC_API,
                        {
                            method:
                                "POST",

                            headers:
                                getHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({
                                    bookingId,

                                    remarks,
                                }),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to create NOC"
                    );
                }

                await loadNoc();

            } catch (
            error
            ) {

                console.error(
                    "Set NOC required error:",
                    error
                );

                const message =
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to set NOC as required";

                setError(
                    message
                );

                alert(
                    message
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    // ==================================================
    // Set Not Required
    // ==================================================

    const handleSetNotRequired =
        async () => {

            if (
                !canModify ||
                !noc
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Mark this NOC as Not Required?"
                );

            if (
                !confirmed
            ) {
                return;
            }

            try {

                setSaving(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${NOC_API}/${noc.id}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({
                                    isRequired:
                                        false,

                                    remarks,
                                }),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to mark NOC as not required"
                    );
                }

                await loadNoc();

            } catch (
            error
            ) {

                console.error(
                    "Set NOC not required error:",
                    error
                );

                const message =
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to update NOC";

                setError(
                    message
                );

                alert(
                    message
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    // ==================================================
    // Status Update
    // ==================================================

    const handleStatusChange =
        async (
            status:
                NocStatus
        ) => {

            if (
                !canModify ||
                !noc
            ) {
                return;
            }

            try {

                setSaving(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${NOC_API}/${noc.id}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({
                                    isRequired:
                                        true,

                                    status,

                                    remarks,
                                }),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to update NOC status"
                    );
                }

                await loadNoc();

            } catch (
            error
            ) {

                console.error(
                    "Update NOC status error:",
                    error
                );

                const message =
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to update NOC status";

                setError(
                    message
                );

                alert(
                    message
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    // ==================================================
    // Remarks Save
    // ==================================================

    const handleSaveRemarks =
        async () => {

            if (
                !canModify ||
                !noc
            ) {
                return;
            }

            try {

                setSaving(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${NOC_API}/${noc.id}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({
                                    remarks,
                                }),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to save NOC remarks"
                    );
                }

                await loadNoc();

            } catch (
            error
            ) {

                console.error(
                    "Save NOC remarks error:",
                    error
                );

                const message =
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to save NOC remarks";

                setError(
                    message
                );

                alert(
                    message
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    // ==================================================
    // Upload NOC
    // ==================================================

    const handleFileUpload = (
        event:
            React.ChangeEvent<HTMLInputElement>
    ) => {

        if (
            !canModify ||
            !noc
        ) {

            event.target.value =
                "";

            return;
        }

        const file =
            event.target
                .files?.[0];

        if (
            !file
        ) {
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            alert(
                "Please upload PDF, JPG or PNG file only."
            );

            event.target.value =
                "";

            return;
        }

        const maxSize =
            10 *
            1024 *
            1024;

        if (
            file.size >
            maxSize
        ) {

            alert(
                "File size must be less than 10 MB."
            );

            event.target.value =
                "";

            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            async () => {

                try {

                    setSaving(
                        true
                    );

                    const fileUrl =
                        reader.result as
                        string;

                    const response =
                        await fetch(
                            `${NOC_API}/${noc.id}`,
                            {
                                method:
                                    "PUT",

                                headers:
                                    getHeaders(
                                        true
                                    ),

                                body:
                                    JSON.stringify({
                                        fileName:
                                            file.name,

                                        fileUrl,

                                        remarks,
                                    }),
                            }
                        );

                    const result =
                        await response
                            .json();

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Failed to upload NOC"
                        );
                    }

                    await loadNoc();

                } catch (
                error
                ) {

                    console.error(
                        "Upload NOC error:",
                        error
                    );

                    alert(
                        error instanceof
                            Error
                            ? error.message
                            : "Failed to upload NOC"
                    );

                } finally {

                    setSaving(
                        false
                    );

                    event.target.value =
                        "";
                }
            };

        reader.onerror =
            () => {

                alert(
                    "Unable to read the selected file."
                );

                event.target.value =
                    "";
            };

        reader.readAsDataURL(
            file
        );
    };

    // ==================================================
    // View NOC File
    // ==================================================

    const handleViewDocument =
        () => {

            const fileUrl =
                noc
                    ?.fileUrl;

            if (
                !fileUrl
            ) {

                alert(
                    "NOC document is not uploaded yet."
                );

                return;
            }

            try {

                if (
                    fileUrl.startsWith(
                        "data:"
                    )
                ) {

                    const parts =
                        fileUrl.split(
                            ","
                        );

                    const mimeMatch =
                        parts[0]
                            .match(
                                /data:(.*?);base64/
                            );

                    const mimeType =
                        mimeMatch?.[1] ||
                        "application/pdf";

                    const byteCharacters =
                        atob(
                            parts[1]
                        );

                    const byteNumbers =
                        new Array(
                            byteCharacters
                                .length
                        );

                    for (
                        let index =
                            0;
                        index <
                        byteCharacters
                            .length;
                        index++
                    ) {

                        byteNumbers[
                            index
                        ] =
                            byteCharacters
                                .charCodeAt(
                                    index
                                );
                    }

                    const byteArray =
                        new Uint8Array(
                            byteNumbers
                        );

                    const blob =
                        new Blob(
                            [
                                byteArray,
                            ],
                            {
                                type:
                                    mimeType,
                            }
                        );

                    const blobUrl =
                        URL
                            .createObjectURL(
                                blob
                            );

                    window.open(
                        blobUrl,
                        "_blank"
                    );

                    setTimeout(
                        () => {

                            URL
                                .revokeObjectURL(
                                    blobUrl
                                );

                        },
                        60000
                    );

                    return;
                }

                window.open(
                    fileUrl,
                    "_blank",
                    "noopener,noreferrer"
                );

            } catch (
            error
            ) {

                console.error(
                    "NOC preview error:",
                    error
                );

                alert(
                    "Unable to open NOC document."
                );
            }
        };

    // ==================================================
    // Loading
    // ==================================================

    if (
        loading
    ) {

        return (

            <div>

                <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
                    NOC
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    Loading NOC details...
                </div>

            </div>
        );
    }

    // ==================================================
    // UI
    // ==================================================

    return (

        <div>

            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
                NOC
            </h3>

            {error && (

                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>

            )}

            {!noc ||
                !noc.isRequired
                ? (

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="font-semibold text-gray-800">
                                    NOC Status
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                                    Not Required
                                </span>

                            </div>

                            {canModify && (

                                <button
                                    type="button"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        handleSetRequired
                                    }
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {
                                        saving
                                            ? "Saving..."
                                            : "Set Required"
                                    }
                                </button>

                            )}

                        </div>

                    </div>

                )
                : (

                    <div className="space-y-4 rounded-xl border border-gray-200 p-4">

                        {/* ======================================
                            Main Status
                        ====================================== */}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <p className="font-bold text-gray-800">
                                        {
                                            noc.nocCode
                                        }
                                    </p>

                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                        Required
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                            noc.status
                                        )}`}
                                    >
                                        {
                                            getStatusLabel(
                                                noc.status
                                            )
                                        }
                                    </span>

                                </div>

                                <p className="mt-2 text-xs text-gray-500">
                                    Requested:{" "}
                                    {
                                        formatDateTime(
                                            noc.requestedAt
                                        )
                                    }
                                </p>

                            </div>

                            {canModify && (

                                <button
                                    type="button"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        handleSetNotRequired
                                    }
                                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Set Not Required
                                </button>

                            )}

                        </div>

                        {/* ======================================
                            Workflow
                        ====================================== */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div>

                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    NOC Workflow Status
                                </label>

                                <select
                                    value={
                                        noc.status
                                    }
                                    disabled={
                                        !canModify ||
                                        saving
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            handleStatusChange(
                                                event
                                                    .target
                                                    .value as
                                                NocStatus
                                            )
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2 disabled:bg-gray-100 disabled:text-gray-500"
                                >

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="IN_PROCESS">
                                        In Process
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                    <option value="ISSUED">
                                        Issued / Given
                                    </option>

                                </select>

                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">

                                <div>

                                    <p className="text-gray-500">
                                        Approved At
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {
                                            formatDateTime(
                                                noc.approvedAt
                                            )
                                        }
                                    </p>

                                </div>

                                <div>

                                    <p className="text-gray-500">
                                        Issued At
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {
                                            formatDateTime(
                                                noc.issuedAt
                                            )
                                        }
                                    </p>

                                </div>

                                {noc.rejectedAt && (

                                    <div className="col-span-2">

                                        <p className="text-gray-500">
                                            Rejected At
                                        </p>

                                        <p className="font-medium text-red-700">
                                            {
                                                formatDateTime(
                                                    noc.rejectedAt
                                                )
                                            }
                                        </p>

                                    </div>

                                )}

                            </div>

                        </div>

                        {/* ======================================
                            Remarks
                        ====================================== */}

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                NOC Remarks
                            </label>

                            <textarea
                                value={
                                    remarks
                                }
                                disabled={
                                    !canModify ||
                                    saving
                                }
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setRemarks(
                                            event
                                                .target
                                                .value
                                        )
                                }
                                rows={
                                    3
                                }
                                placeholder="Enter NOC remarks..."
                                className="w-full rounded-lg border border-gray-300 p-3 disabled:bg-gray-100 disabled:text-gray-500"
                            />

                            {canModify && (

                                <button
                                    type="button"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        handleSaveRemarks
                                    }
                                    className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Save Remarks
                                </button>

                            )}

                        </div>

                        {/* ======================================
                            NOC Document
                        ====================================== */}

                        <div className="rounded-lg bg-gray-50 p-4">

                            <p className="font-semibold text-gray-800">
                                NOC Document
                            </p>

                            {
                                noc.fileName
                                    ? (

                                        <p className="mt-1 break-all text-sm text-gray-600">
                                            {
                                                noc.fileName
                                            }
                                        </p>

                                    )
                                    : (

                                        <p className="mt-1 text-sm text-gray-500">
                                            No NOC document uploaded
                                        </p>

                                    )
                            }

                            <div className="mt-3 flex flex-wrap gap-2">

                                {canModify && (

                                    <>

                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                            onChange={
                                                handleFileUpload
                                            }
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            disabled={
                                                saving
                                            }
                                            onClick={() =>
                                                fileInputRef
                                                    .current
                                                    ?.click()
                                            }
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {
                                                noc.fileUrl
                                                    ? "Replace NOC"
                                                    : "Upload NOC"
                                            }
                                        </button>

                                    </>

                                )}

                                {noc.fileUrl && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleViewDocument
                                        }
                                        className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                    >
                                        View NOC
                                    </button>

                                )}

                            </div>

                            {canModify && (

                                <p className="mt-2 text-xs text-gray-500">
                                    Supported formats: PDF, JPG, PNG. Maximum file size: 10 MB.
                                </p>

                            )}

                        </div>

                    </div>

                )
            }

        </div>
    );
}

export default NocSection;