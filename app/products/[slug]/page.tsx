import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Truck } from "lucide-react";
import { getProductBySlug, products } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {};
  }
  return {
    title: `${product.name} — Crowdfunding FNEBicicultura 2026`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar às recompensas
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {product.gallery && product.gallery.length > 0 ? (
          <ProductGallery images={product.gallery} alt={product.name} />
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(product.price)}
          </p>

          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          {product.slug !== "doacao-qualquer-valor" && (
            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
              <Truck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="text-zinc-700 dark:text-zinc-300">
                Entrega presencialmente durante o evento, ou posteriormente, de
                forma a combinar.
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/products/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
