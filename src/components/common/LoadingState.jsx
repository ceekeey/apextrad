import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Loading…' }) {
    return (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3 text-slate-200">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <span>{label}</span>
            </div>
        </div>
    );
}
