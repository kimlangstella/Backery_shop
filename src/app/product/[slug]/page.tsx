import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { allSlugs, findBySlug } from "@/lib/products";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
   // Only static params for local products to avoid build complexity
  return allSlugs().map(slug => ({ slug }));
}
export const revalidate = 0; // Disable cache for dynamic feeling or use standard revalidation

async function getProduct(slug: string) {
  // 1. Try Local
  const local = findBySlug(slug);
  if (local) return local;

  // 2. Try Firebase
  try {
     const q = query(collection(db, "products"), where("slug", "==", slug));
     const snapshot = await getDocs(q);
     if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        return {
           slug: data.slug,
           name: data.name,
           description: data.description,
           price: data.price,
           rating: data.rating || 5,
           brand: data.brand || "Sweetify",
           sku: data.id,
           images: data.image 
             ? [{ src: data.image, alt: data.name, width: 500, height: 500 }] 
             : [{ src: "/logo.png", alt: "Default", width: 500, height: 500 }]
        };
     }
  } catch (e) {
     console.error("Error fetching product", e);
  }
  return null;
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return { title: "Product — Sweetify Cake Shop" };

  const title = `${p.name} — Sweetify Cake Shop`;
  const desc = p.description;
  const url = `/product/${p.slug}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "Sweetify Cake Shop",
      type: "website",                        // ✅ fix here
      images: p.images.map(i => ({ url: i.src }))
    },
    alternates: { canonical: url }
  };
}


import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({ params }: Props) {
  const p = await getProduct(params.slug);
  if (!p) return notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: p.images.map(i => i.src),
    description: p.description,
    sku: p.sku,
    brand: { "@type": "Brand", name: p.brand },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: 85 },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price,
      availability: "https://schema.org/InStock",
      url: `https://example.com/product/${p.slug}`
    }
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Images */}
      <section className="card p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <Image
            src={p.images[0].src}
            alt={p.images[0].alt}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {p.images.slice(1).map((img, i) => (
            <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="card p-6">
        <h1 className="text-3xl font-semibold">{p.name}</h1>
        <p className="mt-3 text-slate-400">{p.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="badge">⭐ {p.rating}</span>
          
        </div>

        <div className="mt-6 text-3xl font-bold">${p.price.toFixed(2)}</div>

        <AddToCartButton product={p} />

        <ul className="mt-8 space-y-2 text-sm text-slate-300">
          <li>• Free delivery in 24h</li>
          <li>• Freshly baked, guaranteed</li>
          <li>• Secure checkout</li>
        </ul>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
