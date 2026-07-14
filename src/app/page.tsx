"use client";
 
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { MOCK_PRODUCTS, CATEGORIES } from "./mockData";
import { Product, CartItem, TransactionItem } from "./types";
import PaymentModal from "./components/PaymentModal";
import Shell from "./components/Shell";
import { getProducts, bulkDeductStock } from "./actions/products";
import { createTransaction } from "./actions/transactions";
import { jsPDF } from "jspdf";
import { useLanguage } from "./context/LanguageContext";

interface ReceiptData {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountTendered: number;
  changeDue: number;
  timestamp: string;
}

const downloadPDFReceipt = (receipt: ReceiptData | null) => {
  if (!receipt) return;
  const itemsCount = receipt.items.length;
  // Calculate dynamic page height (in mm) based on items count
  const pageHeight = 115 + itemsCount * 6;
  const doc = new jsPDF({
    unit: "mm",
    format: [80, Math.max(120, pageHeight)]
  });

  const xCenter = 40;
  let y = 10;

  // Title: LEWDENIYA STORES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LEWDENIYA STORES", xCenter, y, { align: "center" });
  y += 5;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Terminal #01", xCenter, y, { align: "center" });
  y += 4;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 4;

  // Order Details
  doc.setFontSize(7.5);
  doc.text(`Order ID: ${receipt.orderId}`, 5, y);
  y += 3.5;
  doc.text(`Time: ${receipt.timestamp}`, 5, y);
  y += 4;

  // Divider
  doc.line(5, y, 75, y);
  y += 4.5;

  // Items Header
  doc.setFont("helvetica", "bold");
  doc.text("Item", 5, y);
  doc.text("Qty", 45, y, { align: "right" });
  doc.text("Price", 58, y, { align: "right" });
  doc.text("Total", 75, y, { align: "right" });
  y += 3.5;

  // Divider (thin)
  doc.setLineWidth(0.1);
  doc.line(5, y, 75, y);
  y += 4;

  // Reset font for items list
  doc.setFont("helvetica", "normal");
  receipt.items.forEach((item) => {
    let name = item.product.name;
    if (name.length > 20) {
      name = name.substring(0, 18) + "...";
    }
    doc.text(name, 5, y);
    doc.text(`${item.quantity}`, 45, y, { align: "right" });
    doc.text(`Rs. ${item.product.price.toFixed(2)}`, 58, y, { align: "right" });
    doc.text(`Rs. ${(item.product.price * item.quantity).toFixed(2)}`, 75, y, { align: "right" });
    y += 5.5;
  });

  // Divider
  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 4.5;

  // Totals
  doc.text("Subtotal:", 45, y, { align: "right" });
  doc.text(`Rs. ${receipt.subtotal.toFixed(2)}`, 75, y, { align: "right" });
  y += 3.5;

  doc.text("Tax (8.5%):", 45, y, { align: "right" });
  doc.text(`Rs. ${receipt.tax.toFixed(2)}`, 75, y, { align: "right" });
  y += 4.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total Amount:", 45, y, { align: "right" });
  doc.text(`Rs. ${receipt.total.toFixed(2)}`, 75, y, { align: "right" });
  y += 5.5;

  // Divider
  doc.setLineWidth(0.1);
  doc.line(5, y, 75, y);
  y += 4.5;

  // Payment Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Payment Method:", 5, y);
  doc.text(receipt.paymentMethod, 75, y, { align: "right" });
  y += 3.5;

  if (receipt.paymentMethod === "Cash") {
    doc.text("Amount Tendered:", 5, y);
    doc.text(`Rs. ${receipt.amountTendered.toFixed(2)}`, 75, y, { align: "right" });
    y += 3.5;

    doc.setFont("helvetica", "bold");
    doc.text("Change Returned:", 5, y);
    doc.text(`Rs. ${receipt.changeDue.toFixed(2)}`, 75, y, { align: "right" });
    y += 4.5;
  }

  // Divider
  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 5;

  // Thank you note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Thank you for shopping with us!", xCenter, y, { align: "center" });
  y += 3.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Please keep this receipt for your reference.", xCenter, y, { align: "center" });

  // Save the PDF
  doc.save(`receipt-${receipt.orderId}.pdf`);
};

