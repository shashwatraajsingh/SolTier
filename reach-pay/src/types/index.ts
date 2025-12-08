export interface Campaign {
    campaignId: string;
    brand: string;
    title: string;
    description: string;
    cpm: number;
    likeWeight: number;
    maxBudget: number;
    escrowBalance: number;
    views: number;
    likes: number;
    effectiveViews: number;
    totalPaid: number;
    remainingPayout: number;
    isActive: boolean;
    startTime: string;
    endTime: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCampaignParams {
    walletAddress: string;
    cpm: number;
    likeWeight: number;
    maxBudget: number;
    durationDays: number;
    title?: string;
    description?: string;
}

export interface MetricsUpdate {
    campaignId: string;
    views: number;
    likes: number;
}

export interface User {
    walletAddress: string;
    role: "creator" | "brand";
    xConnected?: boolean;
    xUsername?: string;
    balance?: number;
    brandWalletAddress?: string;
    brandBalance?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Creator {
    walletAddress: string;
    xUsername: string;
    reach: number;
    engagement: string;
    completedCampaigns: number;
}

export interface Application {
    applicationId: string;
    campaignId: string;
    creatorAddress: string;
    proposedContent: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    updatedAt?: string;
}

export interface XConnection {
    walletAddress: string;
    xUsername: string;
    xUserId: string;
    connectedAt: string;
}
