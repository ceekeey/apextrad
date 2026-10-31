export default function InfoChip({ label, value, tone = 'default' }) {
    const toneClasses = {
        default: 'text-slate-300',
        green: 'text-emerald-300',
        red: 'text-red-300',
    };

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
            <div className={`mt-2 text-sm font-semibold ${toneClasses[tone] || toneClasses.default}`}>{value}</div>
        </div>
    );
}
