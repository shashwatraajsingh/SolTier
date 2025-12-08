"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUser } from "@/lib/api";
import { User } from "@/types";

interface UserContextType {
    userRole: "creator" | "brand" | null;
    setUserRole: (role: "creator" | "brand" | null) => void;
    user: User | null;
    refreshUser: () => Promise<void>;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { publicKey, connected } = useWallet();
    const [userRole, setUserRole] = useState<"creator" | "brand" | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshUser = async () => {
        if (!publicKey) {
            setUser(null);
            setUserRole(null);
            return;
        }

        setLoading(true);
        try {
            const userData = await getUser(publicKey.toString());
            setUser(userData);
            setUserRole(userData.role);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            // Don't clear role if it was set manually (e.g. during onboarding)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (connected && publicKey) {
            refreshUser();
        } else {
            setUser(null);
            setUserRole(null);
        }
    }, [connected, publicKey]);

    return (
        <UserContext.Provider value={{ userRole, setUserRole, user, refreshUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
