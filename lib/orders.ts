import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type OrderStatus =
  | "pending"
  | "approved"
  | "pending_review"
  | "rejected"
  | "cancelled"
  | "in_process";

export type Order = {
  id: string;
  status: OrderStatus;
  items: {
    slug: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  total: number;
  payerEmail?: string;
  payerName?: string;
  paymentId?: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function createOrder(input: {
  items: Order["items"];
  total: number;
  payerEmail?: string;
  payerName?: string;
}): Promise<Order> {
  const order: Order = {
    id: randomUUID(),
    status: "pending",
    items: input.items,
    total: input.total,
    payerEmail: input.payerEmail,
    payerName: input.payerName,
    createdAt: new Date().toISOString(),
  };
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function getApprovedTotal(): Promise<number> {
  const orders = await readOrders();
  return orders
    .filter((order) => order.status === "approved")
    .reduce((sum, order) => sum + (order.total ?? 0), 0);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  paymentId?: string,
): Promise<Order | null> {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) {
    return null;
  }
  orders[index] = {
    ...orders[index],
    status,
    ...(paymentId ? { paymentId } : {}),
  };
  await writeOrders(orders);
  return orders[index];
}
