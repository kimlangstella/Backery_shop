"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { saveMessage } from "@/lib/db";

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.displayName || user.email?.split('@')[0] || "",
          email: user.email || ""
        }));
        setLoading(false);
      } else {
        router.push("/login?redirect=/contact");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-[#fff9f2] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d41] mx-auto"></div>
          <p className="text-[#8c7676] font-bold uppercase tracking-widest text-xs">Checking authorization...</p>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ type: "loading", message: "Sending your message..." });

    try {
      const authUser = auth.currentUser;
      if (!authUser) throw new Error("You must be logged in to send a message.");

      await saveMessage({
        userId: authUser.uid,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: formData.subject
      });

      setStatus({ 
        type: "success", 
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon." 
      });
      setFormData(prev => ({ ...prev, subject: "", message: "" }));
    } catch (err: any) {
      console.error("Error sending message:", err);
      setStatus({ type: "error", message: err.message || "Failed to send message. Please try again." });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="section-title">Get In Touch</h1>
            <p className="section-subtitle">We&apos;d love to hear from you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">Our Bakery</h3>
                <p className="text-[#8c7676] leading-relaxed">
                  123 Sweet Street, Pastry District<br />
                  London, UK SW1 2BC
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">Opening Hours</h3>
                <p className="text-[#8c7676] leading-relaxed">
                  Monday - Friday: 8am - 8pm<br />
                  Saturday - Sunday: 9am - 6pm
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">Contact Details</h3>
                <p className="text-[#8c7676] leading-relaxed">
                  Phone: +44 20 1234 5678<br />
                  Email: foxymoonton@gmail.com
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#fdf5e6] p-10 rounded-2xl shadow-sm border border-[#e85d41]/5">
              {status.type === "success" ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-[#e85d41] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">Message Sent!</h3>
                  <p className="text-[#8c7676]">{status.message}</p>
                  <button 
                    onClick={() => setStatus({ type: "idle", message: "" })}
                    className="mt-6 text-[#e85d41] font-bold uppercase tracking-widest text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form 
                  className="space-y-6" 
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Full Name</label>
                    <input 
                      readOnly
                      type="text" 
                      name="name"
                      value={formData.name}
                      autoFocus
                      className="w-full bg-white/50 border border-[#e85d41]/10 rounded-md p-4 outline-none cursor-not-allowed opacity-70" 
                      placeholder="John Doe" 
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Email Address</label>
                    <input 
                      readOnly
                      type="email" 
                      name="email"
                      value={formData.email}
                      className="w-full bg-white/50 border border-[#e85d41]/10 rounded-md p-4 outline-none cursor-not-allowed opacity-70" 
                      placeholder="john@example.com" 
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Subject (Optional)</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#e85d41]/10 rounded-md p-4 outline-none focus:border-[#e85d41] transition-colors" 
                      placeholder="Special Order Inquiry" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Your Message</label>
                    <textarea 
                      name="message"
                      rows={4} 
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full bg-white border ${errors.message ? 'border-red-500' : 'border-[#e85d41]/10'} rounded-md p-4 outline-none focus:border-[#e85d41] transition-colors`} 
                      placeholder="Tell us about your cake dreams..."
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  
                  {status.type === "error" && (
                    <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{status.message}</p>
                  )}

                  <button 
                    disabled={status.type === "loading"}
                    className="w-full bg-[#e85d41] text-white py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {status.type === "loading" ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
