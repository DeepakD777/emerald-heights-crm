import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { API_BASE_URL, getAuthToken } from "../../services/api";

// ======================================================
// Types
// ======================================================

interface SalesMember {
  id: string;

  name: string;

  role: string;

  phone: string;

  email: string;

  status: "active" | "inactive";

  bookings: number;
}

interface MemberForm {
  name: string;

  role: string;

  phone: string;

  email: string;

  status: "active" | "inactive";

  password: string;

  confirmPassword: string;
}

// ======================================================
// Empty Form
// ======================================================

const emptyForm: MemberForm = {
  name: "",

  role: "Sales Executive",

  phone: "",

  email: "",

  status: "active",

  password: "",

  confirmPassword: "",
};

// ======================================================
// API
// ======================================================

const EMPLOYEES_API = `${API_BASE_URL}/employees`;

// ======================================================
// Auth Headers
// ======================================================

const getRequestHeaders = (includeJson = false): HeadersInit => {
  const token = getAuthToken();

  const headers: Record<string, string> = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// ======================================================
// Role Label
// ======================================================

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";

    case "SALES_MANAGER":
      return "Sales Manager";

    case "TEAM_LEADER":
      return "Team Leader";

    case "SALES_EXECUTIVE":
    case "EMPLOYEE":
    default:
      return "Sales Executive";
  }
};

// ======================================================
// Role API Value
// ======================================================

const getRoleApiValue = (role: string) => {
  if (role === "Sales Manager") {
    return "SALES_MANAGER";
  }

  if (role === "Team Leader") {
    return "TEAM_LEADER";
  }

  return "SALES_EXECUTIVE";
};

// ======================================================
// Component
// ======================================================

