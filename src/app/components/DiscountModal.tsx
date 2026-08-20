"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (type: "percentage" | "fixed", value: number) => void;
  onRemove: () => void;
  currentDiscountType: "percentage" | "fixed";
  currentDiscountValue: number;
}

export default function DiscountModal({
  isOpen,
  onClose,
  onApply,
  onRemove,
  currentDiscountType,
  currentDiscountValue,
}: DiscountModalProps) {
  const { language } = useLanguage();
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setType(currentDiscountType);
      setValue(currentDiscountValue > 0 ? currentDiscountValue.toString() : "");
    }
  }, [isOpen, currentDiscountType, currentDiscountValue]);

  if (!isOpen) return null;

  const handlePresetClick = (preset: number) => {
    setType("percentage");
    setValue(preset.toString());
  };

  const handleApply = () => {
    const parsedValue = parseFloat(value) || 0;
    if (parsedValue < 0) {
      alert(
        language === "en"
          ? "Discount cannot be negative."
          : "වට්ටම සෘණ අගයක් විය නොහැක."
      );
      return;
    }

    if (type === "percentage" && parsedValue > 100) {
      alert(
        language === "en"
          ? "Percentage discount cannot exceed 100%."
          : "ප්‍රතිශත වට්ටම 100% නොඉක්මවිය යුතුය."
      );
      return;
    }

    onApply(type, parsedValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-sm animate-fade-in">
      <div className="glass-panel rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.2)] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant/60 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">sell</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              {language === "en" ? "Custom Discount" : "අභිරුචි වට්ටම්"}
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
        <div className="p-lg flex flex-col gap-md">
          {/* Discount Type Selector */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {language === "en" ? "Discount Type" : "වට්ටම් වර්ගය"}
            </label>
            <div className="grid grid-cols-2 gap-sm">
              <button
                type="button"
                onClick={() => setType("percentage")}
                className={`py-sm rounded-2xl border font-label-md text-label-md transition-all flex items-center justify-center gap-xs cursor-pointer ${
                  type === "percentage"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">percent</span>
                {language === "en" ? "Percentage" : "ප්‍රතිශතය"}
              </button>
              <button
                type="button"
                onClick={() => setType("fixed")}
                className={`py-sm rounded-2xl border font-label-md text-label-md transition-all flex items-center justify-center gap-xs cursor-pointer ${
                  type === "fixed"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                {language === "en" ? "Fixed Amount" : "ස්ථාවර මුදල"}
              </button>
            </div>
          </div>

          {/* Discount Value Input */}
          <div className="flex flex-col gap-xs relative">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {language === "en" ? "Discount Value" : "වට්ටම් අගය"}
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "10" : "150.00"}
                className="w-full bg-surface-container-lowest border border-outline-variant/80 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-sm px-md font-body-md text-body-md text-on-surface transition-all placeholder:text-on-surface-variant/40 outline-none pr-10"
              />
              <span className="absolute right-4 font-bold text-on-surface-variant font-label-md text-label-md">
                {type === "percentage" ? "%" : "Rs."}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant font-semibold">
              {language === "en" ? "Quick Presets" : "ක්ෂණික සැකසුම්"}
            </label>
            <div className="flex gap-sm">
              {[5, 10, 15, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="flex-1 py-xs rounded-xl border border-outline-variant/60 bg-surface text-on-surface hover:border-primary/40 hover:bg-surface-container-low font-label-sm text-label-sm transition-all cursor-pointer"
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant/60 flex flex-col gap-sm bg-surface-container-low/40">
          <div className="flex gap-sm">
            <button
              onClick={onClose}
              className="flex-1 bg-surface border border-outline-variant/60 text-on-surface hover:bg-surface-container-low font-label-md text-label-md py-sm rounded-2xl min-h-11 transition-all cursor-pointer font-semibold"
            >
              {language === "en" ? "Cancel" : "අවලංගු කරන්න"}
            </button>
            <button
              onClick={handleApply}
              className="flex-1 btn-primary font-label-md text-label-md py-sm rounded-2xl min-h-11 active:scale-[0.98] cursor-pointer font-semibold"
            >
              {language === "en" ? "Apply" : "යොදන්න"}
            </button>
          </div>
          {currentDiscountValue > 0 && (
            <button
              onClick={onRemove}
              className="w-full bg-error/10 border border-error/30 text-error hover:bg-error/15 font-label-md text-label-md py-sm rounded-2xl min-h-11 transition-all cursor-pointer font-semibold flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {language === "en" ? "Remove Active Discount" : "සක්‍රිය වට්ටම ඉවත් කරන්න"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
