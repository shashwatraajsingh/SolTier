"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { getTopCreators, Creator } from "@/lib/api";
import Link from "next/link";
import { PageLoader } from "@/components/LoadingSpinner";

export default function CreatorsPage() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const data = await getTopCreators(20);
                setCreators(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch creators:", err);
                setError("Failed to load creators. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCreators();
    }, []);

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
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-patrick font-bold mb-4">Top Creators</h1>
                        <p className="text-lg md:text-xl font-inter text-gray-600 max-w-2xl mx-auto">
                            Discover the most influential voices on SolTier. Join them and start earning for your reach.
                        </p>
                    </div>

                    {loading ? (
                        <PageLoader text="Loading creators..." />
                    ) : error ? (
                        <div className="text-center py-12 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
                            <p className="font-patrick text-xl text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    setError(null);
                                    getTopCreators(20).then(data => {
                                        setCreators(data);
                                    }).catch(err => {
                                        setError("Failed to load creators. Please try again.");
                                    }).finally(() => setLoading(false));
                                }}
                                className="px-6 py-2 bg-black text-white font-patrick border-2 border-black hover:bg-gray-800"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {creators.length > 0 ? (
                                creators.map((creator, i) => (
                                    <div key={i} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black mb-4 flex items-center justify-center text-white font-bold text-3xl">
                                                {creator.xUsername.charAt(0).toUpperCase()}
                                            </div>
                                            <h3 className="text-xl font-patrick font-bold mb-1">@{creator.xUsername}</h3>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="px-2 py-1 bg-green-100 border border-black text-xs font-bold rounded-full">
                                                    {creator.reach.toLocaleString()} Reach
                                                </span>
                                            </div>
                                            <div className="w-full grid grid-cols-2 gap-2 text-sm font-inter text-gray-600 mb-4">
                                                <div className="text-center p-2 bg-gray-50 border border-gray-200 rounded">
                                                    <div className="font-bold text-black">{creator.engagement}</div>
                                                    <div>Eng. Rate</div>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 border border-gray-200 rounded">
                                                    <div className="font-bold text-black">{creator.completedCampaigns}</div>
                                                    <div>Campaigns</div>
                                                </div>
                                            </div>
                                            <button className="w-full py-2 bg-black text-white font-patrick text-sm border-2 border-black hover:bg-gray-800 transition-all">
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="font-patrick text-xl text-gray-500">No creators found yet. Be the first!</p>
                                    <Link href="/?role=creator" className="inline-block mt-4 px-6 py-2 bg-black text-white font-patrick border-2 border-black hover:bg-gray-800">
                                        Join as Creator
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </main>
    );
}
