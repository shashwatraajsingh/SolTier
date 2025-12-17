"use client";

import { useEffect, useState } from "react";
import { getCampaignStatus } from "@/lib/api";
import { Campaign } from "@/types";
import { Loader2, TrendingUp, Eye, Heart, DollarSign, RefreshCw } from "lucide-react";

export const CampaignDashboard = ({ campaignId }: { campaignId: string }) => {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const data = await getCampaignStatus(campaignId);
            setCampaign(data);
            setError("");
        } catch (err) {
            setError("Failed to load campaign data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Reduce polling to every 60 seconds to minimize API calls
        const interval = setInterval(() => fetchStatus(), 60000);
        return () => clearInterval(interval);
    }, [campaignId]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
    if (error) return <div className="text-red-500 font-patrick text-xl text-center p-8">{error}</div>;
    if (!campaign) return null;

    return (
        <div className="border-2 border-black p-8 bg-white relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 border-2 border-black font-patrick font-bold flex items-center gap-2">
                LIVE METRICS
                <button
                    onClick={() => fetchStatus(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <h3 className="font-patrick font-bold text-lg mb-4">{campaign.title}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    icon={<Eye className="w-6 h-6" />}
                    label="Views"
                    value={campaign.views.toLocaleString()}
                />
                <MetricCard
                    icon={<Heart className="w-6 h-6" />}
                    label="Likes"
                    value={campaign.likes.toLocaleString()}
                />
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Effective"
                    value={campaign.effectiveViews.toLocaleString()}
                />
                <MetricCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Paid"
                    value={`${campaign.totalPaid.toFixed(4)} SOL`}
                />
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-6">
                <h3 className="font-patrick text-xl mb-4">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm font-inter text-gray-600">
                    <div>Status: <span className={campaign.isActive ? "text-green-600 font-bold" : "text-red-600"}>{campaign.isActive ? "ACTIVE" : "ENDED"}</span></div>
                    <div>Budget: {campaign.maxBudget.toFixed(4)} SOL</div>
                    <div>CPM: {campaign.cpm.toFixed(6)} SOL</div>
                    <div>Ends: {new Date(parseInt(campaign.endTime) * 1000).toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="text-center space-y-2">
        <div className="flex justify-center text-blue-600">{icon}</div>
        <div className="font-patrick text-gray-500">{label}</div>
        <div className="font-inter font-bold text-2xl">{value}</div>
    </div>
);

