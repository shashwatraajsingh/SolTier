import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function PricingPage() {
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

                <div className="flex-grow max-w-6xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-patrick font-bold mb-4 text-center">Simple, Transparent Pricing</h1>
                    <p className="text-xl font-inter text-center text-gray-600 mb-12">No hidden fees. You only pay for results.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Creator Plan */}
                        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                            <h2 className="text-3xl font-patrick font-bold mb-2">Creators</h2>
                            <div className="text-4xl font-bold mb-6">Free</div>
                            <ul className="space-y-4 font-inter text-gray-700 flex-grow mb-8">
                                <li className="flex items-center gap-2">✅ Keep 95% of earnings</li>
                                <li className="flex items-center gap-2">✅ Instant payouts</li>
                                <li className="flex items-center gap-2">✅ Access to all campaigns</li>
                                <li className="flex items-center gap-2">✅ Real-time analytics</li>
                            </ul>
                            <Link href="/?role=creator" className="w-full py-3 bg-black text-white font-patrick text-center text-xl border-2 border-black hover:bg-gray-800 transition-all">
                                Start Earning
                            </Link>
                        </div>

                        {/* Brand Plan */}
                        <div className="relative bg-[#ffeb3b] p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transform md:-translate-y-4">
                            <div className="absolute -top-3 right-4 bg-black text-white px-3 py-1 font-patrick text-sm">POPULAR</div>
                            <h2 className="text-3xl font-patrick font-bold mb-2">Brands</h2>
                            <div className="text-4xl font-bold mb-6">5% <span className="text-lg font-normal text-gray-700">fee</span></div>
                            <ul className="space-y-4 font-inter text-gray-800 flex-grow mb-8">
                                <li className="flex items-center gap-2">✅ Pay only for performance</li>
                                <li className="flex items-center gap-2">✅ 5% platform fee on payouts</li>
                                <li className="flex items-center gap-2">✅ Verified metrics via Oracle</li>
                                <li className="flex items-center gap-2">✅ Automated settlements</li>
                                <li className="flex items-center gap-2">✅ Priority support</li>
                            </ul>
                            <Link href="/?role=brand" className="w-full py-3 bg-black text-white font-patrick text-center text-xl border-2 border-black hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                                Launch Campaign
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                            <h2 className="text-3xl font-patrick font-bold mb-2">Enterprise</h2>
                            <div className="text-4xl font-bold mb-6">Custom</div>
                            <ul className="space-y-4 font-inter text-gray-700 flex-grow mb-8">
                                <li className="flex items-center gap-2">✅ Custom fee structure</li>
                                <li className="flex items-center gap-2">✅ Dedicated account manager</li>
                                <li className="flex items-center gap-2">✅ API access</li>
                                <li className="flex items-center gap-2">✅ White-label solutions</li>
                            </ul>
                            <button className="w-full py-3 bg-white text-black font-patrick text-center text-xl border-2 border-black hover:bg-gray-50 transition-all">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
