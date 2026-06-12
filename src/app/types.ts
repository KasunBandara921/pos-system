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
