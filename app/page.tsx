import Image from "next/image";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CampaignProgress } from "@/components/campaign-progress";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6">
      <CampaignProgress />
      <section className="mb-12 rounded-3xl bg-gradient-to-br from-amber-200 via-orange-100 to-amber-100 px-6 py-16 text-center text-teal-900 sm:px-12">
        <Image
          src="/logo-transp.png"
          alt="Crowdfunding - FNEBicicultura 2026"
          width={1600}
          height={929}
          priority
          className="mx-auto mb-8 h-auto w-full max-w-md sm:max-w-lg"
        />
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Recompensas incríveis para apoiar o FNEBicicultura Fortaleza 2026
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-teal-800">
          Apoie a campanha e escolha sua recompensa com 
          pagamento seguro via Mercado Pago.
        </p>
        <a
          href="#recompensas"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-teal-700 px-8 font-semibold text-white transition-transform hover:scale-105"
        >
          Ver recompensas
        </a>
      </section>

      <section id="recompensas">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recompensas</h2>
          <p className="text-sm text-zinc-500">
            {products.length} recompensas disponíveis
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
