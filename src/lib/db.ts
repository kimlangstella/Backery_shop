import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    deleteDoc,
    onSnapshot,
    Timestamp,
    setDoc,
    where,
    getDoc
} from "firebase/firestore";

// --- Orders ---

export interface Order {
    id?: string;
    userId: string;
    userName: string;
    phone: string;
    address: string;
    items: any[];
    total: number;
    paymentMethod: string;
    receiptImage?: string; // URL to the payment screenshot
    adminNote?: string; // Internal notes for admins
    status: "pending" | "paid" | "delivered" | "cancelled";
    createdAt: Timestamp | any;
}

export const saveOrder = async (order: Omit<Order, "id" | "createdAt" | "status"> & { status?: Order["status"] }) => {
    return addDoc(collection(db, "orders"), {
        ...order,
        status: order.status || "pending",
        createdAt: Timestamp.now()
    });
};

export const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const orderRef = doc(db, "orders", orderId);
    return updateDoc(orderRef, { status });
};

// --- Messages ---

export interface Message {
    id?: string;
    userId: string;
    name: string;
    email: string;
    message: string;
    subject?: string;
    status: "unread" | "read" | "replied";
    createdAt: Timestamp | any;
}

export const saveMessage = async (message: Omit<Message, "id" | "createdAt" | "status">) => {
    return addDoc(collection(db, "messages"), {
        ...message,
        status: "unread",
        createdAt: Timestamp.now()
    });
};

export const updateMessageStatus = async (messageId: string, status: Message["status"]) => {
    const messageRef = doc(db, "messages", messageId);
    return updateDoc(messageRef, { status });
};

export const getMessages = async () => {
    try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const getOrders = async () => {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    try {
        // Use only an equality filter to avoid requiring a composite index.
        // We'll sort client-side by createdAt.
        const q = query(collection(db, "orders"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        return orders.sort((a, b) => {
            const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : Number(new Date(a.createdAt).getTime() || 0);
            const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : Number(new Date(b.createdAt).getTime() || 0);
            return bMs - aMs;
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            return { id: orderSnap.id, ...orderSnap.data() } as Order;
        }
        return null;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};

export const deleteOrder = async (orderId: string) => {
    return deleteDoc(doc(db, "orders", orderId));
};

// --- Users ---

export interface AppUser {
    id?: string;
    uid: string;
    email: string;
    name: string;
    password?: string;
    role: "admin" | "customer";
    status: "active" | "suspended";
    createdAt: Timestamp | any;
    lastLogin?: Timestamp | any;
}

export const getUsers = async () => {
    try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
    try {
        // Fetch by document ID (uid). This avoids requiring collection queries,
        // which are typically admin-only in our rules.
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as AppUser;
        }
        // If there is no profile document, just return null.
        // (Legacy "where uid == ..." fallback is removed because it can be blocked for non-admins.)
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

export const saveUser = async (user: Omit<AppUser, "id" | "createdAt">) => {
    // We use the UID as the document ID for consistency and better performance
    const userRef = doc(db, "users", user.uid);
    return setDoc(userRef, {
        ...user,
        createdAt: Timestamp.now()
    });
};

export const updateUser = async (userId: string, data: Partial<AppUser>) => {
    const userRef = doc(db, "users", userId);
    return updateDoc(userRef, data);
};

export const deleteUser = async (userId: string) => {
    return deleteDoc(doc(db, "users", userId));
};

// --- Products ---

export interface Product {
    id?: string;
    slug: string;
    name: string;
    price: number;
    description: string;
    rating?: number;
    image?: string; // Simplification for MVP: single image URL
    category?: string;
    size?: string; // Added size field
    status: "active" | "draft";
    createdAt: Timestamp | any;
}

export const saveProduct = async (product: Omit<Product, "id" | "createdAt" | "status">) => {
    return addDoc(collection(db, "products"), {
        ...product,
        rating: 5, // Default rating
        status: "active",
        createdAt: Timestamp.now()
    });
};

export const getProducts = async () => {
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching products:", error);
        return []; // Return empty array on error (e.g., missing permissions) to prevent crash
    }
};

export const deleteProduct = async (productId: string) => {
    return deleteDoc(doc(db, "products", productId));
};

export const updateProduct = async (productId: string, data: Partial<Product>) => {
    const productRef = doc(db, "products", productId);
    return updateDoc(productRef, data);
};

// --- Settings ---

export interface ShopSettings {
    abaQrCode?: string;
    abaMerchantId?: string;
    abaApiKey?: string; // Legacy/Manual
    abaPrivateKey?: string; // RSA
    abaPublicKey?: string; // RSA
    abaApiUrl?: string; // Custom API URL
}

export const getSettings = async (): Promise<ShopSettings | null> => {
    try {
        const settingsRef = doc(db, "settings", "shop");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
            return settingsSnap.data() as ShopSettings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
};

export const saveSettings = async (settings: ShopSettings) => {
    const settingsRef = doc(db, "settings", "shop");
    return setDoc(settingsRef, settings, { merge: true });
};
