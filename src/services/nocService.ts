import {
    apiRequest,
} from "./api";

// ======================================================
// Types
// ======================================================

export type NocStatus =
    | "PENDING"
    | "IN_PROCESS"
    | "APPROVED"
    | "REJECTED"
    | "ISSUED";

export interface NocRecord {
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

    createdAt?: string;
    updatedAt?: string;
}

interface NocListResponse {
    success: boolean;

    data: NocRecord[];
}

// ======================================================
// Get All Accessible NOCs
// ======================================================

export async function getNocs() {

    const response =
        await apiRequest<NocListResponse>(
            "/nocs"
        );

    return response.data ?? [];
}