import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function BrandsPage() {
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
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                        <div className="flex-1">
                            <h1 className="text-5xl font-patrick font-bold mb-6">Scale Your Reach with Verified Creators</h1>
                            <p className="text-xl font-inter text-gray-600 mb-8">
                                Launch campaigns in minutes. Pay only for real engagement.
                                Our oracle technology ensures every view and like is verified on-chain.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/?role=brand" className="px-8 py-4 bg-black text-white font-patrick text-xl border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                                    Start Campaign
                                </Link>
                                <Link href="/pricing" className="px-8 py-4 bg-white text-black font-patrick text-xl border-2 border-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-2">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-patrick font-bold">Campaign Results</h3>
                                    <span className="px-3 py-1 bg-green-100 border border-black rounded-full text-sm font-bold">Live</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200">
                                        <span className="font-inter text-gray-600">Total Views</span>
                                        <span className="font-bold text-xl">1.2M</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200">
                                        <span className="font-inter text-gray-600">Engagement</span>
                                        <span className="font-bold text-xl">4.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200">
                                        <span className="font-inter text-gray-600">Cost per View</span>
                                        <span className="font-bold text-xl">$0.01</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-2xl font-patrick font-bold mb-2">Targeted Reach</h3>
                            <p className="font-inter text-gray-600">Filter creators by niche, engagement rate, and audience demographics to find your perfect match.</p>
                        </div>
                        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-2xl font-patrick font-bold mb-2">Instant Settlement</h3>
                            <p className="font-inter text-gray-600">Smart contracts handle payouts automatically. No invoices, no delays, no manual tracking.</p>
                        </div>
                        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-2xl font-patrick font-bold mb-2">Fraud Protection</h3>
                            <p className="font-inter text-gray-600">Our oracle verifies every metric directly from X API. You never pay for bot traffic.</p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
