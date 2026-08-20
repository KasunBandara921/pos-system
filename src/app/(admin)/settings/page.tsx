"use client";

import React, { useState, useEffect } from "react";
import Shell from "../../components/Shell";
import {
  getSystemSettings,
  updateSystemSettings,
  getDiscountRules,
  createDiscountRule,
  deleteDiscountRule,
  DiscountRuleData,
} from "../../actions/settings";
import { useLanguage } from "../../context/LanguageContext";

export default function SettingsPage() {
  const { language } = useLanguage();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isRuleSubmitting, setIsRuleSubmitting] = useState(false);

  // System General Settings State
  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [spendingLimitEnabled, setSpendingLimitEnabled] = useState<boolean>(false);

  // Tiered Rules List State
  const [rules, setRules] = useState<DiscountRuleData[]>([]);

  // Add Rule Form State
  const [newMinSubtotal, setNewMinSubtotal] = useState("");
  const [newDiscountType, setNewDiscountType] = useState("percentage");
  const [newDiscountValue, setNewDiscountValue] = useState("");

  // Status State
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ruleError, setRuleError] = useState("");

  // Load and verify session
  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem("userRole");
    setCurrentRole(savedRole);
    if (savedRole !== "manager") {
      window.location.href = "/";
      return;
    }

    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const generalData = await getSystemSettings();
      setTaxRate(generalData.taxRate);
      setSpendingLimitEnabled(generalData.spendingLimitEnabled);

      const rulesData = await getDiscountRules();
      setRules(rulesData);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(language === "en" ? "Failed to load settings." : "සැකසුම් පූරණය කිරීමට අපොහොසත් විය.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reloadRulesList() {
    try {
      const data = await getDiscountRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to reload discount rules:", err);
    }
  }

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (taxRate < 0 || taxRate > 100) {
      setError(language === "en" ? "Tax rate must be between 0 and 100%." : "බදු ප්‍රතිශතය 0% සහ 100% අතර විය යුතුය.");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const res = await updateSystemSettings({
        taxRate,
        spendingLimitEnabled,
        // Pass dummy values for unused single rules fields in db to satisfy interface
        spendingLimit: 0,
        spendingDiscountType: "percentage",
        spendingDiscountValue: 0,
      });

      if (res.success) {
        setSuccessMessage(
          language === "en"
            ? "General settings updated successfully."
            : "පොදු සැකසුම් සාර්ථකව යාවත්කාලීන කරන ලදී."
        );
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setError(res.error || (language === "en" ? "Failed to save settings." : "සැකසුම් සුරැකීමට අපොහොසත් විය."));
      }
    } catch (err) {
      setError("System database error.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError("");
    setSuccessMessage("");

    const limitVal = parseFloat(newMinSubtotal);
    const discountVal = parseFloat(newDiscountValue);

    if (isNaN(limitVal) || limitVal <= 0) {
      setRuleError(language === "en" ? "Threshold limit must be positive." : "අවම මුදල් සීමාව ධන අගයක් විය යුතුය.");
      return;
    }

    if (isNaN(discountVal) || discountVal <= 0) {
      setRuleError(language === "en" ? "Discount value must be positive." : "වට්ටම් අගය ධන අගයක් විය යුතුය.");
      return;
    }

    if (newDiscountType === "percentage" && discountVal > 100) {
      setRuleError(language === "en" ? "Discount percentage cannot exceed 100%." : "වට්ටම් ප්‍රතිශතය 100% නොඉක්මවිය යුතුය.");
      return;
    }

    setIsRuleSubmitting(true);
    try {
      const res = await createDiscountRule(limitVal, newDiscountType, discountVal);
      if (res.success) {
        setNewMinSubtotal("");
        setNewDiscountValue("");
        setNewDiscountType("percentage");
        await reloadRulesList();
      } else {
        setRuleError(res.error || "Failed to create rule.");
      }
    } catch (err) {
      setRuleError("System database error.");
    } finally {
      setIsRuleSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string, minSubtotal: number) => {
    const confirmMessage = language === "en"
      ? `Are you sure you want to delete the discount rule for Rs. ${minSubtotal.toFixed(2)} spending threshold?`
      : `රු. ${minSubtotal.toFixed(2)} මිලදී ගැනීමේ සීමා වට්ටම් රීතිය ඉවත් කිරීමට අවශ්‍ය බව සහතිකද?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await deleteDiscountRule(id);
      if (res.success) {
        await reloadRulesList();
      } else {
        alert(res.error || "Failed to delete rule.");
      }
    } catch (err) {
      alert("Error deleting rule.");
    }
  };

  if (currentRole !== "manager") return null;

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg animate-fade-in">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-elevated p-lg">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              {language === "en" ? "System Settings" : "පද්ධති සැකසුම්"}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {language === "en"
                ? "Configure tax calculations and define multiple automatic spending limit discounts."
                : "බදු ගණනය කිරීම් සහ ස්වයංක්‍රීය මිලදී ගැනීමේ සීමා වට්ටම් වින්‍යාස කරන්න."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-sm card-elevated bg-surface">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="text-on-surface-variant text-sm font-label-md">
              {language === "en" ? "Loading configuration..." : "වින්‍යාසයන් පූරණය වෙමින්..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            {error && (
              <div className="p-sm bg-error/10 text-error border border-error/20 rounded-2xl text-xs font-semibold leading-relaxed animate-shake">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-sm bg-primary/10 text-primary border border-primary/20 rounded-2xl text-xs font-semibold leading-relaxed animate-fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
              {/* Left Column: General Configurations */}
              <div className="lg:col-span-1 flex flex-col gap-lg">
                <form onSubmit={handleSaveGeneralSettings} className="card-elevated p-lg flex flex-col gap-md bg-surface">
                  <div className="flex items-center gap-sm border-b border-outline-variant/60 pb-sm">
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">percent</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md font-bold">
                      {language === "en" ? "Tax & General" : "බදු සහ පොදු සැකසුම්"}
                    </h3>
                  </div>

                  {/* General Tax Rate */}
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      {language === "en" ? "General Sales Tax Rate (%)" : "පොදු විකුණුම් බදු අනුපාතය (%)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 8.5"
                      className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 font-mono font-bold"
                    />
                    <p className="text-[11px] text-on-surface-variant opacity-75 mt-0.5">
                      {language === "en"
                        ? "This percentage is applied to the post-discount subtotal during checkout."
                        : "මෙම ප්‍රතිශතය පියවීම් වලදී වට්ටම් අඩු කිරීමෙන් පසු මුළු මුදලට එකතු වේ."}
                    </p>
                  </div>

                  {/* Toggle Spending Limits Enabled */}
                  <div className="border-t border-outline-variant/40 pt-md mt-xs">
                    <label className="flex items-center gap-sm cursor-pointer p-xs hover:bg-surface-container-low rounded-2xl transition-colors">
                      <input
                        type="checkbox"
                        checked={spendingLimitEnabled}
                        onChange={(e) => setSpendingLimitEnabled(e.target.checked)}
                        className="w-5 h-5 accent-primary rounded-lg cursor-pointer"
                      />
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        {language === "en"
                          ? "Enable Automatic Spending Discounts"
                          : "මිලදී ගැනීමේ සීමා වට්ටම් සක්‍රීය කරන්න"}
                      </span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="btn-primary text-white font-label-md py-md rounded-2xl transition-all min-h-12 cursor-pointer font-semibold flex items-center justify-center gap-xs active:scale-[0.98] mt-sm"
                  >
                    {isSubmitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {language === "en" ? "Saving..." : "සුරැකෙමින්..."}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        {language === "en" ? "Save General" : "සුරකින්"}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Spending Limit Rules Setup */}
              <div className="lg:col-span-2 flex flex-col gap-lg">
                {spendingLimitEnabled ? (
                  <div className="grid grid-cols-1 gap-lg">
                    
                    {/* Add Rule Form */}
                    <form onSubmit={handleCreateRule} className="card-elevated p-lg flex flex-col gap-md bg-surface">
                      <div className="flex items-center gap-sm border-b border-outline-variant/60 pb-sm">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">add_box</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md font-bold">
                          {language === "en" ? "Create Spending Discount Rule" : "නව මිලදී ගැනීමේ වට්ටම් රීතියක් එක් කරන්න"}
                        </h3>
                      </div>

                      {ruleError && (
                        <div className="p-sm bg-error/10 text-error border border-error/20 rounded-2xl text-xs font-semibold leading-relaxed animate-shake">
                          {ruleError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-sm items-end">
                        {/* Minimum Spending limit */}
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                            {language === "en" ? "Min Spending (Rs.)" : "අවම මිලදී ගැනීම (රු.)"}
                          </label>
                          <input
                            type="number"
                            step="1"
                            required
                            min="1"
                            value={newMinSubtotal}
                            onChange={(e) => setNewMinSubtotal(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 font-mono font-semibold"
                          />
                        </div>

                        {/* Discount Type */}
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                            {language === "en" ? "Discount Type" : "වට්ටම් වර්ගය"}
                          </label>
                          <select
                            value={newDiscountType}
                            onChange={(e) => setNewDiscountType(e.target.value)}
                            className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 cursor-pointer font-semibold text-on-surface"
                          >
                            <option value="percentage">{language === "en" ? "Percentage (%)" : "ප්‍රතිශතය (%)"}</option>
                            <option value="fixed">{language === "en" ? "Fixed Amount (Rs.)" : "ස්ථාවර මුදල (රු.)"}</option>
                          </select>
                        </div>

                        {/* Discount Value */}
                        <div className="flex flex-col gap-xs">
                          <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                            {language === "en" ? "Discount Value" : "වට්ටම් වටිනාකම"}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            min="0.01"
                            value={newDiscountValue}
                            onChange={(e) => setNewDiscountValue(e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full bg-surface border border-outline-variant text-on-surface rounded-2xl px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-11 font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isRuleSubmitting}
                        className="btn-primary text-white font-label-md py-md rounded-2xl transition-all min-h-12 cursor-pointer font-semibold flex items-center justify-center gap-xs active:scale-[0.98] mt-sm w-full md:w-auto self-end md:px-lg"
                      >
                        {isRuleSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            {language === "en" ? "Adding..." : "එක්කරමින්..."}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {language === "en" ? "Add Discount Rule" : "වට්ටම් රීතිය එක් කරන්න"}
                          </>
                        )}
                      </button>
                    </form>

                    {/* Active Rules List */}
                    <div className="card-elevated p-lg flex flex-col gap-md bg-surface overflow-hidden">
                      <div className="flex items-center gap-sm border-b border-outline-variant/60 pb-sm">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">table_chart</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md font-bold">
                          {language === "en" ? "Active Spending Limit Rules" : "සක්‍රීය මිලදී ගැනීමේ සීමා වට්ටම් රීති"}
                        </h3>
                      </div>

                      {rules.length === 0 ? (
                        <div className="py-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
                          <span className="material-symbols-outlined text-4xl">rule_folder</span>
                          <p className="font-label-md text-label-md">
                            {language === "en" ? "No discount rules configured." : "කිසිදු වට්ටම් රීතියක් සකසා නොමැත."}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                                <th className="px-lg py-md">{language === "en" ? "Min Spending Limit" : "අවම මිලදී ගැනීම"}</th>
                                <th className="px-lg py-md">{language === "en" ? "Discount Rate/Value" : "වට්ටම් වටිනාකම"}</th>
                                <th className="px-lg py-md text-right">{language === "en" ? "Actions" : "ක්‍රියාමාර්ග"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/40 font-body-md text-body-md text-on-surface">
                              {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-surface-container-low/40 transition-colors">
                                  <td className="px-lg py-md font-semibold font-mono">Rs. {rule.minSubtotal.toFixed(2)}</td>
                                  <td className="px-lg py-md">
                                    {rule.discountType === "percentage" ? (
                                      <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                        {rule.discountValue}% {language === "en" ? "Discount" : "වට්ටම"}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary">
                                        Rs. {rule.discountValue.toFixed(2)} {language === "en" ? "Fixed" : "ස්ථාවර"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-lg py-md text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRule(rule.id, rule.minSubtotal)}
                                      className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center min-w-9 min-h-9"
                                      title={language === "en" ? "Delete Rule" : "රීතිය ඉවත් කරන්න"}
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card-elevated p-xl bg-surface border border-dashed border-outline-variant/80 rounded-3xl flex flex-col items-center justify-center text-center gap-sm py-20">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-45">price_change</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
                      {language === "en" ? "Spending Discounts Disabled" : "මිලදී ගැනීමේ වට්ටම් අක්‍රීය කර ඇත"}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                      {language === "en"
                        ? "Toggle 'Enable Automatic Spending Discounts' on the left to set up customized rules."
                        : "ස්වයංක්‍රීය මිලදී ගැනීමේ සීමා වට්ටම් රීති සැකසීම සඳහා වම් පස ඇති බොත්තම සක්‍රීය කරන්න."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </Shell>
  );
}
