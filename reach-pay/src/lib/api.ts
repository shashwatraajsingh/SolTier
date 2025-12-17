import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 second timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        // Could add auth headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Only retry on network errors or 5xx, max 2 retries
        if (
            !config._retry &&
            config._retryCount === undefined &&
            (error.code === 'ECONNABORTED' ||
                error.code === 'ERR_NETWORK' ||
                (error.response?.status >= 500 && error.response?.status < 600))
        ) {
            config._retryCount = 0;
        }

        if (config._retryCount !== undefined && config._retryCount < 2) {
            config._retryCount += 1;
            config._retry = true;

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, config._retryCount * 1000));

            return api(config);
        }

        return Promise.reject(error);
    }
);

// Types
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
}

export interface User {
    walletAddress: string;
    role: "creator" | "brand";
    xConnected?: boolean;
    xUsername?: string;
    balance?: number;
    brandWalletAddress?: string;
    brandBalance?: number;
    creatorEarnings?: number;
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
    tweetId?: string;
    tweetUrl?: string;
    tweetSubmittedAt?: string;
}

// ============= USER API =============

export const registerUser = async (walletAddress: string, role: "creator" | "brand"): Promise<User> => {
    const response = await api.post<{ success: boolean; data: User }>("/api/user/register", {
        walletAddress,
        role,
    });
    return response.data.data;
};

export const getUser = async (walletAddress: string): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>(`/api/user/${walletAddress}`);
    return response.data.data;
};

// ============= X (TWITTER) API =============

export const connectX = async (walletAddress: string, username?: string) => {
    const response = await api.post("/api/x/connect", {
        walletAddress,
        username,
    });
    return response.data;
};

export const disconnectX = async (walletAddress: string) => {
    const response = await api.post("/api/x/disconnect", {
        walletAddress,
    });
    return response.data;
};

export const getXStatus = async (walletAddress: string) => {
    const response = await api.get(`/api/x/status/${walletAddress}`);
    return response.data;
};

export const getXMetrics = async (walletAddress: string) => {
    const response = await api.get(`/api/x/metrics/${walletAddress}`);
    return response.data;
};

export const getTweetMetrics = async (walletAddress: string, tweetId: string) => {
    const response = await api.get(`/api/x/tweet/${walletAddress}/${tweetId}`);
    return response.data;
};

// ============= CAMPAIGN API =============

export const createCampaign = async (data: {
    walletAddress: string;
    cpm: number;
    likeWeight: number;
    maxBudget: number;
    durationDays: number;
    title?: string;
    description?: string;
}): Promise<Campaign> => {
    const response = await api.post<{ success: boolean; data: Campaign }>("/api/campaign/create", data);
    return response.data.data;
};

export const getCampaignStatus = async (id: string): Promise<Campaign> => {
    const response = await api.get<{ success: boolean; data: Campaign }>(
        `/api/campaign/${id}/status`
    );
    return response.data.data;
};

export const getActiveCampaigns = async (): Promise<Campaign[]> => {
    const response = await api.get<{ success: boolean; data: Campaign[] }>("/api/campaigns/active");
    return response.data.data;
};

export const getBrandCampaigns = async (walletAddress: string): Promise<Campaign[]> => {
    const response = await api.get<{ success: boolean; data: Campaign[] }>(
        `/api/campaigns/brand/${walletAddress}`
    );
    return response.data.data;
};

export const applyToCampaign = async (campaignId: string, walletAddress: string, proposedContent?: string): Promise<Application> => {
    const response = await api.post<{ success: boolean; data: Application }>(
        `/api/campaign/${campaignId}/apply`,
        {
            walletAddress,
            proposedContent,
        }
    );
    return response.data.data;
};

export const getCampaignApplications = async (campaignId: string): Promise<Application[]> => {
    const response = await api.get<{ success: boolean; data: Application[] }>(
        `/api/campaign/${campaignId}/applications`
    );
    return response.data.data;
};

export const updateApplicationStatus = async (
    applicationId: string,
    walletAddress: string,
    status: "pending" | "approved" | "rejected"
) => {
    const response = await api.put(`/api/application/${applicationId}/status`, {
        status,
        walletAddress,
    });
    return response.data;
};

