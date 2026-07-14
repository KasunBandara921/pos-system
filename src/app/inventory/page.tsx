"use client";

import React, { useState, useMemo, useEffect } from "react";
import Shell from "../components/Shell";
import ProductModal from "../components/ProductModal";
import { Product } from "../types";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../actions/products";
import { useLanguage } from "../context/LanguageContext";

export default function InventoryPage() {
  const { language, t } = useLanguage();

  // Inventory States
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInventory();
  }, []);

  const [selectedFilter, setSelectedFilter] = useState<"All" | "Out of Stock" | "Low Stock">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5); // 5 items per page for interactive testing

  // Add/Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick stats counts
  const stats = useMemo(() => {
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 15).length;
    return { outOfStock, lowStock, total: products.length };
  }, [products]);

  // Categories list derived from products dynamically
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["All Categories", ...cats];
  }, [products]);

  // Filter products list based on search, dropdown category, and status filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Dropdown Category filter
      const matchesCategory =
        selectedCategory === "All Categories" || p.category === selectedCategory;

      // 3. Status Button filter
      let matchesStatus = true;
      if (selectedFilter === "Out of Stock") {
        matchesStatus = p.stock === 0;
      } else if (selectedFilter === "Low Stock") {
        matchesStatus = p.stock > 0 && p.stock <= 15;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedFilter]);

  // Reset pagination to page 1 whenever filters or search query changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFilter]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirmMsg = language === "en"
      ? `Are you sure you want to delete "${productName}" from inventory?`
      : `මෙම භාණ්ඩය "${productName}" තොගයෙන් මැකීමට අවශ්‍ය බව ස්ථිරද?`;
    
    if (confirm(confirmMsg)) {
      try {
        await deleteProduct(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert(
          language === "en"
            ? "Failed to delete product from database. Removing locally for session testing."
            : "දත්ත සමුදායෙන් භාණ්ඩය මැකීමට අපොහොසත් විය. දේශීයව ඉවත් කරයි."
        );
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    setIsModalOpen(false);
    if (editingProduct) {
      // Edit mode: save to database
      try {
        const { id, ...updatedFields } = productData;
        const updatedProduct = await updateProduct(productData.id, updatedFields);
        setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      } catch (error) {
        console.error("Failed to update product:", error);
        alert(
          language === "en"
            ? "Failed to update product in database. Updating locally for session testing."
            : "දත්ත සමුදායේ භාණ්ඩය යාවත්කාලීන කිරීමට අපොහොසත් විය. දේශීයව යාවත්කාලීන කරයි."
        );
        setProducts((prev) => prev.map((p) => (p.id === productData.id ? productData : p)));
      }
    } else {
      // Add mode: save to database
      try {
        const { id, ...newProductFields } = productData;
        const savedProduct = await createProduct(newProductFields);
        setProducts((prev) => [savedProduct, ...prev]);
      } catch (error) {
        console.error("Failed to save product:", error);
        alert(
          language === "en"
            ? "Failed to add product to database. It has been added locally for session testing."
            : "දත්ත සමුදායට භාණ්ඩය එක් කිරීමට අපොහොසත් විය. දේශීයව එක් කරයි."
        );
        setProducts((prev) => [productData, ...prev]);
      }
    }
  };

  return (
    <Shell searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <main className="flex-1 p-lg overflow-y-auto bg-background">
        <div className="flex flex-col gap-lg animate-fade-in animate-rise-in">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md card-elevated p-lg">
            <div className="space-y-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">{t("inventoryTitle")}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("inventorySubtitle")}
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="btn-primary font-label-md text-label-md py-sm px-md rounded-2xl flex items-center gap-xs active:scale-[0.97] whitespace-nowrap min-h-11 cursor-pointer"
            >
              <span className="material-symbols-outlined">add</span>
              {t("addProduct")}
            </button>
          </div>

          {/* Controls & Filters Bar */}
          <div className="card-surface p-md flex flex-col lg:flex-row gap-md justify-between items-center">
            {/* Filters buttons */}
            <div className="flex items-center gap-sm overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
              <button
                onClick={() => setSelectedFilter("All")}
                className={`px-md py-xs rounded-2xl font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                  selectedFilter === "All"
                    ? "btn-primary font-bold"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
                } min-h-9.5`}
              >
                {language === "en" ? "All Items" : "සියලුම භාණ්ඩ"} ({stats.total})
              </button>
              <button
                onClick={() => setSelectedFilter("Out of Stock")}
                className={`px-md py-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  selectedFilter === "Out of Stock"
                    ? "bg-red-50 border-red-500 text-red-700 font-bold"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                } min-h-9.5`}
              >
                <span className="w-2 h-2 rounded-full bg-error"></span>
                {t("outOfStock")} ({stats.outOfStock})
              </button>
              <button
                onClick={() => setSelectedFilter("Low Stock")}
                className={`px-md py-xs rounded-full font-label-md text-label-md whitespace-nowrap transition-all border flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  selectedFilter === "Low Stock"
                    ? "bg-amber-50 border-amber-500 text-amber-700 font-bold"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                } min-h-9.5`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {t("lowStock")} ({stats.lowStock})
              </button>
            </div>

            {/* Sort & Category Dropdown */}
            <div className="flex items-center gap-sm w-full lg:w-auto">
              <div className="relative w-full lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md py-xs pl-sm pr-xl rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-9.5"
                >
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All Categories" ? t("allCategoriesFilter") : cat}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="card-elevated overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="bg-surface-container-low/80 border-b border-outline-variant/60 font-label-md text-label-md text-on-surface-variant">
                  <tr>
                    <th className="p-md font-semibold">{language === "en" ? "Product Details" : "භාණ්ඩ විස්තර"}</th>
                    <th className="p-md font-semibold">{t("sku")}</th>
                    <th className="p-md font-semibold">{t("category")}</th>
                    <th className="p-md font-semibold text-right">{t("price")}</th>
                    <th className="p-md font-semibold text-right">{t("stock")}</th>
                    <th className="p-md font-semibold text-center">{language === "en" ? "Status" : "තත්ත්වය"}</th>
                    <th className="p-md font-semibold text-center">{language === "en" ? "Actions" : "ක්‍රියා"}</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-xs">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="font-label-md text-label-md mt-sm">
                            {language === "en" ? "Loading product catalog..." : "භාණ්ඩ නාමාවලිය පූරණය වෙමින්..."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => {
                      const isOutOfStock = product.stock === 0;
                      const isLowStock = product.stock > 0 && product.stock <= 15;

                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors even:bg-surface-container-lowest odd:bg-surface ${
                            isOutOfStock ? "bg-red-50/10" : ""
                          }`}
                        >
                          {/* Product details */}
                          <td className="p-md">
                            <div className="flex items-center gap-sm">
                              <div className="w-12 h-12 bg-surface-container rounded-2xl border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                                {product.image ? (
                                  <img
                                    alt={product.name}
                                    className={`w-full h-full object-cover ${
                                      isOutOfStock ? "grayscale opacity-70" : ""
                                    }`}
                                    src={product.image}
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-outline-variant text-[28px]">
                                    {product.icon || "image"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-label-md text-label-md text-on-surface font-semibold">
                                  {product.name}
                                </p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant">
                                  {language === "en" ? "Supplier" : "සැපයුම්කරු"}: {product.supplier}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="p-md font-mono-data text-mono-data text-on-surface-variant">
                            {product.sku}
                          </td>

                          {/* Category */}
                          <td className="p-md">{product.category}</td>

                          {/* Price */}
                          <td className="p-md text-right font-semibold">
                            Rs. {product.price.toFixed(2)}
                          </td>

                          {/* Quantity (Stock) */}
                          <td className="p-md text-right font-mono-data">
                            <span
                              className={
                                isOutOfStock
                                  ? "text-error font-bold"
                                  : isLowStock
                                  ? "text-secondary font-bold"
                                  : ""
                              }
                            >
                              {product.stock}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="p-md text-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                                {t("outOfStock")}
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full border border-secondary text-secondary font-label-sm text-label-sm font-semibold">
                                {t("lowStock")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm">
                                {t("inStock")}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-md text-center">
                            <div className="flex items-center justify-center gap-xs">
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="p-xs text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high cursor-pointer"
                                title={t("editProduct")}
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="p-xs text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-surface-container-high cursor-pointer"
                                title={t("deleteProduct")}
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-xs">
                          <span className="material-symbols-outlined text-4xl">search_off</span>
                          <p className="font-label-md text-label-md">
                            {language === "en" ? "No products found matching filters." : "පෙරහන් වලට ගැළපෙන කිසිදු භාණ්ඩයක් හමු නොවීය."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-surface-container-lowest border-t border-outline-variant px-lg py-sm flex items-center justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {language === "en"
                  ? `Showing ${showingStart} to ${showingEnd} of ${totalItems} products`
                  : `භාණ්ඩ ${totalItems} කින් ${showingStart} සිට ${showingEnd} දක්වා පෙන්වයි`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-xs">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-xs rounded text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 min-w-9 min-h-9 flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pNum = index + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`p-xs rounded-full font-label-sm min-w-9 min-h-9 flex items-center justify-center transition-colors cursor-pointer ${
                          currentPage === pNum
                            ? "text-on-surface hover:bg-surface-container-low font-semibold bg-surface-container"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-xs rounded text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50 min-w-9 min-h-9 flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit product modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </Shell>
  );
}
