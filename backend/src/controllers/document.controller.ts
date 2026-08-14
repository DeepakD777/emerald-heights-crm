import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import {
    DocumentStatus,
    DocumentType,
} from "../generated/prisma/enums";

// ======================================================
// Helpers
// ======================================================

const normalizeDocumentType = (
    value: unknown
): DocumentType | null => {
    const type = String(value ?? "")
        .trim()
        .toUpperCase();

    switch (type) {
        case "REQUISITION_LETTER":
        case "REQUISITION":
            return DocumentType.REQUISITION_LETTER;

        case "AGREEMENT_TO_SELL":
        case "AGREEMENT":
            return DocumentType.AGREEMENT_TO_SELL;

        case "TRIPARTITE_AGREEMENT":
        case "TRIPARTITE":
            return DocumentType.TRIPARTITE_AGREEMENT;

        default:
            return null;
    }
};

const normalizeDocumentStatus = (
    value: unknown
): DocumentStatus | null => {
    const status = String(value ?? "")
        .trim()
        .toUpperCase();

    switch (status) {
        case "PENDING":
            return DocumentStatus.PENDING;

        case "GENERATED":
            return DocumentStatus.GENERATED;

        case "UPLOADED":
            return DocumentStatus.UPLOADED;

        case "GIVEN":
            return DocumentStatus.GIVEN;

        case "COMPLETED":
            return DocumentStatus.COMPLETED;

        default:
            return null;
    }
};

// ======================================================
// GET /api/bookings/:bookingId/documents
// ======================================================

export const getBookingDocuments = async (
    req: Request,
    res: Response
) => {
    try {
        const bookingId = String(
            req.params.bookingId
        );

        const booking =
            await prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const documents =
            await prisma.bookingDocument.findMany({
                where: {
                    bookingId,
                },

                orderBy: {
                    createdAt: "asc",
                },
            });

        return res.json({
            success: true,
            data: documents,
        });
    } catch (error) {
        console.error(
            "Get booking documents error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch booking documents",
        });
    }
};

// ======================================================
// GET /api/bookings/:bookingId/documents/:type
// ======================================================

export const getBookingDocumentByType = async (
    req: Request,
    res: Response
) => {
    try {
        const bookingId = String(
            req.params.bookingId
        );

        const type = normalizeDocumentType(
            req.params.type
        );

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Invalid document type",
            });
        }

        const document =
            await prisma.bookingDocument.findUnique({
                where: {
                    bookingId_type: {
                        bookingId,
                        type,
                    },
                },
            });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        return res.json({
            success: true,
            data: document,
        });
    } catch (error) {
        console.error(
            "Get booking document error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch booking document",
        });
    }
};

// ======================================================
// PUT /api/bookings/:bookingId/documents/:type
// ======================================================

export const updateBookingDocument = async (
    req: Request,
    res: Response
) => {
    try {
        const bookingId = String(
            req.params.bookingId
        );

        const type = normalizeDocumentType(
            req.params.type
        );

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Invalid document type",
            });
        }

        const booking =
            await prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },
            });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const existingDocument =
            await prisma.bookingDocument.findUnique({
                where: {
                    bookingId_type: {
                        bookingId,
                        type,
                    },
                },
            });

        if (!existingDocument) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        const {
            status,
            fileName,
            fileUrl,
        } = req.body;

        let normalizedStatus: DocumentStatus | undefined;

        if (status !== undefined) {
            const parsedStatus =
                normalizeDocumentStatus(status);

            if (!parsedStatus) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document status",
                });
            }

            normalizedStatus = parsedStatus;
        }

        const now = new Date();

        const document =
            await prisma.bookingDocument.update({
                where: {
                    bookingId_type: {
                        bookingId,
                        type,
                    },
                },

                data: {
                    status: normalizedStatus,

                    fileName:
                        fileName !== undefined
                            ? fileName
                                ? String(fileName).trim()
                                : null
                            : undefined,

                    fileUrl:
                        fileUrl !== undefined
                            ? fileUrl
                                ? String(fileUrl).trim()
                                : null
                            : undefined,

                    generatedAt:
                        normalizedStatus ===
                            DocumentStatus.GENERATED
                            ? now
                            : undefined,

                    uploadedAt:
                        normalizedStatus ===
                            DocumentStatus.UPLOADED
                            ? now
                            : undefined,

                    givenAt:
                        normalizedStatus ===
                            DocumentStatus.GIVEN
                            ? now
                            : undefined,

                    completedAt:
                        normalizedStatus ===
                            DocumentStatus.COMPLETED
                            ? now
                            : undefined,
                },
            });

        return res.json({
            success: true,
            message:
                "Booking document updated successfully",
            data: document,
        });
    } catch (error) {
        console.error(
            "Update booking document error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update booking document",

            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
};