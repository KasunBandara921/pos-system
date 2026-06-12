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

export async function updateProduct(id: string, productData: Omit<Product, "id">): Promise<Product> {
  try {
    const product = await db.product.update({
      where: { id },
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
    console.error("Failed to update product:", error);
    throw new Error("Failed to update product in database.");
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await db.product.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Failed to delete product from database.");
  }
}

export async function bulkDeductStock(items: { productId: string; quantity: number }[]): Promise<boolean> {
  try {
    // 1. Find all products that exist in the database with these IDs
    const existingProducts = await db.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existingProducts.map((p) => p.id));

    // 2. Only update the products that actually exist in the DB
    const updates = items
      .filter((item) => existingIds.has(item.productId))
      .map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      );

    if (updates.length > 0) {
      await db.$transaction(updates);
    }
    return true;
  } catch (error) {
    console.error("Failed to deduct stock in database:", error);
    throw new Error("Failed to update inventory stock in database.");
  }
}

