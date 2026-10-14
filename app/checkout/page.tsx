"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
  }
}

type CheckoutStatus = "idle" | "loading" | "error";

function CheckoutContent() {
  const { items, subtotal } = useCart();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [checkout, setCheckout] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState("");

  function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cpf.replace(/\D/g, "").length !== 11) {
      setCheckout("error");
      setError("Informe um CPF válido (11 dígitos).");
      return;
    }

    setCheckout("loading");
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, name, email, cpf, deviceId }),
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
      <Script
        src="https://www.mercadopago.com/v2/security.js"
        strategy="afterInteractive"
        onReady={() => setDeviceId(window.MP_DEVICE_SESSION_ID ?? "")}
        {...{ view: "checkout" }}
      />
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      {status === "pending" && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Seu pagamento está em análise. Assim que for confirmado, você
          receberá a confirmação do pedido.
        </div>
      )}
      {status === "failure" && (
        <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">O pagamento não foi concluído.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Não repita a mesma tentativa em sequência: o Mercado Pago pode
              bloquear pagamentos idênticos por segurança.
            </li>
            <li>
              Se possível, pague com <strong>Pix</strong> ou com o saldo da sua
              carteira do Mercado Pago — a aprovação é imediata.
            </li>
            <li>
              No cartão, tente outro cartão ou aguarde alguns minutos antes de
              tentar novamente.
            </li>
          </ul>
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

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cpf"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              required
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 outline-none transition-colors focus:border-indigo-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <p className="text-xs text-zinc-400">
              O CPF é enviado com segurança ao Mercado Pago para confirmar a
              titularidade do cartão.
            </p>
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
              <div
                key={`${item.slug}-${item.size ?? ""}-${item.color ?? ""}`}
                className="flex items-center gap-3"
              >
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
                  <p className="font-medium leading-tight">
                    {item.name}
                    {(item.size || item.color) && (
                      <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                        ·{" "}
                        {[
                          item.size ? `Tam. ${item.size}` : null,
                          item.color ?? null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </p>
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
