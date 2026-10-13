export const seed = [
  {
    id: 1,
    name: "Arc lounge chair",
    sku: "FUR-001",
    category: "Furniture",
    stock: 48,
    reorder_level: 10,
    price: 249,
    location: "Warehouse A",
    tone: "sand",
    icon: "chair",
  },
  {
    id: 2,
    name: "Studio desk lamp",
    sku: "LGT-002",
    category: "Lighting",
    stock: 8,
    reorder_level: 15,
    price: 89,
    location: "Warehouse A",
    tone: "sage",
    icon: "lamp",
  },
  {
    id: 3,
    name: "Everyday ceramic vase",
    sku: "DEC-003",
    category: "Decor",
    stock: 124,
    reorder_level: 20,
    price: 34,
    location: "Warehouse B",
    tone: "clay",
    icon: "vase",
  },
  {
    id: 4,
    name: "Oak side table",
    sku: "FUR-004",
    category: "Furniture",
    stock: 32,
    reorder_level: 10,
    price: 129,
    location: "Warehouse A",
    tone: "sand",
    icon: "table",
  },
  {
    id: 5,
    name: "Linen cushion cover",
    sku: "TXT-005",
    category: "Textiles",
    stock: 0,
    reorder_level: 20,
    price: 24,
    location: "Warehouse B",
    tone: "pink",
    icon: "cushion",
  },
  {
    id: 6,
    name: "Terra planter",
    sku: "DEC-006",
    category: "Decor",
    stock: 76,
    reorder_level: 15,
    price: 42,
    location: "Warehouse B",
    tone: "sage",
    icon: "plant",
  },
  {
    id: 7,
    name: "Woven storage basket",
    sku: "ORG-007",
    category: "Storage",
    stock: 12,
    reorder_level: 15,
    price: 56,
    location: "Warehouse A",
    tone: "sand",
    icon: "basket",
  },
  {
    id: 8,
    name: "Pendant light · ivory",
    sku: "LGT-008",
    category: "Lighting",
    stock: 64,
    reorder_level: 10,
    price: 118,
    location: "Warehouse B",
    tone: "blue",
    icon: "lamp",
  },
];
export const status = (p) =>
  p.stock === 0
    ? "Out of stock"
    : p.stock <= p.reorder_level
      ? "Low stock"
      : "In stock";
export const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const unitPrice = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
