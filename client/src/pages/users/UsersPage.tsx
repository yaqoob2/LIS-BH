import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, Pencil, Plus, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { createUser, getUsers, updateUser } from "../../api/users";

import type { UserRole } from "../../types/auth";
import type {
  CreateUserRequest,
  InternalUser,
  UpdateUserRequest,
} from "../../types/user";

type DrawerMode = "create" | "edit";

interface UserDrawerProps {
  mode: DrawerMode;
  user?: InternalUser | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function UserDrawer({ mode, user, onClose, onSaved }: UserDrawerProps) {
  const [name, setName] = useState(user?.name ?? "");

  const [email, setEmail] = useState(user?.email ?? "");

  const [role, setRole] = useState<UserRole>(user?.role ?? "USER");

  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const [password, setPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const isCreate = mode === "create";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      toast.error("Name is required.");
      return;
    }

    if (!cleanEmail) {
      toast.error("Email is required.");
      return;
    }

    if (isCreate && password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!isCreate && password.length > 0 && password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    try {
      setIsSaving(true);

      if (isCreate) {
        const payload: CreateUserRequest = {
          name: cleanName,
          email: cleanEmail,
          password,
          role,
        };

        await createUser(payload);

        toast.success("User created successfully.");
      } else {
        if (!user) return;

        const payload: UpdateUserRequest = {
          name: cleanName,
          email: cleanEmail,
          role,
          isActive,
          ...(password ? { password } : {}),
        };

        await updateUser(user.id, payload);

        toast.success("User updated successfully.");
      }

      await onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isCreate
            ? "Unable to create user."
            : "Unable to update user.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#101828]/20">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={() => {
          if (!isSaving) {
            onClose();
          }
        }}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-[#E4E7EC] bg-white">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#E7E9EE] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#172033]">
              {isCreate ? "Add User" : "Edit User"}
            </h2>

            <p className="mt-1 text-[11px] text-[#98A2B3]">
              {isCreate
                ? "Create an internal LIS-BH user."
                : "Update account details and access."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isSaving) {
                onClose();
              }
            }}
            className="flex h-8 w-8 items-center justify-center text-[#98A2B3] transition-colors hover:bg-[#F5F6F8] hover:text-[#475467]"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {/* NAME */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#475467]">
                  Name
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ahmed Ali"
                  disabled={isSaving}
                  className="h-10 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#A8AFBC] focus:border-[#667694] disabled:bg-[#F8F9FB]"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#475467]">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ahmed@lawfirm.com"
                  disabled={isSaving}
                  className="h-10 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#A8AFBC] focus:border-[#667694] disabled:bg-[#F8F9FB]"
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#475467]">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  disabled={isSaving}
                  className="h-10 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none focus:border-[#667694] disabled:bg-[#F8F9FB]"
                >
                  <option value="USER">User</option>

                  <option value="ADMIN">Admin</option>
                </select>

                <p className="mt-1.5 text-[10px] leading-4 text-[#98A2B3]">
                  Admins can manage users and legal resources.
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#475467]">
                  {isCreate ? "Password" : "New Password"}
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isCreate
                      ? "Minimum 8 characters"
                      : "Leave blank to keep current password"
                  }
                  disabled={isSaving}
                  className="h-10 w-full border border-[#DDE1E8] bg-white px-3 text-[12px] text-[#18212F] outline-none placeholder:text-[#A8AFBC] focus:border-[#667694] disabled:bg-[#F8F9FB]"
                />

                <p className="mt-1.5 text-[10px] text-[#98A2B3]">
                  Minimum 8 characters.
                </p>
              </div>

              {/* STATUS - EDIT ONLY */}
              {!isCreate && (
                <div className="border-t border-[#EEF0F3] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-[#475467]">
                        Account status
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#98A2B3]">
                        Inactive users cannot access the workspace.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsActive((current) => !current)}
                      className={`h-8 min-w-[82px] border px-3 text-[10.5px] font-medium transition-colors ${
                        isActive
                          ? "border-[#CFE3D6] bg-[#F6FAF7] text-[#397052]"
                          : "border-[#E3D6D6] bg-[#FBF7F7] text-[#934B4B]"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-5 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="h-9 border border-[#DDE1E8] bg-white px-4 text-[11px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex h-9 min-w-[92px] items-center justify-center gap-2 bg-[#17223B] px-4 text-[11px] font-medium text-white transition-colors hover:bg-[#243250] disabled:opacity-50"
            >
              {isSaving && <LoaderCircle size={13} className="animate-spin" />}

              {isSaving
                ? "Saving..."
                : isCreate
                  ? "Create User"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<InternalUser[]>([]);

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);

  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load users.",
      );
    }
  }

  useEffect(() => {
    async function initialise() {
      try {
        setIsLoading(true);
        await loadUsers();
      } finally {
        setIsLoading(false);
      }
    }

    void initialise();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const activeCount = users.filter((user) => user.isActive).length;

  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  function openCreate() {
    setSelectedUser(null);
    setDrawerMode("create");
  }

  function openEdit(user: InternalUser) {
    setSelectedUser(user);
    setDrawerMode("edit");
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedUser(null);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px]">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
              Users
            </h1>

            <p className="mt-0.5 text-[13px] text-[#7B8494]">
              Manage internal users and workspace access.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex h-9 items-center justify-center gap-2 bg-[#17223B] px-4 text-[11.5px] font-medium text-white transition-colors hover:bg-[#243250]"
          >
            <Plus size={14} />
            Add User
          </button>
        </div>

        {/* SUMMARY */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#E7E9EE] py-3 text-[10.5px] text-[#7B8494]">
          <span>
            <strong className="font-semibold text-[#344054]">
              {users.length}
            </strong>{" "}
            Total
          </span>

          <span className="h-3 w-px bg-[#E1E4EA]" />

          <span>
            <strong className="font-semibold text-[#344054]">
              {activeCount}
            </strong>{" "}
            Active
          </span>

          <span className="h-3 w-px bg-[#E1E4EA]" />

          <span>
            <strong className="font-semibold text-[#344054]">
              {adminCount}
            </strong>{" "}
            Admins
          </span>
        </div>

        {/* SEARCH */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-[340px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="h-9 w-full border border-[#DDE1E8] bg-white pl-9 pr-3 text-[11.5px] text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694]"
            />
          </div>

          <p className="hidden text-[10px] text-[#98A2B3] sm:block">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
          </p>
        </div>

        {/* TABLE */}
        <div className="mt-4 overflow-hidden border border-[#E4E7EC] bg-white">
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                <LoaderCircle size={14} className="animate-spin" />
                Loading users...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
              <UserRound size={20} className="text-[#98A2B3]" />

              <p className="mt-2 text-[12px] font-medium text-[#475467]">
                No users found
              </p>

              <p className="mt-1 text-[10.5px] text-[#98A2B3]">
                {search
                  ? "Try a different search."
                  : "Create your first internal user."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#FAFAFB]">
                    <tr className="border-b border-[#E4E7EC]">
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7B8494]">
                        User
                      </th>

                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7B8494]">
                        Role
                      </th>

                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7B8494]">
                        Status
                      </th>

                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7B8494]">
                        Created
                      </th>

                      <th className="w-[90px] px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.04em] text-[#7B8494]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#EEF0F3] last:border-b-0 hover:bg-[#FCFCFD]"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[10.5px] font-semibold text-[#53627E]">
                              {user.name.trim().charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[11.5px] font-semibold text-[#344054]">
                                {user.name}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-[#98A2B3]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex border border-[#E1E4EA] bg-[#F8F9FB] px-2 py-1 text-[9.5px] font-medium text-[#596273]">
                            {user.role === "ADMIN" ? "Admin" : "User"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex px-2 py-1 text-[9.5px] font-medium ${
                              user.isActive
                                ? "bg-[#F3F8F5] text-[#397052]"
                                : "bg-[#FAF4F4] text-[#934B4B]"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-[10.5px] text-[#667085]">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="inline-flex h-8 items-center gap-1.5 border border-[#DDE1E8] bg-white px-2.5 text-[10px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB]"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-[#EEF0F3] md:hidden">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[10.5px] font-semibold text-[#53627E]">
                          {user.name.trim().charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[11.5px] font-semibold text-[#344054]">
                            {user.name}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-[#98A2B3]">
                            {user.email}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="border border-[#E1E4EA] bg-[#F8F9FB] px-2 py-1 text-[9px] font-medium text-[#596273]">
                              {user.role === "ADMIN" ? "Admin" : "User"}
                            </span>

                            <span
                              className={`px-2 py-1 text-[9px] font-medium ${
                                user.isActive
                                  ? "bg-[#F3F8F5] text-[#397052]"
                                  : "bg-[#FAF4F4] text-[#934B4B]"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#DDE1E8] text-[#667085]"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {drawerMode && (
        <UserDrawer
          key={selectedUser?.id ?? "new-user"}
          mode={drawerMode}
          user={selectedUser}
          onClose={closeDrawer}
          onSaved={loadUsers}
        />
      )}
    </>
  );
}
