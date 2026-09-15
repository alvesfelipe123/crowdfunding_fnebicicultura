# Deploy na hospedagem Node.js da GoDaddy

Guia completo para colocar a **loja de crowdfunding FNEBicicultura** no ar na
hospedagem Node.js da GoDaddy, importando direto do repositório GitHub
(`alvesfelipe123/crowdfunding_fnebicicultura`, branch `main`).

---

## Parte 1 — Subir o site no ar

### 1. Importe o repositório

1. Acesse **Websites → Website Setup → Create Website** e escolha um plano de
   hospedagem que inclua **Node.js Hosting** (os planos Web Hosting
   Economy/Deluxe/Ultimate já incluem).
2. Escolha **Import a Git repository** (método recomendado — evita erros de
   upload manual).
3. Autorize o GitHub e selecione `crowdfunding_fnebicicultura`.
4. Branch: **main**.

### 2. Configurações padrão do Next.js

A GoDaddy detecta o framework automaticamente. Confirme:

| Comando | Valor |
|---|---|
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm run start` |

> Em ambiente de produção a GoDaddy injeta a variável `PORT`. Se o app não
> iniciar, ajuste o start para: `npm run start -- -p $PORT`

### 3. Variáveis de ambiente (muito importante)

Adicione **exatamente essas duas** no painel da GoDaddy
(Websites → seu site → **Environment Variables**):

```
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-token-de-producao-aqui
PUBLIC_URL=SUA_URL_PUBLICA
```

> ⚠️ **`PUBLIC_URL`** não pode ser `http://localhost:3000` em produção.
> Use a URL pública que a GoDaddy gerar (ex.: `https://seuapp.seudominio.com`).
> Sem ela correta, o Mercado Pago não notifica a loja e os pagamentos não são
> confirmados.

> O token `MERCADO_PAGO_ACCESS_TOKEN` é o de **produção** (começa com
> `APP_USR-...`), que está no seu `.env` local. Ele **não** deve ser
> versionado — nunca crie commit com ele.

### 4. Deploy e teste

1. Clique em **Deploy / Redeploy**.
2. Abra a URL pública gerada e teste um pagamento com cartão de teste
   (`APRO` + cartão `5480 8328 0103 3311`, vencimento `11/30`, CVV `123`,
   CPF `12345678909`).
3. Confirme que o pedido aparece como `approved` na página de sucesso.

---

## Parte 2 — Configurar o webhook do Mercado Pago

Só pode ser feito **depois** que a GoDaddy der a URL pública (passo 3).

1. No painel do Mercado Pago (conta de produção):
   **Developers → Webhooks**.
2. URL do webhook:
   ```
   https://SUA-URL-PUBLICA/api/webhooks/mercadopago
   ```
3. Evento: **Payment**.
4. Salve.

---

## Parte 3 — Conectar o domínio (quando tiver)

1. Compre o domínio na própria GoDaddy (recomendado) e em
   **Websites → seu site → Domains** clique em **Connect Domain**.
2. O DNS é configurado automaticamente (registros A/CNAME).
3. Atualize `PUBLIC_URL` no painel para `https://seudominio.com.br` e faça
   **Redeploy**.
4. Se o domínio foi comprado fora da GoDaddy, adicione manualmente os
   registros **A** (IP do servidor) e **CNAME** (www) indicados pelo painel.

---

## Checklist de depuração

| Sintoma | Causa provável | Ação |
|---|---|---|
| Erro de build (SWC/binary) | `node_modules` movido entre máquinas | Deixe a GoDaddy instalar do zero (não suba `node_modules`; import via Git já ignora) |
| Página 404 na raiz | Rodou `npm run dev` no servidor | Use `npm run build` + `npm start` |
| Pagamento fica `pending` (não confirma) | Webhook não configurado ou `PUBLIC_URL` com localhost | Configure o webhook (Parte 2) e corrija `PUBLIC_URL` (Parte 1, passo 3) |
| "Pedido não encontrado" na página de sucesso | Token ou `PUBLIC_URL` errados em produção | Confira as duas variáveis no painel |
