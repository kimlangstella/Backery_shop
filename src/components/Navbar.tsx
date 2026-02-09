"use client";
import Link from "next/link";
import { LogoIcon, LoginIcon, CartIcon } from "./Icons";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useState, useEffect } from "react";
import { isAdmin } from "@/lib/auth";

import { usePathname } from "next/navigation";
import { AppUser, getUserProfile } from "@/lib/db";

export default function Navbar() {
  const { totalItems } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => pathname === path ? "text-[#e85d41]" : "text-[#2d1e1e]";

  return (
    <nav className="bg-transparent py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl">
          <LogoIcon />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-widest uppercase">
          <Link href="/" className={`hover:text-[#e85d41] transition-colors ${isActive("/")}`}>Home</Link>
          <Link href="/products" className={`hover:text-[#e85d41] transition-colors ${isActive("/products")}`}>Product</Link>
          <Link href="/about-us" className={`hover:text-[#e85d41] transition-colors ${isActive("/about-us")}`}>About Us</Link>
          <Link href="/contact" className={`hover:text-[#e85d41] transition-colors ${isActive("/contact")}`}>Contact Us</Link>
          {user && isAdmin(user, userProfile) && (
             <Link href="/admin" className={`hover:text-[#e85d41] transition-colors font-bold ${isActive("/admin")}`}>Dashboard</Link>
          )}
          <Link href="/products" className="bg-[#e85d41] text-white px-6 py-2 rounded-full hover:bg-[#d14d34] transition-all">
            Buy Now
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-6 text-[#2d1e1e]">
          {user ? (
            <>
              {!isAdmin(user, userProfile) && (
                <Link
                  href="/orders"
                  className="text-sm font-semibold uppercase tracking-wider hover:text-[#e85d41]"
                >
                  My Orders
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider hover:text-[#e85d41]"
              >
                <LoginIcon />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider hover:text-[#e85d41]">
              <LoginIcon />
              <span>Login</span>
            </Link>
          )}
          <Link href="/cart" className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wider hover:text-[#e85d41] relative">
            <CartIcon />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#e85d41] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
