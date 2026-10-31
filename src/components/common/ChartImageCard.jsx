import { useState } from 'react';

function ChartImageBody({ label, src, alt, onPreview }) {
    const [loading, setLoading] = useState(Boolean(src));
    const [hasError, setHasError] = useState(false);

    if (!src) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                <div className="mb-2 text-sm font-medium text-slate-200">{label}</div>
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900 px-3 text-center text-sm text-slate-400">
                    No chart image available
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
            <div className="mb-2 text-sm font-medium text-slate-200">{label}</div>
            <button type="button" onClick={onPreview} className="relative block w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-300">
                        Loading…
                    </div>
                )}
                {hasError ? (
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900 px-3 text-center text-sm text-slate-400">
                        Image unavailable
                    </div>
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        className="h-40 w-full object-contain transition hover:scale-[1.01]"
                        loading="lazy"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setHasError(true);
                        }}
                    />
                )}
            </button>
        </div>
    );
}

export default function ChartImageCard(props) {
    return <ChartImageBody key={props.src || 'empty-image'} {...props} />;
}
