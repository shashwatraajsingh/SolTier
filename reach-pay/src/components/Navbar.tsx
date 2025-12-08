"use client";

import { WalletButton } from "./WalletButton";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
    const { userRole } = useUser();

    return (
        <nav className="w-full px-6 py-4 border-b-2 border-black bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-patrick font-bold tracking-wide flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full border border-black"></span>
                    SolTier
                </Link>

                <div className="hidden md:flex items-center gap-8 font-patrick text-lg">
                    {!userRole && (
                        <>
                            <Link href="/how-it-works" className="hover:underline decoration-2 underline-offset-4">How it works</Link>
                            <Link href="/pricing" className="hover:underline decoration-2 underline-offset-4">Pricing</Link>
                            <Link href="/creators" className="hover:underline decoration-2 underline-offset-4">Creators</Link>
                            <Link href="/brands" className="hover:underline decoration-2 underline-offset-4">Brands</Link>
                        </>
                    )}

                    {userRole === "creator" && (
                        <>
                            <Link href="/how-it-works" className="hover:underline decoration-2 underline-offset-4">How it works</Link>
                            <Link href="/brands" className="hover:underline decoration-2 underline-offset-4">Brands</Link>
                            <Link href="/about" className="hover:underline decoration-2 underline-offset-4">About Us</Link>
                            <Link href="/" className="hover:underline decoration-2 underline-offset-4">Dashboard</Link>
                        </>
                    )}

                    {userRole === "brand" && (
                        <>
                            <Link href="/creators" className="hover:underline decoration-2 underline-offset-4">Creators</Link>
                            <Link href="/" className="hover:underline decoration-2 underline-offset-4">Campaigns</Link>
                            <Link href="/about" className="hover:underline decoration-2 underline-offset-4">About Us</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <WalletButton />
                </div>
            </div>
        </nav>
    );
};
