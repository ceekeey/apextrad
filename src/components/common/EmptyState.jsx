import { BarChart3 } from 'lucide-react';

export default function EmptyState({ title, description, action, compact = false }) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center ${compact ? 'min-h-20' : 'min-h-64'}`}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-300"><BarChart3 className="h-5 w-5" /></div>
            <div className="text-lg font-semibold text-white">{title}</div>
            <div className="mt-2 max-w-md text-sm text-slate-400">{description}</div>
            {action && <button onClick={action.onClick} className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">{action.label}</button>}
        </div>
    );
}
