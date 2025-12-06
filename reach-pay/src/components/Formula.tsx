export default function Formula() {
    return (
        <section className="container py-12 flex flex-col items-center">
            <div className="sketch-border p-8 bg-white max-w-2xl w-full text-center relative">
                <div className="absolute -top-3 -left-3 transform -rotate-12 bg-yellow-200 px-2 py-1 border border-black text-sm font-bold">The Math</div>
                <code className="text-xl font-mono block mb-4">
                    Effective Views = Views + (20 × Likes)
                </code>
                <code className="text-xl font-mono block">
                    Payout = Effective Views ÷ 1000 × CPM
                </code>
            </div>
            <p className="mt-6 text-xl text-center">
                Views are the base. Likes reward quality.<br />
                Simple, fair, and transparent.
            </p>
        </section>
    );
}
