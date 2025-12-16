import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function DocsPage() {
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

                <div className="flex-grow max-w-5xl mx-auto px-6 py-16">
                    <h1 className="text-5xl font-patrick font-bold mb-4 text-center">Documentation</h1>
                    <p className="text-xl font-inter text-center text-gray-600 mb-12">Everything you need to know about SolTier</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {/* Quick Start */}
                        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-2xl font-patrick font-bold mb-4">🚀 Quick Start</h2>
                            <div className="space-y-3 font-inter text-gray-700">
                                <p>1. Connect your Solana wallet (Phantom, Solflare, etc.)</p>
                                <p>2. Select your role: Creator or Brand</p>
                                <p>3. Follow the onboarding flow</p>
                            </div>
                        </div>

                        {/* Wallet Setup */}
                        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-2xl font-patrick font-bold mb-4">💳 Wallet Setup</h2>
                            <div className="space-y-3 font-inter text-gray-700">
                                <p>SolTier uses Solana for instant, low-cost payments.</p>
                                <p><strong>Recommended wallets:</strong></p>
                                <ul className="list-disc list-inside ml-2">
                                    <li>Phantom Wallet</li>
                                    <li>Solflare</li>
                                    <li>Backpack</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* For Creators */}
                    <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                        <h2 className="text-3xl font-patrick font-bold mb-6 border-b-2 border-black pb-2">For Creators</h2>

                        <div className="space-y-6 font-inter">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Connecting X (Twitter)</h3>
                                <p className="text-gray-700">Link your X account via OAuth to verify your reach. We use official Twitter API to track real metrics - no fake followers can game the system.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Applying to Campaigns</h3>
                                <p className="text-gray-700">Browse active campaigns from brands. Each campaign shows the CPM rate, budget, and requirements. Click "Apply" to submit your interest.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Getting Paid</h3>
                                <p className="text-gray-700">Once approved, create and post content. Our oracle automatically tracks views and likes. Payments are calculated using:</p>
                                <div className="bg-gray-100 p-4 border-2 border-dashed border-gray-300 my-3 font-mono text-sm">
                                    Payout = (Views + Likes × Like Weight) / 1,000 × CPM
                                </div>
                                <p className="text-gray-700">Payments are settled instantly to your connected Solana wallet.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Withdrawing Earnings</h3>
                                <p className="text-gray-700">Your earnings accumulate in your SolTier account. Withdraw anytime to your connected wallet with near-zero transaction fees (&lt;$0.01).</p>
                            </div>
                        </div>
                    </section>

                    {/* For Brands */}
                    <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                        <h2 className="text-3xl font-patrick font-bold mb-6 border-b-2 border-black pb-2">For Brands</h2>

                        <div className="space-y-6 font-inter">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Creating a Campaign</h3>
                                <p className="text-gray-700">Set your campaign parameters:</p>
                                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 space-y-1">
                                    <li><strong>Title & Description:</strong> What you're promoting</li>
                                    <li><strong>CPM Rate:</strong> How much you pay per 1,000 effective views (in SOL)</li>
                                    <li><strong>Like Weight:</strong> Multiplier for engagement (e.g., 20x means 1 like = 20 views)</li>
                                    <li><strong>Budget:</strong> Maximum spend for the campaign</li>
                                    <li><strong>Duration:</strong> Campaign length in days</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Funding Your Wallet</h3>
                                <p className="text-gray-700">Each brand gets a dedicated deposit wallet. Send SOL to this address to fund your campaigns. The balance is shown in real-time on your dashboard.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Managing Applications</h3>
                                <p className="text-gray-700">Review creator applications, see their verified reach metrics, and approve or reject based on fit. Only approved creators can earn from your campaign.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Tracking ROI</h3>
                                <p className="text-gray-700">Monitor live metrics: views, likes, effective views, and total spent. All data is verified through our oracle system - no fake metrics.</p>
                            </div>
                        </div>
                    </section>

                    {/* Technical Details */}
                    <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                        <h2 className="text-3xl font-patrick font-bold mb-6 border-b-2 border-black pb-2">Technical Details</h2>

                        <div className="space-y-6 font-inter">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Smart Contract Escrow</h3>
                                <p className="text-gray-700">Campaign funds are held in a Solana smart contract. Neither the brand nor SolTier can withdraw funds - only the automated payout system based on verified metrics.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Oracle System</h3>
                                <p className="text-gray-700">We use Twitter API v2 with OAuth 2.0 to fetch real engagement data. Metrics are verified and recorded on-chain for full transparency.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Network</h3>
                                <p className="text-gray-700">SolTier operates on <strong>Solana Devnet</strong> for testing. Mainnet launch coming soon.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Fees</h3>
                                <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                                    <li><strong>Creators:</strong> Keep 95% of earnings (5% platform fee)</li>
                                    <li><strong>Brands:</strong> 5% fee on payouts</li>
                                    <li><strong>Gas fees:</strong> ~$0.001 per transaction (Solana)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-3xl font-patrick font-bold mb-6 border-b-2 border-black pb-2">FAQ</h2>

                        <div className="space-y-6 font-inter">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Is my money safe?</h3>
                                <p className="text-gray-700">Yes. Funds are held in audited smart contracts with automated release based on verified performance. No human can manually withdraw campaign funds.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">How fast are payments?</h3>
                                <p className="text-gray-700">Settlements happen in ~0.4 seconds on Solana. Creators can withdraw earnings instantly.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">What if a creator has fake followers?</h3>
                                <p className="text-gray-700">We verify through official Twitter API, not self-reported metrics. You only pay for real, verified engagement.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">Can I cancel a campaign?</h3>
                                <p className="text-gray-700">Unused funds from completed or cancelled campaigns are returned to your brand wallet.</p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-12 text-center">
                        <p className="font-inter text-gray-600 mb-4">Still have questions?</p>
                        <Link href="https://x.com/SolTierD" target="_blank" className="inline-block px-6 py-3 bg-black text-white font-patrick text-xl border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            Contact Us on X
                        </Link>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
