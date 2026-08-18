import {
    useState,
    type FormEvent,
} from "react";

import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    requestAdminPasswordOtp,
    resetAdminPassword,
    verifyAdminPasswordOtp,
} from "../../services/authService";

import type {
    LoginType,
} from "../../services/authService";

// ======================================================
// Recovery Step
// ======================================================

type RecoveryStep =
    | "LOGIN"
    | "EMAIL"
    | "OTP"
    | "RESET"
    | "SUCCESS";

// ======================================================
// Login
// ======================================================

function Login() {

    const navigate =
        useNavigate();

    const {
        login,
        loading,
        isAuthenticated,
    } = useAuth();

    // ==================================================
    // Login Type
    // ==================================================

    const [
        loginType,
        setLoginType,
    ] = useState<LoginType>(
        "ADMIN"
    );

    // ==================================================
    // Recovery
    // ==================================================

    const [
        recoveryStep,
        setRecoveryStep,
    ] = useState<RecoveryStep>(
        "LOGIN"
    );

    const [
        otp,
        setOtp,
    ] = useState("");

    const [
        resetToken,
        setResetToken,
    ] = useState("");

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [
        showNewPassword,
        setShowNewPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    // ==================================================
    // Form
    // ==================================================

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

    const [
        message,
        setMessage,
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
    // Clear Status
    // ==================================================

    const clearStatus =
        () => {

            setError(
                ""
            );

            setMessage(
                ""
            );
        };

    // ==================================================
    // Change Login Type
    // ==================================================

    const handleLoginTypeChange = (
        type: LoginType
    ) => {

        if (
            submitting
        ) {
            return;
        }

        setLoginType(
            type
        );

        setRecoveryStep(
            "LOGIN"
        );

        setPassword(
            ""
        );

        setOtp(
            ""
        );

        setResetToken(
            ""
        );

        setNewPassword(
            ""
        );

        setConfirmPassword(
            ""
        );

        setShowPassword(
            false
        );

        setShowNewPassword(
            false
        );

        setShowConfirmPassword(
            false
        );

        clearStatus();
    };

    // ==================================================
    // Login Submit
    // ==================================================

    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            if (
                !email.trim() ||
                !password
            ) {

                setError(
                    "Please enter email and password."
                );

                setMessage(
                    ""
                );

                return;
            }

            try {

                setSubmitting(
                    true
                );

                clearStatus();

                await login(
                    email.trim(),
                    password,
                    loginType
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

    // ==================================================
    // Forgot Password
    // ==================================================

    const handleForgotPassword =
        () => {

            clearStatus();

            if (
                loginType ===
                "EMPLOYEE"
            ) {

                setError(
                    "Please contact your administrator to reset your password."
                );

                return;
            }

            setPassword(
                ""
            );

            setRecoveryStep(
                "EMAIL"
            );
        };

    // ==================================================
    // Request OTP
    // ==================================================

    const handleRequestOtp =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            if (
                !email.trim()
            ) {

                setError(
                    "Please enter your Admin email address."
                );

                setMessage(
                    ""
                );

                return;
            }

            try {

                setSubmitting(
                    true
                );

                clearStatus();

                const response =
                    await requestAdminPasswordOtp(
                        email.trim()
                    );

                setMessage(
                    response.message
                );

                setOtp(
                    ""
                );

                setRecoveryStep(
                    "OTP"
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to send OTP"
                );

            } finally {

                setSubmitting(
                    false
                );
            }
        };

    // ==================================================
    // Verify OTP
    // ==================================================

    const handleVerifyOtp =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            const normalizedOtp =
                otp
                    .trim()
                    .replace(
                        /\s/g,
                        ""
                    );

            if (
                !/^\d{6}$/.test(
                    normalizedOtp
                )
            ) {

                setError(
                    "Please enter the 6-digit OTP."
                );

                setMessage(
                    ""
                );

                return;
            }

            try {

                setSubmitting(
                    true
                );

                clearStatus();

                const response =
                    await verifyAdminPasswordOtp(
                        email.trim(),
                        normalizedOtp
                    );

                setResetToken(
                    response.resetToken
                );

                setMessage(
                    response.message
                );

                setNewPassword(
                    ""
                );

                setConfirmPassword(
                    ""
                );

                setRecoveryStep(
                    "RESET"
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "OTP verification failed"
                );

            } finally {

                setSubmitting(
                    false
                );
            }
        };

    // ==================================================
    // Reset Password
    // ==================================================

    const handleResetPassword =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            if (
                !newPassword ||
                !confirmPassword
            ) {

                setError(
                    "Please enter and confirm your new password."
                );

                setMessage(
                    ""
                );

                return;
            }

            if (
                newPassword.length <
                8
            ) {

                setError(
                    "Password must be at least 8 characters long."
                );

                setMessage(
                    ""
                );

                return;
            }

            if (
                newPassword !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                setMessage(
                    ""
                );

                return;
            }

            if (
                !resetToken
            ) {

                setError(
                    "Password reset session has expired. Please request a new OTP."
                );

                setMessage(
                    ""
                );

                return;
            }

            try {

                setSubmitting(
                    true
                );

                clearStatus();

                const response =
                    await resetAdminPassword(
                        resetToken,
                        newPassword,
                        confirmPassword
                    );

                setMessage(
                    response.message
                );

                setPassword(
                    ""
                );

                setOtp(
                    ""
                );

                setResetToken(
                    ""
                );

                setNewPassword(
                    ""
                );

                setConfirmPassword(
                    ""
                );

                setShowNewPassword(
                    false
                );

                setShowConfirmPassword(
                    false
                );

                setRecoveryStep(
                    "SUCCESS"
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Password reset failed"
                );

            } finally {

                setSubmitting(
                    false
                );
            }
        };

    // ==================================================
    // Back To Login
    // ==================================================

    const handleBackToLogin =
        () => {

            if (
                submitting
            ) {
                return;
            }

            setRecoveryStep(
                "LOGIN"
            );

            setOtp(
                ""
            );

            setResetToken(
                ""
            );

            setNewPassword(
                ""
            );

            setConfirmPassword(
                ""
            );

            setPassword(
                ""
            );

            setShowPassword(
                false
            );

            setShowNewPassword(
                false
            );

            setShowConfirmPassword(
                false
            );

            clearStatus();
        };

    // ==================================================
    // Heading
    // ==================================================

    const getHeading =
        () => {

            switch (
                recoveryStep
            ) {

                case "EMAIL":

                    return {
                        title:
                            "Forgot Password",
                        subtitle:
                            "Enter your registered Admin email",
                    };

                case "OTP":

                    return {
                        title:
                            "Verify OTP",
                        subtitle:
                            "Enter the 6-digit code sent to your email",
                    };

                case "RESET":

                    return {
                        title:
                            "Set New Password",
                        subtitle:
                            "Create a new password for your Admin account",
                    };

                case "SUCCESS":

                    return {
                        title:
                            "Password Updated",
                        subtitle:
                            "Your Admin password has been reset successfully",
                    };

                default:

                    return {
                        title:
                            "Welcome Back",
                        subtitle:
                            loginType ===
                                "ADMIN"
                                ? "Sign in to the Admin portal"
                                : "Sign in to the Employee portal",
                    };
            }
        };

    const heading =
        getHeading();

    // ==================================================
    // Status Message
    // ==================================================

    const statusSection =
        (
            <>
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
                            leading-6
                            text-red-700
                        "
                    >
                        {error}
                    </div>

                )}

                {message && (

                    <div
                        className="
                            rounded-xl
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-3
                            text-sm
                            font-medium
                            leading-6
                            text-green-800
                        "
                    >
                        {message}
                    </div>

                )}
            </>
        );

    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-gray-100
                px-4
                py-6
                sm:py-10
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
                        min-h-[680px]
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
                            Secure access for authorized
                            administrators and employees to
                            manage and view Emerald Heights
                            inventory.
                        </p>

                    </div>

                    <div className="space-y-4">

                        <div
                            className="
                                rounded-2xl
                                border
                                border-green-700
                                bg-green-800/50
                                p-5
                            "
                        >

                            <div className="flex items-start gap-3">

                                <ShieldCheck
                                    size={22}
                                    className="mt-0.5 shrink-0 text-green-300"
                                />

                                <div>

                                    <p className="font-semibold text-white">
                                        Authorized Access Only
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-green-100">
                                        Employee login credentials are
                                        created and managed by the
                                        Emerald Heights administrator.
                                    </p>

                                </div>

                            </div>

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
                            Bookings • Customers • Reports
                        </div>

                    </div>

                </div>

                {/* ======================================
                    Right Panel
                ====================================== */}

                <div
                    className="
                        flex
                        min-h-[620px]
                        items-center
                        p-6
                        sm:p-10
                        lg:min-h-[680px]
                        lg:p-12
                    "
                >

                    <div className="mx-auto w-full max-w-md">

                        {/* ==================================
                            Mobile Brand
                        ================================== */}

                        <div className="mb-7 lg:hidden">

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                                Emerald Heights
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Property Management CRM
                            </p>

                        </div>

                        {/* ==================================
                            Back Button
                        ================================== */}

                        {recoveryStep !==
                            "LOGIN" && (

                            <button
                                type="button"
                                onClick={
                                    handleBackToLogin
                                }
                                disabled={
                                    submitting
                                }
                                className="
                                    mb-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-gray-500
                                    transition
                                    hover:text-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <ArrowLeft
                                    size={17}
                                />

                                Back to Admin Login
                            </button>

                        )}

                        {/* ==================================
                            Heading
                        ================================== */}

                        <div className="mb-7">

                            <div
                                className="
                                    mb-5
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

                                {recoveryStep ===
                                "SUCCESS" ? (

                                    <CheckCircle2
                                        size={28}
                                    />

                                ) : recoveryStep ===
                                  "OTP" ? (

                                    <KeyRound
                                        size={28}
                                    />

                                ) : recoveryStep ===
                                  "RESET" ? (

                                    <LockKeyhole
                                        size={28}
                                    />

                                ) : loginType ===
                                  "ADMIN" ? (

                                    <ShieldCheck
                                        size={28}
                                    />

                                ) : (

                                    <UserRound
                                        size={28}
                                    />

                                )}

                            </div>

                            <h2 className="text-3xl font-bold text-gray-900">
                                {heading.title}
                            </h2>

                            <p className="mt-2 text-gray-500">
                                {heading.subtitle}
                            </p>

                        </div>

                        {/* ==================================
                            LOGIN
                        ================================== */}

                        {recoveryStep ===
                            "LOGIN" && (

                            <>
                                {/* Admin / Employee Tabs */}

                                <div
                                    className="
                                        mb-7
                                        grid
                                        grid-cols-2
                                        gap-2
                                        rounded-2xl
                                        bg-gray-100
                                        p-1.5
                                    "
                                >

                                    <button
                                        type="button"
                                        disabled={
                                            submitting
                                        }
                                        onClick={() =>
                                            handleLoginTypeChange(
                                                "ADMIN"
                                            )
                                        }
                                        className={`
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-sm
                                            font-semibold
                                            transition
                                            ${
                                                loginType ===
                                                "ADMIN"
                                                    ? "bg-white text-green-700 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-800"
                                            }
                                            disabled:cursor-not-allowed
                                        `}
                                    >

                                        <ShieldCheck
                                            size={18}
                                        />

                                        Admin Login

                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            submitting
                                        }
                                        onClick={() =>
                                            handleLoginTypeChange(
                                                "EMPLOYEE"
                                            )
                                        }
                                        className={`
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-sm
                                            font-semibold
                                            transition
                                            ${
                                                loginType ===
                                                "EMPLOYEE"
                                                    ? "bg-white text-green-700 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-800"
                                            }
                                            disabled:cursor-not-allowed
                                        `}
                                    >

                                        <UserRound
                                            size={18}
                                        />

                                        Employee Login

                                    </button>

                                </div>

                                {/* Role Notice */}

                                <div
                                    className="
                                        mb-6
                                        rounded-xl
                                        border
                                        border-green-100
                                        bg-green-50
                                        px-4
                                        py-3
                                    "
                                >

                                    <p className="text-sm leading-6 text-green-800">

                                        {loginType ===
                                        "ADMIN"
                                            ? "Use your authorized Emerald Heights administrator account."
                                            : "Use the email and password provided by your administrator."}

                                    </p>

                                </div>

                                {/* Login Form */}

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    className="space-y-5"
                                >

                                    {/* Email */}

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                                                transition
                                                focus-within:border-green-600
                                                focus-within:ring-2
                                                focus-within:ring-green-100
                                            "
                                        >

                                            <Mail
                                                size={19}
                                                className="shrink-0 text-gray-400"
                                            />

                                            <input
                                                type="email"
                                                value={
                                                    email
                                                }
                                                onChange={(
                                                    event
                                                ) => {

                                                    setEmail(
                                                        event.target.value
                                                    );

                                                    clearStatus();
                                                }}
                                                placeholder={
                                                    loginType ===
                                                    "ADMIN"
                                                        ? "Enter admin email"
                                                        : "Enter employee email"
                                                }
                                                autoComplete="email"
                                                disabled={
                                                    submitting
                                                }
                                                className="
                                                    w-full
                                                    min-w-0
                                                    bg-transparent
                                                    px-3
                                                    py-3.5
                                                    outline-none
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                "
                                            />

                                        </div>

                                    </div>

                                    {/* Password */}

                                    <div>

                                        <div className="mb-2 flex items-center justify-between gap-3">

                                            <label className="text-sm font-semibold text-gray-700">
                                                Password
                                            </label>

                                            <button
                                                type="button"
                                                onClick={
                                                    handleForgotPassword
                                                }
                                                disabled={
                                                    submitting
                                                }
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-green-700
                                                    transition
                                                    hover:text-green-800
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                "
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
                                                transition
                                                focus-within:border-green-600
                                                focus-within:ring-2
                                                focus-within:ring-green-100
                                            "
                                        >

                                            <LockKeyhole
                                                size={19}
                                                className="shrink-0 text-gray-400"
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
                                                ) => {

                                                    setPassword(
                                                        event.target.value
                                                    );

                                                    clearStatus();
                                                }}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                disabled={
                                                    submitting
                                                }
                                                className="
                                                    w-full
                                                    min-w-0
                                                    bg-transparent
                                                    px-3
                                                    py-3.5
                                                    outline-none
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
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
                                                disabled={
                                                    submitting
                                                }
                                                className="
                                                    shrink-0
                                                    text-gray-400
                                                    transition
                                                    hover:text-gray-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                "
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
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

                                    {statusSection}

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
                                            : loginType ===
                                              "ADMIN"
                                                ? "Sign In as Admin"
                                                : "Sign In as Employee"}

                                    </button>

                                </form>
                            </>

                        )}

                        {/* ==================================
                            EMAIL STEP
                        ================================== */}

                        {recoveryStep ===
                            "EMAIL" && (

                            <form
                                onSubmit={
                                    handleRequestOtp
                                }
                                className="space-y-5"
                            >

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-green-100
                                        bg-green-50
                                        px-4
                                        py-3
                                        text-sm
                                        leading-6
                                        text-green-800
                                    "
                                >
                                    We will send a 6-digit OTP to your
                                    registered Admin email. The OTP will
                                    expire in 10 minutes.
                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Admin Email Address
                                    </label>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            rounded-xl
                                            border
                                            border-gray-300
                                            px-4
                                            transition
                                            focus-within:border-green-600
                                            focus-within:ring-2
                                            focus-within:ring-green-100
                                        "
                                    >

                                        <Mail
                                            size={19}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <input
                                            type="email"
                                            value={
                                                email
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                setEmail(
                                                    event.target.value
                                                );

                                                clearStatus();
                                            }}
                                            placeholder="Enter registered Admin email"
                                            autoComplete="email"
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                w-full
                                                min-w-0
                                                bg-transparent
                                                px-3
                                                py-3.5
                                                outline-none
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        />

                                    </div>

                                </div>

                                {statusSection}

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
                                        ? "Sending OTP..."
                                        : "Send OTP"}
                                </button>

                            </form>

                        )}

                        {/* ==================================
                            OTP STEP
                        ================================== */}

                        {recoveryStep ===
                            "OTP" && (

                            <form
                                onSubmit={
                                    handleVerifyOtp
                                }
                                className="space-y-5"
                            >

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-gray-50
                                        px-4
                                        py-3
                                    "
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        OTP sent for
                                    </p>

                                    <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                                        {email}
                                    </p>
                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        6-Digit OTP
                                    </label>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            rounded-xl
                                            border
                                            border-gray-300
                                            px-4
                                            transition
                                            focus-within:border-green-600
                                            focus-within:ring-2
                                            focus-within:ring-green-100
                                        "
                                    >

                                        <KeyRound
                                            size={19}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                otp
                                            }
                                            maxLength={6}
                                            onChange={(
                                                event
                                            ) => {

                                                const value =
                                                    event.target.value
                                                        .replace(
                                                            /\D/g,
                                                            ""
                                                        )
                                                        .slice(
                                                            0,
                                                            6
                                                        );

                                                setOtp(
                                                    value
                                                );

                                                clearStatus();
                                            }}
                                            placeholder="Enter OTP"
                                            autoComplete="one-time-code"
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                w-full
                                                min-w-0
                                                bg-transparent
                                                px-3
                                                py-3.5
                                                text-lg
                                                font-semibold
                                                tracking-[0.25em]
                                                outline-none
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        />

                                    </div>

                                </div>

                                {statusSection}

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
                                        ? "Verifying..."
                                        : "Verify OTP"}
                                </button>

                            </form>

                        )}

                        {/* ==================================
                            RESET STEP
                        ================================== */}

                        {recoveryStep ===
                            "RESET" && (

                            <form
                                onSubmit={
                                    handleResetPassword
                                }
                                className="space-y-5"
                            >

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-green-100
                                        bg-green-50
                                        px-4
                                        py-3
                                        text-sm
                                        leading-6
                                        text-green-800
                                    "
                                >
                                    OTP verified. Your new password must
                                    contain at least 8 characters.
                                </div>

                                {/* New Password */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        New Password
                                    </label>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            rounded-xl
                                            border
                                            border-gray-300
                                            px-4
                                            transition
                                            focus-within:border-green-600
                                            focus-within:ring-2
                                            focus-within:ring-green-100
                                        "
                                    >

                                        <LockKeyhole
                                            size={19}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                newPassword
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                setNewPassword(
                                                    event.target.value
                                                );

                                                clearStatus();
                                            }}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                w-full
                                                min-w-0
                                                bg-transparent
                                                px-3
                                                py-3.5
                                                outline-none
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    (
                                                        value
                                                    ) =>
                                                        !value
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                shrink-0
                                                text-gray-400
                                                transition
                                                hover:text-gray-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                            aria-label={
                                                showNewPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >

                                            {showNewPassword
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

                                {/* Confirm Password */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Confirm New Password
                                    </label>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            rounded-xl
                                            border
                                            border-gray-300
                                            px-4
                                            transition
                                            focus-within:border-green-600
                                            focus-within:ring-2
                                            focus-within:ring-green-100
                                        "
                                    >

                                        <LockKeyhole
                                            size={19}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                confirmPassword
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                setConfirmPassword(
                                                    event.target.value
                                                );

                                                clearStatus();
                                            }}
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                w-full
                                                min-w-0
                                                bg-transparent
                                                px-3
                                                py-3.5
                                                outline-none
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (
                                                        value
                                                    ) =>
                                                        !value
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                            className="
                                                shrink-0
                                                text-gray-400
                                                transition
                                                hover:text-gray-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >

                                            {showConfirmPassword
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

                                {statusSection}

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
                                        ? "Resetting Password..."
                                        : "Reset Password"}
                                </button>

                            </form>

                        )}

                        {/* ==================================
                            SUCCESS STEP
                        ================================== */}

                        {recoveryStep ===
                            "SUCCESS" && (

                            <div className="space-y-5">

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-green-200
                                        bg-green-50
                                        p-5
                                        text-center
                                    "
                                >

                                    <CheckCircle2
                                        size={42}
                                        className="mx-auto text-green-700"
                                    />

                                    <p className="mt-3 font-semibold text-green-900">
                                        Password reset complete
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-green-700">
                                        You can now sign in using your
                                        new Admin password.
                                    </p>

                                </div>

                                {statusSection}

                                <button
                                    type="button"
                                    onClick={
                                        handleBackToLogin
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
                                    "
                                >
                                    Back to Admin Login
                                </button>

                            </div>

                        )}

                        {/* ==================================
                            Footer
                        ================================== */}

                        <div className="mt-8 border-t border-gray-100 pt-6">

                            <p className="text-center text-xs leading-5 text-gray-400">
                                Authorized Emerald Heights users only.
                                No public registration is available.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;