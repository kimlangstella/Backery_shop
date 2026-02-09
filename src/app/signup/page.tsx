"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";

import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Store profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "customer",
        status: "active",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      console.log("Signup successful!");
      router.push("/"); // Redirect to home
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-24 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-8 border border-[#e85d41]/5">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-serif text-[#2d1e1e]">Create Account</h1>
            <p className="text-[#8c7676] mt-2">Join us for a sweet experience</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#2d1e1e]">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full bg-[#fdf5e6] border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#e85d41]/20 transition-all text-[#2d1e1e]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#2d1e1e]">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                className="w-full bg-[#fdf5e6] border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#e85d41]/20 transition-all text-[#2d1e1e]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#2d1e1e]">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#fdf5e6] border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#e85d41]/20 transition-all text-[#2d1e1e]"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-[#e85d41] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#e85d41]/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>


          <p className="text-center text-sm text-[#8c7676] pt-4 border-t border-slate-100">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e85d41] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
