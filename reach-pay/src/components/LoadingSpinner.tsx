"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
}

export default function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
            {text && <p className="font-patrick text-lg text-gray-600">{text}</p>}
        </div>
    );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white border-2 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <LoadingSpinner size="lg" text={text} />
            </div>
        </div>
    );
}

export function CardLoader() {
    return (
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
    );
}
