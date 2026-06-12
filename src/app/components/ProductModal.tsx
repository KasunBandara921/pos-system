"use client";

import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { CATEGORIES } from "../mockData";

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
      alert("Please fill in all required fields.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-sm">
      <div className="bg-surface-container-lowest bg-white dark:bg-[#1e293b] border border-outline-variant rounded-xl shadow-xl w-full max-w-[512px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-lg py-md border-b border-outline-variant bg-surface flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-2xl">
              {product ? "edit_note" : "add_box"}
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {product ? "Edit Product Details" : "Add New Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-xs rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-lg flex flex-col gap-md">
          {/* Row 1: Product Name */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Honey 500g"
              className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
            />
          </div>

          {/* Row 2: SKU & Supplier */}
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                SKU Barcode *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. HON-ORG-005"
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Supplier *
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier Name"
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              />
            </div>
          </div>

          {/* Row 3: Category & Icon */}
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              >
                {CATEGORIES.filter((c) => c !== "All Items").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Display Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
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
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              >
                <option value="/ea">/ea (Each)</option>
                <option value="/kg">/kg (Kilogram)</option>
                <option value="/pack">/pack (Pack)</option>
                <option value="/box">/box (Box)</option>
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
                Quantity in Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
              />
            </div>
          </div>

          {/* Row 5: Optional Product Image URL */}
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-base">
              Product Image URL (Optional)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full bg-surface border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg px-sm py-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all min-h-[40px]"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-lg py-md border-t border-outline-variant bg-surface flex gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md py-sm rounded-lg transition-colors min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm rounded-lg flex items-center justify-center gap-xs transition-colors shadow-sm min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
}
