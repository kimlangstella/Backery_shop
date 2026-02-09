"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, storage } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { saveOrder, getSettings, ShopSettings, getOrder, Order, updateOrderStatus } from "@/lib/db";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, clearCart, totalItems } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "aba" // 'aba' or 'cash'
  });
  const [receiptFile] = useState<File | null>(null);
  const [_uploadProgress, setUploadProgress] = useState(0);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);

  const [isOrdered, setIsOrdered] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [abaQr] = useState<{ content?: string, image?: string } | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  useEffect(() => {
    // Check if we returned from PayWay successfully
    const status = searchParams.get('status');
    const orderId = searchParams.get('id');
    if (status === 'success') {
       setIsOrdered(true);
       // Cart kept intact per user request
       toast.success("Payment successful!");
       
       if (orderId) {
          // Officially mark as paid in DB
          updateOrderStatus(orderId, 'paid');
          getOrder(orderId).then(setConfirmedOrder);
       }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login?redirect=/checkout");
      } else {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || prev.name
        }));
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, searchParams, clearCart]);

  useEffect(() => {
    getSettings().then(setShopSettings);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#fff9f2] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e85d41] mx-auto"></div>
          <p className="text-[#8c7676] font-bold uppercase tracking-widest text-xs">Preparing Checkout...</p>
        </div>
      </div>
    );
  }

  if (totalItems === 0 && !isOrdered) {
    return (
      <div className="bg-[#fff9f2] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold font-serif text-[#2d1e1e]">Your cart is empty</h1>
            <Link href="/products" className="inline-block bg-[#e85d41] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm">
              Back to Cakes
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let receiptUrl = "";
      
      // 1. If Manual ABA, upload receipt
      if (formData.paymentMethod === 'aba' && receiptFile && !shopSettings?.abaMerchantId) {
          const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, receiptFile);
          
          receiptUrl = await new Promise((resolve, reject) => {
              uploadTask.on('state_changed', 
                  (snapshot) => {
                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      setUploadProgress(progress);
                  },
                  (error) => reject(error),
                  async () => {
                      const url = await getDownloadURL(uploadTask.snapshot.ref);
                      resolve(url);
                  }
              );
          });
      }

      // 2. Save Order to Database
      const orderDoc = await saveOrder({
        userId: user.uid,
        userName: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: cart,
        total: total,
        paymentMethod: formData.paymentMethod,
        receiptImage: receiptUrl,
        status: (formData.paymentMethod === 'aba' && receiptUrl) ? 'paid' : 'pending' as 'paid' | 'pending' | 'delivered' | 'cancelled'
      });
      const orderId = orderDoc.id;

      // 3. ABA Checkout Flow (Redirect to ABA)
      if (formData.paymentMethod === 'aba' && !receiptFile) {
          setIsGeneratingQr(true);
          try {
              const res = await fetch("/api/payway/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      orderId,
                      amount: Number(total.toFixed(2))
                  })
              });

              const data = await res.json();
              
              if (data.error) {
                  throw new Error(data.error);
              }

              // Create form & redirect to ABA
              const form = document.createElement("form");
              form.method = "POST";
              form.action = data.checkoutUrl;

              Object.entries(data.payload).forEach(([key, value]) => {
                  const input = document.createElement("input");
                  input.type = "hidden";
                  input.name = key;
                  input.value = value as string;
                  form.appendChild(input);
              });

              document.body.appendChild(form);
              form.submit();
              return; // User will be redirected to ABA
          } catch (err: unknown) {
              const error = err as { message?: string };
              toast.error("Failed to redirect to ABA: " + error.message);
          } finally {
              setIsGeneratingQr(false);
          }
      }

      setIsOrdered(true);
      // Cart kept intact per user request
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error placing order:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isOrdered) {
    return (
      <div className="bg-[#fff9f2] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16 px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-green-50 p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                ✓
              </div>
              <h1 className="text-4xl font-bold font-serif text-[#2d1e1e]">Order Placed!</h1>
              <p className="text-[#8c7676] max-w-sm mx-auto">Thank you for your order. We&apos;ll contact you soon at <strong>{confirmedOrder?.phone || formData.phone}</strong> for delivery.</p>
            </div>

            <div className="p-12 space-y-10">
              {confirmedOrder ? (
                <>
                  <section className="space-y-6">
                    <h3 className="text-xl font-bold font-serif text-[#2d1e1e] flex items-center gap-3">
                      Order Summary
                      <span className="text-xs font-sans font-normal text-[#8c7676] bg-slate-100 px-3 py-1 rounded-full">#{confirmedOrder.id?.slice(-8).toUpperCase()}</span>
                    </h3>
                    <div className="space-y-4 bg-[#fdf5e6] p-8 rounded-3xl">
                      {confirmedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-[#e85d41]/5 group hover:bg-white transition-all">
                          <div className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Image 
                                src={item.image || item.images?.[0]?.src || "/logo.png"} 
                                alt={item.name} 
                                fill 
                                className="object-contain p-2" 
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-[#2d1e1e] line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-[#8c7676] font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full inline-block">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-[#e85d41] font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-[#e85d41]/10 space-y-2">
                         <div className="flex justify-between text-xs text-[#8c7676]">
                            <span>Delivery Fee</span>
                            <span>$5.00</span>
                         </div>
                         <div className="flex justify-between text-xl font-bold text-[#e85d41]">
                            <span className="font-serif">Total Paid</span>
                            <span className="font-mono">${confirmedOrder.total.toFixed(2)}</span>
                         </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-bold font-serif text-[#2d1e1e]">Shipping Details</h3>
                    <div className="bg-slate-50 p-6 rounded-2xl space-y-2">
                      <p className="text-sm"><strong>Name:</strong> {confirmedOrder.userName}</p>
                      <p className="text-sm"><strong>Phone:</strong> {confirmedOrder.phone}</p>
                      <p className="text-sm"><strong>Address:</strong> {confirmedOrder.address}</p>
                    </div>
                  </section>
                </>
              ) : (
                <div className="flex items-center justify-center p-12">
                   <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100"></div>
                      <div className="h-4 w-32 bg-slate-100 rounded"></div>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                <Link href="/" className="block w-full bg-[#e85d41] text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-sm text-center hover:bg-[#d14d34] transition-all transform hover:-translate-y-1 shadow-xl shadow-[#e85d41]/20">
                  Return Home
                </Link>
                <button onClick={() => window.print()} className="block w-full border-2 border-slate-100 text-[#8c7676] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-12 text-center">Checkout</h1>

          <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#e85d41] text-white text-sm flex items-center justify-center">1</span>
                  Shipping Information
                </h3>
                <div className="grid gap-6 bg-[#fdf5e6] p-8 rounded-3xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Full Name</label>
                    <input 
                      readOnly
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      autoFocus
                      className="w-full bg-white/50 border border-[#e85d41]/10 rounded-xl p-4 outline-none cursor-not-allowed opacity-70" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="012 345 678"
                      className="w-full bg-white border border-[#e85d41]/10 rounded-xl p-4 outline-none focus:border-[#e85d41]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2d1e1e] mb-2">Delivery Address</label>
                    <textarea 
                      required
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, District, City..."
                      className="w-full bg-white border border-[#e85d41]/10 rounded-xl p-4 outline-none focus:border-[#e85d41]" 
                    ></textarea>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-2xl font-bold font-serif text-[#2d1e1e] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#e85d41] text-white text-sm flex items-center justify-center">2</span>
                  Payment Method
                </h3>
                <div className="grid gap-4">
                  <label className={`cursor-pointer border-2 p-6 rounded-3xl flex items-center justify-between transition-all ${formData.paymentMethod === 'aba' ? 'border-[#e85d41] bg-[#fdf5e6]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="aba" 
                        checked={formData.paymentMethod === 'aba'}
                        onChange={handleChange}
                        className="accent-[#e85d41] w-5 h-5"
                      />
                      <div>
                        <p className="font-bold text-[#2d1e1e]">ABA Pay / Mobile Banking</p>
                        <p className="text-xs text-[#8c7676]">
                          {shopSettings?.abaMerchantId ? "Automated secure payment" : "Instantly pay via ABA Mobile"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg shadow-sm font-bold text-blue-600 text-sm">
                      {shopSettings?.abaMerchantId ? "PayWay" : "ABA"}
                    </div>
                  </label>

                  <label className={`cursor-pointer border-2 p-6 rounded-3xl flex items-center justify-between transition-all ${formData.paymentMethod === 'cash' ? 'border-[#e85d41] bg-[#fdf5e6]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cash" 
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="accent-[#e85d41] w-5 h-5"
                      />
                      <div>
                        <p className="font-bold text-[#2d1e1e]">Cash on Delivery</p>
                        <p className="text-xs text-[#8c7676]">Pay when you receive your cake</p>
                      </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg shadow-sm font-bold text-green-600 text-sm">CASH</div>
                  </label>
                </div>

                    <div className="bg-[#f0f9ff] border-2 border-blue-100 p-8 rounded-3xl text-center space-y-6 animate-in fade-in slide-in-from-top-4">
                      {isGeneratingQr ? (
                        <div className="py-12 flex flex-col items-center gap-4">
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                           <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Generating QR...</p>
                        </div>
                      ) : abaQr ? (
                        <div className="space-y-6">
                           <div className="bg-white p-4 rounded-2xl shadow-sm inline-block relative w-48 h-48">
                              <Image src={abaQr.image || ""} alt="ABA QR Code" fill className="object-contain" />
                           </div>
                           <div className="space-y-2">
                             <h4 className="font-bold text-[#2d1e1e] text-lg">Scan to Pay</h4>
                             <p className="text-[#8c7676] text-sm leading-relaxed">
                               Open your ABA Mobile app and scan this QR code to complete your purchase of <strong>${total.toFixed(2)}</strong>.
                             </p>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-[#2d1e1e] text-lg">Secure ABA PayWay</h4>
                            <p className="text-[#8c7676] text-sm leading-relaxed">
                              Click the button below to generate a secure QR code for your payment.
                            </p>
                          </div>
                        </>
                      )}

                      <div className="pt-4 border-t border-blue-100/50">
                        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                           <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                           {isGeneratingQr ? "Processing..." : abaQr ? "Awaiting Payment" : "Automated Payment Portal Enabled"}
                        </div>
                      </div>
                    </div>
              </section>
            </div>

            <div className="bg-[#fdf5e6] p-10 rounded-[40px] h-fit space-y-8 sticky top-8">
              <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">In Your Order</h3>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.slug} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-white rounded-xl flex-shrink-0">
                      <Image src={item.images?.[0]?.src || (item as { image?: string }).image || "/logo.png"} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-[#2d1e1e] text-sm">{item.name}</p>
                      <p className="text-xs text-[#8c7676]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#2d1e1e]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-[#e85d41]/10 space-y-4">
                <div className="flex justify-between text-[#8c7676]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2d1e1e]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8c7676]">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#2d1e1e]">${shipping.toFixed(2)}</span>
                </div>
                <div className="pt-4 flex justify-between items-center text-3xl font-bold text-[#2d1e1e]">
                  <span className="font-serif">Total</span>
                  <span className="text-[#e85d41] font-mono">${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#e85d41] text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all transform hover:-translate-y-1 shadow-xl shadow-[#e85d41]/20 disabled:opacity-50">
                {loading ? 'Processing...' : 'Confirm & Place Order'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
