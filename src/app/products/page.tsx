"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, Product as DbProduct } from "@/lib/db";

export default function ProductsPage() {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);

  useEffect(() => {
    // Fetch dynamic products
    getProducts().then((fetchedProducts) => {
       setDbProducts(fetchedProducts);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF2F0] font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter / Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[#E8C8C4] pb-6 gap-4">
           <div>
             <h2 className="text-3xl font-bold text-[#5e4040] font-serif">All Sweet Treats</h2>
             <p className="text-[#8c7676] mt-2">Browse our collection of delicious pastries.</p>
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="px-6 py-2 bg-[#5e4040] text-white rounded-full text-sm font-medium whitespace-nowrap shadow-lg shadow-[#5e4040]/20">All</button>
              <button className="px-6 py-2 bg-white text-[#5e4040] hover:bg-[#fff9f2] rounded-full text-sm font-medium whitespace-nowrap transition-colors border border-[#E8C8C4]">Cakes</button>
              <button className="px-6 py-2 bg-white text-[#5e4040] hover:bg-[#fff9f2] rounded-full text-sm font-medium whitespace-nowrap transition-colors border border-[#E8C8C4]">Pastries</button>
              <button className="px-6 py-2 bg-white text-[#5e4040] hover:bg-[#fff9f2] rounded-full text-sm font-medium whitespace-nowrap transition-colors border border-[#E8C8C4]">Donuts</button>
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dbProducts.map((p) => (
            <div key={p.slug} className="transform hover:-translate-y-2 transition-transform duration-300">
              <ProductCard product={p as any} /> 
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
