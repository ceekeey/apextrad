import { Info } from 'lucide-react';

export default function About() {
    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-glow">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Info className="h-5 w-5" /></div>
                    <div>
                        <div className="text-sm text-slate-400">About Apex Trade</div>
                        <h2 className="text-2xl font-bold text-white">Trading journal</h2>
                    </div>
                </div>

                <div className="space-y-4 text-sm leading-7 text-slate-300">
                    <p>Apex Trade is a personal trading journal designed to help you document trades, review setups, and improve decision-making over time.</p>
                    <p>It stores journal entries, chart screenshots, trading plans, and performance metrics so you can review your execution without losing context.</p>
                    <p>All trading results, notes, and analytics are based on the data you record in your account and the connected API.</p>
                </div>
            </div>
        </div>
    );
}
