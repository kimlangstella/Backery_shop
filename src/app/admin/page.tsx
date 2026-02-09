"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, secondaryAuth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { onAuthStateChanged, User, createUserWithEmailAndPassword } from "firebase/auth";
import { isAdmin } from "@/lib/auth";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { 
  getProducts, 
  saveProduct, 
  updateProduct,
  getOrders, 
  getMessages, 
  getUsers,
  saveUser,
  updateUser,
  deleteUser,
  getUserProfile,
  Order, 
  Message, 
  Product,
  AppUser,
  ShopSettings,
  getSettings,
  saveSettings
} from "@/lib/db";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Package, 
  LogOut, 
  Home, 
  Search, 
  Bell, 
  User as UserIcon, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Filter,
  X,
  Plus,
  Pencil,
  Check,
  Truck,
  Users as UsersIconIcon,
  Trash
} from "lucide-react";

// --- Components ---
const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group mb-1 ${
      active 
        ? 'bg-white text-[#ff5c8a] shadow-sm' 
        : 'text-[#9c7b7b] hover:bg-[#ffe5ec] hover:text-[#5e4040]'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${active ? 'text-[#ff5c8a]' : 'text-[#a15c74] group-hover:text-[#ff5c8a]'}`} />
      <span className={`font-medium text-sm ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
    {badge ? (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
        active ? 'bg-[#ff5c8a] text-white' : 'bg-white text-[#ff5c8a]'
      }`}>{badge}</span>
    ) : null}
  </button>
);

const StatCard = ({ label, value, icon: Icon, sub, trend }: { label: string, value: string, icon: React.ElementType, sub: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-pink-50 rounded-lg text-[#ff5c8a]">
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-xs text-slate-400 mt-2">{sub}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "messages" | "products" | "users" | "settings">("overview");
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
      name: "",
      email: "",
      password: "",
      role: "customer" as "admin" | "customer",
      status: "active" as "active" | "suspended"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    size: ""
  });

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");

  // Settings State
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFile, setSettingsFile] = useState<File | null>(null);

  const handleCreateProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProduct(true);
      try {
          let imageUrl = newProduct.image;

          // Handle Image Upload
          if (imageFile) {
             const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
             const snapshot = await uploadBytes(storageRef, imageFile);
             imageUrl = await getDownloadURL(snapshot.ref);
          } else if (!imageUrl) {
             imageUrl = "/logo.png"; // Default
          }

          const productData = {
              slug: newProduct.name.toLowerCase().replace(/ /g, '-'),
              name: newProduct.name,
              price: parseFloat(newProduct.price),
              description: newProduct.description,
              image: imageUrl, 
              size: newProduct.size,
              category: "Cake",
              status: "active" as const
          };

          if (editingProductId) {
             await updateProduct(editingProductId, productData);
             toast.success("Product updated successfully!");
          } else {
             await saveProduct(productData);
             toast.success("Product created successfully!");
          }
          
          setIsProductModalOpen(false);
          setEditingProductId(null); // Reset edit mode
          setNewProduct({ name: "", price: "", description: "", image: "", size: "" });
          setImageFile(null);
          // Alert handled above
          fetchData(); // Refresh list
      } catch (error) {
          console.error(error);
          toast.error("Failed to save product");
      } finally {
          setIsSavingProduct(false);
      }
  };

  const handleEditProduct = (product: Product) => {
      setEditingProductId(product.id || null);
      setNewProduct({
          name: product.name,
          price: product.price.toString(),
          description: product.description,
          image: product.image || "",
          size: product.size || ""
      });
      setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
      if(!confirm("Are you sure you want to delete this product?")) return;
      try {
          await deleteDoc(doc(db, "products", id));
          setProducts(products.filter(p => p.id !== id));
      } catch (e: unknown) {
          console.error("Error deleting product", e);
          const err = e as { code?: string };
          const msg =
            err?.code === "permission-denied"
              ? "Permission denied. Update Firestore Rules for admin delete."
              : "Failed to delete product";
          toast.error(msg);
      }
  };

  // --- User Handlers ---
  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingUser(true);
      try {
           if (editingUserId) {
              await updateUser(editingUserId, newUser);
              toast.success("User updated successfully!");
           } else {
              // 1. Create Auth Account first
              let finalUid = "manual-" + Date.now();
              if (newUser.password) {
                  try {
                      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
                      finalUid = userCred.user.uid;
                  } catch (authErr: unknown) {
                      const err = authErr as { code?: string };
                      if (err.code === 'auth/email-already-in-use') {
                          toast.error("This email is already registered in Authentication.");
                          setIsSavingUser(false);
                          return;
                      }
                      throw authErr;
                  }
              }
              
              // 2. Save to Firestore with the Auth UID
              await saveUser({ ...newUser, uid: finalUid });
              toast.success("User created and Auth account synced!");
           }
          setIsUserModalOpen(false);
          setEditingUserId(null);
          setNewUser({ name: "", email: "", password: "", role: "customer", status: "active" });
          fetchData();
      } catch (error: unknown) {
          console.error(error);
          const err = error as { code?: string };
          const msg = err.code === 'permission-denied' 
            ? "Permission Denied! Please update Firestore Rules." 
            : "Failed to save user";
          toast.error(msg);
      } finally {
          setIsSavingUser(false);
      }
  };

  const handleEditUser = (user: AppUser) => {
      setEditingUserId(user.id || null);
      setNewUser({
          name: user.name,
          email: user.email,
          password: user.password || "",
          role: user.role,
          status: user.status
      });
      setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
      if(!confirm("Are you sure you want to delete this user?")) return;
      try {
          await deleteUser(id);
          setAppUsers(appUsers.filter(u => u.id !== id));
      } catch (e) {
          console.error("Error deleting user", e);
          toast.error("Failed to delete user");
      }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
      try {
          await updateDoc(doc(db, "orders", orderId), { status: newStatus });
          toast.success(`Order status updated to ${newStatus}`);
      } catch (e) {
          console.error("Error updating order", e);
          toast.error("Failed to update order status");
      }
  };

  const handleUpdateOrderNote = async (orderId: string, note: string) => {
      try {
          await updateDoc(doc(db, "orders", orderId), { adminNote: note });
          toast.success("Order note updated");
      } catch (e) {
          console.error("Error updating note", e);
          toast.error("Failed to update order note");
      }
  };

  const handleDeleteOrder = async (id: string) => {
      if(!confirm("Are you sure you want to delete this order?")) return;
      try {
          await deleteDoc(doc(db, "orders", id));
          setOrders(orders.filter(o => o.id !== id));
          toast.success("Order deleted successfully");
      } catch (e: unknown) {
          console.error("Error deleting order", e);
          const err = e as { code?: string };
          const msg =
            err?.code === "permission-denied"
              ? "Permission denied. Update Firestore Rules for admin delete."
              : "Failed to delete order";
          toast.error(msg);
      }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingSettings(true);
      try {
          let qrUrl = shopSettings?.abaQrCode || "";

          if (settingsFile) {
              const storageRef = ref(storage, `settings/aba_qr_${Date.now()}`);
              const snapshot = await uploadBytes(storageRef, settingsFile);
              qrUrl = await getDownloadURL(snapshot.ref);
          }

          await saveSettings({ 
              ...shopSettings, 
              abaQrCode: qrUrl,
              abaMerchantId: shopSettings?.abaMerchantId || "",
              abaApiKey: shopSettings?.abaApiKey || "",
              abaPrivateKey: shopSettings?.abaPrivateKey || "",
              abaPublicKey: shopSettings?.abaPublicKey || "",
              abaApiUrl: shopSettings?.abaApiUrl || ""
          });
          setShopSettings({ 
              ...shopSettings, 
              abaQrCode: qrUrl,
              abaMerchantId: shopSettings?.abaMerchantId || "",
              abaApiKey: shopSettings?.abaApiKey || "",
              abaPrivateKey: shopSettings?.abaPrivateKey || "",
              abaPublicKey: shopSettings?.abaPublicKey || "",
              abaApiUrl: shopSettings?.abaApiUrl || ""
          });
          toast.success("Settings saved successfully!");
          setSettingsFile(null);
      } catch (error) {
          console.error("Error saving settings:", error);
          toast.error("Failed to save settings");
      } finally {
          setIsSavingSettings(false);
      }
  };

  const fetchData = async () => {
     // Fetch Orders
     const ordersData = await getOrders();
     setOrders(ordersData);

     // Fetch Messages
     const messagesData = await getMessages();
     setMessages(messagesData);

     // Fetch Products
     const productsData = await getProducts();
     setProducts(productsData);

     // Fetch Users
     const usersData = await getUsers();
     setAppUsers(usersData);
  };

  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeProducts: (() => void) | null = null;
    let unsubscribeUsers: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      let profile = null;
      if (currentUser) {
        profile = await getUserProfile(currentUser.uid);
      }
      
      if (!currentUser || !isAdmin(currentUser, profile)) {
        router.push("/"); // Redirect non-admins
        return;
      }

      setUser(currentUser);
      setLoading(false);

      // Initial data fetch
      fetchData();

      // Set up real-time listeners
      const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      }, (err) => {
        console.error("Orders listener error:", err);
        toast.error(err?.code === "permission-denied" ? "Permission denied (orders). Check Firestore Rules." : "Orders listener error");
      });

      const qMessages = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      }, (err) => {
        console.error("Messages listener error:", err);
        toast.error(err?.code === "permission-denied" ? "Permission denied (messages). Check Firestore Rules." : "Messages listener error");
      });

      const qProducts = query(collection(db, "products"), orderBy("name"));
      unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }, (err) => {
        console.error("Products listener error:", err);
        toast.error(err?.code === "permission-denied" ? "Permission denied (products). Check Firestore Rules." : "Products listener error");
      });

      const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
      unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        setAppUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser)));
      }, (err) => {
        console.error("Users listener error:", err);
        toast.error(err?.code === "permission-denied" ? "Permission denied (users). Check Firestore Rules." : "Users listener error");
      });
    });

    // Fetch initial settings
    const loadSettings = async () => {
        const settings = await getSettings();
        setShopSettings(settings);
    };
    loadSettings();

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const revenue = orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0);
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="bg-slate-50 min-h-screen flex text-slate-800 font-sans">
      {/* Sidebar - PINK BACKGROUND */}
      <aside className="w-64 bg-[#fff0f3] border-r border-pink-100 flex flex-col fixed h-screen z-20">
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm bg-white">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg text-[#5e4040] tracking-tight">Sweet<span className="text-[#ff5c8a]">Admin</span></span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-[#a15c74] uppercase tracking-wider mb-2">Main Menu</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <SidebarItem icon={ShoppingBag} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
              <SidebarItem icon={MessageSquare} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} badge={unreadCount > 0 ? unreadCount : undefined} />
              <SidebarItem icon={Package} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
              <SidebarItem icon={UsersIconIcon} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <SidebarItem icon={TrendingUp} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-pink-100">
           <button 
             onClick={() => auth.signOut()}
             className="w-full flex items-center gap-3 px-4 py-3 text-[#a15c74] hover:bg-white/50 hover:text-[#ff5c8a] rounded-lg transition-colors text-sm font-medium"
           >
             <LogOut className="w-5 h-5" />
             <span>Sign Out</span>
           </button>
           
           <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#a15c74] hover:text-[#ff5c8a] transition-colors text-sm font-medium mt-1">
              <Home className="w-5 h-5" />
              <span>Back to Shop</span>
           </Link>
        </div>
      </aside>

      {/* Main Content - NEUTRAL BACKGROUND */}
      <main className="flex-grow ml-64 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'messages' && 'Support Inbox'}
              {activeTab === 'products' && 'Product Inventory'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'settings' && 'Shop Settings'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.email}</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all w-64 text-slate-700"
                />
             </div>
             <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff5c8a] rounded-full border-2 border-white"></span>
             </button>
             <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#ff5c8a] font-bold text-sm">
                {user?.email?.[0].toUpperCase()}
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} icon={CreditCard} sub="All time earnings" trend="+12.5%" />
                <StatCard label="Active Orders" value={orders.length.toString()} icon={ShoppingBag} sub="Orders pending processing" />
                <StatCard label="Unread Messages" value={unreadCount.toString()} icon={MessageSquare} sub="Requires attention" />
                <StatCard label="Total Products" value={products.length.toString()} icon={Package} sub="In current catalog" />
              </div>

              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-[#ff5c8a] text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div>
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{order.userName}</p>
                              <p className="text-xs text-slate-500">{order.items?.[0]?.name || 'Order Items'} • ${order.total?.toFixed(2)}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            order.status === 'paid' ? 'bg-green-50 text-green-700' : 
                            order.status === 'delivered' ? 'bg-blue-50 text-blue-700' : 
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="bg-slate-800 rounded-xl shadow-lg shadow-slate-200 text-white p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-2">Customer Insights</h3>
                      <p className="text-slate-300 text-sm mb-6">You have <strong className="text-white">{unreadCount} unread messages</strong> needing your attention. Responding quickly improves customer satisfaction.</p>
                      
                      <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                           <div className="flex items-center gap-3 mb-2">
                              <TrendingUp className="w-4 h-4 text-slate-300" />
                              <span className="text-xs font-medium uppercase tracking-wider text-slate-300">Response Time</span>
                           </div>
                           <p className="text-2xl font-bold">1.2 hrs</p>
                           <p className="text-xs text-slate-400">Average response time this week</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="w-full mt-6 bg-[#ff5c8a] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#ff3369] transition-colors"
                    >
                      Go to Inbox
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-slate-800">All Orders</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 shadow-sm cursor-pointer hover:border-slate-300">All Status</span>
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 shadow-sm cursor-pointer hover:border-slate-300">Latest First</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#ff5c8a] text-white rounded-lg text-sm font-medium hover:bg-[#ff3369] transition-colors shadow-sm shadow-[#ff5c8a]/30">
                   <Filter className="w-4 h-4" />
                   Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Order ID & Customer</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded text-slate-400">
                               <Package className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-medium text-slate-900">{order.userName}</p>
                               <p className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-800">{order.phone}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px]">{order.address}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-900">${order.total?.toFixed(2)}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{order.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                order.status === 'delivered' ? 'bg-blue-100 text-blue-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status}
                              </span>
                              {order.adminNote && (
                                <p className="text-[10px] text-slate-400 italic max-w-[120px] truncate" title={order.adminNote}>
                                  Note: {order.adminNote}
                                </p>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Order Details */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View Order Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Receipt Preview */}
                            {order.receiptImage ? (
                              <button 
                                onClick={() => setSelectedReceipt(order.receiptImage)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="View Receipt"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            ) : (
                               <div className="p-2 text-slate-200">
                                 <CreditCard className="w-4 h-4" />
                               </div>
                            )}

                            {/* Divider */}
                            <div className="w-px h-6 bg-slate-100 mx-1"></div>

                            {/* Verification Actions */}
                            {order.status === 'pending' || order.status === 'paid' ? (
                               <div className="flex items-center gap-1">
                                  {order.status === 'pending' && (
                                    <button 
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, 'paid')}
                                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                      title="Approve Payment"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  {order.status === 'paid' && (
                                    <button 
                                      onClick={() => order.id && handleUpdateOrderStatus(order.id, 'delivered')}
                                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                      title="Mark Delivered"
                                    >
                                      <Truck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                        if (order.id) {
                                            setEditingNoteId(order.id);
                                            setTempNote(order.adminNote || "");
                                        }
                                    }}
                                    className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Add Note / Reject"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                 className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
                               >
                                 Reset
                               </button>
                            )}
                            
                            {/* Delete Button */}
                            <button 
                              onClick={() => order.id && handleDeleteOrder(order.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors ml-1"
                              title="Delete Order"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-800">Inbox</h2>
                </div>
                <div className="divide-y divide-slate-100">
                   {messages.map((msg) => (
                     <div key={msg.id} className={`p-6 transition-all hover:bg-slate-50 flex gap-6 ${msg.status === 'unread' ? 'bg-indigo-50/30' : ''}`}>
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.status === 'unread' ? 'bg-pink-100 text-[#ff5c8a]' : 'bg-slate-100 text-slate-500'}`}>
                           <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <h4 className={`text-sm ${msg.status === 'unread' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{msg.name}</h4>
                                 <p className="text-xs text-slate-500">{msg.email}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 {msg.status === 'unread' && (
                                   <button 
                                     onClick={() => updateDoc(doc(db, "messages", msg.id), { status: "read" })}
                                     className="text-xs font-medium text-[#ff5c8a] hover:text-[#d64065]"
                                   >
                                     Mark as Read
                                   </button>
                                 )}
                                 <span className="text-xs text-slate-400 font-mono">
                                    {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                 </span>
                              </div>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 group-hover:border-slate-200 transition-colors">
                             {msg.message}
                           </p>
                           <div className="mt-3 flex justify-end">
                              <a 
                                href={`mailto:${msg.email}?subject=Re: Support Inquiry`}
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#ff5c8a] transition-colors uppercase tracking-wider"
                              >
                                Reply via Email <ChevronRight className="w-3 h-3" />
                              </a>
                           </div>
                        </div>
                     </div>
                   ))}
                   {messages.length === 0 && (
                     <div className="p-12 text-center text-slate-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No messages found.</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              {/* Product List Header */}
              <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Products</h2>
                  <p className="text-sm text-slate-500">Manage your store&apos;s inventory</p>
                </div>
                <button 
                  onClick={() => {
                      setEditingProductId(null);
                      setNewProduct({ name: "", price: "", description: "", image: "", size: "" });
                      setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#ff5c8a] text-white rounded-lg hover:bg-[#ff3369] transition flex items-center gap-2 shadow-lg shadow-[#ff5c8a]/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>

               {/* Hint for user */}
               <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 flex items-start gap-3">
                  <div className="bg-blue-100 p-1 rounded text-blue-600 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block mb-1">New Feature</strong> 
                    You can now add products with Size and Custom Image support using the new modal.
                  </div>
               </div>

              {/* Product List Table */}
              {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No products yet</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first product.</p>
                    <button 
                      onClick={() => setIsProductModalOpen(true)}
                      className="px-4 py-2 bg-[#ff5c8a] text-white rounded-lg hover:bg-[#ffc2d1] font-medium transition"
                    >
                      Add Product
                    </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                         <tr>
                           <th className="px-6 py-4">Product</th>
                           <th className="px-6 py-4">Price</th>
                           <th className="px-6 py-4">Size</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {products.map((product) => (
                           <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden relative bg-slate-100">
                                      <Image src={product.image || "/logo.png"} alt={product.name} fill className="object-cover" />
                                   </div>
                                  <div>
                                     <p className="text-sm font-medium text-slate-900">{product.name}</p>
                                     <p className="text-xs text-slate-500 truncate max-w-[150px]">{product.description}</p>
                                  </div>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-sm font-medium text-slate-900">
                               ${product.price}
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-500">
                               {product.size || '-'}
                             </td>
                             <td className="px-6 py-4">
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                 {product.status}
                               </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => handleEditProduct(product)}
                                   className="text-[#ff5c8a] hover:text-[#d64065] p-2 hover:bg-[#ffe5ec] rounded-lg transition-colors"
                                   title="Edit Product"
                                 >
                                   <Pencil className="w-4 h-4" /> 
                                 </button>
                                 <button 
                                   onClick={() => product.id && handleDeleteProduct(product.id)}
                                   className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                   title="Delete Product"
                                 >
                                   <LogOut className="w-4 h-4" /> 
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
               {/* Users Header */}
               <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                  <p className="text-sm text-slate-500">Manage admin access and customer profiles</p>
                </div>
                <button 
                  onClick={() => {
                      setEditingUserId(null);
                      setNewUser({ name: "", email: "", password: "", role: "customer", status: "active" });
                      setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#ff5c8a] text-white rounded-lg hover:bg-[#ff3369] transition flex items-center gap-2 shadow-lg shadow-[#ff5c8a]/20"
                >
                  <Plus className="w-5 h-5" />
                  Add User
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                         <tr>
                           <th className="px-6 py-4">Name & Email</th>
                           <th className="px-6 py-4">Role</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Joined</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {appUsers.map((u) => (
                           <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u.role === 'admin' ? 'bg-pink-100 text-[#ff5c8a]' : 'bg-slate-100 text-slate-500'}`}>
                                     {u.name?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                     <p className="text-sm font-medium text-slate-900">{u.name}</p>
                                     <p className="text-xs text-slate-500">{u.email}</p>
                                  </div>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                 u.role === 'admin' ? 'bg-pink-50 text-[#ff5c8a]' : 'bg-slate-50 text-slate-500'
                               }`}>
                                 {u.role}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                 u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                               }`}>
                                 {u.status}
                               </span>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-500">
                                {u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : 'Manual'}
                             </td>
                             <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => handleEditUser(u)}
                                   className="text-slate-600 hover:text-[#ff5c8a] p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                 >
                                   <Pencil className="w-4 h-4" /> 
                                 </button>
                                 <button 
                                   onClick={() => u.id && handleDeleteUser(u.id)}
                                   className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                   <LogOut className="w-4 h-4" /> 
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                         {appUsers.length === 0 && (
                           <tr>
                             <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                               <UsersIconIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                               <p>No user records found.</p>
                             </td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#ff5c8a]" />
                    Payment Settings
                  </h2>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ABA QR Code</label>
                      <div className="space-y-4">
                        <div className="w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative">
                           {(settingsFile || shopSettings?.abaQrCode) ? (
                              <Image 
                                src={settingsFile ? URL.createObjectURL(settingsFile) : shopSettings?.abaQrCode!} 
                                alt="ABA QR Preview" 
                                fill
                                className="object-contain"
                              />
                           ) : (
                              <div className="text-slate-300 flex flex-col items-center">
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="text-xs font-medium">No Image</span>
                              </div>
                           )}
                        </div>
                        
                        <div className="relative group max-w-xs">
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={(e) => setSettingsFile(e.target.files?.[0] || null)}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <div className="px-4 py-2 border border-slate-200 rounded-lg bg-white group-hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600 flex items-center justify-center gap-2">
                              {settingsFile ? 'Change Image' : 'Upload QR Code'}
                           </div>
                        </div>
                        <p className="text-xs text-slate-400">Upload your ABA QR code image. This will be shown to customers at checkout.</p>
                      </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ABA Merchant ID</label>
                        <input 
                          type="text"
                          value={shopSettings?.abaMerchantId || ""}
                          onChange={(e) => setShopSettings(prev => prev ? { ...prev, abaMerchantId: e.target.value } : { abaMerchantId: e.target.value })}
                          placeholder="e.g. ec123456"
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">PayWay API URL</label>
                        <input 
                          type="text"
                          value={shopSettings?.abaApiUrl || ""}
                          onChange={(e) => setShopSettings(prev => prev ? { ...prev, abaApiUrl: e.target.value } : { abaApiUrl: e.target.value })}
                          placeholder="https://checkout.ababank.com/..."
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">RSA Private Key</label>
                        <textarea 
                          rows={4}
                          value={shopSettings?.abaPrivateKey || ""}
                          onChange={(e) => setShopSettings(prev => prev ? { ...prev, abaPrivateKey: e.target.value } : { abaPrivateKey: e.target.value })}
                          placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">RSA Public Key</label>
                        <textarea 
                          rows={4}
                          value={shopSettings?.abaPublicKey || ""}
                          onChange={(e) => setShopSettings(prev => prev ? { ...prev, abaPublicKey: e.target.value } : { abaPublicKey: e.target.value })}
                          placeholder="-----BEGIN PUBLIC KEY-----..."
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-xs font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Required for ABA PayWay RSA integration. Keep your Private Key secret.</p>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                       <button 
                         type="submit"
                         disabled={isSavingSettings}
                         className="px-8 py-3 bg-[#ff5c8a] text-white rounded-xl font-bold text-sm hover:bg-[#ff3369] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#ff5c8a]/20 disabled:opacity-50 flex items-center gap-2"
                       >
                         {isSavingSettings ? 'Saving...' : 'Save Settings'}
                       </button>
                    </div>
                  </form>
               </div>
            </div>
          )}

          {/* ADD PRODUCT MODAL */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-800">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                  <button 
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleCreateProduct} className="space-y-5">
                      <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                           <input 
                             required
                             value={newProduct.name}
                             onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                             placeholder="e.g. Strawberry Shortcake"
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900 placeholder:text-slate-400"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                              <input 
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                placeholder="0.00"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Size / Weight</label>
                              <input 
                                value={newProduct.size}
                                onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                                placeholder="e.g. 1kg, 8 inches"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                              />
                           </div>
                        </div>

                         <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                           <div className="space-y-3">
                             {/* File Input */}
                             <div className="flex items-center gap-2">
                               <input 
                                 type="file"
                                 accept="image/*"
                                 onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                 className="block w-full text-sm text-slate-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-pink-50 file:text-[#ff5c8a]
                                   hover:file:bg-pink-100"
                               />
                             </div>
                             
                             <div className="text-center text-slate-400 text-xs font-medium">- OR -</div>

                             {/* URL Input (Fallback) */}
                             <input 
                               value={newProduct.image}
                               onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                               placeholder="Enter Image URL directly..."
                               className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-sm font-mono text-slate-600"
                             />
                           </div>
                           <p className="text-xs text-slate-500 mt-1">Upload a file or provide a URL. Defaults to logo if empty.</p>
                        </div>
                        
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                           <textarea 
                             value={newProduct.description}
                             onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                             placeholder="Describe your tasty product..."
                             rows={3}
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all text-sm"
                           ></textarea>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                         <button 
                           type="button"
                           onClick={() => setIsProductModalOpen(false)}
                           className="px-4 py-2 text-[#a15c74] hover:bg-[#fff0f3] rounded-lg font-medium text-sm transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           type="submit"
                           disabled={isSavingProduct}
                           className="px-6 py-2 bg-[#ff5c8a] text-white rounded-lg font-bold text-sm hover:bg-[#ff3369] transition-colors shadow-lg shadow-[#ff5c8a]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                         >
                           {isSavingProduct ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               Saving...
                             </>
                           ) : (
                             editingProductId ? 'Update Product' : 'Create Product'
                           )}
                         </button>
                      </div>
                  </form>
               </div>
            </div>
           </div>
          )}

          {/* USER MODAL */}
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-800">{editingUserId ? 'Edit User' : 'Add New User'}</h3>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleCreateUser} className="space-y-5">
                      <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                           <input 
                             required
                             value={newUser.name}
                             onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                             placeholder="e.g. John Doe"
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                           <input 
                             required
                             type="email"
                             value={newUser.email}
                             onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                             placeholder="john@example.com"
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                           <input 
                             required={!editingUserId}
                             type="password"
                             value={newUser.password || ""}
                             onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                             placeholder={editingUserId ? "Leave blank to keep same" : "••••••••"}
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select 
                                 value={newUser.role}
                                 onChange={(e) => setNewUser({...newUser, role: e.target.value as "admin" | "customer"})}
                                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                               >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select 
                                 value={newUser.status}
                                 onChange={(e) => setNewUser({...newUser, status: e.target.value as "active" | "suspended"})}
                                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 focus:border-[#ff5c8a] transition-all font-medium text-slate-900"
                               >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                              </select>
                           </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                         <button 
                           type="button"
                           onClick={() => setIsUserModalOpen(false)}
                           className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           type="submit"
                           disabled={isSavingUser}
                           className="px-6 py-2 bg-[#ff5c8a] text-white rounded-lg font-bold text-sm hover:bg-[#ff3369] transition-colors shadow-lg shadow-[#ff5c8a]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                         >
                           {isSavingUser ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
                         </button>
                      </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* RECEIPT VIEW MODAL */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#ff5c8a]" />
                        Payment Screenshot
                     </h3>
                     <button 
                       onClick={() => setSelectedReceipt(null)}
                       className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 flex items-center justify-center bg-slate-100 min-h-[400px] relative">
                     <Image 
                       src={selectedReceipt} 
                       alt="Payment Receipt" 
                       fill
                       className="object-contain"
                     />
                  </div>
                  <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                     <button 
                       onClick={() => setSelectedReceipt(null)}
                       className="px-6 py-2 bg-[#ff5c8a] text-white rounded-lg font-bold text-sm hover:bg-[#ff3369] transition-colors"
                     >
                       Close Preview
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* ORDER DETAILS MODAL */}
          {selectedOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800">Order Details</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      #{selectedOrder.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white">
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Customer</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-semibold text-slate-700">Name:</span> {selectedOrder.userName}</p>
                        <p><span className="font-semibold text-slate-700">Phone:</span> {selectedOrder.phone}</p>
                        <p className="truncate"><span className="font-semibold text-slate-700">Address:</span> {selectedOrder.address}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payment</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-700">{selectedOrder.paymentMethod?.toUpperCase()}</p>
                          <p className="text-xs text-slate-500">Status: <span className="font-bold">{selectedOrder.status}</span></p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">${selectedOrder.total?.toFixed(2)}</p>
                      </div>
                      {selectedOrder.receiptImage ? (
                        <button
                          onClick={() => setSelectedReceipt(selectedOrder.receiptImage!)}
                          className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          <CreditCard className="w-4 h-4" />
                          View Receipt
                        </button>
                      ) : null}
                    </div>

                    {selectedOrder.adminNote ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Admin Note</p>
                        <p className="text-sm text-amber-800 leading-relaxed">{selectedOrder.adminNote}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Ordered</p>
                      <p className="text-xs text-slate-500 font-bold">
                        {(selectedOrder.items?.length || 0)} item(s)
                      </p>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3">
                      {(selectedOrder.items || []).map((it, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                            <Image
                              src={it?.image || (it as any)?.images?.[0]?.src || "/logo.png"}
                              alt={it?.name || "Item"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="font-semibold text-slate-800 truncate">{it?.name || "Item"}</p>
                            <p className="text-xs text-slate-500">
                              Qty: <span className="font-bold">{it?.quantity || 1}</span>
                              {it?.size ? <> • Size: <span className="font-bold">{it.size}</span></> : null}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                              ${(Number(it?.price || 0) * Number(it?.quantity || 1)).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ${Number(it?.price || 0).toFixed(2)} ea
                            </p>
                          </div>
                        </div>
                      ))}
                      {(selectedOrder.items || []).length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                          No items found on this order.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-2 bg-[#ff5c8a] text-white rounded-lg font-bold text-sm hover:bg-[#ff3369] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ORDER NOTE MODAL */}
          {editingNoteId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                     <h3 className="font-bold text-slate-800">Order Note & Quick Actions</h3>
                     <button 
                       onClick={() => setEditingNoteId(null)}
                       className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg"
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Note</label>
                        <textarea 
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="e.g. Paid only $5, short $1. Or customer called to change address."
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff5c8a]/20 transition-all text-sm"
                          rows={4}
                        />
                     </div>
                     
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                              handleUpdateOrderNote(editingNoteId, tempNote);
                              setEditingNoteId(null);
                          }}
                          className="flex-grow py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors"
                        >
                          Update Note Only
                        </button>
                        <button 
                          onClick={() => {
                              if(confirm("Reject this order? Status will change to 'cancelled'.")) {
                                  handleUpdateOrderNote(editingNoteId, tempNote);
                                  handleUpdateOrderStatus(editingNoteId, 'cancelled');
                                  setEditingNoteId(null);
                              }
                          }}
                          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                        >
                          Reject Order
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

