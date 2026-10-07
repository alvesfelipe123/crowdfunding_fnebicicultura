export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  gallery?: string[];
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
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
    price: 15,
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
    name: "Cap CUIDA",
    category: "Vestuário",
    price: 50,
    description: "Cap 3 painéis, aba flexível, tecido Dryfit",
    image: "/products/Cap.png",
    gallery: ["/products/Cap.png", "/products/Cap-tamanhos.jpeg"],
    sizes: ["P", "M", "G"],
  },
  {
    slug: "camiseta-algodao",
    name: "Camiseta algodão",
    category: "Vestuário",
    price: 60,
    description:
      "Camiseta 100% algodão, confortável e respirável para uso no dia a dia.",
    image: "/products/Camiseta-poliamida.jpeg",
    gallery: ["/products/Camiseta-poliamida.jpeg"],
    sizes: ["PP", "P", "M", "G", "GG"],
  },
  {
    slug: "camiseta-poliamida",
    name: "Camiseta poliamida",
    category: "Vestuário",
    price: 70,
    description:
      "Camiseta em poliamida, tecido leve e de secagem rápida, perfeita para os pedais ou treinos.",
    image: "/products/Camiseta-poliamida.jpeg",
    gallery: ["/products/Camiseta-poliamida.jpeg"],
    sizes: ["PP", "P", "M", "G", "GG"],
  },
  {
    slug: "cropped-lasbicis",
    name: "Cropped LASBICIS",
    category: "Vestuário",
    price: 70,
    description:
      "Cropped com design exclusivo, a peça é feita 100% de algodão penteado, 30.1 tão macio que abraça a pele quando coloca.",
    image: "/products/Cropped - frente.png",
    gallery: [
      "/products/Cropped - frente.png",
      "/products/Cropped - costas.png",
      "/products/Cropped-tamanho.png",
    ],
    sizes: ["P", "M", "G"],
  },
  {
    slug: "camisetao-lasbicis",
    name: "Regata LASBICIS",
    category: "Vestuário",
    price: 80,
    description:
      "Regata com um design exclusivo, tecido 100% algodão 30.1 penteado. A modelagem diferenciada da regata traz um elegância com o efeito do ombro reto.",
    image: "/products/Camisetao - frente.png",
    gallery: [
      "/products/Camisetao - frente.png",
      "/products/Camisetao - costas.png",
      "/products/Regata-tamanho.png",
    ],
    sizes: ["P", "M", "G"],
  },
  {
    slug: "sacoche-hito",
    name: "Sacoche HITO",
    category: "Acessórios",
    price: 100,
    description:
      "Sacoche em nylon resinado Rip Stop, com alça auxiliar, e 2 bolsos externos. Largura de 34 cm, altura 26 cm, e profundidade 5 cm.",
    image: "/products/Sacoche-HITO-00.jpeg",
    gallery: [
      "/products/Sacoche-HITO-00.jpeg",
      "/products/Sacoche-HITO-01.jpeg",
      "/products/Sacoche Hito.png",
      "/products/Sacoche Hito-2.png",
      "/products/Sacoche Hito-3.png",
    ],
    colors: ["Amarelo", "Azul", "Rosa"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
