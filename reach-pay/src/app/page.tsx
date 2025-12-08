"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Formula from "@/components/Formula";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { CampaignDashboard } from "@/components/CampaignDashboard";
import { RoleSelectionModal } from "@/components/RoleSelectionModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import {
  registerUser,
  getUser,
  getXStatus,
  connectX as connectXAPI,
  getBrandCampaigns,
  getActiveCampaigns,
  getTopCreators,
  getBalance,
  applyToCampaign,
  type Campaign,
  type Creator as CreatorType,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [showDemo, setShowDemo] = useState(false);
  const [userRole, setUserRole] = useState<"creator" | "brand" | null>(null);
  const [isXConnected, setIsXConnected] = useState(false);
  const [xUsername, setXUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<CreatorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandWalletAddress, setBrandWalletAddress] = useState<string | null>(null);

  // Register user and fetch data when wallet connects
  useEffect(() => {
    if (connected && publicKey && userRole) {
      initializeUser();
    }
  }, [connected, publicKey, userRole]);

  // Fetch campaigns when role changes
  useEffect(() => {
    if (userRole && publicKey) {
      fetchDashboardData();
    }
  }, [userRole, publicKey]);

  const initializeUser = async () => {
    if (!publicKey || !userRole) return;

    try {
      await registerUser(publicKey.toString(), userRole);
      const user = await getUser(publicKey.toString());

      if (user.role === "creator") {
        const xStatus = await getXStatus(publicKey.toString());
        setIsXConnected(xStatus.data.connected);
        setXUsername(xStatus.data.username || "");
      } else if (user.role === "brand") {
        // Get brand wallet info
        setBrandWalletAddress(user.brandWalletAddress || null);
        setBalance(user.brandBalance || 0);
      }
    } catch (error) {
      console.error("Failed to initialize user:", error);
    }
  };

  const fetchDashboardData = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      if (userRole === "brand") {
        const brandCampaigns = await getBrandCampaigns(publicKey.toString());
        setCampaigns(brandCampaigns);

        const topCreators = await getTopCreators(10);
        setCreators(topCreators);

        const bal = await getBalance(publicKey.toString());
        setBalance(bal);
      } else if (userRole === "creator") {
        const activeCampaigns = await getActiveCampaigns();
        setCampaigns(activeCampaigns);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleXConnect = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    const username = prompt("Enter your X (Twitter) username:");
    if (!username) return;

    try {
      // Ensure user is registered first
      if (!userRole) {
        toast.error("Please select your role first");
        return;
      }

      // Register user if not already registered
      try {
        await registerUser(publicKey.toString(), userRole);
      } catch (error) {
        // User might already be registered, continue
        console.log("User already registered or registration error:", error);
      }

      // Now connect X account
      const response = await connectXAPI(publicKey.toString(), username);

      if (response.success) {
        setIsXConnected(true);
        setXUsername(username);
        toast.success(`Connected to @${username}! 🎉`);

        // Fetch campaigns after connecting
        fetchDashboardData();
      } else {
        toast.error(response.error || "Failed to connect X account");
      }
    } catch (error: any) {
      console.error("Failed to connect X:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to connect X account";
      toast.error(errorMessage);
    }
  };

  const handleApplyToCampaign = async (campaignId: string) => {
    if (!publicKey) return;

    try {
      await applyToCampaign(campaignId, publicKey.toString());
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      console.error("Failed to apply:", error);
      toast.error(error.response?.data?.error || "Failed to apply to campaign");
    }
  };

  const handleRoleSelect = async (role: "creator" | "brand") => {
    setUserRole(role);
    if (publicKey) {
      try {
        await registerUser(publicKey.toString(), role);
        toast.success(`Registered as ${role}`);
      } catch (error) {
        console.error("Failed to register:", error);
      }
    }
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

      <div className="relative z-10">
        <Navbar userRole={userRole} />

        {!connected && !showDemo ? (
          <>
            <Hero />
            <Formula />
            <HowItWorks />
          </>
        ) : (
          <>
            <RoleSelectionModal
              isOpen={connected && !userRole && !showDemo}
              onSelect={handleRoleSelect}
            />

            {(userRole || showDemo) && (
              <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
                <div id="dashboard" className="flex justify-between items-center">
                  <h1 className="text-4xl font-patrick font-bold">
                    {userRole === "brand" ? "Brand Dashboard" : "Creator Dashboard"}
                  </h1>
                  <button
                    onClick={() => {
                      setShowDemo(!showDemo);
                      if (!showDemo) setUserRole("brand");
                    }}
                    className="text-sm underline font-inter text-gray-500"
                  >
                    {showDemo ? "Back to Home" : "View Demo Dashboard"}
                  </button>
                </div>

                {userRole === "brand" ? (
                  <>
                    <div id="campaigns" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div>
                        {/* Brand Wallet Section */}
                        <div className="bg-white border-2 border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <h3 className="text-xl font-patrick font-bold mb-4">Campaign Wallet</h3>

                          {brandWalletAddress ? (
                            <>
                              <div className="mb-4">
                                <label className="text-sm text-gray-600 font-inter block mb-2">Your Deposit Address:</label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 p-3 bg-gray-100 border-2 border-dashed border-gray-300 text-sm font-mono break-all">
                                    {brandWalletAddress}
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(brandWalletAddress);
                                      toast.success("Address copied!");
                                    }}
                                    className="px-4 py-3 bg-blue-500 text-white font-patrick border-2 border-black hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mb-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 font-inter">SOL Balance:</p>
                                    <p className="text-2xl font-bold font-patrick">{balance.toFixed(4)} SOL</p>
                                  </div>
                                  <button
                                    onClick={() => fetchDashboardData()}
                                    className="px-4 py-2 bg-white border-2 border-black font-patrick text-sm hover:bg-gray-50"
                                  >
                                    Refresh
                                  </button>
                                </div>
                              </div>

                              <div className="text-sm text-gray-600 font-inter space-y-2">
                                <p className="font-bold">💡 How to add funds:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                  <li>Copy the deposit address above</li>
                                  <li>Send SOL from any Solana wallet (Phantom, Solflare, etc.)</li>
                                  <li>Wait for confirmation (usually 1-2 seconds)</li>
                                  <li>Click "Refresh" to see your updated balance</li>
                                </ol>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500 font-inter">Loading wallet...</p>
                            </div>
                          )}
                        </div>

                        <h2 className="text-2xl font-patrick font-bold mb-6">Launch New Campaign</h2>
                        <CreateCampaignForm onSuccess={fetchDashboardData} />
                      </div>

                      <div className="space-y-8">
                        <h2 className="text-2xl font-patrick font-bold mb-6">Active Campaigns</h2>
                        {campaigns.length > 0 ? (
                          campaigns.map(campaign => (
                            <CampaignDashboard key={campaign.campaignId} campaignId={campaign.campaignId} />
                          ))
                        ) : (
                          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <p className="font-patrick text-gray-500">No active campaigns yet. Create one to get started!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div id="creators" className="space-y-8">
                      <h2 className="text-3xl font-patrick font-bold text-center">Top Creators</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {creators.length > 0 ? creators.map((creator, i) => (
                          <div key={i} className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black mb-4 flex items-center justify-center text-white font-bold text-2xl">
                              {creator.xUsername.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-patrick font-bold">@{creator.xUsername}</h3>
                            <p className="text-sm text-gray-600 mb-2">{creator.reach.toLocaleString()}+ Reach</p>
                            <p className="text-sm text-gray-600 mb-4">{creator.engagement} Engagement</p>
                            <button className="px-4 py-2 bg-black text-white font-patrick text-sm hover:bg-gray-800 w-full">
                              Invite to Campaign
                            </button>
                          </div>
                        )) : (
                          <div className="col-span-3 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <p className="font-patrick text-gray-500">No creators available yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div id="brands" className="space-y-8">
                    {!isXConnected ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-3xl font-patrick font-bold mb-6">Connect X to Start Earning</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto text-center font-inter">
                          You need to connect your X (Twitter) account to verify your reach and track your promotions.
                        </p>
                        <button
                          onClick={handleXConnect}
                          className="px-8 py-4 bg-black text-white font-patrick text-xl border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          Connect X Account
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-patrick font-bold">Available Campaigns</h2>
                          <div className="px-4 py-2 bg-blue-100 border-2 border-black rounded-full font-bold text-sm">
                            @{xUsername}
                          </div>
                        </div>
                        <p className="font-inter text-gray-600 mb-6">
                          Browse campaigns from brands and start earning for your reach.
                        </p>
                        {/* Real campaigns from backend */}
                        <div className="mt-6 grid gap-4">
                          {campaigns.length > 0 ? campaigns.map((campaign) => (
                            <div key={campaign.campaignId} className="p-4 border-2 border-black bg-white flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <div>
                                <div className="font-bold font-patrick">{campaign.title}</div>
                                <div className="text-sm text-gray-600">{campaign.description}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  ${campaign.cpm} CPM • Budget: ${campaign.maxBudget.toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => handleApplyToCampaign(campaign.campaignId)}
                                className="px-4 py-2 bg-black text-white font-patrick text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                              >
                                Apply
                              </button>
                            </div>
                          )) : (
                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                              <p className="font-patrick text-gray-500">No active campaigns available yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <HowItWorks />

                <section id="about" className="container py-12 text-center">
                  <h2 className="text-4xl font-patrick font-bold mb-6">About Us</h2>
                  <p className="max-w-2xl mx-auto text-lg text-gray-600 font-inter">
                    SolTier is revolutionizing influencer marketing by bringing transparency and fairness to the ecosystem.
                    Built on Solana, we ensure instant payouts and verified performance metrics.
                  </p>
                </section>
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}
