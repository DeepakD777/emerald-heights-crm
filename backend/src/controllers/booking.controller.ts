import {
    Request,
    Response,
} from "express";

import {
    prisma,
} from "../lib/prisma";

import {
    BookingStatus,
    DocumentType,
    DocumentStatus,
    PropertyStatus,
} from "../generated/prisma/enums";

type FrontendDocument = {
    status?: unknown;
    fileName?: unknown;
    fileUrl?: unknown;
    generatedAt?: unknown;
    uploadedAt?: unknown;
    givenAt?: unknown;
    completedAt?: unknown;
};

type FrontendDocuments = {
    requisitionLetter?:
        FrontendDocument;

    agreementToSell?:
        FrontendDocument;

    tripartiteAgreement?: {
        required?: boolean;

        document?:
            FrontendDocument;
    };
};

const normalizeBookingStatus = (
    status: unknown
): BookingStatus => {

    const value =
        String(
            status ?? ""
        )
            .trim()
            .toUpperCase();

    switch (value) {

        case "BOOKED":
        case "CONFIRMED":
            return (
                BookingStatus.CONFIRMED
            );

        case "CANCELLED":
        case "CANCELED":
            return (
                BookingStatus.CANCELLED
            );

        case "COMPLETED":
            return (
                BookingStatus.COMPLETED
            );

        case "PENDING":
        default:
            return (
                BookingStatus.PENDING
            );
    }
};

const normalizeDocumentStatus = (
    status: unknown
): DocumentStatus => {

    const value =
        String(
            status ?? ""
        )
            .trim()
            .toUpperCase();

    switch (value) {

        case "GENERATED":
            return (
                DocumentStatus.GENERATED
            );

        case "UPLOADED":
            return (
                DocumentStatus.UPLOADED
            );

        case "GIVEN":
            return (
                DocumentStatus.GIVEN
            );

        case "COMPLETED":
            return (
                DocumentStatus.COMPLETED
            );

        case "PENDING":
        default:
            return (
                DocumentStatus.PENDING
            );
    }
};

const parseDateValue = (
    value: unknown
): Date | null | undefined => {

    if (
        value === undefined
    ) {
        return undefined;
    }

    if (
        value === null ||
        value === ""
    ) {
        return null;
    }

    const date =
        new Date(
            String(
                value
            )
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return undefined;
    }

    return date;
};

const buildDocumentData = (
    payload:
        FrontendDocument |
        undefined
) => {

    const status =
        normalizeDocumentStatus(
            payload?.status
        );

    const data:
        Record<
            string,
            any
        > = {
            status,
        };

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "fileName"
            )
    ) {

        data.fileName =
            payload.fileName
                ? String(
                    payload.fileName
                )
                : null;
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "fileUrl"
            )
    ) {

        data.fileUrl =
            payload.fileUrl
                ? String(
                    payload.fileUrl
                )
                : null;
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "generatedAt"
            )
    ) {

        data.generatedAt =
            parseDateValue(
                payload.generatedAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "uploadedAt"
            )
    ) {

        data.uploadedAt =
            parseDateValue(
                payload.uploadedAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "givenAt"
            )
    ) {

        data.givenAt =
            parseDateValue(
                payload.givenAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "completedAt"
            )
    ) {

        data.completedAt =
            parseDateValue(
                payload.completedAt
            );
    }

    if (
        status ===
            DocumentStatus.GENERATED &&
        data.generatedAt ===
            undefined
    ) {

        data.generatedAt =
            new Date();
    }

    if (
        status ===
            DocumentStatus.UPLOADED &&
        data.uploadedAt ===
            undefined
    ) {

        data.uploadedAt =
            new Date();
    }

    if (
        status ===
            DocumentStatus.GIVEN &&
        data.givenAt ===
            undefined
    ) {

        data.givenAt =
            new Date();
    }

    if (
        status ===
            DocumentStatus.COMPLETED &&
        data.completedAt ===
            undefined
    ) {

        data.completedAt =
            new Date();
    }

    if (
        status ===
        DocumentStatus.PENDING
    ) {

        data.givenAt =
            null;

        data.completedAt =
            null;
    }

    if (
        status ===
        DocumentStatus.UPLOADED
    ) {

        data.givenAt =
            null;

        data.completedAt =
            null;
    }

    if (
        status ===
        DocumentStatus.GIVEN
    ) {

        data.completedAt =
            null;
    }

    return data;
};

