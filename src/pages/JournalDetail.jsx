import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getJournalById } from '../api/journal.api';
import ChartImageCard from '../components/common/ChartImageCard';
import EmptyState from '../components/common/EmptyState';
import InfoChip from '../components/common/InfoChip';
import LoadingState from '../components/common/LoadingState';
import { currency, formatTradeDate, getChartImageValue, getResultBadge, resolveImageUrl } from '../utils/trading';

export default function JournalDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                setLoading(true);
                const response = await getJournalById(id);
                const entry = response?.data || response?.journal || response;
                setJournal(entry || null);
            } catch {
                toast.error('Unable to load trade details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJournal();
    }, [id]);

    const selectedDate = searchParams.get('date');
    const tradeId = journal?._id || journal?.id;
    const result = journal?.result || (Number(journal?.pnl || 0) > 0 ? 'Win' : Number(journal?.pnl || 0) < 0 ? 'Loss' : 'Break Even');
    const chartScreenshots = {
        '4H': resolveImageUrl(getChartImageValue(journal, '4H')),
        '15M': resolveImageUrl(getChartImageValue(journal, '15M')),
        '5M': resolveImageUrl(getChartImageValue(journal, '5M')),
    };

    if (loading) return <LoadingState label="Loading trade details…" />;

    if (!journal) {
        return (
            <EmptyState
                title="Trade not found"
                description="The requested journal entry could not be loaded."
                action={{ label: 'Back to journal', onClick: () => navigate(`/journal${selectedDate ? `?date=${selectedDate}` : ''}`) }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => navigate(`/journal${selectedDate ? `?date=${selectedDate}` : ''}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-glow">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Trade overview</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2 className="text-3xl font-bold text-white">{journal.asset || 'Unknown pair'}</h2>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${journal.type === 'SHORT' ? 'bg-slate-700 text-slate-100' : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'}`}>
                                {journal.type || 'LONG'}
                            </span>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${getResultBadge(result)}`}>
                                {result}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{formatTradeDate(journal.date || journal.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(`/journal/${tradeId}/edit${selectedDate ? `?date=${selectedDate}` : ''}`)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Financial summary</div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <InfoChip label="PnL" value={currency(journal.pnl || 0)} tone={Number(journal.pnl || 0) >= 0 ? 'green' : 'red'} />
                            <InfoChip label="Risk" value={journal.risk ?? '—'} />
                            <InfoChip label="Lot size" value={journal.lotSize ?? '—'} />
                            <InfoChip label="Result" value={journal.result || result} />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Trade details</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <InfoChip label="Entry price" value={journal.entryPrice ?? '—'} />
                            <InfoChip label="Exit price" value={journal.exitPrice ?? '—'} />
                            <InfoChip label="Stop loss" value={journal.stopLoss ?? '—'} />
                            <InfoChip label="Take profit" value={journal.takeProfit ?? '—'} />
                            <InfoChip label="Trading plan" value={journal.setup || journal.plan?.name || 'General setup'} />
                            <InfoChip label="Trade date" value={formatTradeDate(journal.date || journal.createdAt)} />
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Trading psychology</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <InfoChip label="Before trade mood" value={journal.emotion || journal.beforeMood || '—'} />
                            <InfoChip label="After trade mood" value={journal.afterEmotion || journal.afterMood || '—'} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Execution notes</div>
                        <div className="space-y-3 text-sm leading-6 text-slate-300">
                            <p>{journal.notes || 'No notes were added for this trade.'}</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                        <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Lessons learned</div>
                        <div className="space-y-3 text-sm leading-6 text-slate-300">
                            <p>{journal.lesson || journal.lessonsLearned || 'No lesson recorded for this trade yet.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Chart screenshots</div>
                <div className="grid gap-4 md:grid-cols-3">
                    {['4H', '15M', '5M'].map((timeframe) => (
                        <ChartImageCard
                            key={timeframe}
                            label={timeframe}
                            src={chartScreenshots[timeframe]}
                            alt={`${journal.asset || 'Trade'} ${timeframe} chart`}
                            onPreview={() => setSelectedImage(chartScreenshots[timeframe])}
                        />
                    ))}
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-3 top-3 rounded-full border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-600">
                            <X className="h-4 w-4" />
                        </button>
                        <img src={selectedImage} alt="Trade chart preview" className="max-h-[80vh] w-full rounded-2xl object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}
