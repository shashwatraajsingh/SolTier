"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC, useEffect, useState } from "react";

export const WalletButton: FC = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="sketch-button-wrapper">
                <button className="!bg-[#2a2a2a] !font-patrick !text-white !h-12 !px-6 !rounded-none !border-2 !border-black hover:!bg-[#3a3a3a] transition-all transform hover:-translate-y-0.5">
                    Select Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="sketch-button-wrapper">
            <WalletMultiButton className="!bg-[#2a2a2a] !font-patrick !text-white !h-12 !px-6 !rounded-none !border-2 !border-black hover:!bg-[#3a3a3a] transition-all transform hover:-translate-y-0.5" />
        </div>
    );
};
