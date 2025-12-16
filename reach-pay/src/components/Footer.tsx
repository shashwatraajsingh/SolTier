import { Twitter, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="container py-12 border-t-2 border-dashed border-gray-300 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <div className="text-xl font-bold mb-2">SolTier</div>
                    <p className="text-gray-500">Built by founders tired of guessing ROI</p>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-gray-600">
                    <Link href="/docs" className="flex items-center gap-2 hover:text-black transition-colors"><FileText size={18} /> Docs</Link>
                    <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
                    <a href="https://x.com/SolTierD" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition-colors"><Twitter size={18} /> Twitter</a>
                </div>
            </div>
        </footer>
    );
}
