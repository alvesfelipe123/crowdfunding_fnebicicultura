"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "aurora-cart";

let items: CartItem[] = [];
let listeners: Array<() => void> = [];
let loaded = false;

function loadFromStorage(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function emit() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignora erros de armazenamento
  }
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CartItem[] {
  if (!loaded) {
    items = loadFromStorage();
    loaded = true;
  }
  return items;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const existing = items.find((item) => item.slug === product.slug);
    if (existing) {
      items = items.map((item) =>
        item.slug === product.slug
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    } else {
      items = [
        ...items,
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    }
    emit();
  }, []);

  const removeItem = useCallback((slug: string) => {
    items = items.filter((item) => item.slug !== slug);
    emit();
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    items =
      quantity <= 0
        ? items.filter((item) => item.slug !== slug)
        : items.map((item) =>
            item.slug === slug ? { ...item, quantity } : item,
          );
    emit();
  }, []);

  const clearCart = useCallback(() => {
    items = [];
    emit();
  }, []);

  const { count, subtotal } = useMemo(() => {
    const count = snapshot.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = snapshot.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return { count, subtotal };
  }, [snapshot]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: snapshot,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      count,
      subtotal,
    }),
    [snapshot, addItem, removeItem, updateQuantity, clearCart, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
