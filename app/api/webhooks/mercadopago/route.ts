import { NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { updateOrderStatus, type OrderStatus } from "@/lib/orders";

function mapPaymentStatus(status?: string): OrderStatus | null {
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

type MercadoPagoNotification = {
  type?: string;
  data?: { id?: string };
};

export async function POST(request: Request) {
  let notification: MercadoPagoNotification | null = null;

  try {
    notification = (await request.json()) as MercadoPagoNotification;
  } catch {
    // corpo inválido; apenas responde 200
  }

  const paymentId = notification?.data?.id;
  const type = notification?.type;

  if ((type === "payment" || type === "merchant_order") && paymentId) {
    try {
      const client = getMercadoPagoClient();
      if (client) {
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: paymentId });

        const status = mapPaymentStatus(payment.status);
        const externalReference = payment.external_reference;

        if (status && externalReference) {
          await updateOrderStatus(externalReference, status, String(paymentId));
          console.log(
            `Pedido ${externalReference} atualizado para ${status} (pagamento ${paymentId})`,
          );
        }
      }
    } catch (error) {
      console.error("Erro ao processar notificação do Mercado Pago:", error);
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
