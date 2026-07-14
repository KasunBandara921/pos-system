"use client";

import React, { useState } from "react";
import Shell from "../components/Shell";

export default function ReportsPage() {
  // Interactive states for date filters
  const [startDate, setStartDate] = useState("2023-10-01");
  const [endDate, setEndDate] = useState("2023-10-31");

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg">
        {/* Page Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-elevated p-lg">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Sales Reports</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Performance overview and transactional insights.
            </p>
          </div>
          <div className="flex items-center gap-2 glass-panel p-2 rounded-2xl">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2 text-on-surface-variant text-[18px]">
                calendar_month
              </span>
              <input
                className="pl-8 pr-2 py-xs bg-transparent border-none text-sm font-label-md text-on-surface focus:ring-0 cursor-pointer w-32.5 rounded-full"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="text-on-surface-variant font-label-md">-</span>
            <div className="relative flex items-center">
              <input
                className="pl-2 pr-2 py-xs bg-transparent border-none text-sm font-label-md text-on-surface focus:ring-0 cursor-pointer w-32.5 rounded-full"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="bg-surface-container hover:bg-surface-container-high text-on-surface p-xs rounded-full transition-colors ml-1 min-w-9 min-h-9 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* KPI Summary Cards (Top Row) */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-md">
            {/* Total Sales */}
            <div className="card-elevated p-lg relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl text-primary">payments</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Sales</p>
              <h3 className="font-display-price text-display-price gradient-text mb-2">Rs. 42,509.80</h3>
              <div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm bg-primary/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+12.5% vs last month</span>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="card-elevated p-lg relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl text-tertiary">receipt_long</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Average Order Value</p>
              <h3 className="font-display-price text-display-price text-on-surface mb-2">Rs. 84.50</h3>
              <div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm bg-primary/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+3.2% vs last month</span>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="card-elevated p-lg relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl text-secondary">shopping_bag</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Transactions</p>
              <h3 className="font-display-price text-display-price text-on-surface mb-2">503</h3>
              <div className="inline-flex items-center gap-1 text-error font-label-sm text-label-sm bg-error-container/50 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                <span>-1.8% vs last month</span>
              </div>
            </div>
          </div>

          {/* Main Chart Area (Daily Revenue) */}
          <div className="lg:col-span-8 card-elevated p-lg">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Daily Revenue Trends</h3>
              <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-full transition-colors min-w-9 min-h-9 flex items-center justify-center">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            {/* Faux Line Chart Visualization */}
            <div className="w-full h-64 relative flex items-end justify-between pt-8 pb-4 border-b border-outline-variant/30">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right pr-2 text-on-surface-variant font-mono-data text-mono-data text-[10px] opacity-70">
                <span>Rs. 3k</span>
                <span>Rs. 2k</span>
                <span>Rs. 1k</span>
                <span>Rs. 0</span>
              </div>
              {/* Grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                <div className="w-full h-px border-t border-dashed border-outline-variant/30"></div>
                <div className="w-full h-px border-t border-dashed border-outline-variant/30"></div>
                <div className="w-full h-px border-t border-dashed border-outline-variant/30"></div>
                <div className="w-full h-px border-t border-solid border-outline-variant/50"></div>
              </div>
              {/* Data Points (SVG for continuous line look) */}
              <div className="absolute left-12 right-0 top-0 bottom-8 overflow-hidden">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Gradient Fill under line */}
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--color-primary-container)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 L10,60 L20,70 L30,40 L40,50 L50,20 L60,35 L70,10 L80,30 L90,15 L100,5 L100,100 L0,100 Z"
                    fill="url(#chart-gradient)"
                  />
                  {/* The Line */}
                  <path
                    d="M0,80 L10,60 L20,70 L30,40 L40,50 L50,20 L60,35 L70,10 L80,30 L90,15 L100,5"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  {/* Data dots */}
                  <circle cx="50" cy="20" fill="var(--color-surface)" r="1.5" stroke="var(--color-primary)" strokeWidth={1} />
                  <circle cx="70" cy="10" fill="var(--color-surface)" r="1.5" stroke="var(--color-primary)" strokeWidth={1} />
                  <circle cx="100" cy="5" fill="var(--color-surface)" r="1.5" stroke="var(--color-primary)" strokeWidth={1} />
                </svg>
              </div>
              {/* X-axis labels (Dates) spacer */}
              <div className="w-full pl-12 flex justify-between absolute bottom-0 left-0 right-0 text-on-surface-variant font-mono-data text-[10px] opacity-70">
                <span>Oct 1</span>
                <span>Oct 8</span>
                <span>Oct 15</span>
                <span>Oct 22</span>
                <span>Oct 29</span>
              </div>
            </div>
          </div>

          {/* Top Selling Items (Bar Chart replacement) */}
          <div className="lg:col-span-4 card-elevated p-lg flex flex-col">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-md text-headline-md text-on-surface">Top Selling Items</h3>
              <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-full transition-colors min-w-9 min-h-9 flex items-center justify-center">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-sm justify-center">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">local_drink</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-md text-label-md text-on-surface">Premium Cola 2L</span>
                    <span className="font-mono-data text-mono-data text-on-surface">Rs. 1,240</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-linear-to-r from-primary to-primary-container h-2 rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">bakery_dining</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-md text-label-md text-on-surface">Artisan Sourdough</span>
                    <span className="font-mono-data text-mono-data text-on-surface">Rs. 980</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full opacity-80" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">egg</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-md text-label-md text-on-surface">Organic Eggs (Dozen)</span>
                    <span className="font-mono-data text-mono-data text-on-surface">Rs. 850</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full opacity-60" style={{ width: "55%" }}></div>
                  </div>
                </div>
              </div>
              {/* Item 4 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">icecream</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-label-md text-label-md text-on-surface">Vanilla Bean Pint</span>
                    <span className="font-mono-data text-mono-data text-on-surface">Rs. 620</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full opacity-40" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <button className="mt-md w-full py-xs text-primary font-label-md text-label-md hover:bg-surface-container rounded transition-colors text-center">
              View All Inventory Performance
            </button>
          </div>
        </div>
      </main>
    </Shell>
  );
}