const upsertBookingDocument =
    async (
        tx: any,
        bookingId: string,
        type: DocumentType,
        payload?:
            FrontendDocument
    ) => {

        const existing =
            await tx.bookingDocument
                .findFirst({

                    where: {
                        bookingId,
                        type,
                    },

                    select: {
                        id:
                            true,
                    },
                });

        const data =
            buildDocumentData(
                payload
            );

        if (
            existing
        ) {

            await tx.bookingDocument
                .update({

                    where: {
                        id:
                            existing.id,
                    },

                    data,
                });

            return;
        }

        await tx.bookingDocument
            .create({

                data: {
                    bookingId,
                    type,
                    ...data,
                },
            });
    };

const syncBookingDocuments =
    async (
        tx: any,
        bookingId: string,
        documents:
            FrontendDocuments |
            undefined
    ) => {

        if (
            !documents
        ) {
            return;
        }

        if (
            documents
                .requisitionLetter
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .REQUISITION_LETTER,
                documents
                    .requisitionLetter
            );
        }

        if (
            documents
                .agreementToSell
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .AGREEMENT_TO_SELL,
                documents
                    .agreementToSell
            );
        }

        const tripartite =
            documents
                .tripartiteAgreement;

        if (
            !tripartite
        ) {
            return;
        }

        if (
            tripartite.required ===
            false
        ) {

            await tx.bookingDocument
                .deleteMany({

                    where: {
                        bookingId,

                        type:
                            DocumentType
                                .TRIPARTITE_AGREEMENT,
                    },
                });

            return;
        }

        if (
            tripartite.required ===
                true ||
            tripartite.document
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .TRIPARTITE_AGREEMENT,
                tripartite.document ?? {
                    status:
                        "pending",
                }
            );
        }
    };

const getPropertyStatusFromBookingStatus =
    (
        status:
            BookingStatus
    ): PropertyStatus => {

        switch (
            status
        ) {

            case BookingStatus
                .CONFIRMED:

                return (
                    PropertyStatus.BOOKED
                );

            case BookingStatus
                .COMPLETED:

                return (
                    PropertyStatus.SOLD
                );

            case BookingStatus
                .PENDING:

                return (
                    PropertyStatus.HOLD
                );

            case BookingStatus
                .CANCELLED:

            default:

                return (
                    PropertyStatus.AVAILABLE
                );
        }
    };

const getPropertyStatusFromBookings =
    (
        bookings:
            Array<{
                status:
                    BookingStatus;
            }>
    ): PropertyStatus => {

        if (
            bookings.some(
                (
                    booking
                ) =>
                    booking.status ===
                    BookingStatus
                        .COMPLETED
            )
        ) {

            return (
                PropertyStatus.SOLD
            );
        }

        if (
            bookings.some(
                (
                    booking
                ) =>
                    booking.status ===
                    BookingStatus
                        .CONFIRMED
            )
        ) {

            return (
                PropertyStatus.BOOKED
            );
        }

        if (
            bookings.some(
                (
                    booking
                ) =>
                    booking.status ===
                    BookingStatus
                        .PENDING
            )
        ) {

            return (
                PropertyStatus.HOLD
            );
        }

        return (
            PropertyStatus.AVAILABLE
        );
    };

