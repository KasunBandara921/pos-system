"use client";

import React, { useState, useEffect } from "react";
import Shell from "../../components/Shell";
import { getActiveProfiles, deleteUser, SafeUser } from "../../actions/auth";
import { useLanguage } from "../../context/LanguageContext";
import StaffModal from "../../components/StaffModal";

export default function ManageUsersPage() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load and verify session
  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem("userRole");
    setCurrentRole(savedRole);
    if (savedRole !== "manager") {
      window.location.href = "/";
      return;
    }

    loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await getActiveProfiles();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmMessage = language === "en"
      ? `Are you sure you want to delete user "${userName}"?`
      : `ඔබට "${userName}" පරිශීලකයා ඉවත් කිරීමට අවශ්‍ය බව සහතිකද?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await deleteUser(userId);
      if (res.success) {
        loadUsers();
      } else {
        alert(res.error || "Failed to delete user.");
      }
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  if (currentRole !== "manager") return null;

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg animate-fade-in">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-elevated p-lg">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              {language === "en" ? "Cashier & Staff Management" : "කැෂියර් සහ කාර්ය මණ්ඩල කළමනාකරණය"}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {language === "en" 
                ? "Register cashier accounts, assign roles, and configure secure numeric login PINs."
                : "කැෂියර් ගිණුම් ලියාපදිංචි කිරීම, භූමිකාවන් පැවරීම සහ ආරක්ෂිත PIN කේත සැකසීම."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary font-label-md py-sm px-lg rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-11 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            {language === "en" ? "Add New Cashier" : "නව කැෂියර් කෙනෙක් එක් කරන්න"}
          </button>
        </div>

        {/* Users Table / Grid */}
        <div className="card-elevated overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <p className="text-on-surface-variant text-sm font-label-md">
                {language === "en" ? "Loading staff registry..." : "කාර්ය මණ්ඩල ලේඛනය පූරණය වෙමින්..."}
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-4xl">group_off</span>
              <p className="font-label-md text-label-md">
                {language === "en" ? "No users registered." : "පරිශීලකයින් කිසිවෙකු ලියාපදිංචි වී නොමැත."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <th className="px-lg py-md">{language === "en" ? "Name" : "නම"}</th>
                    <th className="px-lg py-md">{language === "en" ? "Username" : "පරිශීලක නාමය"}</th>
                    <th className="px-lg py-md">{language === "en" ? "Role" : "භූමිකාව"}</th>
                    <th className="px-lg py-md text-right">{language === "en" ? "Actions" : "ක්‍රියාමාර්ග"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-body-md text-body-md text-on-surface">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-lg py-md font-semibold">{u.name}</td>
                      <td className="px-lg py-md text-on-surface-variant font-mono">{u.username}</td>
                      <td className="px-lg py-md">
                        {u.role === "manager" ? (
                          <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">
                            <span className="material-symbols-outlined text-[12px] fill">crown</span>
                            {language === "en" ? "Manager" : "කළමනාකරු"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[12px] fill">badge</span>
                            {language === "en" ? "Cashier" : "අයකැමි"}
                          </span>
                        )}
                      </td>
                      <td className="px-lg py-md text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center min-w-9 min-h-9"
                          title={language === "en" ? "Delete User" : "පරිශීලකයා ඉවත් කරන්න"}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <StaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadUsers}
      />
    </Shell>
  );
}
