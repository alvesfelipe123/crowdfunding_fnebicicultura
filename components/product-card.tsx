import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          {product.category}
        </p>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {formatPrice(product.price)}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-zinc-800">
            <ShoppingCart className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