const formatBooking = (
    booking: any
) => {

    let extraData: {
        paymentMode?: string;
        remarks?: string;
    } = {};

    try {

        if (
            booking.notes
        ) {

            extraData =
                JSON.parse(
                    booking.notes
                );
        }

    } catch {

        extraData = {
            remarks:
                booking.notes ??
                "",
        };
    }

    const documents =
        booking.documents ??
        [];

    const findDocument = (
        type:
            DocumentType
    ) => {

        const document =
            documents.find(
                (
                    item: any
                ) =>
                    item.type ===
                    type
            );

        return {

            status:
                document
                    ?.status
                    ?.toLowerCase() ??
                "pending",

            fileName:
                document
                    ?.fileName ??
                undefined,

            fileUrl:
                document
                    ?.fileUrl ??
                undefined,

            generatedAt:
                document
                    ?.generatedAt
                    ?.toISOString?.() ??
                undefined,

            uploadedAt:
                document
                    ?.uploadedAt
                    ?.toISOString?.() ??
                undefined,

            givenAt:
                document
                    ?.givenAt
                    ?.toISOString?.() ??
                undefined,

            completedAt:
                document
                    ?.completedAt
                    ?.toISOString?.() ??
                undefined,
        };
    };

    const tripartiteRow =
        documents.find(
            (
                item: any
            ) =>
                item.type ===
                DocumentType
                    .TRIPARTITE_AGREEMENT
        );

    const tripartite =
        findDocument(
            DocumentType
                .TRIPARTITE_AGREEMENT
        );

    return {

        id:
            booking.id,

        employeeId:
            booking.employeeId ??
            booking.employee
                ?.id ??
            null,

        assignedEmployee:
            booking.employee
                ? {

                    id:
                        booking.employee.id,

                    name:
                        booking.employee.name,

                    email:
                        booking.employee.email,

                    phone:
                        booking.employee.phone ??
                        null,

                    role:
                        booking.employee.role,

                    status:
                        booking.employee.status,
                }
                : null,

        flatNumber:
            booking.property
                ?.unitNumber ??
            "",

        tower:
            booking.property
                ?.block ??
            booking.property
                ?.tower ??
            "",

        floor:
            Number(
                booking.property
                    ?.floor ??
                0
            ),

        customerName:
            booking.customer
                ?.name ??
            "",

        mobile:
            booking.customer
                ?.phone ??
            "",

        email:
            booking.customer
                ?.email ??
            "",

        address:
            booking.customer
                ?.address ??
            "",

        aadhar:
            booking.customer
                ?.aadhar ??
            "",

        pan:
            booking.customer
                ?.pan ??
            "",

        dob:
            booking.customer
                ?.dob
                ? new Date(
                    booking.customer.dob
                )
                    .toISOString()
                    .split("T")[0]
                : "",

        doa:
            booking.customer
                ?.doa
                ? new Date(
                    booking.customer.doa
                )
                    .toISOString()
                    .split("T")[0]
                : "",

        profile:
            booking.customer
                ?.profile ??
            "",

        bookingAmount:
            booking.amount !=
                null
                ? String(
                    booking.amount
                )
                : "",

        totalAmount:
            booking.totalAmount !=
                null
                ? String(
                    booking.totalAmount
                )
                : "",

        discount:
            booking.discount !=
                null
                ? String(
                    booking.discount
                )
                : "",

        afterDiscountAmount:
            booking.afterDiscountAmount !=
                null
                ? String(
                    booking.afterDiscountAmount
                )
                : "",

        plan:
            booking.plan ??
            "",

        chequeNo:
            booking.chequeNo ??
            "",

        bankName:
            booking.bankName ??
            "",

        finance:
            booking.finance ??
            "",

        customerNeed:
            booking.customerNeed ??
            "",

        paymentMode:
            extraData
                .paymentMode ??
            "Cash",

        bookingDate:
            booking.bookingDate
                ? new Date(
                    booking.bookingDate
                )
                    .toISOString()
                    .split("T")[0]
                : "",

        cancelledAt:
            booking.cancelledAt
                ? new Date(
                    booking.cancelledAt
                )
                    .toISOString()
                : null,

        remarks:
            extraData
                .remarks ??
            "",

        status:
            booking.status ===
                BookingStatus.CONFIRMED
                ? "booked"
                : booking.status
                    .toLowerCase(),

        bookingCode:
            booking.bookingCode,

        documents: {

            requisitionLetter:
                findDocument(
                    DocumentType
                        .REQUISITION_LETTER
                ),

            agreementToSell:
                findDocument(
                    DocumentType
                        .AGREEMENT_TO_SELL
                ),

            tripartiteAgreement: {

                required:
                    Boolean(
                        tripartiteRow
                    ),

                document:
                    tripartite,
            },
        },
    };
};

export const getBookings =
    async (
        _req: Request,
        res: Response
    ) => {

        try {

            const bookings =
                await prisma.booking
                    .findMany({

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                        },

                        orderBy: {
                            createdAt:
                                "desc",
                        },
                    });

            return res.json({

                success:
                    true,

                data:
                    bookings.map(
                        formatBooking
                    ),
            });

        } catch (error) {

            console.error(
                "Get bookings error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to fetch bookings",
                });
        }
    };

