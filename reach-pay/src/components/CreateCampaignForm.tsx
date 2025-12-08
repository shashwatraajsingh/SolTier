"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { createCampaign } from "@/lib/api";

interface CreateCampaignFormProps {
    onSuccess?: () => void;
}

export const CreateCampaignForm = ({ onSuccess }: CreateCampaignFormProps) => {
    const { publicKey } = useWallet();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        cpm: 10,
        likeWeight: 20,
        maxBudget: 100,
        durationDays: 30,
        title: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) {
            toast.error("Please connect your wallet");
            return;
        }

        if (!formData.title.trim()) {
            toast.error("Please enter a campaign title");
            return;
        }

        setLoading(true);
        try {
            await createCampaign({
                walletAddress: publicKey.toString(),
                cpm: formData.cpm,
                likeWeight: formData.likeWeight,
                maxBudget: formData.maxBudget,
                durationDays: formData.durationDays,
                title: formData.title,
                description: formData.description,
            });

            toast.success("Campaign created successfully!");

            // Reset form
            setFormData({
                cpm: 10,
                likeWeight: 20,
                maxBudget: 100,
                durationDays: 30,
                title: "",
                description: "",
            });

            // Call onSuccess callback
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || error.message || "Failed to create campaign";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-8 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
            {/* Sketchy corner decorations */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-black" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-black" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-black" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-black" />

            <h2 className="text-3xl font-patrick font-bold mb-6">Create Campaign</h2>

            <div className="space-y-2">
                <label className="font-patrick text-lg">Campaign Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter campaign name"
                    className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="font-patrick text-lg">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign"
                    className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="font-patrick text-lg">CPM (USDC)</label>
                    <input
                        type="number"
                        value={formData.cpm}
                        onChange={(e) => setFormData({ ...formData, cpm: Number(e.target.value) })}
                        className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400 border-dashed"
                        min="1"
                        step="0.1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-patrick text-lg">Like Weight</label>
                    <input
                        type="number"
                        value={formData.likeWeight}
                        onChange={(e) => setFormData({ ...formData, likeWeight: Number(e.target.value) })}
                        className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400 border-dashed"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-patrick text-lg">Budget (USDC)</label>
                    <input
                        type="number"
                        value={formData.maxBudget}
                        onChange={(e) => setFormData({ ...formData, maxBudget: Number(e.target.value) })}
                        className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400 border-dashed"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-patrick text-lg">Duration (Days)</label>
                    <input
                        type="number"
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                        className="w-full p-3 border-2 border-black font-inter focus:outline-none focus:ring-2 focus:ring-blue-400 border-dashed"
                        min="1"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2a2a2a] text-white font-patrick text-xl border-2 border-black hover:bg-[#3a3a3a] transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                {loading ? "Creating..." : "Launch Campaign 🚀"}
            </button>
        </form>
    );
};
