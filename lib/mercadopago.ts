import { MercadoPagoConfig, Preference } from "mercadopago";
import type { CartItem } from "@/lib/cart-context";

export function getMercadoPagoClient(): MercadoPagoConfig | null {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return null;
  }
  return new MercadoPagoConfig({ accessToken });
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
