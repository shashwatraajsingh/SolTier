import { Wallet, Send, Coins } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            title: "Brand sets campaign",
            icon: <Wallet size={32} />,
            items: ["CPM rate", "Engagement weight", "Max budget", "Funds locked on Solana"]
        },
        {
            title: "Creator posts",
            icon: <Send size={32} />,
            items: ["One promotion", "Zero renegotiation", "No flat fees"]
        },
        {
            title: "Auto-settlement",
            icon: <Coins size={32} />,
            items: ["Views + likes tracked", "Payout streamed", "Campaign stops at budget cap"]
        }
    ];

    return (
        <section id="how-it-works" className="container py-20">
            <h2 className="text-4xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="sketch-border p-6 bg-white flex flex-col items-center text-center">
                        <div className="mb-4 p-4 border-2 border-black rounded-full">
                            {step.icon}
                        </div>
                        <h3 className="text-2xl mb-4">Step {index + 1} – {step.title}</h3>
                        <ul className="text-left space-y-2">
                            {step.items.map((item, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-black rounded-full"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
