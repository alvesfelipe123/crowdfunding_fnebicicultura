# Crowdfunding FNEBicicultura

Loja online com catálogo de produtos físicos e pagamento real via **Mercado Pago (Checkout Pro)**. Construída com **Next.js 16** (App Router), TypeScript e Tailwind CSS.

## Funcionalidades

- Catálogo de produtos com página de detalhes
- Carrinho de compras com persistência local (localStorage)
- Checkout redirecionado para o ambiente seguro do Mercado Pago (cartão, boleto e PIX)
- Webhook que atualiza o status do pedido quando o pagamento é confirmado
- Página de sucesso com consulta do pedido em tempo real
- Suporte a tema claro e escuro

## Como executar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Configuração do Mercado Pago

1. Crie uma conta em https://www.mercadopago.com.br
2. No painel, acesse **Developers > Credenciais** e copie o **Access Token** da aplicação
3. Copie `.env.example` para `.env` e preencha:

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx
PUBLIC_URL=http://localhost:3000
```

- **`MERCADO_PAGO_ACCESS_TOKEN`**: token de produção (ou `TEST-...` de teste). Com token de teste, o pagamento é simulado e nenhum dinheiro é cobrado.
- **`PUBLIC_URL`**: URL pública da loja. Em desenvolvimento local, use `http://localhost:3000`. Em produção, use o domínio real (ex.: `https://minhaloja.com.br`). É usada para o webhook e para as imagens dos produtos.

> **Importante (webhook em desenvolvimento local):** o Mercado Pago só consegue notificar a loja por uma URL pública. Localmente, a confirmação do pagamento ainda funciona via `back_urls` (você é redirecionado para `/success` após pagar), mas o webhook precisa de um túnel como [ngrok](https://ngrok.com) ou de um deploy. Em produção, o webhook é chamado automaticamente.

## Como os pagamentos funcionam

1. O cliente finaliza a compra no checkout
2. A API `POST /api/checkout` cria o pedido e uma **preferência** no Mercado Pago
3. O cliente é redirecionado para o Checkout Pro e paga
4. O Mercado Pago redireciona de volta para `/success` e envia a notificação para `POST /api/webhooks/mercadopago`
5. O webhook consulta o pagamento e atualiza o status do pedido

Os pedidos são salvos em `.data/orders.json` (apenas para desenvolvimento). Para produção, troque `lib/orders.ts` por um banco de dados real.

## Estrutura

```
app/
  page.tsx                 # Catálogo
  products/[slug]/page.tsx # Detalhes do produto
  cart/page.tsx            # Carrinho
  checkout/page.tsx        # Checkout
  success/page.tsx         # Confirmação do pedido
  api/checkout/route.ts    # Cria pedido + preferência MP
  api/webhooks/mercadopago/route.ts  # Recebe notificações
  api/orders/[id]/route.ts # Consulta o pedido
lib/
  products.ts              # Catálogo de produtos (edite aqui)
  cart-context.tsx         # Estado do carrinho
  mercadopago.ts           # Integração com o Mercado Pago
  orders.ts                # Armazenamento dos pedidos
components/                # Header, footer, cards, botões
```

## Personalização

- **Produtos**: edite `lib/products.ts`
- **Cores e estilo**: edite `app/globals.css` e as classes Tailwind
- **Nome da loja**: edite `components/header.tsx` e `app/layout.tsx`
