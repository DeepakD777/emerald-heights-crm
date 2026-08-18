import {
    useEffect,
    useState,
} from "react";
import {
    useSearchParams,
} from "react-router-dom";

import {
    UserPlus,
    Users,
    UserCheck,
    UserX,
    Phone,
    Mail,
    MoreVertical,
    Pencil,
    Trash2,
    Power,
    X,
    Eye,
    EyeOff,
} from "lucide-react";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    getAuthToken,
} from "../../services/api";

// ======================================================
// Types
// ======================================================

interface SalesMember {
    id: string;

    name: string;

    role: string;

    phone: string;

    email: string;

    status:
    | "active"
    | "inactive";

    bookings: number;
}

interface MemberForm {
    name: string;

    role: string;

    phone: string;

    email: string;

    status:
    | "active"
    | "inactive";

    password: string;

    confirmPassword: string;
}

// ======================================================
// Empty Form
// ======================================================

const emptyForm:
    MemberForm = {

    name: "",

    role:
        "Sales Executive",

    phone: "",

    email: "",

    status:
        "active",

    password: "",

    confirmPassword: "",
};

// ======================================================
// API
// ======================================================

const EMPLOYEES_API =
    "http://localhost:5000/api/employees";

// ======================================================
// Auth Headers
// ======================================================

const getRequestHeaders = (
    includeJson = false
): HeadersInit => {

    const token =
        getAuthToken();

    const headers:
        Record<string, string> = {};

    if (includeJson) {

        headers[
            "Content-Type"
        ] =
            "application/json";
    }

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
};

// ======================================================
// Role Label
// ======================================================

const getRoleLabel = (
    role: string
) => {

    switch (role) {

        case "ADMIN":

            return "Admin";

        case "SALES_MANAGER":

            return "Sales Manager";

        case "TEAM_LEADER":

            return "Team Leader";

        case "SALES_EXECUTIVE":
        case "EMPLOYEE":
        default:

            return "Sales Executive";
    }
};

// ======================================================
// Role API Value
// ======================================================

const getRoleApiValue = (
    role: string
) => {

    if (
        role ===
        "Sales Manager"
    ) {

        return "SALES_MANAGER";
    }

    if (
        role ===
        "Team Leader"
    ) {

        return "TEAM_LEADER";
    }

    return "SALES_EXECUTIVE";
};

// ======================================================
// Component
// ======================================================

