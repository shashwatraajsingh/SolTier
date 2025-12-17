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
  applyToCampaign,
  type Campaign,
  type Creator as CreatorType,
} from "@/lib/api";
import toast from "react-hot-toast";

import { useUser } from "@/context/UserContext";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { userRole, setUserRole } = useUser();
  const [showDemo, setShowDemo] = useState(false);
  // const [userRole, setUserRole] = useState<"creator" | "brand" | null>(null); // Removed local state
  const [isXConnected, setIsXConnected] = useState(false);
  const [xUsername, setXUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<CreatorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandWalletAddress, setBrandWalletAddress] = useState<string | null>(null);

  // Initialize user and fetch dashboard data when wallet connects and role is set
  useEffect(() => {
    const initializeAndFetchData = async () => {
      if (!connected || !publicKey || !userRole) return;

      setLoading(true);
      try {
        // Register user first
        await registerUser(publicKey.toString(), userRole);
        const user = await getUser(publicKey.toString());

        // Set user-specific data
        if (user.role === "creator") {
          // Fetch X status and campaigns in parallel
          const [xStatus, activeCampaigns] = await Promise.all([
            getXStatus(publicKey.toString()),
            getActiveCampaigns(),
          ]);
          setIsXConnected(xStatus.data.connected);
          setXUsername(xStatus.data.username || "");
          setCampaigns(activeCampaigns);
        } else if (user.role === "brand") {
          // Set brand wallet info from user data
          setBrandWalletAddress(user.brandWalletAddress || null);
          setBalance(user.brandBalance || 0);

          // Fetch campaigns and creators in parallel
          const [brandCampaigns, topCreators] = await Promise.all([
            getBrandCampaigns(publicKey.toString()),
            getTopCreators(10),
          ]);
          setCampaigns(brandCampaigns);
          setCreators(topCreators);
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchData();
  }, [connected, publicKey, userRole]);

  const fetchDashboardData = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      if (userRole === "brand") {
        // Parallel fetching for better performance
        const [brandCampaigns, topCreators] = await Promise.all([
          getBrandCampaigns(publicKey.toString()),
          getTopCreators(10),
        ]);
        setCampaigns(brandCampaigns);
        setCreators(topCreators);

        // Also refresh brand balance from user endpoint
        const user = await getUser(publicKey.toString());
        setBalance(user.brandBalance || 0);
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

      // Request OAuth URL from backend
      const response = await connectXAPI(publicKey.toString());

      if (response.success) {
        if (response.mock) {
          // Mock mode - connection already made
          setIsXConnected(true);
          setXUsername(response.data.username);
          toast.success(`Connected to @${response.data.username}! 🎉 (Mock Mode)`);
          fetchDashboardData();
        } else if (response.data.authUrl) {
          // Real OAuth mode - open Twitter authorization in new window
          toast("Opening Twitter authorization...");
          const authWindow = window.open(
            response.data.authUrl,
            "Twitter Auth",
            "width=600,height=700"
          );

          // Listen for the OAuth callback
          const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "twitter-oauth-success") {
              setIsXConnected(true);
              setXUsername(event.data.username);
              toast.success(`Connected to @${event.data.username}! `);
              fetchDashboardData();
              window.removeEventListener("message", handleMessage);
            } else if (event.data.type === "twitter-oauth-error") {
              toast.error(event.data.error || "Failed to connect X account");
              window.removeEventListener("message", handleMessage);
            }
          };

          window.addEventListener("message", handleMessage);
        }
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
        <Navbar />

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
                  {/* <button
                    onClick={() => {
                      setShowDemo(!showDemo);
                      if (!showDemo) setUserRole("brand");
                    }}
                    className="text-sm underline font-inter text-gray-500"
                  >
                    {showDemo ? "Back to Home" : "View Demo Dashboard"}
                  </button> */}
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
