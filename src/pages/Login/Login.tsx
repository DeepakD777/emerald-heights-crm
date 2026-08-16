import {
    useState,
} from "react";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

function Login() {

    const navigate =
        useNavigate();

    const {
        login,
        loading,
        isAuthenticated,
    } = useAuth();

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    // ==================================================
    // Already Logged In
    // ==================================================

    if (
        !loading &&
        isAuthenticated
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // ==================================================
    // Submit
    // ==================================================

    const handleSubmit =
        async (
            event:
                React.FormEvent
        ) => {

        event.preventDefault();

        if (
            !email.trim() ||
            !password
        ) {
            setError(
                "Please enter email and password."
            );

            return;
        }

        try {
            setSubmitting(
                true
            );

            setError("");

            await login(
                email.trim(),
                password
            );

            navigate(
                "/",
                {
                    replace:
                        true,
                }
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed"
            );

        } finally {
            setSubmitting(
                false
            );
        }
    };

    return (
        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-gray-100
                px-4
                py-10
            "
        >

            <div
                className="
                    grid
                    w-full
                    max-w-5xl
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    shadow-xl
                    lg:grid-cols-2
                "
            >

                {/* ======================================
                    Brand Panel
                ====================================== */}

                <div
                    className="
                        hidden
                        min-h-[640px]
                        flex-col
                        justify-between
                        bg-green-900
                        p-12
                        text-white
                        lg:flex
                    "
                >

                    <div>

                        <p
                            className="
                                text-sm
                                font-semibold
                                uppercase
                                tracking-[0.25em]
                                text-green-300
                            "
                        >
                            Emerald Heights
                        </p>

                        <h1
                            className="
                                mt-5
                                text-4xl
                                font-bold
                                leading-tight
                            "
                        >
                            Property Management
                            <br />
                            CRM
                        </h1>

                        <p
                            className="
                                mt-5
                                max-w-md
                                text-base
                                leading-7
                                text-green-100
                            "
                        >
                            Secure access for administrators
                            and employees to manage and view
                            Emerald Heights inventory.
                        </p>

                    </div>

                    <div
                        className="
                            rounded-2xl
                            border
                            border-green-700
                            bg-green-800/50
                            p-5
                            text-sm
                            text-green-100
                        "
                    >
                        Residential • Commercial •
                        Bookings • Customers
                    </div>

                </div>

                {/* ======================================
                    Login Form
                ====================================== */}

                <div
                    className="
                        flex
                        min-h-[640px]
                        items-center
                        p-7
                        sm:p-12
                    "
                >

                    <div className="mx-auto w-full max-w-md">

                        <div className="mb-8">

                            <div
                                className="
                                    mb-6
                                    inline-flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-green-100
                                    text-green-700
                                "
                            >
                                <LockKeyhole
                                    size={28}
                                />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900">
                                Welcome Back
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Sign in to Emerald Heights CRM
                            </p>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5"
                        >

                            {/* Email */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    Email Address
                                </label>

                                <div
                                    className="
                                        flex
                                        items-center
                                        rounded-xl
                                        border
                                        border-gray-300
                                        px-4
                                        focus-within:border-green-600
                                        focus-within:ring-2
                                        focus-within:ring-green-100
                                    "
                                >

                                    <Mail
                                        size={19}
                                        className="text-gray-400"
                                    />

                                    <input
                                        type="email"
                                        value={
                                            email
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        className="
                                            w-full
                                            bg-transparent
                                            px-3
                                            py-3.5
                                            outline-none
                                        "
                                    />

                                </div>

                            </div>

                            {/* Password */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label className="text-sm font-semibold text-gray-700">
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-sm font-medium text-green-700 hover:text-green-800"
                                    >
                                        Forgot Password?
                                    </button>

                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        rounded-xl
                                        border
                                        border-gray-300
                                        px-4
                                        focus-within:border-green-600
                                        focus-within:ring-2
                                        focus-within:ring-green-100
                                    "
                                >

                                    <LockKeyhole
                                        size={19}
                                        className="text-gray-400"
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            password
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="
                                            w-full
                                            bg-transparent
                                            px-3
                                            py-3.5
                                            outline-none
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (
                                                    value
                                                ) =>
                                                    !value
                                            )
                                        }
                                        className="text-gray-400 hover:text-gray-700"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword
                                            ? (
                                                <EyeOff
                                                    size={19}
                                                />
                                            )
                                            : (
                                                <Eye
                                                    size={19}
                                                />
                                            )}
                                    </button>

                                </div>

                            </div>

                            {/* Error */}

                            {error && (
                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        text-red-700
                                    "
                                >
                                    {error}
                                </div>
                            )}

                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    bg-green-700
                                    px-5
                                    py-3.5
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-800
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {submitting
                                    ? "Signing In..."
                                    : "Sign In"}
                            </button>

                        </form>

                        <p className="mt-8 text-center text-xs text-gray-400">
                            Authorized Emerald Heights users only.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;