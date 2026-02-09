"use client";
import { type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
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
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`${
        added ? "bg-green-600" : "bg-[#e85d41]"
      } text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all transform hover:-translate-y-1`}
    >
      {added ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
