"use client";
import Link from "next/link";
import { LogoIcon } from "./Icons";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#5e4040] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1: Brand & Slogan */}
        <div className="space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
             <div className="relative w-48 h-16 bg-white/10 rounded-lg p-2 flex items-center justify-center backdrop-blur-sm">
                <LogoIcon />
             </div>
          </div>
          <p className="text-[#e6d0c4] leading-relaxed max-w-sm mx-auto md:mx-0">
            Handcrafted with 100% organic ingredients and a sprinkle of magic. 
            We bake memories, one slice at a time.
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
             <SocialButton icon={Facebook} />
             <SocialButton icon={Instagram} />
             <SocialButton icon={Twitter} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="text-center md:text-left space-y-6">
           <h3 className="text-xl font-serif font-bold text-[#ffc2d1]">Quick Links</h3>
           <ul className="space-y-4 text-[#e6d0c4]">
              <li><Link href="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Home</Link></li>
              <li><Link href="/products" className="hover:text-white hover:translate-x-1 transition-all inline-block">All Products</Link></li>
              <li><Link href="/about-us" className="hover:text-white hover:translate-x-1 transition-all inline-block">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:translate-x-1 transition-all inline-block">Contact Support</Link></li>
           </ul>
        </div>

        {/* Column 3: Newsletter (Simplified) */}
        <div className="text-center md:text-left space-y-6">
           <h3 className="text-xl font-serif font-bold text-[#ffc2d1]">Stay Sweet</h3>
           <p className="text-[#e6d0c4]">Subscribe to get notified about new flavors and special offers.</p>
           <div className="flex flex-col gap-3">
              <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-[#ff5c8a] focus:bg-white/10 text-white placeholder:text-white/30 transition-all"
              />
              <button className="px-6 py-3 bg-[#ff5c8a] text-white font-bold rounded-lg hover:bg-[#ff3369] transition-colors shadow-lg shadow-[#ff5c8a]/20">
                 Subscribe
              </button>
           </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-[#e6d0c4]/60">
         <p>© {new Date().getFullYear()} Sweetify Cake Shop. All Rights Reserved.</p>
         <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
         </div>
      </div>
    </footer>
  );
}

const SocialButton = ({ icon: Icon }: { icon: any }) => (
  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#ff5c8a] text-white flex items-center justify-center transition-all duration-300">
     <Icon size={18} />
  </button>
);
