"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Copy, Check, Heart, Zap, Users, Code } from "lucide-react";
import Link from "next/link";

const SUPPORT_WALLET = "9djfkCjnpGnD1ubvuTL4T7iGETmHCjFuwdPTo7hVFmMh";

export default function SupportPage() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SUPPORT_WALLET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="flex-grow max-w-4xl mx-auto px-6 py-16">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-full border-2 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Heart className="w-10 h-10 text-white" fill="white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-patrick font-bold mb-4">Support SolTier</h1>
                        <p className="text-lg md:text-xl font-inter text-gray-600 max-w-2xl mx-auto">
                            Help us build the future of creator-first, transparent influencer marketing on Solana.
                        </p>
                    </div>

                    {/* Donation Card */}
                    <div className="bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
                        <h2 className="text-2xl md:text-3xl font-patrick font-bold mb-6 text-center">
                            Send SOL to Support Us
                        </h2>

                        <div className="bg-gray-50 p-6 border-2 border-dashed border-gray-300 rounded-lg mb-6">
                            <p className="text-sm font-inter text-gray-600 mb-2 text-center">Solana Wallet Address</p>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <code className="flex-1 w-full p-4 bg-white border-2 border-black font-mono text-sm md:text-base break-all text-center sm:text-left">
                                    {SUPPORT_WALLET}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className={`px-6 py-4 font-patrick text-lg border-2 border-black transition-all flex items-center gap-2 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${copied
                                            ? "bg-green-500 text-white"
                                            : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="font-inter text-gray-600 mb-4">
                                Every contribution helps us improve the platform and keep it running.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <span className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-sm font-inter">SOL</span>
                                <span className="px-3 py-1 bg-purple-100 border border-purple-300 rounded-full text-sm font-inter">SPL Tokens</span>
                                <span className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm font-inter">NFTs</span>
                            </div>
                        </div>
                    </div>

                    {/* Why Support Section */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-patrick font-bold mb-8 text-center">Why Support Us?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-12 h-12 bg-blue-100 rounded-full border-2 border-black flex items-center justify-center mb-4">
                                    <Code className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-patrick font-bold mb-2">Open Development</h3>
                                <p className="font-inter text-gray-600 text-sm">
                                    We're building in public. Your support helps us ship features faster and keep the platform free.
                                </p>
                            </div>

                            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-12 h-12 bg-green-100 rounded-full border-2 border-black flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-patrick font-bold mb-2">Creator-First</h3>
                                <p className="font-inter text-gray-600 text-sm">
                                    We believe creators deserve fair pay. Your support helps us keep platform fees minimal.
                                </p>
                            </div>

                            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full border-2 border-black flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-patrick font-bold mb-2">Innovation</h3>
                                <p className="font-inter text-gray-600 text-sm">
                                    Funds support new features like multi-platform integration, AI matching, and more.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What We Use Funds For */}
                    <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
                        <h2 className="text-2xl font-patrick font-bold mb-6">How Your Support Helps</h2>
                        <ul className="space-y-4 font-inter">
                            <li className="flex items-start gap-3">
                                <span className="text-xl">🖥️</span>
                                <div>
                                    <strong>Server & Infrastructure</strong>
                                    <p className="text-gray-600 text-sm">Hosting, RPC nodes, and database costs to keep SolTier running 24/7.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-xl">🔗</span>
                                <div>
                                    <strong>Blockchain Fees</strong>
                                    <p className="text-gray-600 text-sm">Covering transaction fees for oracle operations and smart contract deployments.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-xl">🛠️</span>
                                <div>
                                    <strong>Development</strong>
                                    <p className="text-gray-600 text-sm">Building new features, fixing bugs, and improving the user experience.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-xl">🔒</span>
                                <div>
                                    <strong>Security Audits</strong>
                                    <p className="text-gray-600 text-sm">Professional audits to ensure smart contracts are secure and trustworthy.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Thank You */}
                    <div className="text-center">
                        <p className="text-2xl font-patrick font-bold mb-4">Thank You for Believing in Us! 💜</p>
                        <p className="font-inter text-gray-600 mb-6">
                            Every SOL counts. Whether you donate or just spread the word, we appreciate your support.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="https://x.com/SolTierD"
                                target="_blank"
                                className="px-6 py-3 bg-black text-white font-patrick border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Follow on X
                            </Link>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-white text-black font-patrick border-2 border-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Explore Platform
                            </Link>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
