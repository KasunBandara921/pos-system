"use server";

import { getProducts } from "./products";
import { getTransactions } from "./transactions";
import type { Product, TransactionRecord } from "../types";

export interface AdviceMetric {
  healthScore: number;
  lowStockAlertsCount: number;
  salesVelocity: string;
}

export interface AdviceRecommendation {
  id: string;
  category: "inventory" | "sales" | "pricing" | "general";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionableSteps: string[];
}

export interface AdviceInsight {
  title: string;
  description: string;
}

export interface AIAdviceResult {
  advisorOverview: string;
  metrics: AdviceMetric;
  recommendations: AdviceRecommendation[];
  insights: AdviceInsight[];
  isRealAI: boolean;
}

// Programmatic fallback analytical advisor
function generateMockAdvice(products: Product[], transactions: TransactionRecord[]): AIAdviceResult {
  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  
  // Calculate health score: start at 100, deduct 6 per out-of-stock item, 3 per low-stock item (min 40)
  let healthScore = 100 - (outOfStock.length * 6) - (lowStock.length * 3);
  healthScore = Math.max(40, Math.min(100, healthScore));

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const txCount = transactions.length;
  const avgOrderVal = txCount > 0 ? totalSales / txCount : 0;

  // Determine sales velocity based on transaction counts
  let salesVelocity = "Neutral";
  if (txCount > 15) {
    salesVelocity = "Positive";
  } else if (txCount > 0 && txCount <= 5) {
    salesVelocity = "Negative";
  }

  const recommendations: AdviceRecommendation[] = [];

  // 1. Out of stock recommendation
  if (outOfStock.length > 0) {
    const list = outOfStock.slice(0, 3).map((p) => p.name).join(", ");
    recommendations.push({
      id: "rec-stock-out",
      category: "inventory",
      title: "Restock Critical Out-of-Stock Items",
      description: `You have ${outOfStock.length} items completely sold out, including: ${list}. This causes lost revenue daily.`,
      impact: "high",
      actionableSteps: outOfStock.map((p) => `Reorder ${p.name} (SKU: ${p.sku}) from supplier "${p.supplier || "default"}".`),
    });
  }

  // 2. Low stock warning
  if (lowStock.length > 0) {
    const list = lowStock.slice(0, 3).map((p) => `${p.name} (${p.stock} left)`).join(", ");
    recommendations.push({
      id: "rec-stock-low",
      category: "inventory",
      title: "Replenish Low Stock Inventory",
      description: `${lowStock.length} products are nearing depletion: ${list}. Replenish stock before they run out.`,
      impact: "medium",
      actionableSteps: lowStock.map((p) => `Draft replenishment request for ${p.name} (current stock: ${p.stock}).`),
    });
  }

  // 3. Best Seller Promotion
  const itemQuantities: { [name: string]: { qty: number; total: number } } = {};
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      if (!itemQuantities[item.name]) {
        itemQuantities[item.name] = { qty: 0, total: 0 };
      }
      itemQuantities[item.name].qty += item.quantity;
      itemQuantities[item.name].total += item.lineTotal;
    });
  });

  const sortedItems = Object.entries(itemQuantities).sort((a, b) => b[1].qty - a[1].qty);
  if (sortedItems.length > 0) {
    const [bestSellerName, data] = sortedItems[0];
    recommendations.push({
      id: "rec-sales-promo",
      category: "sales",
      title: `Optimize Display for Best Seller: ${bestSellerName}`,
      description: `"${bestSellerName}" is your top moving product with ${data.qty} units sold recently, generating Rs. ${data.total.toFixed(2)}.`,
      impact: "medium",
      actionableSteps: [
        `Place "${bestSellerName}" at eye-level shelf height or near checkouts.`,
        "Create a discount bundle with complementary lower-velocity products.",
      ],
    });
  } else {
    recommendations.push({
      id: "rec-general-sales",
      category: "general",
      title: "Initiate Store Sales Activity",
      description: "No sales transactions found in the database yet. Launch promotions or run demo transactions to analyze buyer trends.",
      impact: "medium",
      actionableSteps: [
        "Open the Checkout terminal and process a few sample orders.",
        "Check that cashiers are trained on standard checkout procedures.",
      ],
    });
  }

  // 4. Basket size optimization
  if (txCount > 0 && avgOrderVal < 1500) {
    recommendations.push({
      id: "rec-pricing-upsell",
      category: "pricing",
      title: "Introduce Cross-Selling and Impulse Bundles",
      description: `Your average transaction basket size is Rs. ${avgOrderVal.toFixed(2)}. Encouraging small add-ons at checkout can boost revenue by 10-15%.`,
      impact: "medium",
      actionableSteps: [
        "Train cashiers to suggest beverages or snacks at checkout.",
        "Set up an impulse rack next to the POS counter for items under Rs. 200.",
      ],
    });
  }

  // Insights
  const insights: AdviceInsight[] = [];
  
  if (outOfStock.length > 0) {
    insights.push({
      title: "Stock Alert",
      description: `${outOfStock.length} items are currently unavailable, leading to a projected 5% dip in daily category revenue.`,
    });
  }

  if (txCount > 0) {
    const cashCount = transactions.filter(t => t.paymentMethod.toLowerCase() === "cash").length;
    const cashPercent = Math.round((cashCount / txCount) * 100);
    
    insights.push({
      title: "Preferred Payment Channels",
      description: `${cashPercent}% of transactions were completed via cash, while the remaining ${100 - cashPercent}% used card or online gateways.`,
    });
  }

  insights.push({
    title: "Inventory Balance",
    description: `Your catalog contains ${products.length} products with a total inventory valuation of Rs. ${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}.`,
  });

  return {
    advisorOverview: `Lewdeniya Stores is operating at a store health rating of ${healthScore}%. ${
      outOfStock.length > 0 
        ? `Attention is needed regarding ${outOfStock.length} out-of-stock items which are causing revenue gaps.`
        : "Stock levels look stable, with no critical product outages."
    } Recent checkout activities indicate a transaction flow of ${txCount} orders, averaging Rs. ${avgOrderVal.toFixed(2)} per order.`,
    metrics: {
      healthScore,
      lowStockAlertsCount: outOfStock.length + lowStock.length,
      salesVelocity,
    },
    recommendations,
    insights,
    isRealAI: false,
  };
}

