"use client";

import { useState } from "react";
import { WalletButton } from "./WalletButton";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { userRole } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const NavLinks = () => {
        if (!userRole) {
            return (
                <>
                    <Link href="/how-it-works" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
                    <Link href="/pricing" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                    <Link href="/creators" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Creators</Link>
                    <Link href="/brands" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
                </>
            );
        }

        if (userRole === "creator") {
            return (
                <>
                    <Link href="/how-it-works" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
                    <Link href="/brands" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
                    <Link href="/about" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                    <Link href="/" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </>
            );
        }

        if (userRole === "brand") {
            return (
                <>
                    <Link href="/creators" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Creators</Link>
                    <Link href="/" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>Campaigns</Link>
                    <Link href="/about" className="hover:underline decoration-2 underline-offset-4" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                </>
            );
        }

        return null;
    };

    return (
        <nav className="w-full px-6 py-4 border-b-2 border-black bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-patrick font-bold tracking-wide flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full border border-black"></span>
                    SolTier
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 font-patrick text-lg">
                    <NavLinks />
                </div>

                {/* Desktop Wallet Button */}
                <div className="hidden md:flex items-center gap-4">
                    <WalletButton />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 border-2 border-black bg-white hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="pt-4 pb-2 flex flex-col gap-4 font-patrick text-lg border-t-2 border-dashed border-gray-300 mt-4">
                    <NavLinks />
                    <div className="pt-2 border-t border-gray-200">
                        <WalletButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
