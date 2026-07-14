"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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

  const handleNewSale = () => {
    if (onNewSaleClick) {
      onNewSaleClick();
    } else {
      router.push("/?newSale=true");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-background text-on-background">
      {/* Side Navigation Bar */}
      <nav className="bg-surface/95 dark:bg-surface-container-high/95 backdrop-blur-md border-r border-outline-variant h-[calc(100vh-1.5rem)] w-64 flex flex-col fixed left-3 top-3 z-40 transition-colors duration-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Store Details */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-lowest/70">
          <div className="flex items-center gap-sm mb-md">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md shadow-sm">
              <span className="material-symbols-outlined fill">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed leading-tight tracking-tight">
                Lewdeniya Stores
              </h1>
            </div>
          </div>
          <button
            onClick={handleNewSale}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md py-sm px-md rounded-full flex items-center justify-center gap-xs transition-all shadow-sm active:scale-95 min-h-11"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Sale
          </button>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 py-md overflow-y-auto">
          <ul className="space-y-xs px-sm font-body-md text-body-md">
            <li>
              <Link
                href="/"
                className={`flex items-center gap-sm px-md py-sm rounded-2xl transition-all duration-200 min-h-11 ${
                  pathname === "/"
                    ? "text-primary dark:text-primary-fixed-dim font-bold bg-primary-container/10 ring-1 ring-primary/20 shadow-sm"
                    : "text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className={`material-symbols-outlined ${pathname === "/" ? "fill" : ""}`}>
                  shopping_cart
                </span>
                Checkout
              </Link>
            </li>
            <li>
              <Link
                href="/inventory"
                className={`flex items-center gap-sm px-md py-sm rounded-2xl transition-all duration-200 min-h-11 ${
                  pathname === "/inventory"
                    ? "text-primary dark:text-primary-fixed-dim font-bold bg-primary-container/10 ring-1 ring-primary/20 shadow-sm"
                    : "text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className={`material-symbols-outlined ${pathname === "/inventory" ? "fill" : ""}`}>
                  inventory_2
                </span>
                Inventory
              </Link>
            </li>
            <li>
              <Link
                href="/reports"
                className={`flex items-center gap-sm px-md py-sm rounded-2xl transition-all duration-200 min-h-11 ${
                  pathname === "/reports"
                    ? "text-primary dark:text-primary-fixed-dim font-bold bg-primary-container/10 ring-1 ring-primary/20 shadow-sm"
                    : "text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className={`material-symbols-outlined ${pathname === "/reports" ? "fill" : ""}`}>
                  bar_chart
                </span>
                Reports
              </Link>
            </li>
          </ul>

          {/* Suspended Sales Section */}
          {suspendedCarts && suspendedCarts.length > 0 && pathname === "/" && (
            <div className="mt-lg px-md">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">
                Suspended Sales ({suspendedCarts.length})
              </p>
              <div className="flex flex-col gap-xs max-h-40 overflow-y-auto">
                {suspendedCarts.map((sc, index) => {
                  const scTotal = sc.reduce((s, item) => s + item.product.price * item.quantity, 0) * 1.085;
                  return (
                    <button
                      key={index}
                      onClick={() => onResumeCart && onResumeCart(index)}
                      className="text-left w-full p-sm rounded-2xl border border-outline-variant bg-surface hover:bg-surface-container flex items-center justify-between text-xs transition-all shadow-sm"
                    >
                      <span className="truncate text-on-surface">Order #{index + 1}</span>
                      <span className="font-mono text-primary font-bold">${scTotal.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="p-sm border-t border-outline-variant bg-surface-container-lowest/70">
          <ul className="space-y-xs font-body-md text-body-md">
            <li>
              <Link
                href="#"
                className="flex items-center gap-sm px-md py-sm rounded-2xl text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 min-h-11"
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="flex items-center gap-sm px-md py-sm rounded-2xl text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 min-h-11"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-68 bg-background pr-3 py-3">
        {/* Top Header Bar */}
        <header className="bg-surface/95 dark:bg-surface-dim/95 backdrop-blur-md border border-outline-variant flex justify-between items-center w-full px-lg py-sm sticky top-3 z-30 h-18 rounded-2xl shadow-sm">
          <div className="flex items-center gap-md flex-1">
            {/* Search Input conditional on callback */}
            {onSearchChange ? (
              <div className="relative w-full max-w-112 hidden sm:block">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  className="w-full pl-xl pr-sm py-xs bg-surface-container-lowest border border-outline-variant rounded-full font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-10"
                  placeholder={
                    pathname === "/inventory"
                      ? "Search products, SKUs..."
                      : "Search products, SKUs, or barcodes..."
                  }
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
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
          <div className="flex items-center gap-sm">
            <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 relative min-w-10 min-h-10 flex items-center justify-center">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 min-w-10 min-h-10 flex items-center justify-center">
              <span className="material-symbols-outlined">help</span>
            </button>
            <button className="p-xs text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 flex items-center gap-xs pl-sm pr-xs border border-outline-variant ml-xs min-h-10 rounded-full">
              <span className="font-label-md text-label-md mr-xs hidden lg:block text-on-surface font-semibold">
                Store Manager
              </span>
              <span className="material-symbols-outlined text-[28px]">account_circle</span>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
