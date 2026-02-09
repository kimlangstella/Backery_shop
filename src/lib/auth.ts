import { User } from "firebase/auth";
import { AppUser } from "./db";

export const ADMIN_EMAIL = "foxymoonton@gmail.com";

/**
 * Checks if a given Firebase user has Admin privileges.
 */
export const isAdmin = (user: User | null, profile?: AppUser | null): boolean => {
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    return profile?.role === "admin";
};

/**
 * Returns the user's role as a string.
 */
export const getUserRole = (user: User | null): "admin" | "user" => {
    return isAdmin(user) ? "admin" : "user";
};
