import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
                    <h1 className="text-5xl font-patrick font-bold mb-4 text-center">Terms & Conditions</h1>
                    <p className="text-center font-inter text-gray-600 mb-12">Last updated: December 2025</p>

                    <div className="bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="prose prose-lg max-w-none font-inter">

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-700 mb-3">
                                    By accessing or using SolTier ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform.
                                </p>
                                <p className="text-gray-700">
                                    SolTier is a decentralized influencer marketing platform built on the Solana blockchain that connects brands with content creators for performance-based marketing campaigns.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">2. Eligibility</h2>
                                <p className="text-gray-700 mb-3">To use SolTier, you must:</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Be at least 18 years of age</li>
                                    <li>Have the legal capacity to enter into binding agreements</li>
                                    <li>Not be prohibited from using blockchain-based services in your jurisdiction</li>
                                    <li>Own and control a valid Solana wallet</li>
                                    <li>Provide accurate information during registration</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">3. User Accounts</h2>
                                <p className="text-gray-700 mb-3">
                                    <strong>3.1 Wallet-Based Authentication:</strong> Your Solana wallet address serves as your unique identifier. You are responsible for maintaining the security of your wallet and private keys.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>3.2 Account Types:</strong> Users may register as either a Creator or a Brand. Each role has different capabilities and responsibilities on the Platform.
                                </p>
                                <p className="text-gray-700">
                                    <strong>3.3 X (Twitter) Integration:</strong> Creators must connect their X account via OAuth for verification. We only access public profile and tweet metrics as authorized.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">4. Creator Terms</h2>
                                <p className="text-gray-700 mb-3">As a Creator, you agree to:</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Create original, authentic content that complies with campaign requirements</li>
                                    <li>Not engage in artificial inflation of metrics (fake views, likes, or followers)</li>
                                    <li>Disclose sponsored content as required by applicable laws and platform guidelines</li>
                                    <li>Not violate X (Twitter) Terms of Service or community guidelines</li>
                                    <li>Accept that earnings are based on verified, real engagement only</li>
                                </ul>
                                <p className="text-gray-700 mt-3">
                                    <strong>Payment:</strong> Creators retain 95% of earnings. A 5% platform fee is deducted automatically.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">5. Brand Terms</h2>
                                <p className="text-gray-700 mb-3">As a Brand, you agree to:</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Fund campaigns with sufficient SOL before launch</li>
                                    <li>Set fair and reasonable campaign parameters</li>
                                    <li>Not request content that violates laws or platform guidelines</li>
                                    <li>Accept automated payment execution based on verified metrics</li>
                                    <li>Understand that funds in escrow cannot be withdrawn prematurely</li>
                                </ul>
                                <p className="text-gray-700 mt-3">
                                    <strong>Fees:</strong> A 5% platform fee applies to all campaign payouts.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">6. Smart Contracts & Payments</h2>
                                <p className="text-gray-700 mb-3">
                                    <strong>6.1 Escrow:</strong> Campaign funds are held in Solana smart contracts. Neither SolTier nor any individual can manually access or withdraw these funds outside of the automated system.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>6.2 Automated Payments:</strong> Payouts are executed automatically based on verified Twitter metrics. This process is trustless and transparent.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>6.3 Blockchain Transactions:</strong> All transactions are final and irreversible. You are responsible for ensuring correct wallet addresses.
                                </p>
                                <p className="text-gray-700">
                                    <strong>6.4 Gas Fees:</strong> Users are responsible for Solana network transaction fees (typically &lt;$0.01).
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">7. Prohibited Activities</h2>
                                <p className="text-gray-700 mb-3">Users may not:</p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                    <li>Manipulate or fake engagement metrics</li>
                                    <li>Use bots, scripts, or automated tools to inflate performance</li>
                                    <li>Create multiple accounts to circumvent rules</li>
                                    <li>Engage in fraud, money laundering, or illegal activities</li>
                                    <li>Attempt to exploit or attack smart contracts</li>
                                    <li>Harass other users or SolTier team members</li>
                                    <li>Violate intellectual property rights</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">8. Disclaimers</h2>
                                <p className="text-gray-700 mb-3">
                                    <strong>8.1 No Warranty:</strong> SolTier is provided "as is" without warranties of any kind, express or implied.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    <strong>8.2 Blockchain Risks:</strong> You acknowledge the inherent risks of blockchain technology, including but not limited to smart contract bugs, network congestion, and price volatility.
                                </p>
                                <p className="text-gray-700">
                                    <strong>8.3 Third-Party Services:</strong> SolTier integrates with Twitter/X API and Solana blockchain. We are not responsible for issues arising from these third-party services.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">9. Limitation of Liability</h2>
                                <p className="text-gray-700">
                                    To the maximum extent permitted by law, SolTier and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or cryptocurrency, arising from your use of the Platform.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">10. Intellectual Property</h2>
                                <p className="text-gray-700 mb-3">
                                    <strong>10.1 Platform IP:</strong> SolTier branding, design, and code are owned by SolTier. Users may not copy, modify, or distribute without permission.
                                </p>
                                <p className="text-gray-700">
                                    <strong>10.2 User Content:</strong> Creators retain ownership of their content. By using SolTier, you grant us a license to display campaign-related content on the Platform.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">11. Termination</h2>
                                <p className="text-gray-700">
                                    We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, any pending earnings will be processed according to standard withdrawal procedures.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">12. Changes to Terms</h2>
                                <p className="text-gray-700">
                                    We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new Terms.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-patrick font-bold mb-4">13. Governing Law</h2>
                                <p className="text-gray-700">
                                    These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through good-faith negotiation or binding arbitration.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-patrick font-bold mb-4">14. Contact</h2>
                                <p className="text-gray-700">
                                    For questions about these Terms, contact us at{" "}
                                    <a href="https://x.com/SolTierD" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        @SolTierD on X
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
