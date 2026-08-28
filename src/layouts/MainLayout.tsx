import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "../components/dashboard/Navbar";

function MainLayout() {
    const [
        sidebarOpen,
        setSidebarOpen,
    ] = useState(false);

    return (
        <div
            className="
                flex
                min-h-dvh
                w-full
                overflow-x-hidden
                bg-gray-50
                transition-colors
                dark:bg-gray-950
            "
        >
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
            />

            <div
                className="
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    overflow-x-hidden
                "
            >
                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main
                    className="
                        min-w-0
                        flex-1
                        overflow-x-hidden
                        p-3
                        sm:p-4
                        md:p-5
                        lg:p-6
                    "
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;