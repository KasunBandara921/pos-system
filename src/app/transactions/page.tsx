"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Shell from "../components/Shell";
import { getTransactions } from "../actions/transactions";
import type { TransactionRecord } from "../types";
import { useLanguage } from "../context/LanguageContext";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (value: number) => `Rs. ${value.toFixed(2)}`;

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalOrders = transactions.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cashOrders = transactions.filter((transaction) => transaction.paymentMethod === "Cash").length;

  if (isLoading) {
    return (
      <Shell>
        <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg animate-pulse">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-md card-elevated p-lg">
            <div className="space-y-2 w-48">
              <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
              <div className="h-4 bg-surface-container rounded"></div>
            </div>
            <div className="h-10 bg-surface-container rounded w-32"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-elevated p-lg h-24 flex flex-col justify-between">
                <div className="h-4 bg-surface-container rounded w-1/3"></div>
                <div className="h-6 bg-surface-container-high rounded w-2/3"></div>
              </div>
            ))}
          </div>

          <div className="card-elevated h-96 p-lg flex flex-col justify-between">
            <div className="h-6 bg-surface-container rounded w-1/4"></div>
            <div className="flex-1 bg-surface-container-low rounded-xl mt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-container-high/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg animate-fade-in animate-rise-in">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-md card-elevated p-lg">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">{t("transactionsTitle")}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("transactionsSubtitle")}
            </p>
          </div>
          <Link
            href="/"
            className="btn-primary font-label-md py-sm px-md rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-11"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            {t("newSale")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
          <div className="card-elevated p-lg hover:-translate-y-0.5 transition-transform duration-300">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("totalRevenue")}</p>
            <h3 className="font-display-price text-display-price text-on-surface">{formatCurrency(totalRevenue)}</h3>
          </div>
          <div className="card-elevated p-lg hover:-translate-y-0.5 transition-transform duration-300">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("totalOrders")}</p>
            <h3 className="font-display-price text-display-price text-on-surface">{totalOrders}</h3>
          </div>
          <div className="card-elevated p-lg hover:-translate-y-0.5 transition-transform duration-300">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("averageOrder")}</p>
            <h3 className="font-display-price text-display-price text-on-surface">{formatCurrency(averageOrder)}</h3>
          </div>
          <div className="card-elevated p-lg hover:-translate-y-0.5 transition-transform duration-300">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("cashPayments")}</p>
            <h3 className="font-display-price text-display-price text-on-surface">{cashOrders}</h3>
          </div>
        </div>

        <section className="card-elevated overflow-hidden animate-fade-in animate-rise-in">
          <div className="px-lg py-md border-b border-outline-variant/60 bg-linear-to-r from-primary/5 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">{t("salesHistory")}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {t("latestTransactions")}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm border border-primary/20">
              {totalOrders} {t("savedSales")}
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-240">
                <thead className="bg-surface-container-low border-b border-outline-variant font-label-md text-label-md text-on-surface-variant">
                  <tr>
                    <th className="p-md font-semibold">{t("colOrder")}</th>
                    <th className="p-md font-semibold">{t("colTime")}</th>
                    <th className="p-md font-semibold text-right">{t("colItems")}</th>
                    <th className="p-md font-semibold">{t("colPayment")}</th>
                    <th className="p-md font-semibold text-right">{t("colSubtotal")}</th>
                    <th className="p-md font-semibold text-right">{t("colTax")}</th>
                    <th className="p-md font-semibold text-right">{t("colTotal")}</th>
                    <th className="p-md font-semibold text-right">{t("colChange")}</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} formatDateTime={formatDateTime} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-xl text-center flex flex-col items-center justify-center gap-sm">
              <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">receipt_long</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">{t("noTransactionsYet")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                {t("completeSaleInstruction")}
              </p>
              <Link
                href="/"
                className="mt-2 btn-primary font-label-md py-sm px-md rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-11 cursor-pointer"
              >
                {t("goToCheckout")}
              </Link>
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}

function TransactionRow({
  transaction,
  formatDateTime,
}: {
  transaction: TransactionRecord;
  formatDateTime: (val: string) => string;
}) {
  const itemPreview = transaction.items.slice(0, 2).map((item) => item.name).join(", ");
  const itemCount = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
      <td className="p-md">
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-on-surface font-semibold">{transaction.orderId}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant truncate max-w-60">
            {itemPreview}
            {transaction.items.length > 2 ? "..." : ""}
          </span>
        </div>
      </td>
      <td className="p-md font-label-sm text-label-sm text-on-surface-variant">{formatDateTime(transaction.createdAt)}</td>
      <td className="p-md text-right font-mono-data text-mono-data">{itemCount}</td>
      <td className="p-md">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant">
          {transaction.paymentMethod}
        </span>
      </td>
      <td className="p-md text-right font-mono-data">Rs. {transaction.subtotal.toFixed(2)}</td>
      <td className="p-md text-right font-mono-data">Rs. {transaction.tax.toFixed(2)}</td>
      <td className="p-md text-right font-semibold text-primary">Rs. {transaction.total.toFixed(2)}</td>
      <td className="p-md text-right font-mono-data">Rs. {transaction.changeDue.toFixed(2)}</td>
    </tr>
  );
}
