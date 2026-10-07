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
  size?: string;
  color?: string;
};

export type CartVariant = {
  size?: string;
  color?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: CartVariant) => void;
  removeItem: (slug: string, variant?: CartVariant) => void;
  updateQuantity: (
    slug: string,
    quantity: number,
    variant?: CartVariant,
  ) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

function matches(item: CartItem, slug: string, variant?: CartVariant): boolean {
  return (
    item.slug === slug &&
    (item.size ?? "") === (variant?.size ?? "") &&
    (item.color ?? "") === (variant?.color ?? "")
  );
}

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

  const addItem = useCallback(
    (product: Product, quantity = 1, variant?: CartVariant) => {
      const existing = items.find((item) =>
        matches(item, product.slug, variant),
      );
      if (existing) {
        items = items.map((item) =>
          matches(item, product.slug, variant)
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
            ...(variant?.size ? { size: variant.size } : {}),
            ...(variant?.color ? { color: variant.color } : {}),
          },
        ];
      }
      emit();
    },
    [],
  );

  const removeItem = useCallback((slug: string, variant?: CartVariant) => {
    items = items.filter((item) => !matches(item, slug, variant));
    emit();
  }, []);

  const updateQuantity = useCallback(
    (slug: string, quantity: number, variant?: CartVariant) => {
      items =
        quantity <= 0
          ? items.filter((item) => !matches(item, slug, variant))
          : items.map((item) =>
              matches(item, slug, variant) ? { ...item, quantity } : item,
            );
      emit();
    },
    [],
  );

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
