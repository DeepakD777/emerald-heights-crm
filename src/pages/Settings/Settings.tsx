import { useState } from "react";
import type { FormEvent } from "react";

import {
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Moon,
  Sun,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../services/authService";

type ThemeMode =
  | "light"
  | "dark";

const THEME_STORAGE_KEY =
  "emerald-heights-theme";

function Settings() {
  const { user, isAdmin } = useAuth();

  const [theme, setTheme] =
    useState<ThemeMode>(() => {
      return localStorage.getItem(
        THEME_STORAGE_KEY
      ) === "dark"
        ? "dark"
        : "light";
    });

  const handleThemeChange = (
    nextTheme: ThemeMode
  ) => {
    setTheme(nextTheme);

    localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme
    );

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  };

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const userInitial =
    user?.name?.trim().charAt(0).toUpperCase() || "U";

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );

      return;
    }

    try {
      setPasswordSaving(true);

      const response = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      setPasswordSuccess(
        response.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
      {/* ==================================================
          Header
      ================================================== */}

      <div className="rounded-2xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-900 sm:p-5 lg:p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Manage your account and CRM information.
        </p>
      </div>

      {/* ==================================================
          Account Information
      ================================================== */}

      <div className="rounded-2xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700 dark:bg-green-950/60 dark:text-green-300">
              {userInitial}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
                {user?.name || "User"}
              </h2>

              <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                {user?.email || "-"}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isAdmin
                ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            }`}
          >
            <BadgeCheck size={16} />

            {isAdmin ? "Administrator" : "Employee"}
          </div>
        </div>

        <div className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/70">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm dark:bg-gray-900 dark:text-green-300">
              <UserRound size={20} />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Name
            </p>

            <p className="mt-1 break-words font-semibold text-gray-900 dark:text-gray-100">
              {user?.name || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/70">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300">
              <Mail size={20} />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Email
            </p>

            <p className="mt-1 break-all font-semibold text-gray-900 dark:text-gray-100">
              {user?.email || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/70">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-purple-700 shadow-sm dark:bg-gray-900 dark:text-purple-300">
              <ShieldCheck size={20} />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Account Type
            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              {user?.userType || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/70">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm dark:bg-gray-900 dark:text-amber-300">
              <LockKeyhole size={20} />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Role
            </p>

            <p className="mt-1 break-words font-semibold text-gray-900 dark:text-gray-100">
              {user?.role || "-"}
            </p>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
      {/* ==================================================
          Security
      ================================================== */}

      <div className="rounded-2xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
            <KeyRound size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              Security
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Change the password for your current CRM account.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="mt-5 max-w-2xl space-y-4"
        >
          {/* Current Password */}

          <div>
            <label
              htmlFor="current-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="current-password"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter current password"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-950"
                disabled={passwordSaving}
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (value) => !value
                  )
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                disabled={passwordSaving}
              >
                {showCurrentPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}

          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-950"
                disabled={passwordSaving}
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (value) => !value
                  )
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                disabled={passwordSaving}
              >
                {showNewPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-950"
                disabled={passwordSaving}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                disabled={passwordSaving}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {passwordError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {passwordError}
            </div>
          ) : null}

          {passwordSuccess ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300">
              {passwordSuccess}
            </div>
          ) : null}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordSaving
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </div>

        </>
      ) : null}

      {/* ==================================================
          Appearance
      ================================================== */}

      <div className="rounded-2xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
            {theme === "dark" ? (
              <Moon size={22} />
            ) : (
              <Sun size={22} />
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              Appearance
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose the CRM theme for this browser.
            </p>
          </div>
        </div>

        <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              handleThemeChange("light")
            }
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              theme === "light"
                ? "border-green-600 bg-green-50 ring-2 ring-green-100 dark:border-green-500 dark:bg-green-950/50 dark:ring-green-900"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm dark:bg-gray-900 dark:text-amber-300">
              <Sun size={20} />
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Light
              </p>

              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Bright CRM interface
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleThemeChange("dark")
            }
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
              theme === "dark"
                ? "border-green-600 bg-green-50 ring-2 ring-green-100 dark:border-green-500 dark:bg-green-950/50 dark:ring-green-900"
                : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm dark:bg-gray-950">
              <Moon size={20} />
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Dark
              </p>

              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Dark CRM interface
              </p>
            </div>
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Theme preference is saved automatically on this device.
        </p>
      </div>

      {/* ==================================================
          CRM Information
      ================================================== */}

      <div className="rounded-2xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
            <Building2 size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              CRM Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current project and application details.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Project
            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              Emerald Heights &amp; Residences
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application
            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              Inventory Management System
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 transition-colors dark:border-gray-700 dark:bg-gray-800/50 sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Access
            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
              {isAdmin
                ? "Full administrative access"
                : "View-only access"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
