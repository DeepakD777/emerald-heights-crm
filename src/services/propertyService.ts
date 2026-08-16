import {
    apiRequest,
} from "./api";

// ======================================================
// Types
// ======================================================

export type PropertyStatus =
    | "AVAILABLE"
    | "HOLD"
    | "BOOKED"
    | "SOLD";

export type PropertyType =
    | "RESIDENTIAL"
    | "COMMERCIAL";

export type Property = {
    id: string;

    propertyCode: string;

    name: string;

    type: PropertyType;

    status: PropertyStatus;

    isFineDine: boolean;

    phase: string | null;

    block: string | null;

    tower: string | null;

    floor: string | null;

    series: string | null;

    unitNumber: string | null;

    area: number | null;

    price: number | null;

    description: string | null;

    createdAt: string;

    updatedAt: string;
};

export type PropertyInput = {
    propertyCode: string;

    name: string;

    type: PropertyType;

    status?: PropertyStatus;

    isFineDine?: boolean;

    phase?: string;

    block?: string;

    tower?: string;

    floor?: string;

    series?: string;

    unitNumber?: string;

    area?: number | null;

    price?: number | null;

    description?: string;
};

// ======================================================
// API Response Types
// ======================================================

type PropertyResponse = {
    success: true;

    message?: string;

    data: Property;
};

type PropertiesResponse = {
    success: true;

    data: Property[];
};

type DeletePropertyResponse = {
    success: true;

    message: string;
};

// ======================================================
// GET ALL
// Admin + Employee
// ======================================================

export async function getProperties(
    params?: {
        type?: PropertyType;

        status?: PropertyStatus;

        phase?: string;

        block?: string;

        tower?: string;

        floor?: string;

        series?: string;

        isFineDine?: boolean;
    }
) {

    const query =
        new URLSearchParams();

    if (params?.type) {
        query.set(
            "type",
            params.type
        );
    }

    if (params?.status) {
        query.set(
            "status",
            params.status
        );
    }

    if (params?.phase) {
        query.set(
            "phase",
            params.phase
        );
    }

    if (params?.block) {
        query.set(
            "block",
            params.block
        );
    }

    if (params?.tower) {
        query.set(
            "tower",
            params.tower
        );
    }

    if (params?.floor) {
        query.set(
            "floor",
            params.floor
        );
    }

    if (params?.series) {
        query.set(
            "series",
            params.series
        );
    }

    if (
        params?.isFineDine !==
        undefined
    ) {
        query.set(
            "isFineDine",
            String(
                params.isFineDine
            )
        );
    }

    const queryString =
        query.toString();

    return apiRequest<PropertiesResponse>(
        `/properties${
            queryString
                ? `?${queryString}`
                : ""
        }`
    );
}

// ======================================================
// GET ONE
// Admin + Employee
// ======================================================

export async function getPropertyById(
    id: string
) {

    return apiRequest<PropertyResponse>(
        `/properties/${id}`
    );
}

// ======================================================
// CREATE
// ADMIN ONLY
// ======================================================

export async function createProperty(
    data: PropertyInput
) {

    return apiRequest<PropertyResponse>(
        "/properties",
        {
            method: "POST",

            body:
                JSON.stringify(
                    data
                ),
        }
    );
}

// ======================================================
// UPDATE
// ADMIN ONLY
// ======================================================

export async function updateProperty(
    id: string,
    data: Partial<PropertyInput>
) {

    return apiRequest<PropertyResponse>(
        `/properties/${id}`,
        {
            method: "PUT",

            body:
                JSON.stringify(
                    data
                ),
        }
    );
}

// ======================================================
// DELETE
// ADMIN ONLY
// ======================================================

export async function deleteProperty(
    id: string
) {

    return apiRequest<DeletePropertyResponse>(
        `/properties/${id}`,
        {
            method:
                "DELETE",
        }
    );
}