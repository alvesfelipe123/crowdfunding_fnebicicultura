"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h1 className="text-2xl font-bold tracking-tight">
          Você ainda não escolheu recompensas
        </h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Explore as recompensas, escolha a sua e faça parte desta campanha. 💙
        </p>
          <Link
            href="/"
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Ver recompensas da campanha
          </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Suas recompensas
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.slug, item.quantity - 1)
                    }
                    className="h-8 w-8 rounded-full border border-zinc-300 font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.slug, item.quantity + 1)
                    }
                    className="h-8 w-8 rounded-full border border-zinc-300 font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-bold">Sua contribuição</h2>
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>Recompensas</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total da contribuição</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Apoiar campanha
            <ArrowRight className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="mt-3 block text-center text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Ver outras recompensas
          </Link>
        </div>
      </div>
    </div>
  );
}
