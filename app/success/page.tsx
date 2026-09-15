"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

type OrderInfo = {
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
} | null;

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("external_reference");
  const { clearCart, items } = useCart();
  const [state, setState] = useState<{
    order: OrderInfo;
    loading: boolean;
    notFound: boolean;
  }>({
    order: null,
    loading: Boolean(orderId),
    notFound: !orderId,
  });

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    fetch(`/api/orders/${orderId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("not found");
        }
        return (await response.json()) as NonNullable<OrderInfo>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        setState({ order: data, loading: false, notFound: false });
        if (data.status === "approved") {
          clearCart();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ order: null, loading: false, notFound: true });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (state.loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-zinc-500">Consultando seu pedido…</p>
      </div>
    );
  }

  if (state.notFound || (!state.order && !orderId)) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold tracking-tight">
          Pedido não encontrado
        </h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Não conseguimos localizar o pedido. Se você foi redirecionado do
          Mercado Pago, verifique seu e-mail para mais informações.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  const approved = state.order?.status === "approved";
  const pending = state.order?.status === "pending";

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
      {approved ? (
        <CheckCircle2 className="h-20 w-20 text-emerald-500" />
      ) : pending ? (
        <Clock className="h-20 w-20 text-amber-500" />
      ) : (
        <ShoppingBag className="h-20 w-20 text-zinc-400" />
      )}

      <h1 className="text-3xl font-bold tracking-tight">
        {approved
          ? "Pagamento aprovado!"
          : pending
            ? "Pagamento em análise"
            : "Pedido recebido"}
      </h1>

      <p className="max-w-md leading-relaxed text-zinc-600 dark:text-zinc-400">
        {approved
          ? `Obrigado pela compra! Seu pedido de ${formatPrice(state.order?.total ?? 0)} foi confirmado. Você receberá os detalhes de envio no seu e-mail.`
          : pending
            ? "Estamos aguardando a confirmação do Mercado Pago. Assim que o pagamento for aprovado, você receberá um e-mail com a confirmação."
            : "Seu pedido foi recebido, mas o pagamento ainda não foi confirmado."}
      </p>

      {state.order && (
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Pedido #{orderId?.slice(0, 8)}
          </p>
          <ul className="flex flex-col gap-2">
            {state.order.items.map((item) => (
              <li
                key={item.name}
                className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400"
              >
                <span>{item.name}</span>
                <span>× {item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 font-bold dark:border-zinc-800">
            <span>Total</span>
            <span>{formatPrice(state.order.total)}</span>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <Link
          href="/checkout"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Tentar pagamento novamente
        </Link>
      )}

      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Continuar comprando
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
