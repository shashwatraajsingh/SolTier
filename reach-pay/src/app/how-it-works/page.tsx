import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
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
                    <h1 className="text-5xl font-patrick font-bold mb-8 text-center">How SolTier Works</h1>

                    <div className="space-y-12">
                        <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-3xl font-patrick font-bold mb-4">For Creators</h2>
                            <div className="space-y-4 font-inter text-lg text-gray-700">
                                <p>1. <span className="font-bold">Connect Wallet & X:</span> Sign up with your Solana wallet and link your Twitter account to verify your reach.</p>
                                <p>2. <span className="font-bold">Browse Campaigns:</span> Find campaigns from brands that match your niche and audience.</p>
                                <p>3. <span className="font-bold">Create & Post:</span> Create content according to the campaign brief and post it on X.</p>
                                <p>4. <span className="font-bold">Get Paid Instantly:</span> Our oracle tracks your views and engagement. You get paid automatically in USDC based on your performance.</p>
                            </div>
                        </section>

                        <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-3xl font-patrick font-bold mb-4">For Brands</h2>
                            <div className="space-y-4 font-inter text-lg text-gray-700">
                                <p>1. <span className="font-bold">Fund Your Campaign:</span> Deposit USDC into the smart contract escrow.</p>
                                <p>2. <span className="font-bold">Set Your Metrics:</span> Define your CPM (Cost Per Mille) and budget.</p>
                                <p>3. <span className="font-bold">Approve Creators:</span> Review applications from creators or invite top performers.</p>
                                <p>4. <span className="font-bold">Pay for Performance:</span> You only pay for verified views and engagement. Unused funds are returned to you.</p>
                            </div>
                        </section>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
