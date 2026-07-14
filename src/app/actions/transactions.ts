"use server";

import db from "../../lib/db";
import { TransactionItem, TransactionRecord } from "../types";

type CreateTransactionInput = {
  orderId: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountTendered: number;
  changeDue: number;
};

export async function createTransaction(input: CreateTransactionInput): Promise<TransactionRecord> {
  const prisma = db as any;
  const transaction = await prisma.saleTransaction.create({
    data: {
      orderId: input.orderId,
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      paymentMethod: input.paymentMethod,
      amountTendered: input.amountTendered,
      changeDue: input.changeDue,
    },
  });

  return {
    id: transaction.id,
    orderId: transaction.orderId,
    items: transaction.items as TransactionItem[],
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    amountTendered: transaction.amountTendered,
    changeDue: transaction.changeDue,
    createdAt: transaction.createdAt.toISOString(),
  };
}

export async function getTransactions(): Promise<TransactionRecord[]> {
  const prisma = db as any;
  const transactions = await prisma.saleTransaction.findMany({
    orderBy: { createdAt: "desc" },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    orderId: transaction.orderId,
    items: transaction.items as TransactionItem[],
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    amountTendered: transaction.amountTendered,
    changeDue: transaction.changeDue,
    createdAt: transaction.createdAt.toISOString(),
  }));
}