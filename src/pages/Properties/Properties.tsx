import { Building2, Home, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Properties() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Properties
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Manage residential and commercial properties
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/residential")}
                        className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        View Inventory
                    </button>

                </div>

            </div>

            {/* Property Types */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Residential */}
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
                            300
                        </p>

                    </div>

                    <button
                        onClick={() => navigate("/residential")}
                        className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                    >
                        Manage Residential
                    </button>

                </div>

                {/* Commercial */}
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
                            560
                        </p>

                    </div>

                    <button
                        onClick={() => navigate("/commercial")}
                        className="w-full rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
                    >
                        Manage Commercial
                    </button>

                </div>

            </div>

            {/* Project Summary */}
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
                            Emerald Heights inventory overview
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="rounded-xl bg-blue-50 p-5">
                        <p className="text-sm text-blue-600">
                            Total Properties
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-700">
                            860
                        </p>
                    </div>

                    <div className="rounded-xl bg-green-50 p-5">
                        <p className="text-sm text-green-600">
                            Residential
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-700">
                            300
                        </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-5">
                        <p className="text-sm text-orange-600">
                            Commercial
                        </p>

                        <p className="mt-1 text-2xl font-bold text-orange-700">
                            560
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Properties;