export const getBookingById =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const booking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                String(
                                    req.params.id
                                ),
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                        },
                    });

            if (
                !booking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            return res.json({

                success:
                    true,

                data:
                    formatBooking(
                        booking
                    ),
            });

        } catch (error) {

            console.error(
                "Get booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to fetch booking",
                });
        }
    };

export const createBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const {
                bookingCode,
                customerId,
                propertyId,
                employeeId,

                flatNumber,
                tower,
                floor,

                customerName,
                mobile,
                email,
                address,
                aadhar,
                pan,
                dob,
                doa,
                profile,

                bookingAmount,
                totalAmount,
                discount,
                afterDiscountAmount,
                plan,
                chequeNo,
                bankName,
                finance,
                customerNeed,
                paymentMode,
                bookingDate,
                remarks,

                status,

                documents,
            } =
                req.body as {

                    bookingCode?: string;

                    customerId?: string;

                    propertyId?: string;

                    employeeId?:
                        string |
                        null;

                    flatNumber?: string;

                    tower?: string;

                    floor?: number;

                    customerName?: string;

                    mobile?: string;

                    email?: string;

                    address?: string;

                    aadhar?: string;

                    pan?: string;

                    dob?: string;

                    doa?: string;

                    profile?: string;

                    bookingAmount?: string;

                    totalAmount?: string;

                    discount?: string;

                    afterDiscountAmount?: string;

                    plan?: string;

                    chequeNo?: string;

                    bankName?: string;

                    finance?: string;

                    customerNeed?: string;

                    paymentMode?: string;

                    bookingDate?: string;

                    remarks?: string;

                    status?: string;

                    documents?:
                        FrontendDocuments;
                };

            if (
                !customerName ||
                !mobile
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Customer name and mobile are required",
                    });
            }

            let customer;

            if (
                customerId
            ) {

                customer =
                    await prisma.customer
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        customerId
                                    ),
                            },
                        });
            }

            if (
                !customer
            ) {

                customer =
                    await prisma.customer
                        .findFirst({

                            where: {
                                phone:
                                    String(
                                        mobile
                                    )
                                        .trim(),
                            },
                        });
            }

            if (
                customer
            ) {

                customer =
                    await prisma.customer
                        .update({

                            where: {
                                id:
                                    customer.id,
                            },

                            data: {

                                name:
                                    String(
                                        customerName
                                    )
                                        .trim(),

                                email:
                                    email
                                        ? String(
                                            email
                                        )
                                            .trim()
                                        : null,

                                phone:
                                    String(
                                        mobile
                                    )
                                        .trim(),

                                address:
                                    address
                                        ? String(
                                            address
                                        )
                                            .trim()
                                        : null,

                                aadhar:
                                    aadhar
                                        ? String(
                                            aadhar
                                        )
                                            .trim()
                                        : null,

                                pan:
                                    pan
                                        ? String(
                                            pan
                                        )
                                            .trim()
                                        : null,

                                dob:
                                    parseDateValue(
                                        dob
                                    ),

                                doa:
                                    parseDateValue(
                                        doa
                                    ),

                                profile:
                                    profile
                                        ? String(
                                            profile
                                        )
                                            .trim()
                                        : null,
                            },
                        });

            } else {

                customer =
                    await prisma.customer
                        .create({

                            data: {

                                name:
                                    String(
                                        customerName
                                    )
                                        .trim(),

                                email:
                                    email
                                        ? String(
                                            email
                                        )
                                            .trim()
                                        : null,

                                phone:
                                    String(
                                        mobile
                                    )
                                        .trim(),

                                address:
                                    address
                                        ? String(
                                            address
                                        )
                                            .trim()
                                        : null,

                                aadhar:
                                    aadhar
                                        ? String(
                                            aadhar
                                        )
                                            .trim()
                                        : null,

                                pan:
                                    pan
                                        ? String(
                                            pan
                                        )
                                            .trim()
                                        : null,

                                dob:
                                    parseDateValue(
                                        dob
                                    ),

                                doa:
                                    parseDateValue(
                                        doa
                                    ),

                                profile:
                                    profile
                                        ? String(
                                            profile
                                        )
                                            .trim()
                                        : null,
                            },
                        });
            }

            let property;

            if (
                propertyId
            ) {

                property =
                    await prisma.property
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        propertyId
                                    ),
                            },
                        });
            }

            if (
                !property
            ) {

                property =
                    await prisma.property
                        .findFirst({

                            where: {

                                unitNumber:
                                    String(
                                        flatNumber ??
                                        ""
                                    ),

                                OR: [
                                    {
                                        block:
                                            String(
                                                tower ??
                                                ""
                                            ),
                                    },

                                    {
                                        tower:
                                            String(
                                                tower ??
                                                ""
                                            ),
                                    },
                                ],

                                floor:
                                    String(
                                        floor ??
                                        ""
                                    ),
                            },
                        });
            }

            if (
                !property
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Property/flat not found in inventory",
                    });
            }

            if (
                property.isFineDine
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This property is reserved for Fine Dine and cannot be booked",
                    });
            }

            const finalBookingStatus =
                normalizeBookingStatus(
                    status
                );

            if (
                finalBookingStatus !==
                    BookingStatus.CANCELLED &&
                property.status !==
                    PropertyStatus.AVAILABLE
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            `Property is currently ${property.status.toLowerCase()} and cannot be booked`,
                    });
            }

            if (
                employeeId
            ) {

                const employee =
                    await prisma.employee
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        employeeId
                                    ),
                            },
                        });

                if (
                    !employee
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Employee not found",
                        });
                }
            }

            const finalBookingCode =
                bookingCode ||
                `BK-${Date.now()}`;

            const existingBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            bookingCode:
                                finalBookingCode,
                        },
                    });

            if (
                existingBooking
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Booking with this code already exists",
                    });
            }

            const notes =
                JSON.stringify({

                    paymentMode:
                        paymentMode ??
                        "Cash",

                    remarks:
                        remarks ??
                        "",
                });

            const booking =
                await prisma
                    .$transaction(
                        async (
                            tx
                        ) => {

                            const currentProperty =
                                await tx.property
                                    .findUnique({

                                        where: {
                                            id:
                                                property.id,
                                        },
                                    });

                            if (
                                !currentProperty
                            ) {

                                throw new Error(
                                    "Property not found"
                                );
                            }

                            if (
                                currentProperty
                                    .isFineDine
                            ) {

                                throw new Error(
                                    "FINE_DINE_BLOCK"
                                );
                            }

                            if (
                                finalBookingStatus !==
                                    BookingStatus.CANCELLED &&
                                currentProperty.status !==
                                    PropertyStatus.AVAILABLE
                            ) {

                                throw new Error(
                                    "PROPERTY_NOT_AVAILABLE"
                                );
                            }

                            const newBooking =
                                await tx.booking
                                    .create({

                                        data: {

                                            bookingCode:
                                                finalBookingCode,

                                            customerId:
                                                customer.id,

                                            propertyId:
                                                currentProperty.id,

                                            employeeId:
                                                employeeId
                                                    ? String(
                                                        employeeId
                                                    )
                                                    : null,

                                            status:
                                                finalBookingStatus,

                                            bookingDate:
                                                bookingDate
                                                    ? new Date(
                                                        bookingDate
                                                    )
                                                    : undefined,

                                            amount:
                                                bookingAmount
                                                    ? Number(
                                                        bookingAmount
                                                    )
                                                    : undefined,

                                            totalAmount:
                                                totalAmount
                                                    ? Number(
                                                        totalAmount
                                                    )
                                                    : undefined,

                                            discount:
                                                discount
                                                    ? Number(
                                                        discount
                                                    )
                                                    : undefined,

                                            afterDiscountAmount:
                                                afterDiscountAmount
                                                    ? Number(
                                                        afterDiscountAmount
                                                    )
                                                    : undefined,

                                            plan:
                                                plan
                                                    ? String(
                                                        plan
                                                    )
                                                        .trim()
                                                    : null,

                                            chequeNo:
                                                chequeNo
                                                    ? String(
                                                        chequeNo
                                                    )
                                                        .trim()
                                                    : null,

                                            bankName:
                                                bankName
                                                    ? String(
                                                        bankName
                                                    )
                                                        .trim()
                                                    : null,

                                            finance:
                                                finance
                                                    ? String(
                                                        finance
                                                    )
                                                        .trim()
                                                    : null,

                                            customerNeed:
                                                customerNeed
                                                    ? String(
                                                        customerNeed
                                                    )
                                                        .trim()
                                                    : null,

                                            notes,
                                        },
                                    });

                            await upsertBookingDocument(
                                tx,
                                newBooking.id,
                                DocumentType
                                    .REQUISITION_LETTER,
                                documents
                                    ?.requisitionLetter ??
                                {
                                    status:
                                        "pending",
                                }
                            );

                            await upsertBookingDocument(
                                tx,
                                newBooking.id,
                                DocumentType
                                    .AGREEMENT_TO_SELL,
                                documents
                                    ?.agreementToSell ??
                                {
                                    status:
                                        "pending",
                                }
                            );

                            if (
                                documents
                                    ?.tripartiteAgreement
                                    ?.required ===
                                true
                            ) {

                                await upsertBookingDocument(
                                    tx,
                                    newBooking.id,
                                    DocumentType
                                        .TRIPARTITE_AGREEMENT,
                                    documents
                                        .tripartiteAgreement
                                        .document ??
                                    {
                                        status:
                                            "pending",
                                    }
                                );
                            }

                            await tx.property
                                .update({

                                    where: {
                                        id:
                                            currentProperty.id,
                                    },

                                    data: {
                                        status:
                                            getPropertyStatusFromBookingStatus(
                                                finalBookingStatus
                                            ),
                                    },
                                });

                            return newBooking;
                        }
                    );

            const completeBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                booking.id,
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                        },
                    });

            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Booking created successfully",

                    data:
                        formatBooking(
                            completeBooking
                        ),
                });

        } catch (error) {

            console.error(
                "Create booking error:",
                error
            );

            if (
                error instanceof
                    Error &&
                error.message ===
                    "FINE_DINE_BLOCK"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This property is reserved for Fine Dine and cannot be booked",
                    });
            }

            if (
                error instanceof
                    Error &&
                error.message ===
                    "PROPERTY_NOT_AVAILABLE"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Property is no longer available for booking",
                    });
            }

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to create booking",

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };

