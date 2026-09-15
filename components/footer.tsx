export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Crowdfunding - FNEBicicultura 2026.
          Todos os direitos reservados.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pagamentos processados com segurança via{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Mercado Pago
          </span>
        </p>
      </div>
    </footer>
  );
}
