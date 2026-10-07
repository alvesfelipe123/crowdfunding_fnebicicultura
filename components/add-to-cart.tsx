"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

function OptionPicker({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (option: string) => void;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`h-11 min-w-14 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
              }`}
              aria-pressed={active}
            >
              {option}
            </button>
          );
        })}
      </div>
      {!value && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {hint}
        </p>
      )}
    </div>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const sizes = product.sizes;
  const colors = product.colors;
  const needsSize = Boolean(sizes?.length);
  const needsColor = Boolean(colors?.length);
  const selectedSize = needsSize ? size : null;
  const selectedColor = needsColor ? color : null;
  const canAdd =
    (!needsSize || selectedSize !== null) &&
    (!needsColor || selectedColor !== null);
  const variant = {
    ...(selectedSize ? { size: selectedSize } : {}),
    ...(selectedColor ? { color: selectedColor } : {}),
  };

  function handleAdd() {
    if (!canAdd) {
      return;
    }
    addItem(product, quantity, variant);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      {needsSize && sizes && (
        <OptionPicker
          label="Tamanho"
          options={sizes}
          value={selectedSize}
          onChange={setSize}
          hint="Escolha um tamanho para continuar."
        />
      )}

      {needsColor && colors && (
        <OptionPicker
          label="Cor"
          options={colors}
          value={selectedColor}
          onChange={setColor}
          hint="Escolha uma cor para continuar."
        />
      )}

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
          disabled={!canAdd}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
          disabled={pending || !canAdd}
          onClick={() => {
            if (!canAdd) {
              return;
            }
            addItem(product, quantity, variant);
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
