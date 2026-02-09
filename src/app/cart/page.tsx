"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = totalItems > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    // Proceed to checkout page
    router.push("/checkout");
  };

  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-12">Your Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-6">
              <div className="text-6xl text-slate-200">🛒</div>
              <p className="text-[#8c7676] text-xl">Your cart is as empty as a cake-less party.</p>
              <Link href="/products" className="inline-block bg-[#e85d41] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all">
                Browse our Cakes
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-16">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-8">
                {cart.map((item) => (
                  <div key={item.slug} className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100">
                    <div className="relative w-32 h-32 bg-[#fdf5e6] rounded-2xl p-2">
                      <Image 
                        src={item.images?.[0]?.src || (item as any).image || "/logo.png"} 
                        alt={item.name} 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    
                    <div className="flex-grow space-y-2 text-center sm:text-left">
                      <h3 className="text-xl font-bold font-serif text-[#2d1e1e]">{item.name}</h3>
                      <p className="text-[#8c7676] text-sm line-clamp-1">{item.description}</p>
                      <button 
                        onClick={() => removeFromCart(item.slug)}
                        className="text-[#e85d41] text-xs font-bold uppercase tracking-widest hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#e85d41] hover:text-white transition-all font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-[#2d1e1e]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#e85d41] hover:text-white transition-all font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xl font-bold text-[#2d1e1e] w-24 text-right">
                      {(item.price * item.quantity).toFixed(2)}$
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-[#fdf5e6] p-10 rounded-3xl h-fit space-y-8">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[#8c7676]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#2d1e1e]">{subtotal.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between text-[#8c7676]">
                    <span>Shipping</span>
                    <span className="font-bold text-[#2d1e1e]">{shipping.toFixed(2)}$</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-2xl font-bold text-[#2d1e1e]">
                    <span>Total</span>
                    <span className="text-[#e85d41]">{total.toFixed(2)}$</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#e85d41] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#e85d41]/20">
                  Proceed to Checkout
                </button>
                
                <div className="flex items-center justify-center gap-4 pt-4 opacity-30 grayscale">
                    <span className="text-[10px] font-bold">VISA</span>
                    <span className="text-[10px] font-bold">MASTER</span>
                    <span className="text-[10px] font-bold">PAYPAL</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
