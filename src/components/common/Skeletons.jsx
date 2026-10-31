export function SkeletonCard() {
    return <div className="h-32 animate-pulse rounded-3xl border border-slate-800 bg-slate-900" />;
}

export function SkeletonCalendar() {
    return <div className="grid grid-cols-7 gap-2">{[...Array(35)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-950/60" />)}</div>;
}

export function SkeletonRow() {
    return <div className="h-28 animate-pulse rounded-3xl border border-slate-800 bg-slate-900" />;
}
