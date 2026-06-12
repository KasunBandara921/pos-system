"use server";

import db from "../../lib/db";
import { Product } from "../types";
import { MOCK_PRODUCTS } from "../mockData";

export async function getProducts(): Promise<Product[]> {
  try {
    let products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (products.length === 0) {
      console.log("Database is empty. Seeding with mock products...");
      // Strip dynamic ids since DB will auto-generate or keep them as is
      // Neon/PostgreSQL can handle custom UUIDs or generate them
      await db.product.createMany({
        data: MOCK_PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit,
          category: p.category,
          stock: p.stock,
          image: p.image || null,
          altText: p.altText || null,
          icon: p.icon || null,
          sku: p.sku,
          supplier: p.supplier,
        })),
      });

      products = await db.product.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      category: p.category,
      stock: p.stock,
      image: p.image ?? undefined,
      altText: p.altText ?? undefined,
      icon: p.icon ?? undefined,
      sku: p.sku,
      supplier: p.supplier,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Return mock products as fallback during transition or connection failure
    return MOCK_PRODUCTS;
  }
}

export async function createProduct(productData: Omit<Product, "id">): Promise<Product> {
  try {
    const product = await db.product.create({
      data: {
        name: productData.name,
        price: Number(productData.price),
        unit: productData.unit,
        category: productData.category,
        stock: Number(productData.stock),
        image: productData.image || null,
        altText: productData.altText || null,
        icon: productData.icon || null,
        sku: productData.sku,
        supplier: productData.supplier,
      },
    });
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      category: product.category,
      stock: product.stock,
      image: product.image ?? undefined,
      altText: product.altText ?? undefined,
      icon: product.icon ?? undefined,
      sku: product.sku,
      supplier: product.supplier,
    };
  } catch (error) {
    console.error("Failed to create product:", error);
    throw new Error("Failed to add product to database.");
  }
}
