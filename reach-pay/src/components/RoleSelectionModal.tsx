"use client";

import { FC } from "react";
import { User, Briefcase } from "lucide-react";

interface RoleSelectionModalProps {
    isOpen: boolean;
    onSelect: (role: "creator" | "brand") => void;
}

export const RoleSelectionModal: FC<RoleSelectionModalProps> = ({ isOpen, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border-2 border-black p-8 max-w-2xl w-full relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* Sketchy corners */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-black bg-white" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-black bg-white" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-black bg-white" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-black bg-white" />

                <h2 className="text-4xl font-patrick font-bold text-center mb-2">Who are you?</h2>
                <p className="text-center text-gray-600 font-inter mb-10">Select your role to continue</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Creator Option */}
                    <button
                        onClick={() => onSelect("creator")}
                        className="group relative p-8 border-2 border-black hover:bg-blue-50 transition-all text-left"
                    >
                        <div className="absolute inset-0 border-2 border-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform -z-10 bg-white" />
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User size={32} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-patrick font-bold">I'm a Creator</h3>
                            <p className="text-center text-sm text-gray-600 font-inter">
                                I want to get paid for my content and engagement.
                            </p>
                        </div>
                    </button>

                    {/* Brand Option */}
                    <button
                        onClick={() => onSelect("brand")}
                        className="group relative p-8 border-2 border-black hover:bg-green-50 transition-all text-left"
                    >
                        <div className="absolute inset-0 border-2 border-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform -z-10 bg-white" />
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Briefcase size={32} className="text-black" />
                            </div>
                            <h3 className="text-2xl font-patrick font-bold">I'm a Brand</h3>
                            <p className="text-center text-sm text-gray-600 font-inter">
                                I want to launch campaigns and pay for reach.
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
