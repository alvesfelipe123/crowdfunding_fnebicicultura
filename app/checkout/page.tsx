"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

type CheckoutStatus = "idle" | "loading" | "error";

function CheckoutContent() {
  const { items, subtotal } = useCart();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkout, setCheckout] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState("");

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckout("loading");
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, name, email }),
      });
      const data = (await response.json()) as {
        initPoint?: string;
        error?: string;
      };

      if (!response.ok || !data.initPoint) {
        setCheckout("error");
        setError(data.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setCheckout("error");
      setError("Erro de conexão. Tente novamente.");
    }
  }

  if (items.length === 0 && status === null) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Seu carrinho está vazio
        </h1>
        <Link
          href="/"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Ver recompensas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      {status === "pending" && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Seu pagamento está em análise. Assim que for confirmado, você
          receberá a confirmação do pedido.
        </div>
      )}
      {status === "failure" && (
        <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          O pagamento não foi concluído. Você pode tentar novamente abaixo.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleCheckout}
          className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold">Dados para entrega</h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={checkout === "loading"}
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {checkout === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirecionando para o Mercado Pago…
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                Pagar com Mercado Pago
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4" />
            Você será redirecionado para o ambiente seguro do Mercado Pago.
          </p>
        </form>

        <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold">Resumo do pedido</h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{item.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