// Main server action to retrieve dashboard advice
export async function getAIAdvice(): Promise<AIAdviceResult> {
  try {
    const products = await getProducts();
    const transactions = await getTransactions();

    const hfToken = process.env.HF_TOKEN;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!hfToken && !apiKey) {
      console.log("No HF_TOKEN or GEMINI_API_KEY environment variable found. Using programmatic analytics advisor.");
      return generateMockAdvice(products, transactions);
    }

    // Format clean summaries for the prompt to save context tokens
    const productsSummary = products.map((p) => ({
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      category: p.category,
      supplier: p.supplier,
    }));

    const transactionsSummary = transactions.slice(0, 30).map((t) => ({
      orderId: t.orderId,
      total: t.total,
      paymentMethod: t.paymentMethod,
      items: t.items.map((i) => `${i.name} (qty: ${i.quantity})`),
      time: t.createdAt,
    }));

    const promptText = `
You are a retail business consultant analyzing the data of "Lewdeniya Stores" POS system.
Here is the current snapshot of our data:
- Current Inventory Products: ${JSON.stringify(productsSummary)}
- Recent Transactions (past 30 days): ${JSON.stringify(transactionsSummary)}

Analyze this data and provide retail advice. Be specific to the product names, category trends, stock shortages, and pricing dynamics in the data.
Return a JSON object matching this schema exactly:
{
  "advisorOverview": "A brief overview summary paragraph of how the store is doing, any critical issues, and general recommendations.",
  "metrics": {
    "healthScore": 85, // 0-100 integer score of how well the store is doing (consider out-of-stocks, sales trends)
    "lowStockAlertsCount": 2, // number of items in low stock (stock <= 5) or out of stock (stock <= 0)
    "salesVelocity": "Positive" // one of "Positive", "Neutral", "Negative"
  },
  "recommendations": [
    {
      "id": "rec-1",
      "category": "inventory", // one of: "inventory", "sales", "pricing", "general"
      "title": "Short title of advice",
      "description": "Elaborated advice description referring to actual product names if applicable",
      "impact": "high", // one of: "high", "medium", "low"
      "actionableSteps": ["Concrete task step 1", "Concrete task step 2"]
    }
  ],
  "insights": [
    {
      "title": "Insight heading",
      "description": "Analytical description of a trend seen in products or sales data"
    }
  ]
}

Ensure the response is valid JSON and nothing else. Do not wrap in markdown blocks like \`\`\`json.
`;

    let responseText = "";
    let isRealAI = false;

    // Try Hugging Face Router first
    if (hfToken) {
      try {
        console.log("Contacting Hugging Face OpenAI router with model openai/gpt-oss-20b:groq...");
        const url = "https://router.huggingface.co/v1/chat/completions";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${hfToken}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b:groq",
            messages: [
              {
                role: "user",
                content: promptText,
              },
            ],
          }),
        });

        if (response.ok) {
          const json = await response.json();
          responseText = json.choices?.[0]?.message?.content || "";
          isRealAI = true;
          console.log("Hugging Face API advice retrieved successfully.");
        } else {
          console.warn("Hugging Face API request failed with status:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error fetching from Hugging Face API:", err);
      }
    }

    // Try Gemini API second
    if (!responseText && apiKey) {
      try {
        console.log("Contacting Gemini API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          isRealAI = true;
          console.log("Gemini API advice retrieved successfully.");
        } else {
          console.warn("Gemini API request failed with status:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error fetching from Gemini API:", err);
      }
    }

    if (!responseText) {
      console.warn("No API response gathered. Falling back to local analytics.");
      return generateMockAdvice(products, transactions);
    }

    const cleanedText = responseText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const result = JSON.parse(cleanedText) as AIAdviceResult;
    result.isRealAI = isRealAI;
    return result;

  } catch (error) {
    console.error("Failed to run AI Advice action:", error);
    try {
      const products = await getProducts();
      const transactions = await getTransactions();
      return generateMockAdvice(products, transactions);
    } catch (fallbackError) {
      console.error("Even fallback mock generator failed:", fallbackError);
      return {
        advisorOverview: "System is temporarily unable to retrieve retail metrics. Please ensure database connectivity is stable.",
        metrics: { healthScore: 100, lowStockAlertsCount: 0, salesVelocity: "Neutral" },
        recommendations: [],
        insights: [],
        isRealAI: false,
      };
    }
  }
}

