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

  // Real-time Notifications states
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [activeToasts, setActiveToasts] = React.useState<any[]>([]);
  const [showBellMenu, setShowBellMenu] = React.useState(false);

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

  // Real-time event notifications listener (SSE EventSource)
  React.useEffect(() => {
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      if (event.data === "connected") return;
      try {
        const data = JSON.parse(event.data);
        const newId = Math.random().toString(36).substring(2, 9);
        
        const newNotif = {
          id: newId,
          productName: data.name,
          sku: data.sku,
          time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };

        setNotifications((prev) => [newNotif, ...prev]);

        // Add toast
        const toastTitle = language === "en" ? "Out of Stock Warning" : "තොග නොමැත අවවාදය";
        const toastText = language === "en"
          ? `Product "${data.name}" (SKU: ${data.sku}) has reached 0 stock.`
          : `"${data.name}" (SKU: ${data.sku}) භාණ්ඩයේ තොග අවසන් වී ඇත.`;

        const newToast = { id: newId, title: toastTitle, message: toastText };
        setActiveToasts((prev) => [...prev, newToast]);

        // Auto dismiss after 5s
        setTimeout(() => {
          setActiveToasts((prev) => prev.filter((t) => t.id !== newId));
        }, 5000);

      } catch (err) {
        console.error("Failed to parse stock notification event:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [language]);

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowBellMenu(false);
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
    { href: "/users", label: t("navUsers"), icon: "group" },
    { href: "/transactions", label: t("navTransactions"), icon: "receipt_long" },
  ].filter((link) => {
    if (role === "cashier" && (link.href === "/inventory" || link.href === "/reports" || link.href === "/users")) {
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
            {role === "manager" && (
              <li>
                <Link
                  href="/settings"
                  className={`flex items-center gap-sm px-md py-sm rounded-2xl transition-all duration-200 min-h-11 ${
                    pathname === "/settings"
                      ? "nav-active"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${pathname === "/settings" ? "fill" : ""}`}>settings</span>
                  {t("settings")}
                </Link>
              </li>
            )}
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
          <div className="flex items-center gap-xs relative">
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
            
            {/* Dynamic Notification Bell Button & Menu */}
            <div className="relative">
              <button
                onClick={() => setShowBellMenu(!showBellMenu)}
                className="p-xs rounded-2xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all duration-200 relative min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-error text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ring-2 ring-surface animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showBellMenu && (
                <div className="absolute right-0 top-12 w-80 bg-surface border border-outline-variant/60 rounded-3xl shadow-[0_16px_40px_rgba(15,23,42,0.12)] p-md flex flex-col gap-sm z-50 animate-rise-in text-on-surface">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-xs">
                    <span className="font-label-md text-label-md font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">notifications</span>
                      {language === "en" ? "Notifications" : "දැනුම්දීම්"}
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-primary hover:text-primary-container text-xs cursor-pointer font-semibold font-label-sm"
                      >
                        {language === "en" ? "Clear All" : "සියල්ල ඉවත් කරන්න"}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-xs max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-md text-center text-on-surface-variant/60 flex flex-col items-center justify-center gap-xs">
                        <span className="material-symbols-outlined text-3xl">notifications_off</span>
                        <p className="font-label-sm text-label-sm">
                          {language === "en" ? "No new alerts." : "නව අනතුරු ඇඟවීම් නැත."}
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-sm bg-surface-container-low rounded-2xl border border-outline-variant/40 flex items-start gap-xs text-xs"
                        >
                          <span className="material-symbols-outlined text-error shrink-0 text-sm mt-0.5 font-bold">warning</span>
                          <div className="flex-1">
                            <p className="font-semibold text-on-surface leading-snug">
                              {language === "en" ? `Out of stock: ${n.productName}` : `තොග අවසන්: ${n.productName}`}
                            </p>
                            <p className="text-[10px] text-on-surface-variant/80 mt-0.5">
                              SKU: {n.sku} • {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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

      {/* Sliding Toasts Container */}
      <div className="fixed top-22 right-4 z-50 flex flex-col gap-sm w-full max-w-96 pointer-events-none">
        {activeToasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-surface border-l-4 border-error text-on-surface card-elevated p-md rounded-2xl flex items-start gap-sm animate-slide-in-right shadow-[0_16px_40px_rgba(239,68,68,0.12)] border border-outline-variant/60"
          >
            <div className="w-8 h-8 rounded-xl bg-error/15 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[20px] fill">warning</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label-md text-label-md font-bold text-on-surface leading-tight">
                {t.title}
              </h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => handleDismissToast(t.id)}
              className="text-on-surface-variant hover:text-on-surface p-0.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Numerical lock screen overlay */}
      <LockScreen
        isOpen={isLocked}
        onUnlock={handleUnlock}
        onLogout={handleLogout}
      />
    </div>
  );
}
