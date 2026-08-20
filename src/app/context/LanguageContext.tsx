"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "si";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Sinhala and English dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & General
    brandName: "Lewdeniya Stores",
    terminalLabel: "Terminal #01",
    newSale: "New Sale",
    menuLabel: "Menu",
    settings: "Settings",
    "All Items": "All Items",
    "Fresh Produce": "Fresh Produce",
    "Dairy & Bakery": "Dairy & Bakery",
    "Beverages": "Beverages",
    "Snacks": "Snacks",
    logout: "Logout",
    notifications: "Notifications",
    help: "Help",
    storeManager: "Store Manager",
    storeCashier: "Store Cashier",
    suspendedSales: "Suspended Sales",

    // Navigation Links
    navCheckout: "Checkout",
    navInventory: "Inventory",
    navReports: "Reports",
    navTransactions: "Transactions",
    navUsers: "Cashiers",

    // Login Page
    loginTitle: "Lewdeniya Stores",
    loginSubtitle: "POS Checkout Terminal System",
    selectRole: "Select Role",
    manager: "Manager",
    cashier: "Cashier",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing In...",
    demoCredentials: "Demo Credentials",

    // Reports Page
    salesReports: "Sales Reports",
    performanceOverview: "Performance overview and transactional insights.",
    totalSales: "Total Sales",
    averageOrderValue: "Average Order Value",
    totalTransactions: "Total Transactions",
    vsLastPeriod: "vs last period",
    dailyRevenueTrends: "Daily Revenue Trends",
    noSalesPeriod: "No sales recorded for this period.",
    topSellingItems: "Top Selling Items",
    viewAllInventory: "View All Inventory Performance",

    // Transactions Page
    transactionsTitle: "Transactions",
    transactionsSubtitle: "Every completed sale is saved here for review and audit.",
    totalRevenue: "Total Revenue",
    totalOrders: "Total Orders",
    averageOrder: "Average Order",
    cashPayments: "Cash Payments",
    salesHistory: "Sales History",
    latestTransactions: "Latest transactions appear first.",
    savedSales: "saved sales",
    noTransactionsYet: "No transactions saved yet",
    completeSaleInstruction: "Complete a sale from the checkout screen and it will appear here automatically.",
    goToCheckout: "Go to Checkout",

    // Transaction Columns
    colOrder: "Order",
    colTime: "Time",
    colItems: "Items",
    colPayment: "Payment",
    colSubtotal: "Subtotal",
    colTax: "Tax",
    colTotal: "Total",
    colChange: "Change",

    // POS / Checkout Screen
    searchPlaceholder: "Search products, SKUs, or barcodes...",
    searchInventoryPlaceholder: "Search products, SKUs...",
    allCategories: "All Items",
    cartLabel: "Current Cart",
    emptyCartLabel: "Cart is empty",
    scanInstruction: "Select items or scan barcode to add to cart",
    subtotal: "Subtotal",
    tax: "Tax (8.5%)",
    total: "Total",
    clearCart: "Clear Cart",
    suspendSale: "Suspend Sale",
    payButton: "Pay Now",
    checkoutSuccess: "Transaction Completed Successfully!",

    // Inventory Page
    inventoryTitle: "Inventory Control",
    inventorySubtitle: "Manage store items, pricing, category classification and stock count.",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    searchInventory: "Search inventory...",
    categoriesLabel: "Categories",
    allCategoriesFilter: "All Categories",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    inStock: "In Stock",
    sku: "SKU",
    supplier: "Supplier",
    price: "Price",
    stock: "Stock",
    unit: "Unit",
    category: "Category",
    productName: "Product Name",
    saveChanges: "Save Changes",
    discard: "Discard",
    confirmDelete: "Are you sure you want to delete this product?",
    editProductDetails: "Edit Product Details",
    addNewProduct: "Add New Product",
    skuBarcode: "SKU Barcode",
    displayIcon: "Display Icon",
    priceRs: "Price (Rs)",
    stockQuantity: "Quantity in Stock",
    productImageUrl: "Product Image URL (Optional)",
    cancel: "Cancel",
    saveDetails: "Save Details",
  },
  si: {
    // Brand & General
    brandName: "ලෙව්දෙනිය ස්ටෝර්ස්",
    terminalLabel: "පර්යන්තය #01",
    newSale: "නව විකුණුම්",
    menuLabel: "මෙනුව",
    settings: "සැකසුම්",
    "All Items": "සියලුම භාණ්ඩ",
    "Fresh Produce": "නැවුම් එළවළු සහ පළතුරු",
    "Dairy & Bakery": "කිරි සහ බේකරි නිෂ්පාදන",
    "Beverages": "පාන වර්ග",
    "Snacks": "කෑම බීම / ස්නැක්ස්",
    logout: "පිටවීම",
    notifications: "දැනුම්දීම්",
    help: "උදව්",
    storeManager: "වෙළඳසැල් කළමනාකරු",
    storeCashier: "වෙළඳසැල් අයකැමි",
    suspendedSales: "අත්හිටුවන ලද විකුණුම්",

    // Navigation Links
    navCheckout: "මුදල් කවුන්ටරය",
    navInventory: "තොග පාලනය",
    navReports: "වාර්තා",
    navTransactions: "ගනුදෙනු ඉතිහාසය",
    navUsers: "කැෂියර්වරුන්",

    // Login Page
    loginTitle: "ලෙව්දෙනිය ස්ටෝර්ස්",
    loginSubtitle: "POS විකුණුම් පර්යන්ත පද්ධතිය",
    selectRole: "භූමිකාව තෝරන්න",
    manager: "කළමනාකරු",
    cashier: "අයකැමි",
    username: "පරිශීලක නාමය",
    password: "මුරපදය",
    signIn: "ඇතුල් වන්න",
    signingIn: "ඇතුල් වෙමින්...",
    demoCredentials: "ආදර්ශ පිවිසුම් දත්ත",

    // Reports Page
    salesReports: "විකුණුම් වාර්තා",
    performanceOverview: "කාර්ය සාධන දළ විශ්ලේෂණය සහ ගනුදෙනු අවබෝධය.",
    totalSales: "මුළු විකුණුම්",
    averageOrderValue: "සාමාන්‍ය ඇණවුම් වටිනාකම",
    totalTransactions: "මුළු ගනුදෙනු සංඛ්‍යාව",
    vsLastPeriod: "පසුගිය කාල සීමාවට සාපේක්ෂව",
    dailyRevenueTrends: "දෛනික ආදායම් ප්‍රවණතා",
    noSalesPeriod: "මෙම කාල සීමාව සඳහා විකුණුම් වාර්තා වී නොමැත.",
    topSellingItems: "වැඩිපුරම අලෙවි වන භාණ්ඩ",
    viewAllInventory: "සියලුම තොග කාර්ය සාධනය බලන්න",

    // Transactions Page
    transactionsTitle: "ගනුදෙනු",
    transactionsSubtitle: "සම්පූර්ණ කරන ලද සෑම විකුණුමක්ම සමාලෝචනය සඳහා මෙහි සුරැකේ.",
    totalRevenue: "මුළු ආදායම",
    totalOrders: "මුළු ඇණවුම් සංඛ්‍යාව",
    averageOrder: "සාමාන්‍ය ඇණවුම",
    cashPayments: "මුදල් ගෙවීම්",
    salesHistory: "විකුණුම් ඉතිහාසය",
    latestTransactions: "නවතම ගනුදෙනු මුලින්ම දිස්වේ.",
    savedSales: "සුරකින ලද විකුණුම්",
    noTransactionsYet: "තවමත් ගනුදෙනු සුරැකී නැත",
    completeSaleInstruction: "මුදල් කවුන්ටරයෙන් ගනුදෙනුවක් සම්පූර්ණ කරන්න, එවිට එය ස්වයංක්‍රීයව මෙහි දර්ශනය වේ.",
    goToCheckout: "මුදල් කවුන්ටරය වෙත යන්න",

    // Transaction Columns
    colOrder: "ඇණවුම",
    colTime: "වේලාව",
    colItems: "භාණ්ඩ ප්‍රමාණය",
    colPayment: "ගෙවීම් ක්‍රමය",
    colSubtotal: "උප එකතුව",
    colTax: "බදු",
    colTotal: "එකතුව",
    colChange: "ඉතිරි මුදල",

    // POS / Checkout Screen
    searchPlaceholder: "භාණ්ඩ, SKU හෝ තීරු කේත සොයන්න...",
    searchInventoryPlaceholder: "භාණ්ඩ, SKU සොයන්න...",
    allCategories: "සියලුම භාණ්ඩ",
    cartLabel: "වත්මන් කරත්තය",
    emptyCartLabel: "කරත්තය හිස් ය",
    scanInstruction: "කරත්තයට එකතු කිරීමට භාණ්ඩ තෝරන්න හෝ තීරු කේතය ස්කෑන් කරන්න",
    subtotal: "උප එකතුව",
    tax: "බදු (8.5%)",
    total: "එකතුව",
    clearCart: "කරත්තය හිස් කරන්න",
    suspendSale: "විකිණීම අත්හිටුවන්න",
    payButton: "ගෙවීම් කරන්න",
    checkoutSuccess: "ගනුදෙනුව සාර්ථකව සම්පූර්ණ කරන ලදී!",

    // Inventory Page
    inventoryTitle: "තොග කළමනාකරණය",
    inventorySubtitle: "භාණ්ඩ, මිල ගණන්, කාණ්ඩ වර්ගීකරණය සහ තොග ප්‍රමාණය කළමනාකරණය කරන්න.",
    addProduct: "භාණ්ඩයක් එකතු කරන්න",
    editProduct: "භාණ්ඩය සංස්කරණය කරන්න",
    deleteProduct: "භාණ්ඩය මකන්න",
    searchInventory: "තොග සොයන්න...",
    categoriesLabel: "වර්ගීකරණයන්",
    allCategoriesFilter: "සියලුම වර්ගීකරණයන්",
    outOfStock: "තොග නොමැත",
    lowStock: "අඩු තොග",
    inStock: "තොග පවතී",
    sku: "SKU කේතය",
    supplier: "සැපයුම්කරු",
    price: "මිල",
    stock: "තොගය",
    unit: "ඒකකය",
    category: "වර්ගය",
    productName: "භාණ්ඩයේ නම",
    saveChanges: "වෙනස්කම් සුරකින්න",
    discard: "ඉවතලන්න",
    confirmDelete: "මෙම භාණ්ඩය මැකීමට අවශ්‍ය බව ස්ථිරද?",
    editProductDetails: "භාණ්ඩ විස්තර සංස්කරණය",
    addNewProduct: "නව භාණ්ඩයක් එක් කරන්න",
    skuBarcode: "SKU තීරු කේතය",
    displayIcon: "නිරූපක රූපය",
    priceRs: "මිල (රු)",
    stockQuantity: "තොගයේ ඇති ප්‍රමාණය",
    productImageUrl: "භාණ්ඩයේ පින්තූර URL (විකල්ප)",
    cancel: "අවලංගු කරන්න",
    saveDetails: "තොරතුරු සුරකින්න",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang === "en" || savedLang === "si") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
