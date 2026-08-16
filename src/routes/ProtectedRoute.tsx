import {
    Navigate,
    Outlet,
} from "react-router-dom";

import {
    useAuth,
} from "../context/AuthContext";

type ProtectedRouteProps = {
    adminOnly?: boolean;
};

function ProtectedRoute({
    adminOnly = false,
}: ProtectedRouteProps) {

    const {
        loading,
        isAuthenticated,
        isAdmin,
    } = useAuth();

    // ==================================================
    // Session Loading
    // ==================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">

                <div className="text-center">

                    <div
                        className="
                            mx-auto
                            h-10
                            w-10
                            animate-spin
                            rounded-full
                            border-4
                            border-green-200
                            border-t-green-700
                        "
                    />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading Emerald Heights...
                    </p>

                </div>

            </div>
        );
    }

    // ==================================================
    // Not Logged In
    // ==================================================

    if (
        !isAuthenticated
    ) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // ==================================================
    // Admin Only
    // ==================================================

    if (
        adminOnly &&
        !isAdmin
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;