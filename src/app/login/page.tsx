"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");
  const [showPassword, setShowPassword] = useState(false);

  // Status Indicators
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Read theme from html node class list
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simple mock authorization logic
    setTimeout(() => {
      const isValidAdmin = username.toLowerCase() === "admin" && password === "admin123";
      const isValidCashier = username.toLowerCase() === "cashier" && password === "cashier123";

      if (isValidAdmin || isValidCashier) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", username);
        router.push("/");
      } else {
        setError(
          language === "en"
            ? "Invalid username or password. Use hints: admin/admin123 or cashier/cashier123"
            : "වැරදි පරිශීලක නාමයක් හෝ මුරපදයක්. ඉඟි භාවිතා කරන්න: admin/admin123 හෝ cashier/cashier123"
        );
        setIsSubmitting(false);
      }
    }, 800); // Slight delay for realistic authentication animation
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-md relative overflow-hidden bg-background">
      {/* Theme and Language Toggle in Top Right Corner */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === "en" ? "si" : "en")}
          className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded-2xl font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all duration-200 min-h-10 min-w-14 flex items-center justify-center relative group glass-panel shadow-sm cursor-pointer font-semibold"
          title={language === "en" ? "සිංහල භාෂාවට මාරු වන්න" : "Switch to English"}
        >
          {language === "en" ? "සිංහල" : "EN"}
        </button>
        <button
          onClick={toggleTheme}
          className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 min-w-10 min-h-10 flex items-center justify-center relative group glass-panel shadow-sm cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:rotate-12">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-112 card-elevated p-xl relative z-10 glass-panel shadow-2xl flex flex-col gap-lg animate-fade-in animate-rise-in">
        {/* Logo and Brand Details */}
        <div className="flex flex-col items-center gap-sm text-center">
          <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-[0_8px_24px_rgba(5,150,105,0.25)] mb-1">
            <span className="material-symbols-outlined fill text-[36px]">storefront</span>
          </div>
          <div className="space-y-1">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface leading-tight tracking-tight">
              {t("loginTitle")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("loginSubtitle")}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-md">
          {/* Error Message banner */}
          {error && (
            <div className="p-sm bg-error-container text-error rounded-2xl flex items-start gap-xs border border-error/20 font-label-sm text-label-sm animate-fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant px-1 font-semibold">
              {t("selectRole")}
            </label>
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`py-sm px-md rounded-2xl border font-label-md text-label-md transition-all flex items-center justify-center gap-xs cursor-pointer ${
                  role === "manager"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                {t("manager")}
              </button>
              <button
                type="button"
                onClick={() => setRole("cashier")}
                className={`py-sm px-md rounded-2xl border font-label-md text-label-md transition-all flex items-center justify-center gap-xs cursor-pointer ${
                  role === "cashier"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                {t("cashier")}
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="flex flex-col gap-xs relative group">
            <label htmlFor="username" className="font-label-md text-label-md text-on-surface-variant px-1 font-semibold">
              {t("username")}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-md text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                person
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-11 pr-sm py-sm bg-surface-container-low/80 border border-outline-variant/60 rounded-2xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all min-h-12"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-xs relative group">
            <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant px-1 font-semibold">
              {t("password")}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-md text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-sm bg-surface-container-low/80 border border-outline-variant/60 rounded-2xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all min-h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-sm text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Sign In button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary font-label-md py-sm px-md rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-12 mt-2 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t("signingIn")}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>{t("signIn")}</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Hints */}
        <div className="border-t border-outline-variant/60 pt-md text-center flex flex-col gap-1.5">
          <p className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
            {t("demoCredentials")}
          </p>
          <div className="flex flex-col gap-1 font-label-sm text-[12px] text-on-surface-variant/80">
            <div>
              <span className="font-bold text-on-surface">Admin: </span>
              <code className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono select-all">admin</code> / <code className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono select-all">admin123</code>
            </div>
            <div>
              <span className="font-bold text-on-surface">Cashier: </span>
              <code className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono select-all">cashier</code> / <code className="bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono select-all">cashier123</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
