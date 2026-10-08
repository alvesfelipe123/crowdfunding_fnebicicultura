import { getApprovedTotal } from "@/lib/orders";
import { searchRecentPayments } from "@/lib/mercadopago";

export type RaisedTotal = {
  total: number;
  source: "mercadopago" | "local";
};

const CACHE_TTL_MS = 60_000;
const PAYMENT_WINDOW_DAYS = 180;

let cache: (RaisedTotal & { cachedAt: number }) | null = null;

/**
 * Total arrecadado: soma os pagamentos aprovados no Mercado Pago (sobrevive a
 * redeploys). Se a API não responder, cai para o arquivo local de pedidos.
 * Resultado memorizado por 60s para não consultar o Mercado Pago a cada request.
 */
export async function getRaisedTotal(): Promise<RaisedTotal> {
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return { total: cache.total, source: cache.source };
  }

  let result: RaisedTotal;

  const payments = await searchRecentPayments(PAYMENT_WINDOW_DAYS, 500);
  if (payments) {
    const total = payments
      .filter((payment) => payment.status === "approved")
      .reduce((sum, payment) => sum + payment.amount, 0);
    result = { total, source: "mercadopago" };
  } else {
    result = { total: await getApprovedTotal(), source: "local" };
  }

  cache = { ...result, cachedAt: Date.now() };
  return result;
}
