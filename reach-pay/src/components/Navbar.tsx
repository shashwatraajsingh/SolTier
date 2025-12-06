import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="container flex items-center justify-between py-6">
            <div className="text-2xl font-bold">ReachPay</div>
            <div className="flex items-center gap-8 nav-links">
                <Link href="#how-it-works" className="hover:underline">How it works</Link>
                <Link href="#pricing" className="hover:underline">Pricing</Link>
                <Link href="#creators" className="hover:underline">Creators</Link>
                <Link href="#brands" className="hover:underline">Brands</Link>
            </div>
            <button className="sketch-button">Join waitlist</button>
        </nav>
    );
}
