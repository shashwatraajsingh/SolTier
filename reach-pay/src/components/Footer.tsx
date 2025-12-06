import { Twitter, FileText } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="container py-12 border-t-2 border-dashed border-gray-300 mt-12">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-xl font-bold mb-2">ReachPay</div>
                    <p className="text-gray-500">Built by founders tired of guessing ROI</p>
                </div>
                <div className="flex gap-6 text-gray-600">
                    <a href="#" className="flex items-center gap-2 hover:text-black"><FileText size={18} /> Docs</a>
                    <a href="#" className="hover:text-black">Terms</a>
                    <a href="#" className="flex items-center gap-2 hover:text-black"><Twitter size={18} /> Twitter</a>
                </div>
            </div>
        </footer>
    );
}
