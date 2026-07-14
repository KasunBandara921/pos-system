"use client";

import React, { useState, useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onComplete: (paymentMethod: string, amountTendered: number) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onComplete,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [changeDue, setChangeDue] = useState<number>(0);

  useEffect(() => {
    if (paymentMethod !== "Cash") {
      setCashTendered(totalAmount.toFixed(2));
      setChangeDue(0);
    } else {
      setCashTendered("");
      setChangeDue(0);
    }
  }, [paymentMethod, totalAmount]);

  useEffect(() => {
    if (paymentMethod === "Cash") {
      const tendered = parseFloat(cashTendered) || 0;
      if (tendered >= totalAmount) {
        setChangeDue(tendered - totalAmount);
      } else {
        setChangeDue(0);
      }
    }
  }, [cashTendered, paymentMethod, totalAmount]);

  if (!isOpen) return null;

  const handleCashShortcut = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleConfirm = () => {
    const tendered = parseFloat(cashTendered) || 0;
    if (paymentMethod === "Cash" && tendered < totalAmount) {
      alert("Insufficient cash tendered.");
      return;
    }
    onComplete(paymentMethod, tendered);
  };

  const isCompleteDisabled =
    paymentMethod === "Cash" && (parseFloat(cashTendered) || 0) < totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-sm">
      <div className="bg-surface-container-lowest dark:bg-[#1e293b] border border-outline-variant rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.18)] w-full max-w-128 max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant bg-surface flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-2xl">payments</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Payment Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors min-w-10 min-h-10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-lg flex-1 overflow-y-auto flex flex-col gap-md">
          {/* Amount Due Indicator */}
          <div className="bg-surface-container rounded-2xl p-md text-center border border-outline-variant/50 shadow-sm">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-xs">
              Amount Due
            </p>
            <p className="font-display-price text-display-price text-primary font-bold">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Payment Method Selectors */}
          <div>
            <p className="font-label-md text-label-md text-on-surface mb-xs">Select Payment Method</p>
            <div className="grid grid-cols-3 gap-sm">
              {[
                { name: "Cash", icon: "payments" },
                { name: "Card", icon: "credit_card" },
                { name: "Mobile", icon: "phone_android" },
              ].map((method) => (
                <button
                  key={method.name}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`py-md px-sm rounded-2xl border flex flex-col items-center gap-xs transition-all active:scale-[0.98] min-h-20 shadow-sm ${
                    paymentMethod === method.name
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{method.icon}</span>
                  <span className="text-sm font-label-sm">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Details Panel */}
          {paymentMethod === "Cash" && (
            <div className="flex flex-col gap-sm animate-fade-in">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                    Cash Tendered ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={totalAmount}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface border border-outline-variant text-on-surface font-headline-md text-headline-md rounded-2xl px-md py-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-12"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                    Change Due ($)
                  </label>
                  <div className="w-full bg-surface border border-outline-variant text-error font-headline-md text-headline-md rounded-2xl px-md py-sm min-h-12 flex items-center">
                    ${changeDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Cash Shortcuts */}
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Quick Cash Input</p>
                <div className="flex flex-wrap gap-xs">
                  {[
                    { label: "Exact", val: totalAmount },
                    { label: "$5.00", val: 5 },
                    { label: "$10.00", val: 10 },
                    { label: "$20.00", val: 20 },
                    { label: "$50.00", val: 50 },
                    { label: "$100.00", val: 100 },
                  ]
                    .filter((btn) => btn.val >= totalAmount || btn.label === "Exact")
                    .map((btn, index) => (
                      <button
                        key={index}
                        onClick={() => handleCashShortcut(Number(btn.val.toFixed(2)))}
                        className="bg-surface border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md py-xs px-md rounded-full transition-colors min-h-9 shadow-sm"
                      >
                        {btn.label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Card / Mobile Details Panel */}
          {paymentMethod !== "Cash" && (
            <div className="bg-surface-container rounded-2xl p-md text-center border border-outline-variant/40 animate-fade-in flex flex-col items-center justify-center gap-xs min-h-30 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
                {paymentMethod === "Card" ? "contactless" : "qr_code_2"}
              </span>
              <p className="font-label-md text-label-md text-on-surface">
                {paymentMethod === "Card"
                  ? "Waiting for credit/debit card tap..."
                  : "Scanning customer mobile wallet..."}
              </p>
              <p className="text-xs text-on-surface-variant">
                The external card reader terminal is online.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface flex gap-sm">
          <button
            onClick={onClose}
            className="flex-1 bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md py-md rounded-2xl transition-colors min-h-12"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isCompleteDisabled}
            className={`flex-1 font-headline-md text-headline-md py-md rounded-2xl flex items-center justify-center gap-xs transition-all shadow-sm min-h-12 ${
              isCompleteDisabled
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed border border-outline-variant"
                : "bg-primary hover:bg-primary-container text-on-primary active:scale-[0.98]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
