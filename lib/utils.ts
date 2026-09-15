export function formatPrice(value: number, opts?: { integer?: boolean }): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: opts?.integer ? 0 : 2,
  }).format(value);
}
