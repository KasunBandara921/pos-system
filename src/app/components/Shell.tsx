"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import LockScreen from "./LockScreen";
import { SafeUser } from "../actions/auth";

interface ShellProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNewSaleClick?: () => void;
  suspendedCarts?: any[][];
  onResumeCart?: (index: number) => void;
}

export default function Shell({
  children,
  searchQuery = "",
  onSearchChange,
  onNewSaleClick,
  suspendedCarts,
  onResumeCart,
}: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  // Dark/Light Mode Theme State
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [userLabel, setUserLabel] = React.useState("Store Manager");
  const [role, setRole] = React.useState<string | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);

  React.useEffect(() => {
    // Read actual state of DOM HTML class set by layout script
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Session validation
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
    }

    const locked = localStorage.getItem("isTerminalLocked") === "true";
    setIsLocked(locked);

    const savedRole = localStorage.getItem("userRole");
    setRole(savedRole);
    if (savedRole === "cashier") {
      setUserLabel(t("storeCashier"));
    } else if (savedRole === "manager") {
      setUserLabel(t("storeManager"));
    }
  }, [router, language, t]);

  const handleUnlock = (user: SafeUser) => {
    localStorage.removeItem("isTerminalLocked");
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userId", user.id);
    
    setRole(user.role);
    if (user.role === "cashier") {
      setUserLabel(t("storeCashier"));
    } else if (user.role === "manager") {
      setUserLabel(t("storeManager"));
    }
    
    setIsLocked(false);
    router.push("/");
  };

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

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  const handleNewSale = () => {
    if (onNewSaleClick) {
      onNewSaleClick();
    } else {
      router.push("/?newSale=true");
    }
  };

  const navLinks = [
    { href: "/", label: t("navCheckout"), icon: "shopping_cart" },
    { href: "/inventory", label: t("navInventory"), icon: "inventory_2" },
    { href: "/reports", label: t("navReports"), icon: "bar_chart" },
    { href: "/transactions", label: t("navTransactions"), icon: "receipt_long" },
  ].filter((link) => {
    if (role === "cashier" && (link.href === "/inventory" || link.href === "/reports")) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-screen w-full overflow-hidden flex text-on-background">
      {/* Side Navigation Bar */}
      <nav className="glass-panel h-[calc(100vh-1.5rem)] w-64 flex flex-col fixed left-3 top-3 z-40 rounded-3xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] overflow-hidden">
        {/* Header Store Details */}
        <div className="p-lg border-b border-outline-variant/60">
          <div className="flex items-center gap-sm mb-md">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)]">
              <span className="material-symbols-outlined fill text-[22px]">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold gradient-text leading-tight tracking-tight">
                {t("brandName")}
              </h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{t("terminalLabel")}</p>
            </div>
          </div>
          <button
            onClick={handleNewSale}
            className="w-full btn-primary font-label-md py-sm px-md rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-11 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t("newSale")}
          </button>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 py-md overflow-y-auto">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-lg mb-sm opacity-70">
            {t("menuLabel")}
          </p>
          <ul className="space-y-1 px-sm font-body-md text-body-md">
            {navLinks.map(({ href, label, icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-sm px-md py-sm rounded-2xl transition-all duration-200 min-h-11 ${
                      isActive
                        ? "nav-active"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? "fill" : ""}`}>
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Suspended Sales Section */}
          {suspendedCarts && suspendedCarts.length > 0 && pathname === "/" && (
            <div className="mt-lg px-md">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">
                {t("suspendedSales")} ({suspendedCarts.length})
              </p>
              <div className="flex flex-col gap-xs max-h-40 overflow-y-auto">
                {suspendedCarts.map((sc, index) => {
                  const scTotal = sc.reduce((s, item) => s + item.product.price * item.quantity, 0) * 1.085;
                  return (
                    <button
                      key={index}
                      onClick={() => onResumeCart && onResumeCart(index)}
                      className="text-left w-full p-sm rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container hover:border-primary/30 flex items-center justify-between text-xs transition-all cursor-pointer"
                    >
                      <span className="truncate text-on-surface font-medium">Order #{index + 1}</span>
                      <span className="font-mono text-primary font-bold">Rs. {scTotal.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="p-sm border-t border-outline-variant/60">
          <ul className="space-y-1 font-body-md text-body-md">
            <li>
              <Link
                href="#"
                className="flex items-center gap-sm px-md py-sm rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors duration-200 min-h-11"
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
                {t("settings")}
              </Link>
            </li>
             <li>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-sm px-md py-sm rounded-2xl text-on-surface-variant hover:bg-error-container/50 hover:text-error transition-colors duration-200 min-h-11 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
                {t("logout")}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-68 pr-3 py-3">
        {/* Top Header Bar */}
        <header className="glass-panel flex justify-between items-center w-full px-lg py-sm sticky top-3 z-30 h-18 rounded-3xl shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-md flex-1">
            {onSearchChange ? (
              <div className="relative w-full max-w-112 hidden sm:block group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  className="w-full pl-12 pr-sm py-xs bg-surface-container-low/80 border border-outline-variant/60 rounded-2xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all min-h-11"
                  placeholder={
                    pathname === "/inventory"
                      ? t("searchInventoryPlaceholder")
                      : t("searchPlaceholder")
                  }
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">clear</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full max-w-112 hidden sm:block" />
            )}
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setLanguage(language === "en" ? "si" : "en")}
              className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded-2xl font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all duration-200 min-h-10 min-w-14 flex items-center justify-center relative group glass-panel shadow-sm cursor-pointer font-semibold"
              title={language === "en" ? "සිංහල භාෂාවට මාරු වන්න" : "Switch to English"}
            >
              {language === "en" ? "සිංහල" : "EN"}
            </button>
            <button
              onClick={toggleTheme}
              className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 min-w-10 min-h-10 flex items-center justify-center relative group"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:rotate-12">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 relative min-w-10 min-h-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
            </button>
            <button className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 min-w-10 min-h-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
            <button
              onClick={() => {
                localStorage.setItem("isTerminalLocked", "true");
                setIsLocked(true);
              }}
              className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
              title={language === "en" ? "Lock Terminal" : "පර්යන්තය අගුළු ලන්න"}
            >
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </button>
            <button className="p-xs text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 flex items-center gap-xs pl-sm pr-xs border border-outline-variant/60 ml-xs min-h-10 rounded-2xl">
              <span className="font-label-md text-label-md mr-xs hidden lg:block text-on-surface font-semibold">
                {userLabel}
              </span>
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px] text-primary">account_circle</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-hidden flex flex-col mt-sm">
          {children}
        </div>
      </div>

      {/* Numerical lock screen overlay */}
      <LockScreen
        isOpen={isLocked}
        onUnlock={handleUnlock}
        onLogout={handleLogout}
      />
    </div>
  );
}
