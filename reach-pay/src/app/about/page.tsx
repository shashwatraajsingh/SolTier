import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
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
                    <h1 className="text-5xl font-patrick font-bold mb-8 text-center">About SolTier</h1>

                    <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
                        <p className="text-xl font-inter text-gray-700 leading-relaxed mb-6">
                            SolTier is the first decentralized influencer marketing platform built on Solana. We're on a mission to make creator marketing transparent, fair, and efficient.
                        </p>
                        <p className="text-xl font-inter text-gray-700 leading-relaxed">
                            By leveraging blockchain technology and oracles, we eliminate the middlemen, reduce fees, and ensure that creators get paid instantly for the value they generate.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#ffeb3b] p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-patrick font-bold mb-4">Our Vision</h3>
                            <p className="font-inter text-gray-800">
                                A world where any creator, regardless of size, can monetize their influence directly and fairly, without relying on centralized platforms that take huge cuts.
                            </p>
                        </div>
                        <div className="bg-blue-100 p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-patrick font-bold mb-4">Why Solana?</h3>
                            <p className="font-inter text-gray-800">
                                Solana's high speed and low transaction costs make it the perfect foundation for micro-payments and real-time settlements required for a global creator economy.
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
