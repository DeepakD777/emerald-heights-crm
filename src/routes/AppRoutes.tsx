import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import {
    AuthProvider,
} from "../context/AuthContext";

import ProtectedRoute from "./ProtectedRoute";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login/Login";

import Dashboard from "../pages/Dashboard/Dashboard";

import Bookings from "../components/dashboard/Bookings";

import Customers from "../pages/Customers/Customers";

import Commercial from "../pages/Commercial/Commercial";

import Residential from "../pages/Residential/Residential";

import Properties from "../pages/Properties/Properties";

import Reports from "../pages/Reports/Reports";

import Notifications from "../components/dashboard/Notifications";

import FloorMap from "../components/dashboard/Floormap";

import SalesTeam from "../pages/SalesTeam/SalesTeam";

import Settings from "../pages/Settings/Settings";

// ======================================================
// Routes
// ======================================================

function AppRoutes() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* Public */}

                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />

                    {/* Authenticated */}

                    <Route
                        element={
                            <ProtectedRoute />
                        }
                    >

                        <Route
                            path="/"
                            element={
                                <MainLayout />
                            }
                        >

                            <Route
                                index
                                element={
                                    <Dashboard />
                                }
                            />

                            <Route
                                path="residential"
                                element={
                                    <Residential />
                                }
                            />

                            <Route
                                path="commercial"
                                element={
                                    <Commercial />
                                }
                            />

                            <Route
                                path="floor-map"
                                element={
                                    <FloorMap />
                                }
                            />

                            <Route
                                path="bookings"
                                element={
                                    <Bookings />
                                }
                            />

                            <Route
                                path="customers"
                                element={
                                    <Customers />
                                }
                            />

                            <Route
                                path="sales-team"
                                element={
                                    <SalesTeam />
                                }
                            />

                            <Route
                                path="reports"
                                element={
                                    <Reports />
                                }
                            />

                            <Route
                                path="notifications"
                                element={
                                    <Notifications />
                                }
                            />

                            <Route
                                path="settings"
                                element={
                                    <Settings />
                                }
                            />

                            {/* Admin Only */}

                            <Route
                                element={
                                    <ProtectedRoute
                                        adminOnly
                                    />
                                }
                            >

                                <Route
                                    path="properties"
                                    element={
                                        <Properties />
                                    }
                                />

                            </Route>

                        </Route>

                    </Route>

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default AppRoutes;