import { Product } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Premium Gold Pineapple",
    price: 3.99,
    unit: "/ea",
    category: "Fresh Produce",
    stock: 94,
    sku: "PRO-PIN-001",
    supplier: "Local Farms Co.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVgXBLLhqP_21EcBomEmdvOJJpI91COsgMCW7FiJE8nSXz9kka-_SCjhgE9AVwlbwlMT25HIKAKEdm7tyVneaFS0e4HwP4bxLfk5UwBIuaGDN94WGOxcEABOMOq1lhdPCTVXfHPgAIqAIGT0JPclBqFSEI9HOSfw3bVqcnyaZJUf_zVKoCDrThlJexcTbfzaD0hjAgfFwqWsbpYDhFQaBWXLbNYo43fnvx2-G5W1_x9WfneMh0kMcrW59jXHMTwp7vSKOIxEf5UfpU",
    altText: "A bright, high-resolution product photography shot of a single fresh pineapple sitting on a pristine white surface."
  },
  {
    id: "prod-002",
    name: "Hass Avocado",
    price: 1.50,
    unit: "/ea",
    category: "Fresh Produce",
    stock: 42,
    sku: "PRO-AVO-002",
    supplier: "Local Farms Co.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0xUZEVdSuB0w6eILcd0ONvIZrSTHZqFTrt6MqtOoulw13OB_nz5YS4FD7Wsgh-UIL-Lwwv7IAGR6Dc_s4H22EUG29DFRCFARRguTieROMU3kwEHU51kihjXZoiuCtJqIUVHPpbDW3anGWf_0ntDi2qNfgYv1eDDQ1yw5Xm1BNAEqV0zbxUSHYQNZZVzMwNIHM2yyu49epdqvFovR3M_-SKQatTy4OeCxM3V_El7GQBRjJTyJHYWPdwvEKr8wLJmpxyomoYEjbxl1j",
    altText: "A ripe, halved avocado with the pit intact, resting on a clean, light-grey studio backdrop."
  },
  {
    id: "prod-003",
    name: "Organic Bananas",
    price: 1.99,
    unit: "/kg",
    category: "Fresh Produce",
    stock: 85,
    sku: "PRO-BAN-003",
    supplier: "SunGrown Fruits",
    icon: "eco"
  },
  {
    id: "prod-004",
    name: "Red Strawberries 250g",
    price: 4.50,
    unit: "/ea",
    category: "Fresh Produce",
    stock: 28,
    sku: "PRO-STR-004",
    supplier: "SunGrown Fruits",
    icon: "nutrition"
  },
  {
    id: "prod-005",
    name: "Whole Milk 2L",
    price: 3.49,
    unit: "/ea",
    category: "Dairy & Bakery",
    stock: 60,
    sku: "DAI-MIL-005",
    supplier: "Fresh Dairies Ltd.",
    icon: "opacity"
  },
  {
    id: "prod-006",
    name: "Greek Yogurt 1kg",
    price: 5.99,
    unit: "/ea",
    category: "Dairy & Bakery",
    stock: 24,
    sku: "DAI-YOG-006",
    supplier: "Fresh Dairies Ltd.",
    icon: "egg"
  },
  {
    id: "prod-007",
    name: "Fresh Sourdough Bread",
    price: 4.25,
    unit: "/ea",
    category: "Dairy & Bakery",
    stock: 15,
    sku: "BAK-SOU-007",
    supplier: "City Bakery",
    icon: "breakfast_dining"
  },
  {
    id: "prod-008",
    name: "Chocolate Croissant",
    price: 2.75,
    unit: "/ea",
    category: "Dairy & Bakery",
    stock: 18,
    sku: "BAK-CRO-008",
    supplier: "City Bakery",
    icon: "bakery_dining"
  },
  {
    id: "prod-009",
    name: "Spring Water 1L",
    price: 0.99,
    unit: "/ea",
    category: "Beverages",
    stock: 112,
    sku: "BEV-WAT-009",
    supplier: "AquaFresh",
    icon: "water_drop"
  },
  {
    id: "prod-010",
    name: "Fresh Orange Juice 1L",
    price: 3.80,
    unit: "/ea",
    category: "Beverages",
    stock: 35,
    sku: "BEV-JUI-010",
    supplier: "AquaFresh",
    icon: "local_drink"
  },
  {
    id: "prod-011",
    name: "Ground Coffee Arabica 250g",
    price: 8.99,
    unit: "/ea",
    category: "Beverages",
    stock: 50,
    sku: "BEV-COF-011",
    supplier: "GlobalRoast Inc.",
    icon: "coffee"
  },
  {
    id: "prod-012",
    name: "Matcha Green Tea 50g",
    price: 12.50,
    unit: "/ea",
    category: "Beverages",
    stock: 12,
    sku: "BEV-MAT-012",
    supplier: "GlobalRoast Inc.",
    icon: "energy_savings_leaf"
  },
  {
    id: "prod-013",
    name: "Potato Chips Salted",
    price: 2.20,
    unit: "/ea",
    category: "Snacks",
    stock: 75,
    sku: "SNA-CHI-013",
    supplier: "SnackTime Corp.",
    icon: "cookie"
  },
  {
    id: "prod-014",
    name: "Mixed Nuts 200g",
    price: 5.50,
    unit: "/ea",
    category: "Snacks",
    stock: 40,
    sku: "SNA-NUT-014",
    supplier: "SnackTime Corp.",
    icon: "spa"
  },
  {
    id: "prod-015",
    name: "Dark Chocolate 70%",
    price: 3.50,
    unit: "/ea",
    category: "Snacks",
    stock: 62,
    sku: "SNA-CHO-015",
    supplier: "Premium Confectionery",
    icon: "flatware"
  },
  {
    id: "prod-016",
    name: "Organic Granola Bars",
    price: 4.99,
    unit: "/ea",
    category: "Snacks",
    stock: 30,
    sku: "SNA-GRA-016",
    supplier: "SnackTime Corp.",
    icon: "grain"
  }
];

export const CATEGORIES = [
  "All Items",
  "Fresh Produce",
  "Dairy & Bakery",
  "Beverages",
  "Snacks"
];
