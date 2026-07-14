"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { CATEGORIES } from "../mockData";
import { useLanguage } from "../context/LanguageContext";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
}

const COMMON_ICONS = [
  "shopping_bag",
  "local_drink",
  "water_drop",
  "coffee",
  "eco",
  "egg",
  "breakfast_dining",
  "bakery_dining",
  "cookie",
  "spa",
  "flatware",
  "grain",
];

export default function ProductModal({
  isOpen,
  onClose,
  product = null,
  onSave,
}: ProductModalProps) {
  const { language, t } = useLanguage();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("/ea");
  const [category, setCategory] = useState("Fresh Produce");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [icon, setIcon] = useState("shopping_bag");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setUnit(product.unit);
      setCategory(product.category);
      setStock(product.stock.toString());
      setSku(product.sku);
      setSupplier(product.supplier);
      setIcon(product.icon || "shopping_bag");
      setImage(product.image || "");
    } else {
      setName("");
      setPrice("");
      setUnit("/ea");
      setCategory("Fresh Produce");
      setStock("");
      setSku("");
      setSupplier("");
      setIcon("shopping_bag");
      setImage("");
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !stock || !sku || !supplier) {
      alert(
        language === "en"
          ? "Please fill in all required fields."
          : "කරුණාකර අවශ්‍ය සියලුම තොරතුරු ඇතුළත් කරන්න."
      );
      return;
    }

    const savedProduct: Product = {
      id: product?.id || `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      price: parseFloat(price) || 0,
      unit,
      category,
      stock: parseInt(stock) || 0,
      sku,
      supplier,
      icon,
      image: image || undefined,
    };

    onSave(savedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-sm animate-fade-in">
      <div className="glass-panel rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.2)] w-full max-w-128 max-h-[90vh] overflow-hidden flex flex-col animate-rise-in">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant/60 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/15 to-primary-container/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">
                {product ? "edit_note" : "add_box"}
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              {product ? t("editProductDetails") : t("addNewProduct")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-lg flex flex-col gap-md">
          {/* Row 1: Product Name */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
              {t("productName")} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === "en" ? "e.g. Organic Honey 500g" : "උදා: කාබනික මී පැණි 500g"}
              className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
            />
          </div>

          {/* Row 2: SKU & Supplier */}
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("skuBarcode")} *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. HON-ORG-005"
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("supplier")} *
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder={language === "en" ? "Supplier Name" : "සැපයුම්කරුගේ නම"}
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              />
            </div>
          </div>

          {/* Row 3: Category & Icon */}
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("category")} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              >
                {CATEGORIES.filter((c) => c !== "All Items").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("displayIcon")}
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              >
                {COMMON_ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Price, Unit & Stock */}
          <div className="grid grid-cols-3 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("priceRs")} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("unit")} *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              >
                <option value="/ea">{language === "en" ? "/ea (Each)" : "/ea (එකක්)"}</option>
                <option value="/kg">{language === "en" ? "/kg (Kilogram)" : "/kg (කිලෝග්‍රෑම්)"}</option>
                <option value="/pack">{language === "en" ? "/pack (Pack)" : "/pack (පැකට්)"}</option>
                <option value="/box">{language === "en" ? "/box (Box)" : "/box (පෙට්ටිය)"}</option>
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
                {t("stockQuantity")} *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
              />
            </div>
          </div>

          {/* Row 5: Optional Product Image URL */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base font-semibold">
              {t("productImageUrl")}
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-surface-container-low border border-outline-variant/60 text-on-surface font-body-md text-body-md rounded-2xl px-sm py-xs focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all min-h-10"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant/60 flex gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-surface-container-low border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container font-label-md text-label-md py-sm rounded-2xl transition-colors min-h-10 cursor-pointer font-semibold"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 btn-primary font-label-md text-label-md py-sm rounded-2xl flex items-center justify-center gap-xs transition-colors min-h-10 active:scale-[0.98] cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {t("saveDetails")}
          </button>
        </div>
      </div>
    </div>
  );
}
