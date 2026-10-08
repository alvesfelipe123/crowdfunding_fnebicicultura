import type { Metadata } from "next";
import { listOrders, type Order, type OrderStatus } from "@/lib/orders";
import {
  getPaymentDetails,
  searchRecentPayments,
  type PaymentSummary,
} from "@/lib/mercadopago";
import { formatPrice } from "@/lib/utils";
import { CAMPAIGN_GOAL } from "@/components/campaign-progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedidos — Admin FNEBicicultura",
  robots: { index: false, follow: false },
};

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  approved: {
    label: "Aprovado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  in_process: {
    label: "Em processamento",
    className: "bg-sky-100 text-sky-800 border-sky-200",
  },
  pending_review: {
    label: "Em análise",
    className: "bg-violet-100 text-violet-800 border-violet-200",
  },
  rejected: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-zinc-200 text-zinc-700 border-zinc-300",
  },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "approved", label: "Aprovados" },
  { value: "pending", label: "Pendentes" },
  { value: "rejected", label: "Rejeitados" },
  { value: "cancelled", label: "Cancelados" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function describeItem(item: Order["items"][number]): string {
  const variant = [item.size ? `Tam. ${item.size}` : null, item.color]
    .filter(Boolean)
    .join(", ");
  return variant ? `${item.name} (${variant})` : item.name;
}

type AdminRow = {
  key: string;
  orderId: string;
  status: OrderStatus;
  total: number;
  items: Order["items"];
  payerName?: string;
  payerEmail?: string;
  paymentId?: string;
  createdAt: string;
  source: "arquivo local" | "Mercado Pago" | "ambos";
};

function statusRank(status: OrderStatus | null): number {
  if (status === "approved") return 3;
  if (status === "pending" || status === "in_process") return 2;
  return status ? 1 : 0;
}

/**
 * Junta o arquivo local de pedidos com os pagamentos do Mercado Pago.
 * O Mercado Pago é a fonte de verdade: pagamentos que sumiram do arquivo
 * local (redeploy) voltam a aparecer, com status e valor atuais.
 */
async function loadRows(): Promise<{
  rows: AdminRow[];
  mpAvailable: boolean;
  mpCount: number;
  localCount: number;
}> {
  const [orders, payments] = await Promise.all([
    listOrders(),
    searchRecentPayments(180, 500),
  ]);

  const rows = new Map<string, AdminRow>();
  for (const order of orders) {
    rows.set(order.id, {
      key: order.id,
      orderId: order.id,
      status: order.status,
      total: order.total,
      items: order.items,
      payerName: order.payerName,
      payerEmail: order.payerEmail,
      paymentId: order.paymentId,
      createdAt: order.createdAt,
      source: "arquivo local",
    });
  }
  const localCount = rows.size;

  if (!payments) {
    return {
      rows: [...rows.values()],
      mpAvailable: false,
      mpCount: 0,
      localCount,
    };
  }

  // melhor pagamento por pedido (aprovado tem prioridade)
  const best = new Map<string, PaymentSummary>();
  for (const payment of payments) {
    const key = payment.orderId ?? `mp:${payment.paymentId}`;
    const current = best.get(key);
    if (!current || statusRank(payment.status) > statusRank(current.status)) {
      best.set(key, payment);
    }
  }

  // pagamentos sem pedido local e sem itens na metadata: busca no Mercado Pago
  const missingIds = [...best.entries()]
    .filter(([key, payment]) => !rows.has(key) && !payment.items?.length)
    .map(([, payment]) => payment.paymentId)
    .slice(0, 50);
  const details = await getPaymentDetails(missingIds);

  for (const [key, payment] of best) {
    const existing = rows.get(key);
    if (existing) {
      if (payment.status) {
        existing.status = payment.status;
      }
      existing.paymentId = payment.paymentId;
      if (payment.amount > 0) {
        existing.total = payment.amount;
      }
      existing.payerEmail = existing.payerEmail ?? payment.payerEmail;
      existing.source = "ambos";
      continue;
    }

    const detail = details?.get(payment.paymentId);
    const mpItems = payment.items?.length
      ? payment.items
      : detail?.items;
    const items: Order["items"] = mpItems?.length
      ? mpItems.map((item) => ({
          slug: "",
          name: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [
          {
            slug: "",
            name: payment.description ?? "Pagamento Mercado Pago",
            quantity: 1,
            unitPrice: payment.amount,
          },
        ];

    rows.set(key, {
      key,
      orderId: payment.orderId ?? payment.paymentId,
      status: payment.status ?? "pending",
      total: payment.amount,
      items,
      payerName: detail?.payerName,
      payerEmail: detail?.payerEmail ?? payment.payerEmail,
      paymentId: payment.paymentId,
      createdAt: payment.createdAt,
      source: "Mercado Pago",
    });
  }

  const sorted = [...rows.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );

  return {
    rows: sorted,
    mpAvailable: true,
    mpCount: payments.length,
    localCount,
  };
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function TokenForm({ error }: { error?: boolean }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-24">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Área administrativa</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Informe o token configurado na variável{" "}
          <code className="rounded bg-zinc-100 px-1">ADMIN_TOKEN</code>.
        </p>
        <form method="get" action="/admin" className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            name="token"
            autoFocus
            required
            placeholder="Token de acesso"
            className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-zinc-900 outline-none transition-colors focus:border-indigo-600"
          />
          {error && (
            <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              Token inválido.
            </p>
          )}
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h1 className="text-lg font-bold text-amber-900">
            ADMIN_TOKEN não configurado
          </h1>
          <p className="mt-2 text-sm text-amber-800">
            Adicione a variável <strong>ADMIN_TOKEN</strong> nas variáveis de
            ambiente (painel da GoDaddy → Environment Variables, ou{" "}
            <code className="rounded bg-amber-100 px-1">.env</code> local) e
            reinicie o app. Depois acesse{" "}
            <code className="rounded bg-amber-100 px-1">
              /admin?token=SEU_TOKEN
            </code>
            .
          </p>
        </div>
      </div>
    );
  }

  if (token !== expected) {
    return <TokenForm error={token ? true : undefined} />;
  }

  const { rows: all, mpAvailable, mpCount, localCount } = await loadRows();
  const activeFilter = status ?? "all";
  const orders =
    activeFilter === "all"
      ? all
      : all.filter((order) => order.status === activeFilter);

  const approved = all.filter((order) => order.status === "approved");
  const pending = all.filter((order) => order.status === "pending");
  const raised = approved.reduce((sum, order) => sum + order.total, 0);

  const linkFor = (value: string) =>
    `/admin?token=${encodeURIComponent(token)}${
      value === "all" ? "" : `&status=${value}`
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <span className="text-sm text-zinc-500">
          {all.length} pedido{all.length === 1 ? "" : "s"} no total ·{" "}
          {mpAvailable
            ? `Mercado Pago: ${mpCount} pagamento${mpCount === 1 ? "" : "s"} · arquivo local: ${localCount}`
            : "arquivo local"}
        </span>
      </div>

      {!mpAvailable && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Não foi possível consultar a API do Mercado Pago — exibindo apenas o
          arquivo local (que pode estar vazio após um redeploy). Verifique o{" "}
          <code className="rounded bg-amber-100 px-1">
            MERCADO_PAGO_ACCESS_TOKEN
          </code>
          .
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Arrecadado
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {formatPrice(raised)}
          </p>
          <p className="text-xs text-emerald-700">
            {approved.length} pagamento
            {approved.length === 1 ? "" : "s"} aprovado
            {approved.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Pendentes
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">
            {pending.length}
          </p>
          <p className="text-xs text-amber-700">
            {formatPrice(pending.reduce((sum, o) => sum + o.total, 0))}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Meta
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-800">
            {formatPrice(CAMPAIGN_GOAL, { integer: true })}
          </p>
          <p className="text-xs text-zinc-500">
            {Math.min(100, Math.round((raised / CAMPAIGN_GOAL) * 100))}% da meta
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Valor total dos pedidos
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-800">
            {formatPrice(all.reduce((sum, o) => sum + o.total, 0))}
          </p>
          <p className="text-xs text-zinc-500">todos os status</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <a
            key={filter.value}
            href={linkFor(filter.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
          Nenhum pedido neste filtro.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Itens</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((row) => (
                <tr key={row.key} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-zinc-700">
                      {row.orderId.slice(0, 8)}
                    </p>
                    {row.paymentId && (
                      <p className="text-xs text-zinc-400">MP {row.paymentId}</p>
                    )}
                    {row.source === "Mercado Pago" && (
                      <p className="text-[10px] font-semibold uppercase text-indigo-500">
                        só no MP
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-800">{row.payerName ?? "—"}</p>
                    <p className="text-xs text-zinc-400">
                      {row.payerEmail ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="flex flex-col gap-1">
                      {row.items.map((item, index) => (
                        <li
                          key={`${row.key}-${index}`}
                          className="text-zinc-700"
                        >
                          {describeItem(item)}{" "}
                          <span className="text-zinc-400">
                            × {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-zinc-900">
                    {formatPrice(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-zinc-400">
        Combina o arquivo local <code>.data/orders.json</code> com os
        pagamentos da API do Mercado Pago (fonte de verdade — sobrevive a
        redeploys). O webhook do Mercado Pago atualiza o arquivo local.
      </p>
    </div>
  );
}