export const updateBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const bookingId =
                String(
                    req.params.id
                );

            const existingBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                bookingId,
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                        },
                    });

            if (
                !existingBooking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            const {
                customerName,
                mobile,
                email,
                address,
                aadhar,
                pan,
                dob,
                doa,
                profile,

                bookingAmount,
                totalAmount,
                discount,
                afterDiscountAmount,
                plan,
                chequeNo,
                bankName,
                finance,
                customerNeed,
                paymentMode,
                bookingDate,
                remarks,

                employeeId,
                status,

                documents,
            } =
                req.body as {

                    customerName?: string;

                    mobile?: string;

                    email?: string;

                    address?: string;

                    aadhar?: string;

                    pan?: string;

                    dob?: string;

                    doa?: string;

                    profile?: string;

                    bookingAmount?: string;

                    totalAmount?: string;

                    discount?: string;

                    afterDiscountAmount?: string;

                    plan?: string;

                    chequeNo?: string;

                    bankName?: string;

                    finance?: string;

                    customerNeed?: string;

                    paymentMode?: string;

                    bookingDate?: string;

                    remarks?: string;

                    employeeId?:
                        string |
                        null;

                    status?: string;

                    documents?:
                        FrontendDocuments;
                };

            if (
                customerName !==
                    undefined ||
                mobile !==
                    undefined ||
                email !==
                    undefined ||
                address !==
                    undefined ||
                aadhar !==
                    undefined ||
                pan !==
                    undefined ||
                dob !==
                    undefined ||
                doa !==
                    undefined ||
                profile !==
                    undefined
            ) {

                await prisma.customer
                    .update({

                        where: {
                            id:
                                existingBooking
                                    .customerId,
                        },

                        data: {

                            name:
                                customerName !==
                                    undefined
                                    ? String(
                                        customerName
                                    )
                                        .trim()
                                    : undefined,

                            phone:
                                mobile !==
                                    undefined
                                    ? String(
                                        mobile
                                    )
                                        .trim()
                                    : undefined,

                            email:
                                email !==
                                    undefined
                                    ? email
                                        ? String(
                                            email
                                        )
                                            .trim()
                                        : null
                                    : undefined,

                            address:
                                address !==
                                    undefined
                                    ? address
                                        ? String(
                                            address
                                        )
                                            .trim()
                                        : null
                                    : undefined,

                            aadhar:
                                aadhar !==
                                    undefined
                                    ? aadhar
                                        ? String(
                                            aadhar
                                        )
                                            .trim()
                                        : null
                                    : undefined,

                            pan:
                                pan !==
                                    undefined
                                    ? pan
                                        ? String(
                                            pan
                                        )
                                            .trim()
                                        : null
                                    : undefined,

                            dob:
                                dob !==
                                    undefined
                                    ? parseDateValue(
                                        dob
                                    )
                                    : undefined,

                            doa:
                                doa !==
                                    undefined
                                    ? parseDateValue(
                                        doa
                                    )
                                    : undefined,

                            profile:
                                profile !==
                                    undefined
                                    ? profile
                                        ? String(
                                            profile
                                        )
                                            .trim()
                                        : null
                                    : undefined,
                        },
                    });
            }

            if (
                employeeId
            ) {

                const employee =
                    await prisma.employee
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        employeeId
                                    ),
                            },
                        });

                if (
                    !employee
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Employee not found",
                        });
                }
            }

            let currentExtraData: {
                paymentMode?: string;
                remarks?: string;
            } = {};

            try {

                if (
                    existingBooking
                        .notes
                ) {

                    currentExtraData =
                        JSON.parse(
                            existingBooking
                                .notes
                        );
                }

            } catch {

                currentExtraData = {
                    remarks:
                        existingBooking
                            .notes ??
                        "",
                };
            }

            const updatedNotes =
                JSON.stringify({

                    paymentMode:
                        paymentMode ??
                        currentExtraData
                            .paymentMode ??
                        "Cash",

                    remarks:
                        remarks ??
                        currentExtraData
                            .remarks ??
                        "",
                });

            const nextBookingStatus =
                status !==
                    undefined
                    ? normalizeBookingStatus(
                        status
                    )
                    : existingBooking
                        .status;

            if (
                status !==
                    undefined &&
                nextBookingStatus !==
                    BookingStatus.CANCELLED
            ) {

                const otherActiveBooking =
                    await prisma.booking
                        .findFirst({

                            where: {

                                propertyId:
                                    existingBooking
                                        .propertyId,

                                id: {
                                    not:
                                        bookingId,
                                },

                                status: {

                                    in: [
                                        BookingStatus
                                            .PENDING,

                                        BookingStatus
                                            .CONFIRMED,

                                        BookingStatus
                                            .COMPLETED,
                                    ],
                                },
                            },
                        });

                if (
                    otherActiveBooking
                ) {

                    return res
                        .status(409)
                        .json({

                            success:
                                false,

                            message:
                                "Another active booking already exists for this property",
                        });
                }

                if (
                    existingBooking
                        .property
                        .isFineDine
                ) {

                    return res
                        .status(409)
                        .json({

                            success:
                                false,

                            message:
                                "This property is reserved for Fine Dine and cannot be booked",
                        });
                }
            }

            const booking =
                await prisma
                    .$transaction(
                        async (
                            tx
                        ) => {

                            const updatedBooking =
                                await tx.booking
                                    .update({

                                        where: {
                                            id:
                                                bookingId,
                                        },

                                        data: {

                                            employeeId:
                                                employeeId !==
                                                    undefined
                                                    ? employeeId
                                                        ? String(
                                                            employeeId
                                                        )
                                                        : null
                                                    : undefined,

                                            status:
                                                status !==
                                                    undefined
                                                    ? nextBookingStatus
                                                    : undefined,

                                            bookingDate:
                                                bookingDate
                                                    ? new Date(
                                                        bookingDate
                                                    )
                                                    : undefined,

                                            amount:
                                                bookingAmount !==
                                                    undefined
                                                    ? bookingAmount
                                                        ? Number(
                                                            bookingAmount
                                                        )
                                                        : null
                                                    : undefined,

                                            totalAmount:
                                                totalAmount !==
                                                    undefined
                                                    ? totalAmount
                                                        ? Number(
                                                            totalAmount
                                                        )
                                                        : null
                                                    : undefined,

                                            discount:
                                                discount !==
                                                    undefined
                                                    ? discount
                                                        ? Number(
                                                            discount
                                                        )
                                                        : null
                                                    : undefined,

                                            afterDiscountAmount:
                                                afterDiscountAmount !==
                                                    undefined
                                                    ? afterDiscountAmount
                                                        ? Number(
                                                            afterDiscountAmount
                                                        )
                                                        : null
                                                    : undefined,

                                            plan:
                                                plan !==
                                                    undefined
                                                    ? plan
                                                        ? String(
                                                            plan
                                                        )
                                                            .trim()
                                                        : null
                                                    : undefined,

                                            chequeNo:
                                                chequeNo !==
                                                    undefined
                                                    ? chequeNo
                                                        ? String(
                                                            chequeNo
                                                        )
                                                            .trim()
                                                        : null
                                                    : undefined,

                                            bankName:
                                                bankName !==
                                                    undefined
                                                    ? bankName
                                                        ? String(
                                                            bankName
                                                        )
                                                            .trim()
                                                        : null
                                                    : undefined,

                                            finance:
                                                finance !==
                                                    undefined
                                                    ? finance
                                                        ? String(
                                                            finance
                                                        )
                                                            .trim()
                                                        : null
                                                    : undefined,

                                            customerNeed:
                                                customerNeed !==
                                                    undefined
                                                    ? customerNeed
                                                        ? String(
                                                            customerNeed
                                                        )
                                                            .trim()
                                                        : null
                                                    : undefined,

                                            notes:
                                                updatedNotes,
                                        },
                                    });

                            await syncBookingDocuments(
                                tx,
                                bookingId,
                                documents
                            );

                            if (
                                status !==
                                undefined
                            ) {

                                const relatedBookings =
                                    await tx.booking
                                        .findMany({

                                            where: {

                                                propertyId:
                                                    existingBooking
                                                        .propertyId,

                                                id: {
                                                    not:
                                                        bookingId,
                                                },

                                                status: {

                                                    in: [
                                                        BookingStatus
                                                            .PENDING,

                                                        BookingStatus
                                                            .CONFIRMED,

                                                        BookingStatus
                                                            .COMPLETED,
                                                    ],
                                                },
                                            },

                                            select: {
                                                status:
                                                    true,
                                            },
                                        });

                                if (
                                    nextBookingStatus !==
                                    BookingStatus.CANCELLED
                                ) {

                                    relatedBookings.push({
                                        status:
                                            nextBookingStatus,
                                    });
                                }

                                const nextPropertyStatus =
                                    getPropertyStatusFromBookings(
                                        relatedBookings
                                    );

                                await tx.property
                                    .update({

                                        where: {
                                            id:
                                                existingBooking
                                                    .propertyId,
                                        },

                                        data: {
                                            status:
                                                nextPropertyStatus,
                                        },
                                    });
                            }

                            return updatedBooking;
                        }
                    );

            const completeBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                booking.id,
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                        },
                    });

            return res.json({

                success:
                    true,

                message:
                    "Booking updated successfully",

                data:
                    formatBooking(
                        completeBooking
                    ),
            });

        } catch (error) {

            console.error(
                "Update booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to update booking",

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };

export const deleteBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const bookingId =
                String(
                    req.params.id
                );

            const existingBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                bookingId,
                        },
                    });

            if (
                !existingBooking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            await prisma
                .$transaction(
                    async (
                        tx
                    ) => {

                        await tx.booking
                            .delete({

                                where: {
                                    id:
                                        bookingId,
                                },
                            });

                        const remainingBookings =
                            await tx.booking
                                .findMany({

                                    where: {

                                        propertyId:
                                            existingBooking
                                                .propertyId,

                                        status: {

                                            in: [
                                                BookingStatus
                                                    .PENDING,

                                                BookingStatus
                                                    .CONFIRMED,

                                                BookingStatus
                                                    .COMPLETED,
                                            ],
                                        },
                                    },

                                    select: {
                                        status:
                                            true,
                                    },
                                });

                        const nextPropertyStatus =
                            getPropertyStatusFromBookings(
                                remainingBookings
                            );

                        await tx.property
                            .update({

                                where: {
                                    id:
                                        existingBooking
                                            .propertyId,
                                },

                                data: {
                                    status:
                                        nextPropertyStatus,
                                },
                            });
                    }
                );

            return res.json({

                success:
                    true,

                message:
                    "Booking deleted successfully",
            });

        } catch (error) {

            console.error(
                "Delete booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to delete booking",

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };