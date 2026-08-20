"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { createUser } from "../actions/auth";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StaffModal({ isOpen, onClose, onSuccess }: StaffModalProps) {
  const { language } = useLanguage();
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("cashier");
  
  // Validation status
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setUsername("");
      setPassword("");
      setPin("");
      setRole("cashier");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Front-end Validations
    if (!name.trim() || !username.trim() || !password.trim() || !pin.trim()) {
      setError(language === "en" ? "All fields are required." : "සියලුම ක්ෂේත්‍ර පිරවීම අනිවාර්ය වේ.");
      return;
    }

    if (username.includes(" ")) {
      setError(language === "en" ? "Username cannot contain spaces." : "පරිශීලක නාමයට හිස්තැන් ඇතුළත් කළ නොහැක.");
      return;
    }

    if (password.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters." : "මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError(language === "en" ? "PIN must be exactly 4 digits." : "PIN කේතය හරියටම සංඛ්‍යා 4ක් විය යුතුය.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const res = await createUser(name, username, password, pin, role);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || (language === "en" ? "Failed to create user." : "පරිශීලකයා නිර්මාණය කිරීමට අපොහොසත් විය."));
      }
    } catch (err) {
      setError("System database error.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-sm animate-fade-in text-on-surface">
      <div className="glass-panel rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.25)] w-full max-w-112 max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant/60 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">person_add</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-extrabold">
              {language === "en" ? "Register Staff Profile" : "නව ගිණුමක් ලියාපදිංචි කිරීම"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreateUser} className="p-lg flex flex-col gap-sm flex-1 overflow-y-auto">
          {error && (
            <div className="p-sm bg-error/10 text-error border border-error/20 rounded-2xl text-xs font-semibold leading-relaxed animate-shake">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {language === "en" ? "Full Name" : "සම්පූර්ණ නම"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nimal Perera"
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {language === "en" ? "Username (for Login)" : "පරිශීලක නාමය (පිවිසීමට)"}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. nimal"
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 font-mono"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {language === "en" ? "Assign Role" : "භූමිකාව පැවරීම"}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 cursor-pointer"
            >
              <option value="cashier">{language === "en" ? "Cashier" : "අයකැමි"}</option>
              <option value="manager">{language === "en" ? "Manager" : "කළමනාකරු"}</option>
            </select>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {language === "en" ? "Password" : "මුරපදය"}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11"
            />
          </div>

          {/* PIN */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              {language === "en" ? "4-Digit Keypad PIN (for overrides & locks)" : "සංඛ්‍යා 4 ක PIN කේතය (අගුළු හැරීමට)"}
            </label>
            <input
              type="text"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 7788"
              className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 font-mono tracking-widest text-center font-bold"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex gap-sm mt-md pt-sm border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-container-low border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container font-label-md text-label-md py-md rounded-2xl transition-colors min-h-12 cursor-pointer font-semibold"
            >
              {language === "en" ? "Cancel" : "අවලංගු කරන්න"}
            </button>
            <button
              type="submit"
              disabled={isSubmitLoading}
              className="flex-1 btn-primary text-white font-label-md py-md rounded-2xl transition-all min-h-12 cursor-pointer font-semibold flex items-center justify-center gap-xs active:scale-[0.98]"
            >
              {isSubmitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {language === "en" ? "Saving..." : "සුරැකෙමින්..."}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  {language === "en" ? "Save Staff" : "සුරකින්"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
