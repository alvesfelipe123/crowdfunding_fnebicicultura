export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  gallery?: string[];
  featured?: boolean;
};

export const products: Product[] = [
  {
    slug: "doacao-qualquer-valor",
    name: "Doação - qualquer valor",
    category: "Doação",
    price: 1,
    description:
      "Contribua com qualquer valor para ajudar a realizar o evento! Ajuste a quantidade para selecionar o valor desejado.",
    image: "/products/doacao.svg",
  },
  {
    slug: "kit-apoiador",
    name: "Kit apoiador - Adesivo + Spoke card + Bottom",
    category: "Kit",
    price: 10,
    description:
      "Kit com adesivo, spoke card e bottom para apoiar a campanha e levar a marca FNEBicicultura por aí. Os modelos serão escolhidos na entrega.",
    image: "/products/Kit apoiador.png",
    gallery: [
      "/products/Kit apoiador.png",
      "/products/Adesivo e Bottom.png",
      "/products/Bottom.png",
      "/products/Spokes.png",
    ],
  },
  {
    slug: "chaveiro-areia-colorida",
    name: "Chaveiro de areia colorida",
    category: "Acessórios",
    price: 10,
    description:
      "Chaveiro de areia colorida, lembrancinha típica do Nordeste. O desenho será personalizado de acordo com o tema do evento!",
    image: "/products/Chaveiro de areia.png",
  },
  {
    slug: "copo-plastico-550ml",
    name: "Copo plástico durável 550 ml",
    category: "Acessórios",
    price: 10,
    description:
      "Copo plástico durável de 550 ml, ideal para hidratação durante o evento. A cor / modelo será escolhida na entrega.",
    image: "/products/Copo.png",
  },
  {
    slug: "cap",
    name: "Cap",
    category: "Vestuário",
    price: 50,
    description:
      "Cap com ajuste regulável para proteger do sol em todos os passeios.",
    image: "/products/Cap.png",
  },
  {
    slug: "camiseta-algodao",
    name: "Camiseta algodão",
    category: "Vestuário",
    price: 60,
    description:
      "Camiseta 100% algodão, confortável e respirável para uso no dia a dia.",
    image: "/products/Camiseta - amarela.png",
    gallery: [
      "/products/Camiseta - amarela.png",
      "/products/Camiseta - branca.png",
      "/products/Camiseta - rosa.png",
    ],
  },
  {
    slug: "camiseta-poliamida",
    name: "Camiseta poliamida",
    category: "Vestuário",
    price: 70,
    description:
      "Camiseta em poliamida de secagem rápida, perfeita para os treinos.",
    image: "/products/Camiseta - branca.png",
    gallery: [
      "/products/Camiseta - branca.png",
      "/products/Camiseta - amarela.png",
      "/products/Camiseta - rosa.png",
    ],
  },
  {
    slug: "cropped-lasbicis",
    name: "Cropped LASBICIS",
    category: "Vestuário",
    price: 70,
    description:
      "Cropped LASBICIS com modelagem moderna para compor o look ciclista.",
    image: "/products/Cropped - frente.png",
    gallery: [
      "/products/Cropped - frente.png",
      "/products/Cropped - costas.png",
    ],
  },
  {
    slug: "camisetao-lasbicis",
    name: "Camisetão LASBICIS",
    category: "Vestuário",
    price: 80,
    description:
      "Camisetão LASBICIS com caimento amplo e estilo para dentro e fora da bike.",
    image: "/products/Camisetao - frente.png",
    gallery: [
      "/products/Camisetao - frente.png",
      "/products/Camisetao - costas.png",
    ],
  },
  {
    slug: "sacoche-hito",
    name: "Sacoche HITO",
    category: "Acessórios",
    price: 100,
    description:
      "Sacoche HITO para carregar seus itens essenciais com praticidade e segurança.",
    image: "/products/Sacoche Hito.png",
    gallery: [
      "/products/Sacoche Hito.png",
      "/products/Sacoche Hito-2.png",
      "/products/Sacoche Hito-3.png",
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