function SalesTeam() {
  const { isAdmin } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [salesTeam, setSalesTeam] = useState<SalesMember[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [formData, setFormData] = useState<MemberForm>(emptyForm);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==================================================
  // Permission Guard
  // ==================================================

  const canModify = () => {
    if (isAdmin) {
      return true;
    }

    alert(
      "View only access — sales team changes can only be made by an administrator.",
    );

    return false;
  };

  // ==================================================
  // Load Employees From Backend
  // ==================================================

  const fetchSalesTeam = async () => {
    try {
      setLoading(true);

      setError(null);

      const response = await fetch(EMPLOYEES_API, {
        headers: getRequestHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch employees");
      }

      const rawEmployees = Array.isArray(result.data) ? result.data : [];

      const employees: SalesMember[] = rawEmployees.map(
        (employee: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role: string;
          status: string;
          bookings?: number;
          _count?: {
            bookings?: number;
          };
        }) => ({
          id: employee.id,

          name: employee.name,

          role: getRoleLabel(employee.role),

          phone: employee.phone || "",

          email: employee.email,

          status: employee.status === "ACTIVE" ? "active" : "inactive",

          bookings: Number(employee.bookings ?? employee._count?.bookings ?? 0),
        }),
      );

      setSalesTeam(employees);
    } catch (error) {
      console.error("Failed to load sales team:", error);

      setSalesTeam([]);

      setError(
        error instanceof Error ? error.message : "Failed to fetch employees",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSalesTeam();
  }, []);

  // ==================================================
  // Statistics
  // ==================================================

  const totalMembers = salesTeam.length;

  const activeMembers = salesTeam.filter(
    (member) => member.status === "active",
  ).length;

  const inactiveMembers = salesTeam.filter(
    (member) => member.status === "inactive",
  ).length;

  const totalBookings = salesTeam.reduce(
    (total, member) => total + member.bookings,
    0,
  );

  // ==================================================
  // Open Add Modal
  // ==================================================

  const handleAddMember = () => {
    if (!canModify()) {
      return;
    }

    setEditingMemberId(null);

    setFormData(emptyForm);

    setShowPassword(false);

    setShowConfirmPassword(false);

    setIsModalOpen(true);

    setOpenMenuId(null);
  };

  // ==================================================
  // Open Edit Modal
  // ==================================================

  const handleEditMember = (member: SalesMember) => {
    if (!canModify()) {
      return;
    }

    setEditingMemberId(member.id);

    setFormData({
      name: member.name,

      role: member.role,

      phone: member.phone,

      email: member.email,

      status: member.status,

      password: "",

      confirmPassword: "",
    });

    setShowPassword(false);

    setShowConfirmPassword(false);

    setIsModalOpen(true);

    setOpenMenuId(null);
  };
  // ======================================================
  // Open Add Member From Quick Actions
  // ======================================================

  useEffect(() => {
    if (!isAdmin || searchParams.get("mode") !== "create") {
      return;
    }

    handleAddMember();

    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("mode");

    setSearchParams(nextParams, {
      replace: true,
    });
  }, [isAdmin, searchParams, setSearchParams]);

  // ==================================================
  // Close Modal
  // ==================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setEditingMemberId(null);

    setFormData(emptyForm);

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  // ==================================================
  // Form Change
  // ==================================================

  const handleInputChange = (
    field: keyof MemberForm,

    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,

      [field]: value,
    }));
  };

  // ==================================================
  // Validate Password
  // ==================================================

  const validatePassword = () => {
    const isNewMember = editingMemberId === null;

    const password = formData.password;

    const confirmPassword = formData.confirmPassword;

    // ----------------------------------------------
    // New Member
    // Password Required
    // ----------------------------------------------

    if (isNewMember) {
      if (!password) {
        alert("Please enter a password for the new sales member.");

        return false;
      }

      if (password.length < 8) {
        alert("Password must be at least 8 characters long.");

        return false;
      }

      if (!confirmPassword) {
        alert("Please confirm the password.");

        return false;
      }

      if (password !== confirmPassword) {
        alert("Password and Confirm Password do not match.");

        return false;
      }

      return true;
    }

    // ----------------------------------------------
    // Edit Member
    // Password Optional
    // ----------------------------------------------

    if (!password && !confirmPassword) {
      return true;
    }

    if (!password || password.length < 8) {
      alert("New password must be at least 8 characters long.");

      return false;
    }

    if (!confirmPassword) {
      alert("Please confirm the new password.");

      return false;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match.");

      return false;
    }

    return true;
  };

  // ==================================================
  // Save Member
  // ==================================================

  const handleSaveMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canModify()) {
      return;
    }

    const trimmedName = formData.name.trim();

    const trimmedPhone = formData.phone.trim();

    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      alert("Please fill Name, Phone and Email.");

      return;
    }

    if (!validatePassword()) {
      return;
    }

    // ==============================================
    // Edit Existing Member
    // ==============================================

    if (editingMemberId !== null) {
      try {
        const payload: Record<string, string> = {
          name: trimmedName,

          email: trimmedEmail,

          phone: trimmedPhone,

          role: getRoleApiValue(formData.role),

          status: formData.status === "active" ? "ACTIVE" : "INACTIVE",
        };

        // Password is optional when editing.
        // Blank means keep existing password.

        if (formData.password) {
          payload.password = formData.password;
        }

        const response = await fetch(`${EMPLOYEES_API}/${editingMemberId}`, {
          method: "PUT",

          headers: getRequestHeaders(true),

          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to update employee");
        }

        const employee = result.data;

        setSalesTeam((previous) =>
          previous.map((member) =>
            member.id === editingMemberId
              ? {
                  ...member,

                  id: employee.id,

                  name: employee.name,

                  role: getRoleLabel(employee.role),

                  phone: employee.phone || "",

                  email: employee.email,

                  status: employee.status === "ACTIVE" ? "active" : "inactive",
                }
              : member,
          ),
        );

        alert("Sales member updated successfully.");
      } catch (error) {
        console.error("Update sales member error:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to update sales member. Please try again.",
        );

        return;
      }
    }

    // ==============================================
    // Add New Member
    // ==============================================
    else {
      try {
        const response = await fetch(EMPLOYEES_API, {
          method: "POST",

          headers: getRequestHeaders(true),

          body: JSON.stringify({
            name: trimmedName,

            email: trimmedEmail,

            phone: trimmedPhone,

            password: formData.password,

            role: getRoleApiValue(formData.role),

            status: formData.status === "active" ? "ACTIVE" : "INACTIVE",
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to create employee");
        }

        const employee = result.data;

        const newMember: SalesMember = {
          id: employee.id,

          name: employee.name,

          role: getRoleLabel(employee.role),

          phone: employee.phone || "",

          email: employee.email,

          status: employee.status === "ACTIVE" ? "active" : "inactive",

          bookings: Number(employee.bookings ?? employee._count?.bookings ?? 0),
        };

        setSalesTeam((previous) => [...previous, newMember]);

        alert("Sales member created successfully.");
      } catch (error) {
        console.error("Create sales member error:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to create sales member. Please try again.",
        );

        return;
      }
    }

    handleCloseModal();
  };

  // ==================================================
  // Toggle Active / Inactive
  // ==================================================

  const handleToggleStatus = async (memberId: string) => {
    if (!canModify()) {
      return;
    }

    const member = salesTeam.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    const newStatus = member.status === "active" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(`${EMPLOYEES_API}/${memberId}`, {
        method: "PUT",

        headers: getRequestHeaders(true),

        body: JSON.stringify({
          name: member.name,

          email: member.email,

          phone: member.phone,

          role: getRoleApiValue(member.role),

          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update employee status");
      }

      const updatedEmployee = result.data;

      setSalesTeam((previous) =>
        previous.map((item) =>
          item.id === memberId
            ? {
                ...item,

                status:
                  updatedEmployee.status === "ACTIVE" ? "active" : "inactive",
              }
            : item,
        ),
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error("Update employee status error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update member status. Please try again.",
      );
    }
  };

  // ==================================================
  // Delete Member
  // ==================================================

  const handleDeleteMember = async (memberId: string) => {
    if (!canModify()) {
      return;
    }

    const member = salesTeam.find((item) => item.id === memberId);

    if (!member) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${member.name} from the sales team?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${EMPLOYEES_API}/${memberId}`, {
        method: "DELETE",

        headers: getRequestHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete employee");
      }

      setSalesTeam((previous) =>
        previous.filter((item) => item.id !== memberId),
      );

      setOpenMenuId(null);

      alert("Sales member deleted successfully.");
    } catch (error) {
      console.error("Delete sales member error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete sales member. Please try again.",
      );
    }
  };

  // ==================================================
  // Render
  // ==================================================

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
      {/* ==========================================
                Header
            ========================================== */}

      <div className="flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Sales Team</h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isAdmin
              ? "Manage your sales team and track their performance"
              : "View sales team and performance information"}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleAddMember}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 md:w-auto"
          >
            <UserPlus size={18} />
            Add Sales Member
          </button>
        )}
      </div>

      {/* ==========================================
                Error
            ========================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ==========================================
                Statistics
            ========================================== */}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {/* Total */}

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>

              <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">
                {totalMembers}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Members</p>

              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400 sm:text-3xl">
                {activeMembers}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600 dark:bg-green-950/60 dark:text-green-300">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Members</p>

              <p className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400 sm:text-3xl">
                {inactiveMembers}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-500 dark:bg-red-950/60 dark:text-red-300">
              <UserX size={24} />
            </div>
          </div>
        </div>

        {/* Bookings */}

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>

              <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400 sm:text-3xl">
                {totalBookings}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
                Team Members
            ========================================== */}

      <div className="min-w-0 rounded-2xl bg-white shadow-sm dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-700 sm:px-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Team Members</h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sales executives and their current status
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            Loading sales team...
          </div>
        ) : salesTeam.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            No sales members found.
          </div>
        ) : (
          <>
            {/* ==============================
                            Desktop Table
                        ============================== */}

            <div className="hidden w-full min-w-0 overflow-x-auto overscroll-x-contain md:block xl:overflow-visible">
              <table className="w-full min-w-[760px] text-gray-700 dark:text-gray-200">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/70 dark:text-gray-300">
                    <th className="px-6 py-4 font-medium">Member</th>

                    <th className="px-6 py-4 font-medium">Contact</th>

                    <th className="px-6 py-4 font-medium">Bookings</th>

                    <th className="px-6 py-4 font-medium">Status</th>

                    {isAdmin && (
                      <th className="px-6 py-4 text-right font-medium">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {salesTeam.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
                            {member.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="break-words font-semibold text-gray-800 dark:text-gray-100">
                              {member.name}
                            </p>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Phone size={14} />

                            {member.phone || "-"}
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail size={14} />

                            {member.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">
                        {member.bookings}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {member.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="relative px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === member.id ? null : member.id,
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                            aria-label="Member actions"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === member.id && (
                            <div className="absolute bottom-14 right-6 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-lg dark:border-gray-700 dark:bg-gray-900">
                              <button
                                type="button"
                                onClick={() => handleEditMember(member)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <Pencil size={16} />
                                Edit Member
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(member.id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                <Power size={16} />

                                {member.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteMember(member.id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <Trash2 size={16} />
                                Delete Member
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ==============================
                            Mobile Cards
                        ============================== */}

            <div className="min-w-0 space-y-3 p-3 sm:p-4 md:hidden">
              {salesTeam.map((member) => (
                <div
                  key={member.id}
                  className="relative min-w-0 rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-950/40"
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-gray-800 dark:text-gray-100">
                          {member.name}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === member.id ? null : member.id,
                          )
                        }
                        className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        aria-label="Member actions"
                      >
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </div>

                  {isAdmin && openMenuId === member.id && (
                    <div className="absolute bottom-14 right-4 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => handleEditMember(member)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Pencil size={16} />
                        Edit Member
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Power size={16} />

                        {member.status === "active" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={16} />
                        Delete Member
                      </button>
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone size={15} />

                      {member.phone || "-"}
                    </div>

                    <div className="flex items-center gap-2 break-all">
                      <Mail size={15} />

                      {member.email}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bookings</p>

                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {member.bookings}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        member.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                      }`}
                    >
                      {member.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ==========================================
                Add / Edit Member Modal
                Admin Only
            ========================================== */}

      {isAdmin && isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-2 sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 sm:max-h-[90vh]">
            {/* Modal Header */}

            <div className="shrink-0 flex min-w-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {editingMemberId !== null
                    ? "Edit Sales Member"
                    : "Add Sales Member"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingMemberId !== null
                    ? "Update sales member details"
                    : "Create a sales member with login access"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleSaveMember} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
              {/* Name */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-green-900/50"
                  required
                />
              </div>

              {/* Role */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>

                <select
                  value={formData.role}
                  onChange={(event) =>
                    handleInputChange("role", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:ring-green-900/50"
                >
                  <option value="Sales Executive">Sales Executive</option>

                  <option value="Sales Manager">Sales Manager</option>

                  <option value="Team Leader">Team Leader</option>
                </select>
              </div>

              {/* Phone */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) =>
                    handleInputChange("phone", event.target.value)
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-green-900/50"
                  required
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    handleInputChange("email", event.target.value)
                  }
                  placeholder="employee@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-green-900/50"
                  required
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {editingMemberId !== null ? "New Password" : "Password"}
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) =>
                      handleInputChange("password", event.target.value)
                    }
                    placeholder={
                      editingMemberId !== null
                        ? "Leave blank to keep current password"
                        : "Minimum 8 characters"
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-green-900/50"
                    required={editingMemberId === null}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {editingMemberId !== null
                    ? "Leave blank if you do not want to change the employee password."
                    : "Password must contain at least 8 characters."}
                </p>
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {editingMemberId !== null
                    ? "Confirm New Password"
                    : "Confirm Password"}
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      handleInputChange("confirmPassword", event.target.value)
                    }
                    placeholder={
                      editingMemberId !== null
                        ? "Confirm new password"
                        : "Re-enter password"
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-green-900/50"
                    required={editingMemberId === null}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Status */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(event) =>
                    handleInputChange(
                      "status",
                      event.target.value as "active" | "inactive",
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:ring-green-900/50"
                >
                  <option value="active">Active</option>

                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}

              <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  {editingMemberId !== null ? "Update Member" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesTeam;