// Cancel a campaign (brand only)
export const cancelCampaign = async (campaignId: string, walletAddress: string) => {
    const response = await api.post(`/api/campaign/${campaignId}/cancel`, {
        walletAddress,
    });
    return response.data;
};

// Submit a tweet for campaign tracking (creator only)
export interface TweetSubmission {
    submissionId: string;
    campaignId: string;
    creatorAddress: string;
    tweetId: string;
    tweetUrl: string;
    submittedAt: string;
    status: string;
}

export const submitTweet = async (
    campaignId: string,
    walletAddress: string,
    tweetData: { tweetId?: string; tweetUrl?: string }
): Promise<TweetSubmission> => {
    const response = await api.post<{ success: boolean; data: TweetSubmission }>(
        `/api/campaign/${campaignId}/submit-tweet`,
        {
            walletAddress,
            ...tweetData,
        }
    );
    return response.data.data;
};

// Get all tweets for a campaign
export interface CampaignTweet {
    applicationId: string;
    creatorAddress: string;
    tweetId: string;
    tweetUrl: string;
    submittedAt: string;
}

export const getCampaignTweets = async (campaignId: string): Promise<CampaignTweet[]> => {
    const response = await api.get<{ success: boolean; data: CampaignTweet[] }>(
        `/api/campaign/${campaignId}/tweets`
    );
    return response.data.data;
};

// ============= CREATOR API =============

export const getTopCreators = async (limit: number = 10): Promise<Creator[]> => {
    const response = await api.get<{ success: boolean; data: Creator[] }>(
        `/api/creators/top?limit=${limit}`
    );
    return response.data.data;
};

export interface CreatorApplicationWithCampaign extends Application {
    campaign: {
        title: string;
        description: string;
        cpm: number;
        maxBudget: number;
        isActive: boolean;
        brand: string;
    } | null;
}

export const getCreatorApplications = async (walletAddress: string): Promise<CreatorApplicationWithCampaign[]> => {
    const response = await api.get<{ success: boolean; data: CreatorApplicationWithCampaign[] }>(
        `/api/creator/applications/${walletAddress}`
    );
    return response.data.data;
};

export const getCreatorEarnings = async (walletAddress: string): Promise<{ earnings: number; earningsLamports: number }> => {
    const response = await api.get<{ success: boolean; data: { earnings: number; earningsLamports: number } }>(
        `/api/creator/earnings/${walletAddress}`
    );
    return response.data.data;
};

export const withdrawCreatorEarnings = async (walletAddress: string, amount: number) => {
    const response = await api.post("/api/creator/withdraw", {
        walletAddress,
        amount,
    });
    return response.data;
};

export interface PayoutResult {
    campaignId: string;
    creatorAddress: string;
    tweetId: string;
    metrics: { views: number; likes: number };
    effectiveViews: number;
    payout: number;
    totalEarnings: number;
}

export const processCampaignPayout = async (campaignId: string, creatorAddress: string): Promise<PayoutResult> => {
    const response = await api.post<{ success: boolean; data: PayoutResult }>(
        `/api/campaign/${campaignId}/process-payout`,
        { creatorAddress }
    );
    return response.data.data;
};


// ============= BALANCE API =============

export const addFunds = async (walletAddress: string, amount: number) => {
    const response = await api.post("/api/balance/add", {
        walletAddress,
        amount,
    });
    return response.data;
};

export const getBalance = async (walletAddress: string): Promise<number> => {
    const response = await api.get<{ success: boolean; data: { balance: number } }>(
        `/api/balance/${walletAddress}`
    );
    return response.data.data.balance;
};

// ============= METRICS API =============

export interface MetricsUpdate {
    campaignId: string;
    views: number;
    likes: number;
}

export const updateMetrics = async (data: MetricsUpdate) => {
    const response = await api.post("/api/metrics/update", data);
    return response.data;
};

export const settlePayout = async (id: string, creatorTokenAccount: string) => {
    const response = await api.post(`/api/campaign/${id}/settle`, {
        creatorTokenAccount,
    });
    return response.data;
};

export const verifyWallet = async (
    publicKey: string,
    signature: string,
    message: string
) => {
    const response = await api.post("/api/wallet/verify", {
        publicKey,
        signature,
        message,
    });
    return response.data;
};