function SalesTeam() {

    const {
        isAdmin,
    } = useAuth();

    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    const [
        salesTeam,
        setSalesTeam,
    ] =
        useState<
            SalesMember[]
        >([]);

    const [
        isModalOpen,
        setIsModalOpen,
    ] =
        useState(false);

    const [
        editingMemberId,
        setEditingMemberId,
    ] =
        useState<
            string | null
        >(null);

    const [
        formData,
        setFormData,
    ] =
        useState<MemberForm>(
            emptyForm
        );

    const [
        openMenuId,
        setOpenMenuId,
    ] =
        useState<
            string | null
        >(null);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const [
        showPassword,
        setShowPassword,
    ] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] =
        useState(false);

    // ==================================================
    // Permission Guard
    // ==================================================

    const canModify =
        () => {

            if (isAdmin) {
                return true;
            }

            alert(
                "View only access — sales team changes can only be made by an administrator."
            );

            return false;
        };

    // ==================================================
    // Load Employees From Backend
    // ==================================================

    const fetchSalesTeam =
        async () => {

            try {

                setLoading(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        EMPLOYEES_API,
                        {
                            headers:
                                getRequestHeaders(),
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
                        "Failed to fetch employees"
                    );
                }

                const rawEmployees =
                    Array.isArray(
                        result.data
                    )
                        ? result.data
                        : [];

                const employees:
                    SalesMember[] =
                    rawEmployees.map(
                        (
                            employee: {
                                id: string;
                                name: string;
                                email: string;
                                phone?: string | null;
                                role: string;
                                status: string;
                                bookings?: number;
                                _count?: {
                                    bookings?: number;
                                };
                            }
                        ) => ({

                            id:
                                employee.id,

                            name:
                                employee.name,

                            role:
                                getRoleLabel(
                                    employee.role
                                ),

                            phone:
                                employee.phone ||
                                "",

                            email:
                                employee.email,

                            status:
                                employee.status ===
                                    "ACTIVE"
                                    ? "active"
                                    : "inactive",

                            bookings:
                                Number(
                                    employee
                                        .bookings ??
                                    employee
                                        ._count
                                        ?.bookings ??
                                    0
                                ),
                        })
                    );

                setSalesTeam(
                    employees
                );

            } catch (error) {

                console.error(
                    "Failed to load sales team:",
                    error
                );

                setSalesTeam(
                    []
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch employees"
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    useEffect(() => {

        void fetchSalesTeam();

    }, []);

    // ==================================================
    // Statistics
    // ==================================================

    const totalMembers =
        salesTeam.length;

    const activeMembers =
        salesTeam.filter(
            (member) =>
                member.status ===
                "active"
        ).length;

    const inactiveMembers =
        salesTeam.filter(
            (member) =>
                member.status ===
                "inactive"
        ).length;

    const totalBookings =
        salesTeam.reduce(
            (
                total,
                member
            ) =>
                total +
                member.bookings,
            0
        );

    // ==================================================
    // Open Add Modal
    // ==================================================

    const handleAddMember =
        () => {

            if (!canModify()) {
                return;
            }

            setEditingMemberId(
                null
            );

            setFormData(
                emptyForm
            );

            setShowPassword(
                false
            );

            setShowConfirmPassword(
                false
            );

            setIsModalOpen(
                true
            );

            setOpenMenuId(
                null
            );
        };

    // ==================================================
    // Open Edit Modal
    // ==================================================

    const handleEditMember = (
        member:
            SalesMember
    ) => {

        if (!canModify()) {
            return;
        }

        setEditingMemberId(
            member.id
        );

        setFormData({

            name:
                member.name,

            role:
                member.role,

            phone:
                member.phone,

            email:
                member.email,

            status:
                member.status,

            password:
                "",

            confirmPassword:
                "",
        });

        setShowPassword(
            false
        );

        setShowConfirmPassword(
            false
        );

        setIsModalOpen(
            true
        );

        setOpenMenuId(
            null
        );
    };
    // ======================================================
    // Open Add Member From Quick Actions
    // ======================================================

    useEffect(() => {

        if (
            !isAdmin ||
            searchParams.get(
                "mode"
            ) !== "create"
        ) {
            return;
        }

        handleAddMember();

        const nextParams =
            new URLSearchParams(
                searchParams
            );

        nextParams.delete(
            "mode"
        );

        setSearchParams(
            nextParams,
            {
                replace:
                    true,
            }
        );

    }, [
        isAdmin,
        searchParams,
        setSearchParams,
    ]);

    // ==================================================
    // Close Modal
    // ==================================================

    const handleCloseModal =
        () => {

            setIsModalOpen(
                false
            );

            setEditingMemberId(
                null
            );

            setFormData(
                emptyForm
            );

            setShowPassword(
                false
            );

            setShowConfirmPassword(
                false
            );
        };

    // ==================================================
    // Form Change
    // ==================================================

    const handleInputChange = (
        field:
            keyof MemberForm,

        value:
            string
    ) => {

        setFormData(
            (
                previous
            ) => ({
                ...previous,

                [field]:
                    value,
            })
        );
    };

    // ==================================================
    // Validate Password
    // ==================================================

    const validatePassword =
        () => {

            const isNewMember =
                editingMemberId ===
                null;

            const password =
                formData.password;

            const confirmPassword =
                formData.confirmPassword;

            // ----------------------------------------------
            // New Member
            // Password Required
            // ----------------------------------------------

            if (isNewMember) {

                if (!password) {

                    alert(
                        "Please enter a password for the new sales member."
                    );

                    return false;
                }

                if (
                    password.length <
                    8
                ) {

                    alert(
                        "Password must be at least 8 characters long."
                    );

                    return false;
                }

                if (
                    !confirmPassword
                ) {

                    alert(
                        "Please confirm the password."
                    );

                    return false;
                }

                if (
                    password !==
                    confirmPassword
                ) {

                    alert(
                        "Password and Confirm Password do not match."
                    );

                    return false;
                }

                return true;
            }

            // ----------------------------------------------
            // Edit Member
            // Password Optional
            // ----------------------------------------------

            if (
                !password &&
                !confirmPassword
            ) {

                return true;
            }

            if (
                !password ||
                password.length <
                8
            ) {

                alert(
                    "New password must be at least 8 characters long."
                );

                return false;
            }

            if (
                !confirmPassword
            ) {

                alert(
                    "Please confirm the new password."
                );

                return false;
            }

            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Password and Confirm Password do not match."
                );

                return false;
            }

            return true;
        };

    // ==================================================
    // Save Member
    // ==================================================

    const handleSaveMember =
        async (
            event:
                React.FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            if (!canModify()) {
                return;
            }

            const trimmedName =
                formData
                    .name
                    .trim();

            const trimmedPhone =
                formData
                    .phone
                    .trim();

            const trimmedEmail =
                formData
                    .email
                    .trim()
                    .toLowerCase();

            if (
                !trimmedName ||
                !trimmedPhone ||
                !trimmedEmail
            ) {

                alert(
                    "Please fill Name, Phone and Email."
                );

                return;
            }

            if (
                !validatePassword()
            ) {

                return;
            }

            // ==============================================
            // Edit Existing Member
            // ==============================================

            if (
                editingMemberId !==
                null
            ) {

                try {

                    const payload:
                        Record<
                            string,
                            string
                        > = {

                        name:
                            trimmedName,

                        email:
                            trimmedEmail,

                        phone:
                            trimmedPhone,

                        role:
                            getRoleApiValue(
                                formData.role
                            ),

                        status:
                            formData.status ===
                                "active"
                                ? "ACTIVE"
                                : "INACTIVE",
                    };

                    // Password is optional when editing.
                    // Blank means keep existing password.

                    if (
                        formData.password
                    ) {

                        payload.password =
                            formData.password;
                    }

                    const response =
                        await fetch(
                            `${EMPLOYEES_API}/${editingMemberId}`,
                            {
                                method:
                                    "PUT",

                                headers:
                                    getRequestHeaders(
                                        true
                                    ),

                                body:
                                    JSON.stringify(
                                        payload
                                    ),
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
                            "Failed to update employee"
                        );
                    }

                    const employee =
                        result.data;

                    setSalesTeam(
                        (
                            previous
                        ) =>
                            previous.map(
                                (
                                    member
                                ) =>
                                    member.id ===
                                        editingMemberId
                                        ? {
                                            ...member,

                                            id:
                                                employee.id,

                                            name:
                                                employee.name,

                                            role:
                                                getRoleLabel(
                                                    employee.role
                                                ),

                                            phone:
                                                employee.phone ||
                                                "",

                                            email:
                                                employee.email,

                                            status:
                                                employee.status ===
                                                    "ACTIVE"
                                                    ? "active"
                                                    : "inactive",
                                        }
                                        : member
                            )
                    );

                    alert(
                        "Sales member updated successfully."
                    );

                } catch (error) {

                    console.error(
                        "Update sales member error:",
                        error
                    );

                    alert(
                        error instanceof Error
                            ? error.message
                            : "Failed to update sales member. Please try again."
                    );

                    return;
                }
            }

            // ==============================================
            // Add New Member
            // ==============================================

            else {

                try {

                    const response =
                        await fetch(
                            EMPLOYEES_API,
                            {
                                method:
                                    "POST",

                                headers:
                                    getRequestHeaders(
                                        true
                                    ),

                                body:
                                    JSON.stringify({

                                        name:
                                            trimmedName,

                                        email:
                                            trimmedEmail,

                                        phone:
                                            trimmedPhone,

                                        password:
                                            formData.password,

                                        role:
                                            getRoleApiValue(
                                                formData.role
                                            ),

                                        status:
                                            formData.status ===
                                                "active"
                                                ? "ACTIVE"
                                                : "INACTIVE",
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
                            "Failed to create employee"
                        );
                    }

                    const employee =
                        result.data;

                    const newMember:
                        SalesMember = {

                        id:
                            employee.id,

                        name:
                            employee.name,

                        role:
                            getRoleLabel(
                                employee.role
                            ),

                        phone:
                            employee.phone ||
                            "",

                        email:
                            employee.email,

                        status:
                            employee.status ===
                                "ACTIVE"
                                ? "active"
                                : "inactive",

                        bookings:
                            Number(
                                employee
                                    .bookings ??
                                employee
                                    ._count
                                    ?.bookings ??
                                0
                            ),
                    };

                    setSalesTeam(
                        (
                            previous
                        ) => [
                                ...previous,
                                newMember,
                            ]
                    );

                    alert(
                        "Sales member created successfully."
                    );

                } catch (error) {

                    console.error(
                        "Create sales member error:",
                        error
                    );

                    alert(
                        error instanceof Error
                            ? error.message
                            : "Failed to create sales member. Please try again."
                    );

                    return;
                }
            }

            handleCloseModal();
        };

    // ==================================================
    // Toggle Active / Inactive
    // ==================================================

    const handleToggleStatus =
        async (
            memberId:
                string
        ) => {

            if (!canModify()) {
                return;
            }

            const member =
                salesTeam.find(
                    (item) =>
                        item.id ===
                        memberId
                );

            if (!member) {
                return;
            }

            const newStatus =
                member.status ===
                    "active"
                    ? "INACTIVE"
                    : "ACTIVE";

            try {

                const response =
                    await fetch(
                        `${EMPLOYEES_API}/${memberId}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getRequestHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify({

                                    name:
                                        member.name,

                                    email:
                                        member.email,

                                    phone:
                                        member.phone,

                                    role:
                                        getRoleApiValue(
                                            member.role
                                        ),

                                    status:
                                        newStatus,
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
                        "Failed to update employee status"
                    );
                }

                const updatedEmployee =
                    result.data;

                setSalesTeam(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                item
                            ) =>
                                item.id ===
                                    memberId
                                    ? {
                                        ...item,

                                        status:
                                            updatedEmployee
                                                .status ===
                                                "ACTIVE"
                                                ? "active"
                                                : "inactive",
                                    }
                                    : item
                        )
                );

                setOpenMenuId(
                    null
                );

            } catch (error) {

                console.error(
                    "Update employee status error:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Failed to update member status. Please try again."
                );
            }
        };

    // ==================================================
    // Delete Member
    // ==================================================

    const handleDeleteMember =
        async (
            memberId:
                string
        ) => {

            if (!canModify()) {
                return;
            }

            const member =
                salesTeam.find(
                    (item) =>
                        item.id ===
                        memberId
                );

            if (!member) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Delete ${member.name} from the sales team?`
                );

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `${EMPLOYEES_API}/${memberId}`,
                        {
                            method:
                                "DELETE",

                            headers:
                                getRequestHeaders(),
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
                        "Failed to delete employee"
                    );
                }

                setSalesTeam(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                item
                            ) =>
                                item.id !==
                                memberId
                        )
                );

                setOpenMenuId(
                    null
                );

                alert(
                    "Sales member deleted successfully."
                );

            } catch (error) {

                console.error(
                    "Delete sales member error:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete sales member. Please try again."
                );
            }
        };

    // ==================================================
    // Render
    // ==================================================

    return (

        <div className="space-y-6">

            {/* ==========================================
                Header
            ========================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-gray-800">
                        Sales Team
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {isAdmin
                            ? "Manage your sales team and track their performance"
                            : "View sales team and performance information"}
                    </p>

                </div>

                {isAdmin && (

                    <button
                        type="button"
                        onClick={
                            handleAddMember
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700"
                    >
                        <UserPlus
                            size={18}
                        />

                        Add Sales Member
                    </button>
                )}

            </div>

            {/* ==========================================
                Error
            ========================================== */}

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* ==========================================
                Statistics
            ========================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total */}

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Total Members
                            </p>

                            <p className="mt-2 text-3xl font-bold text-gray-800">
                                {
                                    totalMembers
                                }
                            </p>

                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users
                                size={24}
                            />
                        </div>

                    </div>

                </div>

                {/* Active */}

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Active Members
                            </p>

                            <p className="mt-2 text-3xl font-bold text-green-600">
                                {
                                    activeMembers
                                }
                            </p>

                        </div>

                        <div className="rounded-xl bg-green-50 p-3 text-green-600">
                            <UserCheck
                                size={24}
                            />
                        </div>

                    </div>

                </div>

                {/* Inactive */}

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Inactive Members
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-500">
                                {
                                    inactiveMembers
                                }
                            </p>

                        </div>

                        <div className="rounded-xl bg-red-50 p-3 text-red-500">
                            <UserX
                                size={24}
                            />
                        </div>

                    </div>

                </div>

                {/* Bookings */}

                <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Total Bookings
                            </p>

                            <p className="mt-2 text-3xl font-bold text-purple-600">
                                {
                                    totalBookings
                                }
                            </p>

                        </div>

                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                            <Users
                                size={24}
                            />
                        </div>

                    </div>

                </div>

            </div>

            {/* ==========================================
                Team Members
            ========================================== */}

            <div className="rounded-2xl bg-white shadow-sm">

                <div className="border-b px-5 py-5 sm:px-6">

                    <h2 className="text-lg font-bold text-gray-800">
                        Team Members
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Sales executives and their current status
                    </p>

                </div>

                {loading ? (

                    <div className="p-10 text-center text-gray-500">
                        Loading sales team...
                    </div>

                ) : salesTeam.length ===
                    0 ? (

                    <div className="p-10 text-center text-gray-500">
                        No sales members found.
                    </div>

                ) : (
                    <>

                        {/* ==============================
                            Desktop Table
                        ============================== */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">

                                        <th className="px-6 py-4 font-medium">
                                            Member
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Contact
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Bookings
                                        </th>

                                        <th className="px-6 py-4 font-medium">
                                            Status
                                        </th>

                                        {isAdmin && (

                                            <th className="px-6 py-4 text-right font-medium">
                                                Action
                                            </th>
                                        )}

                                    </tr>

                                </thead>

                                <tbody>

                                    {salesTeam.map(
                                        (
                                            member
                                        ) => (

                                            <tr
                                                key={
                                                    member.id
                                                }
                                                className="border-b last:border-b-0 hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                                                            {
                                                                member.name
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()
                                                            }
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-gray-800">
                                                                {
                                                                    member.name
                                                                }
                                                            </p>

                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    member.role
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="space-y-1 text-sm text-gray-600">

                                                        <div className="flex items-center gap-2">

                                                            <Phone
                                                                size={14}
                                                            />

                                                            {
                                                                member.phone ||
                                                                "-"
                                                            }

                                                        </div>

                                                        <div className="flex items-center gap-2">

                                                            <Mail
                                                                size={14}
                                                            />

                                                            {
                                                                member.email
                                                            }

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4 font-semibold text-gray-800">
                                                    {
                                                        member.bookings
                                                    }
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${member.status ===
                                                                "active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {
                                                            member.status ===
                                                                "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                        }
                                                    </span>

                                                </td>

                                                {isAdmin && (

                                                    <td className="relative px-6 py-4 text-right">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenMenuId(
                                                                    openMenuId ===
                                                                        member.id
                                                                        ? null
                                                                        : member.id
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                                            aria-label="Member actions"
                                                        >
                                                            <MoreVertical
                                                                size={18}
                                                            />
                                                        </button>

                                                        {openMenuId ===
                                                            member.id && (

                                                                <div className="absolute right-6 top-14 z-20 w-48 overflow-hidden rounded-xl border bg-white text-left shadow-lg">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleEditMember(
                                                                                member
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Pencil
                                                                            size={16}
                                                                        />

                                                                        Edit Member
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleToggleStatus(
                                                                                member.id
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Power
                                                                            size={16}
                                                                        />

                                                                        {member.status ===
                                                                            "active"
                                                                            ? "Deactivate"
                                                                            : "Activate"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDeleteMember(
                                                                                member.id
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2
                                                                            size={16}
                                                                        />

                                                                        Delete Member
                                                                    </button>

                                                                </div>
                                                            )}

                                                    </td>
                                                )}

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* ==============================
                            Mobile Cards
                        ============================== */}

                        <div className="space-y-3 p-4 md:hidden">

                            {salesTeam.map(
                                (
                                    member
                                ) => (

                                    <div
                                        key={
                                            member.id
                                        }
                                        className="relative rounded-xl border p-4"
                                    >

                                        <div className="flex items-start justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                                                    {
                                                        member.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()
                                                    }
                                                </div>

                                                <div>

                                                    <p className="font-semibold text-gray-800">
                                                        {
                                                            member.name
                                                        }
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {
                                                            member.role
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            {isAdmin && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId ===
                                                                member.id
                                                                ? null
                                                                : member.id
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                                    aria-label="Member actions"
                                                >
                                                    <MoreVertical
                                                        size={18}
                                                    />
                                                </button>
                                            )}

                                        </div>

                                        {isAdmin &&
                                            openMenuId ===
                                            member.id && (

                                                <div className="absolute right-4 top-14 z-20 w-48 overflow-hidden rounded-xl border bg-white shadow-lg">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditMember(
                                                                member
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Pencil
                                                            size={16}
                                                        />

                                                        Edit Member
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                member.id
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Power
                                                            size={16}
                                                        />

                                                        {member.status ===
                                                            "active"
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteMember(
                                                                member.id
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2
                                                            size={16}
                                                        />

                                                        Delete Member
                                                    </button>

                                                </div>
                                            )}

                                        <div className="mt-4 space-y-2 text-sm text-gray-600">

                                            <div className="flex items-center gap-2">

                                                <Phone
                                                    size={15}
                                                />

                                                {
                                                    member.phone ||
                                                    "-"
                                                }

                                            </div>

                                            <div className="flex items-center gap-2 break-all">

                                                <Mail
                                                    size={15}
                                                />

                                                {
                                                    member.email
                                                }

                                            </div>

                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t pt-3">

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Bookings
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {
                                                        member.bookings
                                                    }
                                                </p>

                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status ===
                                                        "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {
                                                    member.status ===
                                                        "active"
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            </span>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </>
                )}

            </div>

            {/* ==========================================
                Add / Edit Member Modal
                Admin Only
            ========================================== */}

            {isAdmin &&
                isModalOpen && (

                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                        onMouseDown={(
                            event
                        ) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                handleCloseModal();
                            }
                        }}
                    >

                        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                            {/* Modal Header */}

                            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">

                                <div>

                                    <h2 className="text-lg font-bold text-gray-800">
                                        {editingMemberId !==
                                            null
                                            ? "Edit Sales Member"
                                            : "Add Sales Member"}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {editingMemberId !==
                                            null
                                            ? "Update sales member details"
                                            : "Create a sales member with login access"}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                    aria-label="Close"
                                >
                                    <X
                                        size={20}
                                    />
                                </button>

                            </div>

                            {/* Form */}

                            <form
                                onSubmit={
                                    handleSaveMember
                                }
                                className="space-y-5 p-5 sm:p-6"
                            >

                                {/* Name */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            formData.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleInputChange(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter full name"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        required
                                    />

                                </div>

                                {/* Role */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Role
                                    </label>

                                    <select
                                        value={
                                            formData.role
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleInputChange(
                                                "role",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    >
                                        <option value="Sales Executive">
                                            Sales Executive
                                        </option>

                                        <option value="Sales Manager">
                                            Sales Manager
                                        </option>

                                        <option value="Team Leader">
                                            Team Leader
                                        </option>
                                    </select>

                                </div>

                                {/* Phone */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        value={
                                            formData.phone
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleInputChange(
                                                "phone",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter phone number"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        required
                                    />

                                </div>

                                {/* Email */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleInputChange(
                                                "email",
                                                event.target.value
                                            )
                                        }
                                        placeholder="employee@example.com"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                        required
                                    />

                                </div>

                                {/* Password */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {editingMemberId !==
                                            null
                                            ? "New Password"
                                            : "Password"}
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                formData.password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleInputChange(
                                                    "password",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                editingMemberId !==
                                                    null
                                                    ? "Leave blank to keep current password"
                                                    : "Minimum 8 characters"
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            required={
                                                editingMemberId ===
                                                null
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>

                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {editingMemberId !==
                                            null
                                            ? "Leave blank if you do not want to change the employee password."
                                            : "Password must contain at least 8 characters."}
                                    </p>

                                </div>

                                {/* Confirm Password */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {editingMemberId !==
                                            null
                                            ? "Confirm New Password"
                                            : "Confirm Password"}
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                formData.confirmPassword
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleInputChange(
                                                    "confirmPassword",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                editingMemberId !==
                                                    null
                                                    ? "Confirm new password"
                                                    : "Re-enter password"
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                            required={
                                                editingMemberId ===
                                                null
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>

                                    </div>

                                </div>

                                {/* Status */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            formData.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleInputChange(
                                                "status",
                                                event.target.value as
                                                | "active"
                                                | "inactive"
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>

                                </div>

                                {/* Buttons */}

                                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={
                                            handleCloseModal
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                                    >
                                        {editingMemberId !==
                                            null
                                            ? "Update Member"
                                            : "Save Member"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default SalesTeam;