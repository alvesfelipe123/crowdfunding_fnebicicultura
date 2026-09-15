import { NextResponse } from "next/server";
import { createPreference } from "@/lib/mercadopago";
import { createOrder } from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import type { CartItem } from "@/lib/cart-context";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items?: CartItem[];
      name?: string;
      email?: string;
    };

    const items = (body.items ?? [])
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
      }))
      .map((item) => {
        const product = getProductBySlug(item.slug);
        return product ? { ...item, product } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Seu carrinho está vazio." },
        { status: 400 },
      );
    }

    const orderItems = items.map((item) => ({
      slug: item.slug,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = await createOrder({
      items: orderItems,
      total,
      payerEmail: body.email,
      payerName: body.name,
    });

    const preference = await createPreference(
      items.map((item) => ({
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
      })),
      order.id,
    );

    if (!preference.ok) {
      return NextResponse.json({ error: preference.error }, { status: 502 });
    }

    return NextResponse.json({
      initPoint: preference.initPoint,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Erro no checkout:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o pedido." },
      { status: 500 },
    );
  }
}
