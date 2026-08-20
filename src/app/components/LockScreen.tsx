"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { loginWithPin, getActiveProfiles, SafeUser } from "../actions/auth";

interface LockScreenProps {
  isOpen: boolean;
  onUnlock: (user: SafeUser) => void;
  onLogout: () => void;
}

export default function LockScreen({ isOpen, onUnlock, onLogout }: LockScreenProps) {
  const { language } = useLanguage();
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [profiles, setProfiles] = useState<SafeUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [time, setTime] = useState<Date>(new Date());
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Load profiles and update clock
  useEffect(() => {
    if (!isOpen) return;

    // Load active users
    async function loadProfiles() {
      const data = await getActiveProfiles();
      setProfiles(data);
      
      // Auto select current logged in user if possible
      const currentUserName = localStorage.getItem("userName");
      if (currentUserName) {
        const found = data.find(p => p.name === currentUserName);
        if (found) setSelectedUser(found);
      }
    }
    loadProfiles();

    // Focus keystrokes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    // Clock interval
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    setError("");
    if (pin.length < 4) {
      const nextPin = pin + char;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError("");
    setPin("");
  };

  const verifyPin = async (enteredPin: string) => {
    try {
      const res = await loginWithPin(enteredPin);
      if (res.success && res.user) {
        // Option to validate if selected user matches entered PIN
        if (selectedUser && selectedUser.role !== res.user.role && selectedUser.username !== res.user.username) {
          // If they typed a PIN that belongs to a different profile, we can automatically switch to that profile!
          // This is standard for quick shifts.
        }
        
        onUnlock(res.user);
        setPin("");
      } else {
        setError(
          language === "en"
            ? res.error || "Incorrect PIN."
            : "වැරදි PIN කේතයකි."
        );
        setPin("");
      }
    } catch (err) {
      setError("PIN validation error.");
      setPin("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === "Escape") {
      handleClear();
    } else if (/^[0-9]$/.test(e.key)) {
      handleKeyPress(e.key);
    }
  };

  const formatLongDate = (d: Date) => {
    return d.toLocaleDateString(language === "en" ? "en-US" : "si-LK", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/98 backdrop-blur-2xl p-lg text-white animate-fade-in select-none">
      {/* Hidden input to capture physical keyboard focus */}
      <input
        ref={inputRef}
        type="password"
        value={pin}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />

      {/* Top Section - Large Premium Clock */}
      <div className="flex flex-col items-center text-center mt-xl gap-xs animate-rise-in">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-white mb-2 shadow-[0_8px_24px_rgba(5,150,105,0.3)]">
          <span className="material-symbols-outlined text-2xl fill">lock</span>
        </div>
        <h1 className="text-display-price text-5xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-mono">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </h1>
        <p className="text-slate-400 font-label-md text-label-md tracking-wide mt-1">
          {formatLongDate(time)}
        </p>
      </div>

      {/* Middle Section - Numeric PIN input */}
      <div className="flex flex-col items-center gap-md max-w-sm w-full my-auto animate-fade-in">
        {/* Active profiles view */}
        <div className="flex justify-center gap-md overflow-x-auto w-full py-1">
          {profiles.map((p) => {
            const isSelected = selectedUser?.username === p.username;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedUser(p)}
                className={`flex flex-col items-center gap-xs cursor-pointer transition-all duration-200 ${
                  isSelected ? "scale-105 opacity-100" : "scale-95 opacity-50 hover:opacity-85"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold font-headline-sm text-headline-sm transition-all border ${
                  isSelected 
                    ? "bg-primary border-primary shadow-[0_0_16px_rgba(5,150,105,0.4)]"
                    : "bg-slate-800 border-slate-700"
                }`}>
                  {p.name.charAt(0)}
                </div>
                <span className="text-[11px] font-label-sm font-semibold truncate max-w-20">
                  {p.name.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* PIN Dots display */}
        <div className="flex flex-col items-center gap-xs w-full">
          <div className="flex justify-center gap-md h-10 items-center">
            {pin.length === 0 ? (
              <span className="text-slate-500 font-label-md text-label-md uppercase tracking-wider animate-pulse">
                {language === "en" ? "Enter PIN" : "PIN ඇතුළත් කරන්න"}
              </span>
            ) : (
              Array.from({ length: pin.length }).map((_, i) => (
                <div key={i} className="w-4.5 h-4.5 rounded-full bg-primary shadow-[0_0_12px_rgba(5,150,105,0.5)] animate-fade-in"></div>
              ))
            )}
          </div>
          
          {error && (
            <div className="px-sm py-1 bg-error/15 text-error border border-error/20 rounded-xl text-center font-label-sm text-label-sm animate-shake">
              {error}
            </div>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-sm w-full max-w-64 mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="h-13 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-700/80 border border-slate-800/50 text-white font-headline-md text-headline-md font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.96]"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl bg-transparent text-error hover:bg-error/10 font-bold flex items-center justify-center cursor-pointer active:scale-[0.96]"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-13 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/50 text-white font-headline-md text-headline-md font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.96]"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 rounded-2xl bg-transparent hover:bg-slate-800/20 text-slate-400 font-bold flex items-center justify-center cursor-pointer active:scale-[0.96]"
          >
            <span className="material-symbols-outlined text-md">backspace</span>
          </button>
        </div>
      </div>

      {/* Bottom Section - Logout & Sign out options */}
      <div className="flex gap-lg text-sm text-slate-500 font-label-md text-label-md mt-auto mb-md">
        <button
          onClick={onLogout}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-xs font-semibold py-xs px-sm rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          {language === "en" ? "Sign Out Profile" : "ප්‍රධාන ගිණුමෙන් ඉවත් වන්න"}
        </button>
      </div>
    </div>
  );
}
