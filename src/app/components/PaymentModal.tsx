"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

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
  const { language } = useLanguage();
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
      alert(
        language === "en"
          ? "Insufficient cash tendered."
          : "ලැබුණු මුදල ප්‍රමාණවත් නොවේ."
      );
      return;
    }
    onComplete(paymentMethod, tendered);
  };

  const isCompleteDisabled =
    paymentMethod === "Cash" && (parseFloat(cashTendered) || 0) < totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-sm animate-fade-in">
      <div className="glass-panel rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.2)] w-full max-w-128 max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant/60 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              {language === "en" ? "Payment Checkout" : "ගෙවීම් පියවීම"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors min-w-10 min-h-10 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-lg flex-1 overflow-y-auto flex flex-col gap-md">
          {/* Amount Due Indicator */}
          <div className="bg-linear-to-br from-primary/5 to-primary-container/5 rounded-2xl p-md text-center border border-primary/10">
            <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-xs font-bold">
              {language === "en" ? "Amount Due" : "ගෙවිය යුතු මුදල"}
            </p>
            <p className="font-display-price text-display-price gradient-text font-bold">
              Rs. {totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Payment Method Selectors */}
          <div>
            <p className="font-label-md text-label-md text-on-surface mb-xs font-semibold">
              {language === "en" ? "Select Payment Method" : "ගෙවීම් ක්‍රමය තෝරන්න"}
            </p>
            <div className="grid grid-cols-3 gap-sm">
              {[
                { name: "Cash", enName: "Cash", siName: "මුදල්", icon: "payments" },
                { name: "Card", enName: "Card", siName: "කාඩ්පත්", icon: "credit_card" },
                { name: "Mobile", enName: "Mobile", siName: "ජංගම දුරකථන", icon: "phone_android" },
              ].map((method) => (
                <button
                  key={method.name}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`py-md px-sm rounded-2xl border flex flex-col items-center gap-xs transition-all active:scale-[0.98] min-h-20 cursor-pointer ${
                    paymentMethod === method.name
                      ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-[0_4px_12px_rgba(5,150,105,0.15)]"
                      : "bg-surface-container-low border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{method.icon}</span>
                  <span className="text-sm font-label-sm">{language === "en" ? method.enName : method.siName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Details Panel */}
          {paymentMethod === "Cash" && (
            <div className="flex flex-col gap-sm animate-fade-in">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                    {language === "en" ? "Cash Tendered (Rs)" : "ලැබුණු මුදල (රු)"}
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
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                    {language === "en" ? "Change Due (Rs)" : "ඉතිරි මුදල (රු)"}
                  </label>
                  <div className="w-full bg-surface border border-outline-variant text-error font-headline-md text-headline-md rounded-2xl px-md py-sm min-h-12 flex items-center">
                    Rs. {changeDue.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Cash Shortcuts */}
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs font-semibold">
                  {language === "en" ? "Quick Cash Input" : "ඉක්මන් මුදල් ඇතුළත් කිරීම්"}
                </p>
                <div className="flex flex-wrap gap-xs">
                  {[
                    { label: language === "en" ? "Exact" : "නියමිත මුදල", val: totalAmount },
                    { label: "Rs. 5", val: 5 },
                    { label: "Rs. 10", val: 10 },
                    { label: "Rs. 20", val: 20 },
                    { label: "Rs. 50", val: 50 },
                    { label: "Rs. 100", val: 100 },
                  ]
                    .filter((btn) => btn.val >= totalAmount || btn.label === (language === "en" ? "Exact" : "නියමිත මුදල"))
                    .map((btn, index) => (
                      <button
                        key={index}
                        onClick={() => handleCashShortcut(Number(btn.val.toFixed(2)))}
                        className="bg-surface border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md py-xs px-md rounded-full transition-colors min-h-9 shadow-sm cursor-pointer"
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
                  ? (language === "en" ? "Waiting for credit/debit card tap..." : "ක්‍රෙඩිට්/ඩෙබිට් කාඩ් පත ටැප් කරන තෙක් රැඳී සිටී...")
                  : (language === "en" ? "Scanning customer mobile wallet..." : "පාරිභෝගික ජංගම පසුම්බිය ස්කෑන් කරමින්...")}
              </p>
              <p className="text-xs text-on-surface-variant">
                {language === "en"
                  ? "The external card reader terminal is online."
                  : "බාහිර කාඩ්පත් කියවන පර්යන්තය සක්‍රීයයි."}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant/60 flex gap-sm">
          <button
            onClick={onClose}
            className="flex-1 bg-surface-container-low border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container font-label-md text-label-md py-md rounded-2xl transition-colors min-h-12 cursor-pointer font-semibold"
          >
            {language === "en" ? "Cancel" : "අවලංගු කරන්න"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isCompleteDisabled}
            className={`flex-1 font-headline-md text-headline-md py-md rounded-2xl flex items-center justify-center gap-xs transition-all min-h-12 cursor-pointer font-semibold ${
              isCompleteDisabled
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed border border-outline-variant/60"
                : "btn-primary active:scale-[0.98]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
            {language === "en" ? "Complete Payment" : "ගෙවීම සම්පූර්ණ කරන්න"}
          </button>
        </div>
      </div>
    </div>
  );
}
