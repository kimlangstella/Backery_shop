export type Product = {
  slug: string;
  name: string;
  price: number;
  description: string;
  rating: number;
  images: { src: string; width: number; height: number; alt: string }[];

  sku: string;
  brand: string;
};

export const products: Product[] = [
  {
    slug: "strawberry-dream-cake",
    name: "Strawberry Dream Cake",
    price: 29.0,
    rating: 4.8,
    sku: "CAKE-001",
    brand: "Sweetify",
    description:
      "Fresh cream layered with strawberries and soft sponge. Perfectly optimized for sweet cravings and Core Web Vitals.",
    images: [
      {
        src: "/images/cake-1.png",
        width: 400,
        height: 700,
        alt: "Strawberry Dream Cake side view",
      },
     
    ],
  },
  {
    slug: "chocolate-lava-cake",
    name: "Chocolate Lava Cake",
    price: 19.0,
    rating: 4.6,
    sku: "CAKE-002",
    brand: "Sweetify",
    description:
      "Decadent molten chocolate center, baked to perfection with optimized performance and indulgent flavor.",
    images: [
      {
        src: "/images/cake2.png",
        width: 1200,
        height: 1500,
        alt: "Chocolate Lava Cake cut open",
      },
      
    ],
  },
  {
    slug: "lava-cake",
    name: " Lava Cake",
    price: 19.0,
    rating: 4.6,
    sku: "CAKE-002",
    brand: "Sweetify",
    description:
      "Decadent molten chocolate center, baked to perfection with optimized performance and indulgent flavor.",
    images: [
      {
        src: "/images/cake-5.png",
        width: 1200,
        height: 1500,
        alt: "Chocolate Lava Cake cut open",
      },
      
    ],
  },
  {
    slug: "chocolate-lava-delight",
    name: "Chocolate Lava Delight",
    price: 34.0,
    rating: 4.9,
    sku: "CAKE-002",
    brand: "Sweetify",
    description:
      "Warm molten chocolate center with a light cocoa sponge — indulgence that loads fast and delights users.",
    images: [
      {
        src: "/images/cake-3.png",
        width: 800,
        height: 600,
        alt: "Chocolate Lava Delight close up",
      },
      
    ],
  },
  {
    slug: "lemon-zest-cloud",
    name: "Lemon Zest Cloud",
    price: 27.0,
    rating: 4.6,
    sku: "CAKE-003",
    brand: "Citrus & Co",
    description:
      "Light lemon mousse layered with chiffon sponge and a bright citrus glaze — zesty, clean, and refreshingly fast.",
    images: [
      {
        src: "/images/cake8.png",
        width: 700,
        height: 700,
        alt: "Lemon Zest Cloud whole cake",
      },
      
    ],
  },
  {
    slug: "classic-red-velvet",
    name: "Classic Red Velvet",
    price: 31.0,
    rating: 4.7,
    sku: "CAKE-004",
    brand: "Velvet House",
    description:
      "Velvety cocoa sponge with tangy cream cheese frosting — timeless and perfectly balanced for desktop and mobile cravings.",
    images: [
      {
        src: "/images/cake-6.png",
        width: 900,
        height: 600,
        alt: "Classic Red Velvet side view",
      },
      
    ],
  },
  {
    slug: "matcha-harmony-cake",
    name: "Matcha Harmony Cake",
    price: 33.5,
    rating: 4.8,
    sku: "CAKE-005",
    brand: "Green Spoon",
    description:
      "Ceremonial matcha cream layered with delicate sponge — earthy, elegant, and optimized for repeat customers.",
    images: [
      {
        src: "/images/cake-9.png",
        width: 800,
        height: 800,
        alt: "Matcha Harmony Cake slice",
      },
      
    ],
  },
  {
    slug: "mango-summer-bliss",
    name: "Mango Summer Bliss",
    price: 30.0,
    rating: 4.5,
    sku: "CAKE-006",
    brand: "Tropical Treats",
    description:
      "Fresh mango puree, airy cream and coconut sponge — a sunny, mobile-first favorite for warm-season orders.",
    images: [
      {
        src: "/images/cake-10.png",
        width: 700,
        height: 700,
        alt: "Mango Summer Bliss close up",
      },
      
    ],
  },
  {
    slug: "black-forest-deluxe",
    name: "Black Forest Deluxe",
    price: 35.0,
    rating: 4.9,
    sku: "CAKE-007",
    brand: "Sweetify",
    description:
      "Layers of chocolate sponge, cherries and whipped cream — classic flavor with premium presentation and fast load images.",
    images: [
      {
        src: "/images/cake-11.png",
        width: 800,
        height: 900,
        alt: "Black Forest Deluxe side view",
      },
      
    ],
  },

];

export const findBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);
export const allSlugs = () => products.map((p) => p.slug);
