"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ProductCard from "@/components/ProductCard";
import CakeFlavours from "@/components/CakeFlavours";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { isAdmin } from "@/lib/auth";
import { getProducts, Product as DbProduct, AppUser, getUserProfile } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
         try {
           const profile = await getUserProfile(currentUser.uid);
           setUserProfile(profile);
         } catch (e) {
           console.error("Error loading user profile:", e);
         }
         // Small delay for smooth transition
         await new Promise(resolve => setTimeout(resolve, 500)); 
      } else {
         setUserProfile(null);
      }
      setLoading(false);
    });

    // Fetch dynamic products
    getProducts().then((fetchedProducts) => {
       setDbProducts(fetchedProducts);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#fff9f2] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d41]"></div>
      </div>
    );
  }

  // Regular User or Guest View
  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans selection:bg-[#ff8fa3] selection:text-white">
      <Navbar />
      
      <main>
        {/* Pink/Origami Hero Section */}
        <section className="relative pt-8 pb-16 lg:py-24 px-6 overflow-hidden">
           {/* Origami Background Elements */}
           <div className="absolute top-0 right-0 w-2/3 h-full bg-[#ffe5ec] rounded-l-[200px] z-0 hidden lg:block"></div>
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#fff0f3] rounded-full blur-3xl z-0"></div>

           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left animate-in slide-in-from-bottom duration-700">
                 <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full border border-[#ffc2d1] shadow-sm">
                    <span className="text-[#ff8fa3] text-xs">🎀</span>
                    <span className="text-xs font-bold tracking-widest text-[#d64065] uppercase">Sweetest Creations</span>
                 </div>

                 <h1 className="text-5xl lg:text-7xl font-bold text-[#8a2846] font-serif leading-tight">
                   Our Treats, <br/>
                   <span className="text-[#ff5c8a]">Box of Flavorful Creations.</span>
                 </h1>
                 
                 <p className="text-[#a15c74] text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                    Delightful handcrafted pastries wrapped in love and sweetness. 
                    Perfect for every celebration or quiet moment.
                 </p>

                 <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                    <Link href="/products" className="px-8 py-4 bg-[#ff5c8a] text-white rounded-2xl font-bold shadow-lg shadow-[#ff5c8a]/30 hover:bg-[#ff3369] hover:shadow-xl transition-all transform hover:-translate-y-1">
                       Explore Order Now
                    </Link>
                    <Link href="/about-us" className="px-8 py-4 bg-white text-[#d64065] border-2 border-[#ffd1dc] rounded-2xl font-bold hover:bg-[#fff5f8] hover:border-[#ff5c8a] transition-all">
                       Learn More
                    </Link>
                 </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
                 {/* Pink Blob/Plate background */}
                 <div className="absolute w-[350px] h-[350px] bg-[#ffd1dc] rounded-full blur-[80px] opacity-70"></div>
                 
                 <Image 
                    src="/images/cake-6.png" 
                    alt="Adorable Cake" 
                    width={500}
                    height={500}
                    priority
                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
                 />

                 {/* Origami/Floating Badges */}
                 <div className="absolute top-20 right-10 bg-white/90 p-4 rounded-xl shadow-lg rotate-12 animate-pulse duration-[4000ms]">
                    <span className="text-2xl">🌸</span>
                 </div>
                 <div className="absolute bottom-20 left-10 bg-white/90 p-3 rounded-full shadow-lg -rotate-12">
                     <div className="w-12 h-12 flex items-center justify-center bg-[#ffe5ec] rounded-full text-[#ff5c8a] font-bold">100%</div>
                 </div>
              </div>
           </div>
        </section>

        {/* Explore Purchase / Products Grid */}
        <section className="py-20 px-6 bg-[#fff0f3]">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-12 space-y-3">
               <h2 className="text-3xl lg:text-4xl font-bold text-[#8a2846] font-serif">Explore Order Now</h2>
               <div className="w-16 h-1 bg-[#ff5c8a] mx-auto rounded-full"></div>
             </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {dbProducts.slice(0, 4).map((p) => (
                <div key={p.slug} className="group">
                  <div className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-[#ffe5ec] hover:border-[#ffc2d1] h-full">
                     <ProductCard product={p as DbProduct} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
               <Link href="/products" className="inline-block px-10 py-3 border-2 border-[#8a2846] text-[#8a2846] rounded-2xl font-bold hover:bg-[#8a2846] hover:text-white transition-all duration-300">
                  View All Products
               </Link>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-20 px-6 bg-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffe5ec] rounded-bl-full opacity-50"></div>
           
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="relative order-2 lg:order-1 group">
                 <div className="absolute -top-4 -left-4 w-full h-full border-4 border-[#ffc2d1] rounded-3xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                  <div className="relative rounded-3xl overflow-hidden aspect-square bg-[#fff0f3] flex items-center justify-center">
                     <Image src="/images/cake8.png" alt="Baker mixing ingredients" fill className="p-12 object-contain opacity-90" />
                  </div>
              </div>
              
              <div className="space-y-6 order-1 lg:order-2">
                 <h2 className="text-sm font-bold tracking-widest text-[#ff5c8a] uppercase">About Our Shop</h2>
                 <h3 className="text-4xl font-bold text-[#8a2846] font-serif">Why We Opened Sweetify</h3>
                 <p className="text-[#a15c74] leading-relaxed text-lg">
                    It started with a simple craving for a cake that tasted like home. In a world of mass-produced sweets, we wanted to bring back the magic of slow baking.
                 </p>
                 <p className="text-[#a15c74] leading-relaxed text-lg">
                    We believe in using only 100% organic ingredients, supporting local farmers, and never cutting corners. Every pastry you see here is a **box of flavorful creation**.
                 </p>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
