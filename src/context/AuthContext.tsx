import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
} from "../services/authService";

import type {
    AuthUser,
    LoginType,
} from "../services/authService";

// ======================================================
// Types
// ======================================================

type AuthContextType = {
    user:
    AuthUser | null;

    loading:
    boolean;

    isAuthenticated:
    boolean;

    isAdmin:
    boolean;

    isEmployee:
    boolean;

    login: (
        email: string,
        password: string,
        loginType: LoginType
    ) => Promise<AuthUser>;

    logout:
    () => void;

    refreshUser:
    () => Promise<void>;
};

// ======================================================
// Context
// ======================================================

const AuthContext =
    createContext<
        AuthContextType |
        undefined
    >(undefined);

// ======================================================
// Provider
// ======================================================

export function AuthProvider({
    children,
}: {
    children:
    ReactNode;
}) {

    const [
        user,
        setUser,
    ] = useState<
        AuthUser | null
    >(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    // ==================================================
    // Restore Session
    // ==================================================

    const refreshUser =
        async () => {

            try {
                const response =
                    await getCurrentUser();

                setUser(
                    response.user
                );

            } catch {
                logoutUser();

                setUser(
                    null
                );

            } finally {
                setLoading(
                    false
                );
            }
        };

    useEffect(() => {
        refreshUser();
    }, []);

    // ==================================================
    // Login
    // ==================================================

    const login =
        async (
            email: string,
            password: string,
            loginType: LoginType
        ) => {

            const response =
                await loginUser(
                    email,
                    password,
                    loginType
                );

            setUser(
                response.user
            );

            return response.user;
        };

    // ==================================================
    // Logout
    // ==================================================

    const logout = () => {
        logoutUser();

        setUser(
            null
        );
    };

    // ==================================================
    // Values
    // ==================================================

    const isAuthenticated =
        Boolean(user);

    const isAdmin =
        user?.userType ===
        "ADMIN";

    const isEmployee =
        user?.userType ===
        "EMPLOYEE";

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                isAdmin,
                isEmployee,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ======================================================
// Hook
// ======================================================

export function useAuth() {

    const context =
        useContext(
            AuthContext
        );

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}