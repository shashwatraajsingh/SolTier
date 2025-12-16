import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="container py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6">
            <div className="flex flex-col gap-6 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4">
                    Get paid for your reach. <span className="highlight">Automatically.</span>
                </h1>
                <h2 className="text-xl md:text-2xl font-normal mb-4">
                    Performance-based payouts for X promotions.<br />
                    Views + likes. On-chain. No guesswork.
                </h2>
                <div className="text-base md:text-lg mb-6 space-y-2">
                    <p>Flat fees are broken. Posts flop? Brands lose.</p>
                    <p>Posts overperform? Creators lose.</p>
                    <p>SolTier fixes that — you get <span className="marker-underline">paid per 1,000 views</span>, with <span className="marker-underline">engagement bonuses</span>.</p>
                    <p className="text-sm mt-2 text-gray-600">Settled on Solana</p>
                </div>
                <div className="flex gap-4 items-center justify-center lg:justify-start">
                    <button className="sketch-button secondary flex items-center gap-2">
                        See how it works <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Card 1: Live Campaign Metrics */}
                <div className="sketch-border p-6 bg-white transform lg:rotate-1 hover:rotate-0 transition-transform">
                    <h3 className="text-xl mb-4 border-b-2 border-black pb-2 inline-block">Campaign performance</h3>
                    <div className="space-y-4 font-sans">
                        <div className="flex justify-between">
                            <span>Views</span>
                            <span className="font-bold">842,000</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Likes</span>
                            <span className="font-bold">18,400</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Effective Views</span>
                            <span>1,210,000</span>
                        </div>
                        <div className="w-full bg-gray-200 h-4 rounded-full border border-black overflow-hidden relative">
                            <div className="bg-blue-600 h-full w-3/4 absolute top-0 left-0" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">Payout updates automatically</p>
                    </div>
                </div>

                {/* Card 2: Payout Preview */}
                <div className="sketch-border p-6 bg-white transform lg:-rotate-2 hover:rotate-0 transition-transform w-full lg:w-3/4 self-center lg:self-end">
                    <h3 className="text-lg mb-2">Estimated payout</h3>
                    <div className="text-4xl font-bold font-sans mb-1">$1,210</div>
                    <p className="text-sm text-gray-500">Based on weighted CPM formula</p>
                </div>
            </div>
        </section>
    );
}
