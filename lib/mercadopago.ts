import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { CartItem } from "@/lib/cart-context";
import type { OrderStatus } from "@/lib/orders";

export function getMercadoPagoClient(): MercadoPagoConfig | null {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return null;
  }
  return new MercadoPagoConfig({ accessToken });
}

export function mapPaymentStatus(status?: string): OrderStatus | null {
  switch (status) {
    case "approved":
      return "approved";
    case "pending":
    case "in_process":
      return "pending";
    case "rejected":
      return "rejected";
    case "cancelled":
    case "cancelled_by_payment_authorization":
    case "cancelled_by_customer":
      return "cancelled";
    case "in_mediation":
      return "pending_review";
    default:
      return null;
  }
}

export type CreatePreferenceResult =
  | { ok: true; initPoint: string; preferenceId: string }
  | { ok: false; error: string };

export async function createPreference(
  items: CartItem[],
  orderId: string,
): Promise<CreatePreferenceResult> {
  const client = getMercadoPagoClient();
  if (!client) {
    return {
      ok: false,
      error:
        "MERCADO_PAGO_ACCESS_TOKEN não está configurado. Crie um arquivo .env (veja .env.example).",
    };
  }

  const baseUrl = process.env.PUBLIC_URL ?? "http://localhost:3000";

  try {
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.slug,
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price.toFixed(2)),
          currency_id: "BRL",
          picture_url: `${baseUrl}${item.image}`,
          category_id: "others",
        })),
        external_reference: orderId,
        auto_return: baseUrl.startsWith("https://") ? "approved" : undefined,
        back_urls: {
          success: `${baseUrl}/success`,
          pending: `${baseUrl}/checkout?status=pending`,
          failure: `${baseUrl}/checkout?status=failure`,
        },
        statement_descriptor: "FNEBICICULTURA 2026",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        // Copiado para o pagamento: permite reconstruir o pedido se o
        // arquivo local for perdido (redeploy).
        metadata: {
          order_id: orderId,
          items: JSON.stringify(
            items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit_price: item.price,
            })),
          ),
        },
      },
    });

    if (!response.init_point) {
      return { ok: false, error: "Mercado Pago não retornou uma URL de pagamento." };
    }

    return {
      ok: true,
      initPoint: response.init_point,
      preferenceId: response.id ?? "",
    };
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return {
      ok: false,
      error:
        "Não foi possível iniciar o pagamento. Verifique suas credenciais do Mercado Pago.",
    };
  }
}

export type PaymentItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

export type PaymentSummary = {
  paymentId: string;
  status: OrderStatus | null;
  amount: number;
  orderId?: string;
  createdAt: string;
  payerEmail?: string;
  description?: string;
  items?: PaymentItem[];
};

function parseMetadataItems(metadata: unknown): PaymentItem[] | undefined {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }
  const raw = (metadata as { items?: unknown }).items;
  let list: unknown;

  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      return undefined;
    }
  } else {
    list = raw;
  }

  if (!Array.isArray(list)) {
    return undefined;
  }

  const items = list
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const item = entry as Record<string, unknown>;
      const name = typeof item.name === "string" ? item.name : item.title;
      if (typeof name !== "string" || !name) {
        return null;
      }
      return {
        title: name,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unit_price ?? item.unitPrice) || 0,
      };
    })
    .filter((item): item is PaymentItem => item !== null);

  return items.length > 0 ? items : undefined;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A conta Mercado Pago recebe outros lançamentos (empréstimos, compras na
 * plataforma, testes). Só pagamentos com external_reference de pedido nosso
 * (UUID gerado em createOrder) ou com metadata.order_id são da campanha.
 */
function isCampaignPayment(payment: {
  external_reference?: string | null;
  metadata?: unknown;
}): boolean {
  const metadata = payment.metadata;
  if (metadata && typeof metadata === "object") {
    const orderId = (metadata as { order_id?: unknown }).order_id;
    if (typeof orderId === "string" && orderId) {
      return true;
    }
  }
  return !!payment.external_reference && UUID_PATTERN.test(payment.external_reference);
}

/**
 * Consulta os pagamentos da conta (fonte de verdade que sobrevive a redeploys).
 * Retorna null quando não é possível consultar (sem token ou erro da API).
 */
export async function searchRecentPayments(
  days = 180,
  maxResults = 500,
): Promise<PaymentSummary[] | null> {
  const client = getMercadoPagoClient();
  if (!client) {
    return null;
  }

  try {
    const paymentClient = new Payment(client);
    const beginDate = new Date(Date.now() - days * 86_400_000).toISOString();
    const endDate = new Date().toISOString();
    const payments: PaymentSummary[] = [];

    for (let offset = 0; offset < maxResults; offset += 100) {
      const page = await paymentClient.search({
        options: {
          range: "date_created",
          begin_date: beginDate,
          end_date: endDate,
          sort: "date_created",
          criteria: "desc",
          limit: 100,
          offset,
        },
      });

      const batch = page.results ?? [];
      for (const payment of batch) {
        if (!payment.id || !isCampaignPayment(payment)) {
          continue;
        }
        payments.push({
          paymentId: String(payment.id),
          status: mapPaymentStatus(payment.status),
          amount: payment.transaction_amount ?? 0,
          orderId: payment.external_reference || undefined,
          createdAt: payment.date_created ?? new Date().toISOString(),
          payerEmail: payment.payer?.email || undefined,
          description: payment.description || undefined,
          items: parseMetadataItems(payment.metadata),
        });
      }

      if (batch.length < 100) {
        break;
      }
    }

    return payments;
  } catch (error) {
    console.error("Erro ao consultar pagamentos:", error);
    return null;
  }
}

export type PaymentDetails = {
  items: { title: string; quantity: number; unitPrice: number }[];
  payerName?: string;
  payerEmail?: string;
};

/**
 * Busca itens e pagador dos pagamentos informados (usado para pedidos que
 * não existem mais no arquivo local). Retorna null se a consulta falhar.
 */
export async function getPaymentDetails(
  paymentIds: string[],
): Promise<Map<string, PaymentDetails> | null> {
  const client = getMercadoPagoClient();
  if (!client || paymentIds.length === 0) {
    return null;
  }

  const details = new Map<string, PaymentDetails>();
  const paymentClient = new Payment(client);
  const CONCURRENCY = 8;

  try {
    for (let i = 0; i < paymentIds.length; i += CONCURRENCY) {
      const chunk = paymentIds.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        chunk.map(async (id) => {
          try {
            const payment = await paymentClient.get({ id });
            return { id, payment };
          } catch {
            return { id, payment: null };
          }
        }),
      );

      for (const { id, payment } of results) {
        if (!payment) {
          continue;
        }
        const payerName = [payment.payer?.first_name, payment.payer?.last_name]
          .filter(Boolean)
          .join(" ");
        details.set(id, {
          items: (payment.additional_info?.items ?? [])
            .filter((item) => item.title)
            .map((item) => ({
              title: String(item.title),
              quantity: item.quantity ?? 1,
              unitPrice: item.unit_price ?? payment.transaction_amount ?? 0,
            })),
          payerName: payerName || undefined,
          payerEmail: payment.payer?.email || undefined,
        });
      }
    }

    return details;
  } catch (error) {
    console.error("Erro ao consultar detalhes dos pagamentos:", error);
    return null;
  }
}
