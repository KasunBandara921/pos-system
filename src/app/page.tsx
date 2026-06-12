"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { MOCK_PRODUCTS, CATEGORIES } from "./mockData";
import { Product, CartItem } from "./types";
import PaymentModal from "./components/PaymentModal";
import Shell from "./components/Shell";
import { getProducts } from "./actions/products";

export default function CheckoutPage() {
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
      alert(`${product.name} is out of stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      // Calculate quantity requested
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (currentQty >= product.stock) {
        alert(`Cannot add more. Only ${product.stock} items left in stock.`);
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
              alert(`Cannot add more. Only ${product.stock} items left in stock.`);
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
    if (confirm("Are you sure you want to cancel the current sale?")) {
      setCart([]);
    }
  };

  const handleSuspendSale = () => {
    if (cart.length === 0) return;
    setSuspendedCarts((prev) => [...prev, cart]);
    setCart([]);
    alert("Sale suspended successfully.");
  };

  const handleResumeSale = (index: number) => {
    if (cart.length > 0) {
      const confirmResume = confirm(
        "You have items in your current cart. Suspend current cart first?"
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

  const handlePaymentComplete = (paymentMethod: string, amountTendered: number) => {
    setIsPaymentModalOpen(false);

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

    const orderId = `LWD-${Math.floor(100000 + Math.random() * 900000)}`;
    const changeDue = paymentMethod === "Cash" ? Math.max(0, amountTendered - total) : 0;

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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-[448px] p-lg animate-fade-in text-center flex flex-col gap-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Payment Success!</h2>
              <p className="text-on-surface-variant font-label-sm text-label-sm">
                Order {completedReceipt.orderId} • Completed at {completedReceipt.timestamp}
              </p>
            </div>

            {/* Receipt Body */}
            <div className="border-t border-b border-dashed border-outline-variant py-md text-left flex flex-col gap-sm">
              <div className="flex flex-col gap-xs max-h-48 overflow-y-auto">
                {completedReceipt.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant truncate max-w-[220px]">
                      {item.product.name} <span className="text-xs text-on-surface-variant">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-on-surface">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 pt-xs flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>${completedReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tax (8.5%)</span>
                  <span>${completedReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-on-surface mt-xs">
                  <span>Total Amount</span>
                  <span className="text-primary">${completedReceipt.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-outline-variant/30 pt-xs text-xs text-on-surface-variant flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>{completedReceipt.paymentMethod}</span>
                </div>
                {completedReceipt.paymentMethod === "Cash" && (
                  <>
                    <div className="flex justify-between">
                      <span>Amount Tendered</span>
                      <span>${completedReceipt.amountTendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>Change Returned</span>
                      <span>${completedReceipt.changeDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Footer Actions */}
            <div className="flex gap-sm">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md py-sm rounded-lg flex items-center justify-center gap-xs min-h-[44px]"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print
              </button>
              <button
                onClick={handleNewSale}
                className="flex-1 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md py-sm rounded-lg flex items-center justify-center gap-xs min-h-[44px]"
              >
                <span className="material-symbols-outlined text-sm">fiber_new</span>
                New Order
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Normal Dashboard Flow */
        <main className="flex-1 overflow-hidden flex p-sm gap-md">
          {/* Catalog Grid Area */}
          <section className="flex-1 flex flex-col h-full bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            {/* Category tabs scroll */}
            <div className="px-md py-sm border-b border-outline-variant bg-surface">
              <div className="flex overflow-x-auto no-scrollbar gap-sm pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-md py-xs rounded-full font-label-md text-label-md whitespace-nowrap min-h-[44px] transition-all border ${
                      selectedCategory === cat
                        ? "bg-secondary-container border-secondary-container text-on-secondary-container font-bold"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md content-start">
              {isLoading ? (
                <div className="col-span-full py-xl text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-label-md text-label-md mt-sm">Loading product catalog...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className="bg-surface rounded-lg border border-outline-variant overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-95 group flex flex-col justify-between"
                  >
                    {/* Image container */}
                    <div className="aspect-square bg-surface-container relative flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
                          src={product.image}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-tertiary-fixed to-surface-container rounded-md flex items-center justify-center border border-outline-variant/30 p-md">
                          <span className="material-symbols-outlined text-4xl text-tertiary">
                            {product.icon || "shopping_bag"}
                          </span>
                        </div>
                      )}
                      <div className={`absolute top-xs right-xs px-2 py-1 rounded text-xs font-mono-data font-medium border ${
                        product.stock > 10 
                          ? "bg-surface-container-highest text-on-surface-variant border-outline-variant"
                          : product.stock > 0 
                            ? "bg-warning-container text-on-warning-container border-amber-300 bg-amber-50"
                            : "bg-error-container text-on-error-container border-red-300 bg-red-50 text-error"
                      }`}>
                        {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                      </div>
                    </div>

                    {/* Info container */}
                    <div className="p-sm">
                      <h3 className="font-label-md text-label-md text-on-surface truncate">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="font-headline-md text-headline-md text-primary font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-on-surface-variant">{product.unit}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-xl text-center text-on-surface-variant flex flex-col items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                  <p className="font-label-md text-label-md">No products found matching your search criteria.</p>
                </div>
              )}
            </div>
          </section>

          {/* Cart Panel Area */}
          <section className="w-1/3 min-w-[320px] max-w-[450px] flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {/* Cart Header */}
            <div className="px-lg py-md border-b border-outline-variant bg-surface flex justify-between items-center">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Current Order</h2>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-primary hover:text-primary-container font-label-md text-label-md transition-colors min-h-[44px] px-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-md p-sm bg-surface rounded-lg border border-outline-variant animate-fade-in"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-surface-container rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
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
                        ${item.product.price.toFixed(2)}/ea
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-surface-container-highest rounded-md border border-outline-variant">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-label-md text-label-md text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    {/* Item Subtotal */}
                    <div className="w-16 text-right font-headline-md text-headline-md text-on-surface font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-xs">
                  <span className="material-symbols-outlined text-4xl">shopping_cart</span>
                  <p className="font-label-md text-label-md">Your cart is empty.</p>
                  <p className="text-xs text-center px-lg">Click on products to add them to the checkout sheet.</p>
                </div>
              )}
            </div>

            {/* Pricing & Checkout Actions */}
            <div className="bg-surface-container-lowest border-t border-outline-variant p-lg">
              <div className="flex flex-col gap-2 mb-md">
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Subtotal</span>
                  <span className="font-mono-data">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                  <span>Tax (8.5%)</span>
                  <span className="font-mono-data">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface font-headline-lg mt-sm border-t border-outline-variant pt-sm font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className={`w-full font-headline-md text-headline-md py-md rounded-xl flex items-center justify-center gap-sm transition-all shadow-sm min-h-[64px] ${
                  cart.length === 0
                    ? "bg-surface-container-highest text-on-surface-variant border border-outline-variant cursor-not-allowed"
                    : "bg-primary hover:bg-primary-container text-on-primary active:scale-[0.98]"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">payments</span>
                Pay Now
              </button>

              <div className="grid grid-cols-2 gap-sm mt-sm">
                <button
                  onClick={handleSuspendSale}
                  disabled={cart.length === 0}
                  className={`border border-outline-variant font-label-md text-label-md py-sm rounded-lg transition-colors min-h-[44px] ${
                    cart.length === 0
                      ? "bg-surface-container-lowest text-on-surface-variant opacity-50 cursor-not-allowed"
                      : "bg-surface text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  Suspend
                </button>
                <button
                  onClick={handleCancelSale}
                  disabled={cart.length === 0}
                  className={`border font-label-md text-label-md py-sm rounded-lg transition-colors min-h-[44px] ${
                    cart.length === 0
                      ? "bg-surface-container-lowest text-on-surface-variant opacity-50 border-outline-variant cursor-not-allowed"
                      : "bg-surface border-outline-variant text-error hover:bg-error-container hover:border-error-container"
                  }`}
                >
                  Cancel
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
