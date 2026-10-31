export default function StatCard({ label, value, icon, accent }) {
    const accentClasses = {
        blue: 'bg-blue-500/10 text-blue-300',
        emerald: 'bg-emerald-500/10 text-emerald-300',
        violet: 'bg-violet-500/10 text-violet-300',
        amber: 'bg-amber-500/10 text-amber-300',
    };

    return (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>{icon}</div>
            <div className="text-sm text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-bold text-white">{value}</div>
        </div>
    );
}
