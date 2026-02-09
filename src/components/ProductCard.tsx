"use client";
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/products";
import { HeartIcon } from "./Icons";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const isInCart = cart.some(item => item.slug === product.slug);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    if (!user) {
      router.push("/login?redirect=/products");
      return;
    }
    addToCart(product);
  };

  return (
    <div className="card-specials group">
      <button className="absolute top-4 right-4 z-10 p-2 hover:scale-110 transition-transform">
        <HeartIcon />
      </button>

      <div className="relative aspect-square mb-6 overflow-hidden flex items-center justify-center">
        <Image
          src={product.images?.[0]?.src || "/images/placeholder.png"}
          alt={product.images?.[0]?.alt || product.name || "Product Image"}
          width={280}
          height={280}
          className="object-contain transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="space-y-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xl font-medium text-[#2d1e1e] font-serif tracking-wide group-hover:text-[#e85d41] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="text-2xl font-bold text-[#e85d41]">
          {product.price}$
        </div>

        <button 
          onClick={handleAdd}
          className={`${
            isInCart ? "bg-green-600" : "bg-[#e85d41]"
          } text-white w-full py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all transform hover:-translate-y-1`}
        >
          {isInCart ? "Added!" : "Order This"}
        </button>
      </div>
    </div>
  );
}
