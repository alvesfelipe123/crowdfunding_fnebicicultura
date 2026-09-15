"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Quantidade
        </span>
        <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg font-semibold text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="px-4 py-2 text-lg font-semibold text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total
          </span>
          <span className="text-xl font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          {added ? (
            <Check className="h-5 w-5" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
          {added ? "Recompensa escolhida!" : "Escolher recompensa"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            addItem(product, quantity);
            startTransition(() => router.push("/cart"));
          }}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-300 font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Apoiar agora"
          )}
        </button>
      </div>
    </div>
  );
}
