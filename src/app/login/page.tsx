"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { GoogleIcon, FacebookIcon } from "@/components/Icons";
import { useState } from "react";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // For Admins, we go home (which now renders the dashboard)
      // For Users, we follow the redirect search param
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your spelling and try again.");
      } else {
        setError("An error occurred during sign in. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setLoading(true);
    setError("");
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      router.push(redirect);
    } catch (err: any) {
      console.error(`${providerName} login error:`, err);
      setError(`Failed to sign in with ${providerName}.`);
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
            <h1 className="text-4xl font-bold font-serif text-[#2d1e1e]">Welcome Back</h1>
            <p className="text-[#8c7676] mt-2">Login to manage your orders</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-[#2d1e1e]">Password</label>
                <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#e85d41] hover:underline">Forgot?</Link>
              </div>
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
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white px-4 text-[#8c7676]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-[#2d1e1e]"
            >
               <GoogleIcon />
               Google
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-[#2d1e1e]"
            >
               <FacebookIcon />
               Facebook
            </button>
          </div>

          <p className="text-center text-sm text-[#8c7676]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#e85d41] font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fff9f2]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