export default function CheckoutPage() {
  const { language, t } = useLanguage();

  // Application State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load checkout products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);
  const [cart, setCart] = useState<CartItem[]>([
    // Initialize with the mock cart items from the user's template
    {
      product: MOCK_PRODUCTS.find((p) => p.id === "prod-001") || MOCK_PRODUCTS[0],
      quantity: 2,
    },
    {
      product: MOCK_PRODUCTS.find((p) => p.id === "prod-002") || MOCK_PRODUCTS[1],
      quantity: 4,
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Items");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  
  // Suspended Sales state
  const [suspendedCarts, setSuspendedCarts] = useState<CartItem[][]>([]);
  
  // Completed Receipt state to display success receipt screen
  const [completedReceipt, setCompletedReceipt] = useState<{
    orderId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountTendered: number;
    changeDue: number;
    timestamp: string;
  } | null>(null);

  // Search & Category filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All Items" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const tax = useMemo(() => {
    return Number((subtotal * 0.085).toFixed(2));
  }, [subtotal]);

  const total = useMemo(() => {
    return Number((subtotal + tax).toFixed(2));
  }, [subtotal, tax]);

  // Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(
        language === "en"
          ? `${product.name} is out of stock.`
          : `${product.name} තොග අවසන් වී ඇත.`
      );
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      // Calculate quantity requested
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (currentQty >= product.stock) {
        alert(
          language === "en"
            ? `Cannot add more. Only ${product.stock} items left in stock.`
            : `තවදුරටත් එක් කළ නොහැක. තොගයේ ඉතිරිව ඇත්තේ භාණ්ඩ ${product.stock}ක් පමණි.`
        );
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            
            // Check stock limits on increment
            if (delta > 0 && nextQty > product.stock) {
              alert(
                language === "en"
                  ? `Cannot add more. Only ${product.stock} items left in stock.`
                  : `තවදුරටත් එක් කළ නොහැක. තොගයේ ඉතිරිව ඇත්තේ භාණ්ඩ ${product.stock}ක් පමණි.`
              );
              return item;
            }

            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCancelSale = () => {
    if (cart.length === 0) return;
    const cancelMsg = language === "en"
      ? "Are you sure you want to cancel the current sale?"
      : "වත්මන් විකිණීම අවලංගු කිරීමට අවශ්‍ය බව ස්ථිරද?";

    if (confirm(cancelMsg)) {
      setCart([]);
    }
  };

  const handleSuspendSale = () => {
    if (cart.length === 0) return;
    setSuspendedCarts((prev) => [...prev, cart]);
    setCart([]);
    alert(
      language === "en"
        ? "Sale suspended successfully."
        : "විකිණීම සාර්ථකව අත්හිටුවන ලදී."
    );
  };

  const handleResumeSale = (index: number) => {
    if (cart.length > 0) {
      const confirmResume = confirm(
        language === "en"
          ? "You have items in your current cart. Suspend current cart first?"
          : "ඔබගේ වත්මන් කරත්තයේ භාණ්ඩ තිබේ. මුලින්ම එය අත්හිටුවන්නද?"
      );
      if (confirmResume) {
        setSuspendedCarts((prev) => [...prev, cart]);
      }
    }
    setCart(suspendedCarts[index]);
    setSuspendedCarts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleNewSale = () => {
    setCart([]);
    setCompletedReceipt(null);
  };

  const handlePaymentComplete = async (paymentMethod: string, amountTendered: number) => {
    setIsPaymentModalOpen(false);

    const transactionItems: TransactionItem[] = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      lineTotal: Number((item.product.price * item.quantity).toFixed(2)),
    }));

    // Prepare items to deduct
    const itemsToDeduct = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // Deduct stock in our products state
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    try {
      await bulkDeductStock(itemsToDeduct);
    } catch (error) {
      console.error("Failed to persist stock deduction:", error);
      alert(
        language === "en"
          ? "Failed to update inventory stock in database, but order completed locally."
          : "දත්ත සමුදායේ තොග යාවත්කාලීන කිරීමට අපොහොසත් විය, නමුත් ඇණවුම දේශීයව සම්පූර්ණ කරන ලදී."
      );
    }

    const orderId = `LWD-${Math.floor(100000 + Math.random() * 900000)}`;
    const changeDue = paymentMethod === "Cash" ? Math.max(0, amountTendered - total) : 0;

    try {
      await createTransaction({
        orderId,
        items: transactionItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        amountTendered,
        changeDue,
      });
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert(
        language === "en"
          ? "The sale completed, but saving the transaction history failed."
          : "විකිණීම සම්පූර්ණ විය, නමුත් ගනුදෙනු ඉතිහාසය සුරැකීම අපොහොසත් විය."
      );
    }

    // Open Success Receipt Screen
    setCompletedReceipt({
      orderId,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      amountTendered,
      changeDue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    setCart([]);
  };

  return (
    <Shell
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewSaleClick={handleNewSale}
      suspendedCarts={suspendedCarts}
      onResumeCart={handleResumeSale}
    >
      {completedReceipt ? (
        /* Checkout Completion Receipt Success Screen */
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-lg">
          <div className="card-elevated w-full max-w-124 p-lg animate-rise-in text-center flex flex-col gap-md animate-fade-in">
            <div className="w-20 h-20 bg-linear-to-br from-primary/15 to-primary-container/15 rounded-3xl flex items-center justify-center text-primary mx-auto shadow-[0_8px_24px_rgba(5,150,105,0.15)]">
              <span className="material-symbols-outlined text-5xl fill">check_circle</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                {language === "en" ? "Payment Success!" : "ගෙවීම සාර්ථකයි!"}
              </h2>
              <p className="text-on-surface-variant font-label-sm text-label-sm">
                {language === "en" ? "Order" : "ඇණවුම"} {completedReceipt.orderId} • {language === "en" ? "Completed at" : "සම්පූර්ණ කළ වේලාව"} {completedReceipt.timestamp}
              </p>
            </div>

            {/* Receipt Body */}
            <div className="border-t border-b border-dashed border-outline-variant py-md text-left flex flex-col gap-sm">
              <div className="flex flex-col gap-xs max-h-48 overflow-y-auto">
                {completedReceipt.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant truncate max-w-55">
                      {item.product.name} <span className="text-xs text-on-surface-variant">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-on-surface">Rs. {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 pt-xs flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("subtotal")}</span>
                  <span>Rs. {completedReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("tax")}</span>
                  <span>Rs. {completedReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-on-surface mt-xs">
                  <span>{language === "en" ? "Total Amount" : "මුළු මුදල"}</span>
                  <span className="text-primary">Rs. {completedReceipt.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-outline-variant/30 pt-xs text-xs text-on-surface-variant flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>{t("colPayment")}</span>
                  <span>{completedReceipt.paymentMethod === "Cash" ? (language === "en" ? "Cash" : "මුදල්") : completedReceipt.paymentMethod}</span>
                </div>
                {completedReceipt.paymentMethod === "Cash" && (
                  <>
                    <div className="flex justify-between">
                      <span>{language === "en" ? "Amount Tendered" : "ගෙවූ මුදල"}</span>
                      <span>Rs. {completedReceipt.amountTendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>{language === "en" ? "Change Returned" : "ඉතිරි මුදල"}</span>
                      <span>Rs. {completedReceipt.changeDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Footer Actions */}
            <div className="flex gap-sm">
              <button
                onClick={() => downloadPDFReceipt(completedReceipt)}
                className="flex-1 bg-surface border border-outline-variant/60 text-on-surface hover:bg-surface-container-low font-label-md text-label-md py-sm rounded-2xl flex items-center justify-center gap-xs min-h-11 transition-all hover:shadow-sm cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                {language === "en" ? "Download PDF" : "PDF බාගන්න"}
              </button>
              <button
                onClick={handleNewSale}
                className="flex-1 btn-primary font-label-md text-label-md py-sm rounded-2xl flex items-center justify-center gap-xs min-h-11 active:scale-[0.98] cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-sm">fiber_new</span>
                {language === "en" ? "New Order" : "නව ඇණවුම"}
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Normal Dashboard Flow */
        <main className="flex-1 overflow-hidden flex p-sm gap-md">
          {/* Catalog Grid Area */}
          <section className="flex-1 flex flex-col h-full card-elevated overflow-hidden">
            {/* Category tabs scroll */}
            <div className="px-md py-sm border-b border-outline-variant/60 bg-surface-container-low/50 backdrop-blur-sm">
              <div className="flex overflow-x-auto no-scrollbar gap-xs pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-md py-xs rounded-2xl font-label-md text-label-md whitespace-nowrap min-h-10 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "btn-primary font-bold shadow-[0_4px_12px_rgba(5,150,105,0.25)]"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent hover:border-outline-variant/40"
                    }`}
                  >
                    {t(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-md content-start">
              {isLoading ? (
                <div className="col-span-full py-xl text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-label-md text-label-md mt-sm">
                    {language === "en" ? "Loading product catalog..." : "භාණ්ඩ නාමාවලිය පූරණය වෙමින්..."}
                  </p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  const availableStock = product.stock - (cartItem ? cartItem.quantity : 0);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className="bg-surface rounded-2xl border border-outline-variant/50 overflow-hidden hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-[0.98] group flex flex-col justify-between"
                    >
                      {/* Image container */}
                      <div className="aspect-square bg-linear-to-br from-surface-container-low to-surface-container relative flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img
                            alt={product.name}
                            className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                            src={product.image}
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-primary/5 to-primary-container/10 flex items-center justify-center p-md">
                            <span className="material-symbols-outlined text-4xl text-primary/60 group-hover:text-primary transition-colors">
                              {product.icon || "shopping_bag"}
                            </span>
                          </div>
                        )}
                        <div className={`absolute top-xs right-xs px-2.5 py-1 rounded-full text-xs font-label-sm backdrop-blur-sm ${
                          availableStock > 10 
                            ? "bg-surface/90 text-on-surface-variant border border-outline-variant/50"
                            : availableStock > 0 
                              ? "bg-warning-container/95 text-on-warning-container border border-amber-200/60"
                              : "bg-error-container/95 text-on-error-container border border-red-200/60"
                        }`}>
                          {availableStock > 0 
                            ? `${availableStock} ${t("inStock")}` 
                            : t("outOfStock")}
                        </div>
                      </div>

                      {/* Info container */}
                      <div className="p-md">
                        <h3 className="font-label-md text-label-md text-on-surface truncate">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex items-end justify-between gap-sm">
                          <span className="font-headline-md text-headline-md text-primary font-bold leading-none">
                            Rs. {product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-on-surface-variant whitespace-nowrap">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-xl text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                  <p className="font-label-md text-label-md">
                    {language === "en" ? "No products found matching your search criteria." : "ඔබගේ සෙවුම් නිර්ණායකයට ගැළපෙන කිසිදු භාණ්ඩයක් හමු නොවීය."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Cart Panel Area */}
          <section className="w-1/3 min-w-80 max-w-112 flex flex-col card-elevated overflow-hidden">
            {/* Cart Header */}
            <div className="px-lg py-md border-b border-outline-variant/60 bg-linear-to-r from-primary/5 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary fill">shopping_cart</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {language === "en" ? "Current Order" : "වත්මන් ඇණවුම"}
                </h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-primary hover:text-primary-container font-label-md text-label-md transition-colors min-h-11 px-sm cursor-pointer"
                >
                  {language === "en" ? "Clear All" : "සියල්ල ඉවත් කරන්න"}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-md p-sm bg-surface-container-low rounded-2xl border border-outline-variant/40 animate-fade-in hover:border-primary/20 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-surface-container rounded-2xl shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product.image ? (
                        <img
                          alt={item.product.name}
                          className="w-full h-full object-cover mix-blend-multiply rounded-md"
                          src={item.product.image}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-md text-tertiary">
                          {item.product.icon || "shopping_bag"}
                        </span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-label-md text-label-md text-on-surface truncate">
                        {item.product.name}
                      </h4>
                      <p className="font-mono-data text-on-surface-variant text-sm">
                        Rs. {item.product.price.toFixed(2)}/{language === "en" ? "ea" : "එකක්"}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-surface-container-highest rounded-2xl border border-outline-variant overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-label-md text-label-md text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    {/* Item Subtotal */}
                    <div className="w-16 text-right font-headline-md text-headline-md text-on-surface font-semibold">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-xs">
                  <span className="material-symbols-outlined text-4xl">shopping_cart</span>
                  <p className="font-label-md text-label-md">{t("emptyCartLabel")}</p>
                  <p className="text-xs text-center px-lg">{t("scanInstruction")}</p>
                </div>
              )}
            </div>

            {/* Pricing & Checkout Actions */}
            <div className="bg-surface border-t border-outline-variant/60 p-lg">
              <div className="flex flex-col gap-2 mb-md">
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>{t("subtotal")}</span>
                  <span className="font-mono-data">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>{t("tax")}</span>
                  <span className="font-mono-data">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface mt-sm border-t border-outline-variant/50 pt-sm">
                  <span className="font-headline-md text-headline-md font-bold">{t("total")}</span>
                  <span className="font-display-price text-[28px] gradient-text">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className={`w-full font-headline-md text-headline-md py-md rounded-2xl flex items-center justify-center gap-sm transition-all min-h-16 cursor-pointer ${
                  cart.length === 0
                    ? "bg-surface-container-highest text-on-surface-variant border border-outline-variant/60 cursor-not-allowed"
                    : "btn-primary active:scale-[0.98]"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">payments</span>
                {t("payButton")}
              </button>

              <div className="grid grid-cols-2 gap-sm mt-sm">
                <button
                  onClick={handleSuspendSale}
                  disabled={cart.length === 0}
                  className={`border border-outline-variant font-label-md text-label-md py-sm rounded-2xl transition-colors min-h-11 cursor-pointer ${
                    cart.length === 0
                      ? "bg-surface-container-lowest text-on-surface-variant opacity-50 cursor-not-allowed"
                      : "bg-surface text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {language === "en" ? "Suspend" : "අත්හිටුවන්න"}
                </button>
                <button
                  onClick={handleCancelSale}
                  disabled={cart.length === 0}
                  className={`border font-label-md text-label-md py-sm rounded-2xl transition-colors min-h-11 cursor-pointer ${
                    cart.length === 0
                      ? "bg-surface-container-lowest text-on-surface-variant opacity-50 border-outline-variant cursor-not-allowed"
                      : "bg-surface border-outline-variant text-error hover:bg-error-container hover:border-error-container"
                  }`}
                >
                  {language === "en" ? "Cancel" : "අවලංගු කරන්න"}
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onComplete={handlePaymentComplete}
      />
    </Shell>
  );
}
