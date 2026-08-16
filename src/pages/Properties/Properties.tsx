import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Building2,
    Home,
    Store,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    RefreshCw,
} from "lucide-react";

import {
    useSearchParams,
} from "react-router-dom";

import {
    createProperty,
    deleteProperty,
    getProperties,
    updateProperty,
} from "../../services/propertyService";

import type {
    Property,
    PropertyInput,
    PropertyStatus,
    PropertyType,
} from "../../services/propertyService";

import {
    useAutoRefresh,
} from "../../hooks/useAutoRefresh";

// ======================================================
// Form
// ======================================================

type PropertyFormState = {
    propertyCode: string;
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    isFineDine: boolean;
    phase: string;
    block: string;
    tower: string;
    floor: string;
    series: string;
    unitNumber: string;
    area: string;
    price: string;
    description: string;
};

const emptyForm: PropertyFormState = {
    propertyCode: "",
    name: "",
    type: "RESIDENTIAL",
    status: "AVAILABLE",
    isFineDine: false,
    phase: "",
    block: "",
    tower: "",
    floor: "",
    series: "",
    unitNumber: "",
    area: "",
    price: "",
    description: "",
};

// ======================================================
// Properties
// ======================================================

function Properties() {

    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    const inventoryRef =
        useRef<HTMLDivElement | null>(
            null
        );

    // ==================================================
    // Data
    // ==================================================

    const [
        properties,
        setProperties,
    ] = useState<Property[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    // ==================================================
    // Filters
    // ==================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        typeFilter,
        setTypeFilter,
    ] = useState<
        "ALL" |
        PropertyType
    >("ALL");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState<
        "ALL" |
        PropertyStatus |
        "FINEDINE"
    >("ALL");

    // ==================================================
    // Modal
    // ==================================================

    const [
        isModalOpen,
        setIsModalOpen,
    ] = useState(false);

    const [
        editingProperty,
        setEditingProperty,
    ] = useState<Property | null>(
        null
    );

    const [
        form,
        setForm,
    ] = useState<PropertyFormState>(
        emptyForm
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        deletingId,
        setDeletingId,
    ] = useState<string | null>(
        null
    );

    // ==================================================
    // Load
    // ==================================================

    const loadProperties =
        useCallback(
            async (
                silent = false
            ) => {

            try {

                if (silent) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const response =
                    await getProperties();

                setProperties(
                    response.data
                );

                setError("");

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load properties"
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadProperties();
    }, [
        loadProperties,
    ]);

    useAutoRefresh(
        () =>
            loadProperties(
                true
            ),
        5000
    );

    // ==================================================
    // Quick Action
    // ==================================================

    useEffect(() => {

        const mode =
            searchParams.get(
                "mode"
            );

        if (
            mode === "create"
        ) {
            setEditingProperty(
                null
            );

            setForm({
                ...emptyForm,
            });

            setIsModalOpen(
                true
            );

            setSearchParams(
                {},
                {
                    replace: true,
                }
            );
        }

    }, [
        searchParams,
        setSearchParams,
    ]);

    // ==================================================
    // Counts
    // ==================================================

    const residentialCount =
        properties.filter(
            (property) =>
                property.type ===
                "RESIDENTIAL"
        ).length;

    const commercialCount =
        properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL"
        ).length;

    const availableCount =
        properties.filter(
            (property) =>
                property.status ===
                    "AVAILABLE" &&
                !property.isFineDine
        ).length;

    const holdCount =
        properties.filter(
            (property) =>
                property.status ===
                "HOLD"
        ).length;

    const bookedCount =
        properties.filter(
            (property) =>
                property.status ===
                "BOOKED"
        ).length;

    const soldCount =
        properties.filter(
            (property) =>
                property.status ===
                "SOLD"
        ).length;

    const fineDineCount =
        properties.filter(
            (property) =>
                property.isFineDine
        ).length;

    // ==================================================
    // Manage Residential / Commercial
    // ==================================================

    const manageType = (
        type: PropertyType
    ) => {

        setTypeFilter(
            type
        );

        setStatusFilter(
            "ALL"
        );

        setSearch("");

        window.setTimeout(
            () => {

                inventoryRef.current?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start",
                });
            },
            50
        );
    };

    // ==================================================
    // Filter
    // ==================================================

    const filteredProperties =
        useMemo(
            () => {

            const normalizedSearch =
                search
                    .trim()
                    .toLowerCase();

            return properties.filter(
                (property) => {

                if (
                    typeFilter !==
                        "ALL" &&
                    property.type !==
                        typeFilter
                ) {
                    return false;
                }

                if (
                    statusFilter ===
                    "FINEDINE"
                ) {

                    if (
                        !property.isFineDine
                    ) {
                        return false;
                    }

                } else if (
                    statusFilter !==
                        "ALL" &&
                    property.status !==
                        statusFilter
                ) {
                    return false;
                }

                if (
                    !normalizedSearch
                ) {
                    return true;
                }

                const searchable =
                    [
                        property.propertyCode,
                        property.name,
                        property.unitNumber,
                        property.block,
                        property.tower,
                        property.phase,
                        property.floor,
                        property.series,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                return searchable.includes(
                    normalizedSearch
                );
            });
        },
        [
            properties,
            search,
            typeFilter,
            statusFilter,
        ]
    );

    // ==================================================
    // Modal Helpers
    // ==================================================

    const openAddModal = () => {

        setEditingProperty(
            null
        );

        setForm({
            ...emptyForm,
        });

        setError("");
        setSuccess("");

        setIsModalOpen(
            true
        );
    };

    const openEditModal = (
        property: Property
    ) => {

        setEditingProperty(
            property
        );

        setForm({
            propertyCode:
                property.propertyCode,

            name:
                property.name,

            type:
                property.type,

            status:
                property.status,

            isFineDine:
                property.isFineDine,

            phase:
                property.phase ?? "",

            block:
                property.block ?? "",

            tower:
                property.tower ?? "",

            floor:
                property.floor ?? "",

            series:
                property.series ?? "",

            unitNumber:
                property.unitNumber ?? "",

            area:
                property.area !== null
                    ? String(
                        property.area
                    )
                    : "",

            price:
                property.price !== null
                    ? String(
                        property.price
                    )
                    : "",

            description:
                property.description ?? "",
        });

        setError("");
        setSuccess("");

        setIsModalOpen(
            true
        );
    };

    const closeModal = () => {

        if (saving) {
            return;
        }

        setIsModalOpen(
            false
        );

        setEditingProperty(
            null
        );

        setForm({
            ...emptyForm,
        });
    };

    const updateForm = <
        K extends keyof PropertyFormState
    >(
        key: K,
        value: PropertyFormState[K]
    ) => {

        setForm(
            (current) => ({
                ...current,
                [key]: value,
            })
        );
    };

    // ==================================================
    // Save
    // ==================================================

    const handleSave =
        async (
            event:
                React.FormEvent
        ) => {

        event.preventDefault();

        if (
            !form.propertyCode.trim() ||
            !form.name.trim()
        ) {
            setError(
                "Property code and property name are required."
            );

            return;
        }

        try {

            setSaving(
                true
            );

            setError("");
            setSuccess("");

            const payload:
                PropertyInput = {

                propertyCode:
                    form.propertyCode.trim(),

                name:
                    form.name.trim(),

                type:
                    form.type,

                status:
                    form.status,

                isFineDine:
                    form.isFineDine,

                phase:
                    form.phase.trim(),

                block:
                    form.block.trim(),

                tower:
                    form.tower.trim(),

                floor:
                    form.floor.trim(),

                series:
                    form.series.trim(),

                unitNumber:
                    form.unitNumber.trim(),

                area:
                    form.area.trim()
                        ? Number(
                            form.area
                        )
                        : null,

                price:
                    form.price.trim()
                        ? Number(
                            form.price
                        )
                        : null,

                description:
                    form.description.trim(),
            };

            if (
                editingProperty
            ) {

                await updateProperty(
                    editingProperty.id,
                    payload
                );

                setSuccess(
                    "Property updated successfully."
                );

            } else {

                await createProperty(
                    payload
                );

                setSuccess(
                    "Property added successfully."
                );
            }

            closeModal();

            await loadProperties(
                true
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save property"
            );

        } finally {

            setSaving(false);
        }
    };

    // ==================================================
    // Delete
    // ==================================================

    const handleDelete =
        async (
            property: Property
        ) => {

        const confirmed =
            window.confirm(
                `Delete ${property.name} (${property.propertyCode})?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                property.id
            );

            setError("");
            setSuccess("");

            const response =
                await deleteProperty(
                    property.id
                );

            setSuccess(
                response.message
            );

            await loadProperties(
                true
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete property"
            );

        } finally {

            setDeletingId(
                null
            );
        }
    };

    // ==================================================
    // Status Style
    // ==================================================

    const getStatusStyle = (
        property: Property
    ) => {

        if (
            property.isFineDine
        ) {
            return "bg-purple-100 text-purple-700";
        }

        switch (
            property.status
        ) {

            case "BOOKED":
                return "bg-red-100 text-red-700";

            case "HOLD":
                return "bg-yellow-100 text-yellow-700";

            case "SOLD":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-green-100 text-green-700";
        }
    };

    const getStatusText = (
        property: Property
    ) => {

        if (
            property.isFineDine
        ) {
            return "Fine Dine";
        }

        switch (
            property.status
        ) {

            case "BOOKED":
                return "Booked";

            case "HOLD":
                return "Hold";

            case "SOLD":
                return "Sold";

            default:
                return "Available";
        }
    };

    // ==================================================
    // Loading
    // ==================================================

    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        size={32}
                        className="mx-auto animate-spin text-green-600"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading properties...
                    </p>

                </div>

            </div>
        );
    }

    // ==================================================
    // UI
    // ==================================================

    return (
        <div className="space-y-6">

            {/* Header */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Properties
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Manage residential and commercial property inventory
                        </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                loadProperties(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                px-4
                                py-2
                                font-medium
                                text-gray-700
                                hover:bg-gray-50
                            "
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                        <button
                            type="button"
                            onClick={
                                openAddModal
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-green-600
                                px-5
                                py-2
                                font-medium
                                text-white
                                hover:bg-green-700
                            "
                        >

                            <Plus size={19} />

                            Add Property

                        </button>

                    </div>

                </div>

            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {success}
                </div>
            )}

            {/* Manage Types */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <div className="rounded-2xl bg-white p-6 shadow">

                    <div className="mb-5 flex items-center gap-4">

                        <div className="rounded-xl bg-green-100 p-3">
                            <Home
                                size={28}
                                className="text-green-600"
                            />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                Residential
                            </h2>

                            <p className="text-sm text-gray-500">
                                Apartments & Flats
                            </p>

                        </div>

                    </div>

                    <div className="mb-5 rounded-xl bg-gray-50 p-4">

                        <p className="text-sm text-gray-500">
                            Total Units
                        </p>

                        <p className="mt-1 text-3xl font-bold text-gray-800">
                            {residentialCount}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            manageType(
                                "RESIDENTIAL"
                            )
                        }
                        className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                    >
                        Manage Residential
                    </button>

                </div>

                <div className="rounded-2xl bg-white p-6 shadow">

                    <div className="mb-5 flex items-center gap-4">

                        <div className="rounded-xl bg-orange-100 p-3">
                            <Store
                                size={28}
                                className="text-orange-600"
                            />
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                Commercial
                            </h2>

                            <p className="text-sm text-gray-500">
                                Shops & Commercial Units
                            </p>

                        </div>

                    </div>

                    <div className="mb-5 rounded-xl bg-gray-50 p-4">

                        <p className="text-sm text-gray-500">
                            Total Units
                        </p>

                        <p className="mt-1 text-3xl font-bold text-gray-800">
                            {commercialCount}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            manageType(
                                "COMMERCIAL"
                            )
                        }
                        className="w-full rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
                    >
                        Manage Commercial
                    </button>

                </div>

            </div>

            {/* Summary */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-5 flex items-center gap-3">

                    <Building2
                        size={24}
                        className="text-blue-600"
                    />

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">
                            Project Summary
                        </h2>

                        <p className="text-sm text-gray-500">
                            Live inventory from database
                        </p>

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">

                    <SummaryCard
                        label="Total"
                        value={
                            properties.length
                        }
                        className="bg-blue-50 text-blue-700"
                    />

                    <SummaryCard
                        label="Residential"
                        value={
                            residentialCount
                        }
                        className="bg-green-50 text-green-700"
                    />

                    <SummaryCard
                        label="Commercial"
                        value={
                            commercialCount
                        }
                        className="bg-orange-50 text-orange-700"
                    />

                    <SummaryCard
                        label="Available"
                        value={
                            availableCount
                        }
                        className="bg-emerald-50 text-emerald-700"
                    />

                    <SummaryCard
                        label="Hold"
                        value={
                            holdCount
                        }
                        className="bg-yellow-50 text-yellow-700"
                    />

                    <SummaryCard
                        label="Booked"
                        value={
                            bookedCount
                        }
                        className="bg-red-50 text-red-700"
                    />

                    <SummaryCard
                        label="Sold"
                        value={
                            soldCount
                        }
                        className="bg-gray-100 text-gray-700"
                    />

                    <SummaryCard
                        label="Fine Dine"
                        value={
                            fineDineCount
                        }
                        className="bg-purple-50 text-purple-700"
                    />

                </div>

            </div>

            {/* Inventory */}

            <div
                ref={
                    inventoryRef
                }
                className="scroll-mt-6 space-y-5"
            >

                <div className="rounded-2xl bg-white p-5 shadow">

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="relative">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search code, unit, tower..."
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                    pr-3
                                    outline-none
                                    focus:border-green-500
                                "
                            />

                        </div>

                        <select
                            value={
                                typeFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setTypeFilter(
                                    event.target.value as
                                        "ALL" |
                                        PropertyType
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >

                            <option value="ALL">
                                All Types
                            </option>

                            <option value="RESIDENTIAL">
                                Residential
                            </option>

                            <option value="COMMERCIAL">
                                Commercial
                            </option>

                        </select>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event.target.value as
                                        "ALL" |
                                        PropertyStatus |
                                        "FINEDINE"
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >

                            <option value="ALL">
                                All Statuses
                            </option>

                            <option value="AVAILABLE">
                                Available
                            </option>

                            <option value="HOLD">
                                Hold
                            </option>

                            <option value="BOOKED">
                                Booked
                            </option>

                            <option value="SOLD">
                                Sold
                            </option>

                            <option value="FINEDINE">
                                Fine Dine
                            </option>

                        </select>

                    </div>

                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow">

                    <div className="border-b px-6 py-4">

                        <h2 className="text-xl font-bold text-gray-800">
                            Property Inventory
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {filteredProperties.length} properties shown
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1000px]">

                            <thead className="bg-gray-50">

                                <tr className="border-b text-left text-sm text-gray-600">

                                    <th className="px-5 py-3">
                                        Code
                                    </th>

                                    <th className="px-5 py-3">
                                        Property
                                    </th>

                                    <th className="px-5 py-3">
                                        Type
                                    </th>

                                    <th className="px-5 py-3">
                                        Block / Tower
                                    </th>

                                    <th className="px-5 py-3">
                                        Floor
                                    </th>

                                    <th className="px-5 py-3">
                                        Unit
                                    </th>

                                    <th className="px-5 py-3">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredProperties.map(
                                    (property) => (

                                    <tr
                                        key={
                                            property.id
                                        }
                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                    >

                                        <td className="px-5 py-4 font-medium text-gray-800">
                                            {property.propertyCode}
                                        </td>

                                        <td className="px-5 py-4">

                                            <p className="font-medium text-gray-800">
                                                {property.name}
                                            </p>

                                            {property.phase && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {property.phase}
                                                </p>
                                            )}

                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {property.type ===
                                            "RESIDENTIAL"
                                                ? "Residential"
                                                : "Commercial"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {[
                                                property.block,
                                                property.tower,
                                            ]
                                                .filter(Boolean)
                                                .join(" / ") ||
                                                "-"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {property.floor ||
                                                "-"}
                                        </td>

                                        <td className="px-5 py-4 font-medium text-gray-800">
                                            {property.unitNumber ||
                                                "-"}
                                        </td>

                                        <td className="px-5 py-4">

                                            <span
                                                className={`
                                                    inline-flex
                                                    rounded-full
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-semibold

                                                    ${getStatusStyle(
                                                        property
                                                    )}
                                                `}
                                            >
                                                {getStatusText(
                                                    property
                                                )}
                                            </span>

                                        </td>

                                        <td className="px-5 py-4">

                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            property
                                                        )
                                                    }
                                                    className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                                                >
                                                    <Pencil
                                                        size={17}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            property
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        property.id
                                                    }
                                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <Trash2
                                                        size={17}
                                                    />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                                {filteredProperties.length ===
                                    0 && (

                                    <tr>

                                        <td
                                            colSpan={8}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No properties found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            {/* Add/Edit Modal */}

            {isModalOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                    "
                    onClick={
                        closeModal
                    }
                >

                    <div
                        className="
                            max-h-[90vh]
                            w-full
                            max-w-3xl
                            overflow-y-auto
                            rounded-2xl
                            bg-white
                            shadow-2xl
                        "
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingProperty
                                        ? "Edit Property"
                                        : "Add Property"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage property inventory details
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSave
                            }
                            className="space-y-6 p-6"
                        >

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <FormInput
                                    label="Property Code *"
                                    value={
                                        form.propertyCode
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "propertyCode",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Property Name *"
                                    value={
                                        form.name
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "name",
                                            value
                                        )
                                    }
                                />

                                <FormSelect
                                    label="Property Type"
                                    value={
                                        form.type
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "type",
                                            value as PropertyType
                                        )
                                    }
                                    options={[
                                        {
                                            value:
                                                "RESIDENTIAL",
                                            label:
                                                "Residential",
                                        },
                                        {
                                            value:
                                                "COMMERCIAL",
                                            label:
                                                "Commercial",
                                        },
                                    ]}
                                />

                                <FormSelect
                                    label="Status"
                                    value={
                                        form.status
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "status",
                                            value as PropertyStatus
                                        )
                                    }
                                    options={[
                                        {
                                            value:
                                                "AVAILABLE",
                                            label:
                                                "Available",
                                        },
                                        {
                                            value:
                                                "HOLD",
                                            label:
                                                "Hold",
                                        },
                                        {
                                            value:
                                                "BOOKED",
                                            label:
                                                "Booked",
                                        },
                                        {
                                            value:
                                                "SOLD",
                                            label:
                                                "Sold",
                                        },
                                    ]}
                                />

                                <FormInput
                                    label="Phase"
                                    value={
                                        form.phase
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "phase",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Block"
                                    value={
                                        form.block
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "block",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Tower"
                                    value={
                                        form.tower
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "tower",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Floor"
                                    value={
                                        form.floor
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "floor",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Series"
                                    value={
                                        form.series
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "series",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Unit Number"
                                    value={
                                        form.unitNumber
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "unitNumber",
                                            value
                                        )
                                    }
                                />

                                <FormInput
                                    label="Area"
                                    value={
                                        form.area
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "area",
                                            value
                                        )
                                    }
                                    type="number"
                                />

                                <FormInput
                                    label="Price"
                                    value={
                                        form.price
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        updateForm(
                                            "price",
                                            value
                                        )
                                    }
                                    type="number"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>

                                <textarea
                                    value={
                                        form.description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateForm(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
                                />

                            </div>

                            {form.type ===
                                "COMMERCIAL" && (

                                <label className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4">

                                    <input
                                        type="checkbox"
                                        checked={
                                            form.isFineDine
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "isFineDine",
                                                event.target.checked
                                            )
                                        }
                                    />

                                    <div>

                                        <p className="font-medium text-gray-800">
                                            Fine Dine Reservation
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Reserve this commercial unit for Fine Dine.
                                        </p>

                                    </div>

                                </label>

                            )}

                            <div className="flex justify-end gap-3 border-t pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProperty
                                            ? "Save Changes"
                                            : "Add Property"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

// ======================================================
// Small Components
// ======================================================

function SummaryCard({
    label,
    value,
    className,
}: {
    label: string;
    value: number;
    className: string;
}) {

    return (
        <div
            className={`
                rounded-xl
                p-4
                ${className}
            `}
        >

            <p className="text-xs font-medium opacity-80">
                {label}
            </p>

            <p className="mt-1 text-2xl font-bold">
                {value}
            </p>

        </div>
    );
}

function FormInput({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    type?: string;
}) {

    return (
        <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
            />

        </div>
    );
}

function FormSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    options: Array<{
        value: string;
        label: string;
    }>;
}) {

    return (
        <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-500"
            >

                {options.map(
                    (option) => (

                    <option
                        key={
                            option.value
                        }
                        value={
                            option.value
                        }
                    >
                        {option.label}
                    </option>

                ))}

            </select>

        </div>
    );
}

export default Properties;