import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { IDL } from "@/lib/idl";

const PROGRAM_ID = new PublicKey("11111111111111111111111111111111"); // Replace with actual deployed ID

export const useSolTierProgram = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const provider = useMemo(() => {
        if (!wallet || !wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return null;
        }

        return new AnchorProvider(connection, wallet as any, {
            commitment: "confirmed",
        });
    }, [connection, wallet]);

    const program = useMemo(() => {
        if (!provider) return null;

        try {
            console.log("Initializing Program with IDL:", IDL);
            // @ts-ignore
            return new Program(IDL as any, PROGRAM_ID, provider);
        } catch (err) {
            console.error("Error initializing Program:", err);
            return null;
        }
    }, [provider]);

    return {
        program,
        provider,
        connection,
        wallet,
    };
};