// Ask custom questions to AI Advisor
export async function askAIAdvisor(question: string): Promise<string> {
  try {
    const products = await getProducts();
    const transactions = await getTransactions();

    const hfToken = process.env.HF_TOKEN;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!hfToken && !apiKey) {
      // Local programmatic answers for basic keywords
      const q = question.toLowerCase();
      if (q.includes("stock") || q.includes("inventory") || q.includes("replenish")) {
        const low = products.filter(p => p.stock <= 5);
        if (low.length === 0) return "All items are in healthy supply (above 5 units). No immediate restocking is programmatically flagged.";
        return `We noticed ${low.length} items are running low (stock <= 5): ${low.map(p => `${p.name} (${p.stock} units)`).join(", ")}. Restock these soon to maintain availability.`;
      }
      if (q.includes("sales") || q.includes("revenue") || q.includes("popular") || q.includes("best seller")) {
        const itemQuantities: { [name: string]: number } = {};
        transactions.forEach(t => t.items.forEach(i => {
          itemQuantities[i.name] = (itemQuantities[i.name] || 0) + i.quantity;
        }));
        const sorted = Object.entries(itemQuantities).sort((a,b) => b[1] - a[1]);
        if (sorted.length === 0) return "No sales history exists in the system database yet.";
        return `Based on live records, your top selling item is "${sorted[0][0]}" with ${sorted[0][1]} units sold.`;
      }
      return "Hello! I am Lewdeniya Stores' AI Business Advisor. Please set up an `HF_TOKEN` or `GEMINI_API_KEY` in your `.env` file to unlock unrestricted, real-time AI conversations about your POS system.";
    }

    const productsSummary = products.map((p) => ({
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      category: p.category,
      supplier: p.supplier,
    }));

    const transactionsSummary = transactions.slice(0, 30).map((t) => ({
      orderId: t.orderId,
      total: t.total,
      paymentMethod: t.paymentMethod,
      items: t.items.map((i) => `${i.name} (qty: ${i.quantity})`),
      time: t.createdAt,
    }));

    const promptText = `
You are a retail business consultant answering a question for the store manager of "Lewdeniya Stores".
Here is our data:
- Current Inventory Products: ${JSON.stringify(productsSummary)}
- Recent Transactions (past 30 days): ${JSON.stringify(transactionsSummary)}

The manager's question is: "${question}"

Provide a professional, concise, and helpful response referring directly to the data where possible. Focus on actionable insights. Keep the length under 250 words.
`;

    // Try Hugging Face Router
    if (hfToken) {
      try {
        const url = "https://router.huggingface.co/v1/chat/completions";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${hfToken}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b:groq",
            messages: [
              {
                role: "user",
                content: promptText,
              },
            ],
          }),
        });

        if (response.ok) {
          const json = await response.json();
          return json.choices?.[0]?.message?.content || "No advice returned.";
        }
      } catch (err) {
        console.error("Error asking Hugging Face AI advisor:", err);
      }
    }

    // Try Gemini API
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const json = await response.json();
          return json.candidates?.[0]?.content?.parts?.[0]?.text || "No insights could be compiled. Please try again.";
        }
      } catch (err) {
        console.error("Error asking Gemini AI advisor:", err);
      }
    }

    return "The AI Advisor is busy at the moment. Please verify your credentials or network status.";

  } catch (error) {
    console.error("Error asking AI advisor:", error);
    return "Error communicating with AI Advisor. Please try again.";
  }
}
