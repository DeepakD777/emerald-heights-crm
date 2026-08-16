const API_BASE_URL = "http://localhost:5000/api";

type ApiOptions = RequestInit & {
    token?: string;
};

function getStoredToken() {
    return localStorage.getItem("authToken");
}

export async function apiRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const {
        token,
        headers,
        ...restOptions
    } = options;

    const authToken =
        token ?? getStoredToken();

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...restOptions,

            headers: {
                "Content-Type":
                    "application/json",

                ...(authToken
                    ? {
                          Authorization:
                              `Bearer ${authToken}`,
                      }
                    : {}),

                ...headers,
            },
        }
    );

    const data =
        await response
            .json()
            .catch(() => null);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(
                data?.message ||
                    "Unauthorized. Please login again."
            );
        }

        if (response.status === 403) {
            throw new Error(
                data?.message ||
                    "You do not have permission to perform this action."
            );
        }

        throw new Error(
            data?.message ||
                `Request failed with status ${response.status}`
        );
    }

    return data as T;
}

export function setAuthToken(
    token: string
) {
    localStorage.setItem(
        "authToken",
        token
    );
}

export function clearAuthToken() {
    localStorage.removeItem(
        "authToken"
    );
}

export function getAuthToken() {
    return getStoredToken();
}

export { API_BASE_URL };