import {
    apiRequest,
    clearAuthToken,
    getAuthToken,
    setAuthToken,
} from "./api";

// ======================================================
// Types
// ======================================================

export type AuthUser = {
    id: string;
    name: string;
    email: string;

    role: string;

    userType:
        | "ADMIN"
        | "EMPLOYEE";
};

type LoginResponse = {
    success: true;
    message: string;
    token: string;
    user: AuthUser;
};

type MeResponse = {
    success: true;
    user: AuthUser;
};

// ======================================================
// Login
// ======================================================

export async function loginUser(
    email: string,
    password: string
) {
    const response =
        await apiRequest<LoginResponse>(
            "/auth/login",
            {
                method:
                    "POST",

                body:
                    JSON.stringify({
                        email,
                        password,
                    }),
            }
        );

    setAuthToken(
        response.token
    );

    return response;
}

// ======================================================
// Current User
// ======================================================

export async function getCurrentUser() {
    return apiRequest<MeResponse>(
        "/auth/me"
    );
}

// ======================================================
// Logout
// ======================================================

export function logoutUser() {
    clearAuthToken();
}

// ======================================================
// Token
// ======================================================

export function hasAuthToken() {
    return Boolean(
        getAuthToken()
    );
}