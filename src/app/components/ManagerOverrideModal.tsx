"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { verifyManagerPinOverride } from "../actions/auth";

interface ManagerOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  actionLabel: string;
}

export default function ManagerOverrideModal({
  isOpen,
  onClose,
  onAuthorized,
  actionLabel,
}: ManagerOverrideModalProps) {
  const { language } = useLanguage();
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  // Use ref to capture keystrokes from physical keyboard
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      // Focus the hidden text input to capture physical keyboard input easily
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    setError("");
    if (pin.length < 8) { // Allow longer password inputs too, like 'admin123'
      setPin((prev) => prev + char);
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

  const verifyCredentials = async (inputVal: string) => {
    try {
      const res = await verifyManagerPinOverride(inputVal);
      if (res.success) {
        onAuthorized();
        onClose();
      } else {
        setError(
          language === "en"
            ? res.error || "Unauthorized Manager credentials."
            : "අනුමත නොකළ කළමනාකරු අක්තපත්‍ර."
        );
        setPin("");
      }
    } catch (err) {
      setError("System validation error.");
      setPin("");
    }
  };

  const handleSubmit = () => {
    verifyCredentials(pin);
  };

  // Keyboard support listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      verifyCredentials(pin);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-sm animate-fade-in">
      {/* Hidden input to capture physical keyboard easily */}
      <input
        ref={inputRef}
        type="password"
        value={pin}
        onChange={(e) => {
          setError("");
          setPin(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />

      <div className="glass-panel rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.2)] w-full max-w-96 max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant/60 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-2xl bg-error-container/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                {language === "en" ? "Manager Approval" : "කළමනාකරු අනුමැතිය"}
              </h2>
              <p className="text-[11px] text-on-surface-variant/80 font-medium tracking-wide uppercase">
                {language === "en" ? "Action Required" : "ක්‍රියාවක් අවශ්‍යයි"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-lg flex flex-col gap-md items-center">
          {/* Action description banner */}
          <div className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl p-sm text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {language === "en" ? "Authorizing action:" : "අනුමත කරන ක්‍රියාව:"}
            </p>
            <p className="font-label-md text-label-md text-primary font-bold mt-0.5">
              {actionLabel}
            </p>
          </div>

          {/* PIN Indicator dots */}
          <div className="flex flex-col items-center gap-xs w-full mt-xs">
            <div className="flex justify-center gap-sm h-12 items-center">
              {pin.length === 0 ? (
                <span className="text-on-surface-variant/30 font-label-md text-label-md tracking-wider">
                  {language === "en" ? "Enter PIN" : "PIN කේතය ඇතුළත් කරන්න"}
                </span>
              ) : (
                Array.from({ length: Math.min(8, pin.length) }).map((_, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-full bg-primary animate-fade-in shadow-xs"></div>
                ))
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant opacity-60">
              {language === "en" ? "(Default Manager PIN is 1234)" : "(කළමනාකරු PIN අංකය 1234 වේ)"}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="w-full p-sm bg-error-container text-error rounded-2xl text-center font-label-sm text-label-sm animate-fade-in border border-error/20">
              {error}
            </div>
          )}

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-sm w-full max-w-72 mt-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 active:bg-surface-container-high transition-colors font-headline-md text-headline-md font-bold text-on-surface flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.96]"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-2xl bg-surface border border-outline-variant/30 hover:bg-surface-container-low text-error font-label-md text-label-md font-bold flex items-center justify-center cursor-pointer active:scale-[0.96]"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-14 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 active:bg-surface-container-high transition-colors font-headline-md text-headline-md font-bold text-on-surface flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.96]"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 rounded-2xl bg-surface border border-outline-variant/30 hover:bg-surface-container-low font-bold flex items-center justify-center cursor-pointer active:scale-[0.96] text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-md">backspace</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant/60 bg-surface-container-low/40 flex gap-sm">
          <button
            onClick={onClose}
            className="flex-1 bg-surface border border-outline-variant/60 text-on-surface hover:bg-surface-container-low font-label-md text-label-md py-sm rounded-2xl min-h-11 transition-all cursor-pointer font-semibold"
          >
            {language === "en" ? "Cancel" : "අවලංගු කරන්න"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length === 0}
            className={`flex-1 font-label-md text-label-md py-sm rounded-2xl min-h-11 active:scale-[0.98] cursor-pointer font-semibold flex items-center justify-center gap-xs ${
              pin.length === 0
                ? "bg-surface-container-highest text-on-surface-variant border border-outline-variant/60 cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            <span className="material-symbols-outlined text-sm">vpn_key</span>
            {language === "en" ? "Authorize" : "අනුමත කරන්න"}
          </button>
        </div>
      </div>
    </div>
  );
}
