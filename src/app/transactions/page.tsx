import Link from "next/link";
import Shell from "../components/Shell";
import db from "../../lib/db";
import type { TransactionRecord } from "../types";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default async function TransactionsPage() {
  const prisma = db as any;
  const transactions = ((await prisma.saleTransaction.findMany({
    orderBy: { createdAt: "desc" },
  })) as Array<{
    id: string;
    orderId: string;
    items: unknown;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountTendered: number;
    changeDue: number;
    createdAt: Date;
  }>).map((transaction) => ({
    id: transaction.id,
    orderId: transaction.orderId,
    items: transaction.items as TransactionRecord["items"],
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    amountTendered: transaction.amountTendered,
    changeDue: transaction.changeDue,
    createdAt: transaction.createdAt.toISOString(),
  }));

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalOrders = transactions.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cashOrders = transactions.filter((transaction) => transaction.paymentMethod === "Cash").length;

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Transactions</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Every completed sale is saved here for review and audit.
            </p>
          </div>
          <Link
            href="/"
            className="bg-primary hover:bg-primary-container text-on-primary font-label-md py-sm px-md rounded-full flex items-center justify-center gap-xs transition-all shadow-sm active:scale-95 min-h-11"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            New Sale
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
          <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Revenue</p>
            <h3 className="font-display-price text-display-price text-on-surface">{formatCurrency(totalRevenue)}</h3>
          </div>
          <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Orders</p>
            <h3 className="font-display-price text-display-price text-on-surface">{totalOrders}</h3>
          </div>
          <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">Average Order</p>
            <h3 className="font-display-price text-display-price text-on-surface">{formatCurrency(averageOrder)}</h3>
          </div>
          <div className="bg-surface p-lg rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">Cash Payments</p>
            <h3 className="font-display-price text-display-price text-on-surface">{cashOrders}</h3>
          </div>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface/95 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Sales History</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Latest transactions appear first.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm">
              {totalOrders} saved sales
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-240">
                <thead className="bg-surface-container-low border-b border-outline-variant font-label-md text-label-md text-on-surface-variant">
                  <tr>
                    <th className="p-md font-semibold">Order</th>
                    <th className="p-md font-semibold">Time</th>
                    <th className="p-md font-semibold text-right">Items</th>
                    <th className="p-md font-semibold">Payment</th>
                    <th className="p-md font-semibold text-right">Subtotal</th>
                    <th className="p-md font-semibold text-right">Tax</th>
                    <th className="p-md font-semibold text-right">Total</th>
                    <th className="p-md font-semibold text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-xl text-center flex flex-col items-center justify-center gap-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">receipt_long</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">No transactions saved yet</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Complete a sale from the checkout screen and it will appear here automatically.
              </p>
              <Link
                href="/"
                className="mt-2 bg-primary hover:bg-primary-container text-on-primary font-label-md py-sm px-md rounded-full flex items-center justify-center gap-xs transition-all shadow-sm active:scale-95 min-h-11"
              >
                Go to Checkout
              </Link>
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionRecord }) {
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
      <td className="p-md text-right font-mono-data">${transaction.subtotal.toFixed(2)}</td>
      <td className="p-md text-right font-mono-data">${transaction.tax.toFixed(2)}</td>
      <td className="p-md text-right font-semibold text-primary">${transaction.total.toFixed(2)}</td>
      <td className="p-md text-right font-mono-data">${transaction.changeDue.toFixed(2)}</td>
    </tr>
  );
}
