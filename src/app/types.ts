export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string; // e.g. "/ea", "/kg"
  category: string;
  stock: number;
  image?: string;
  altText?: string;
  icon?: string; // fallback material symbol name
  sku: string;
  supplier: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountTendered: number;
  changeDue: number;
  userId?: string;
  cashierName?: string;
  createdAt: string;
}
