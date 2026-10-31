import { useMemo, useState, useEffect } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import { deleteJournal, getJournals } from '../api/journal.api';
import EmptyState from '../components/common/EmptyState';
import InfoChip from '../components/common/InfoChip';
import { SkeletonRow } from '../components/common/Skeletons';
import { currency, formatDateKey, formatTradeDate, getResultBadge } from '../utils/trading';

export default function Journal() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [journals, setJournals] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getJournals();
                const items = Array.isArray(response) ? response : response?.data || [];
                setJournals(items);
            } catch {
                toast.error('Could not fetch journal entries.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const selectedDate = searchParams.get('date');
    const visibleJournals = useMemo(() => {
        const term = search.trim().toLowerCase();
        return journals.filter((journal) => {
            const dateKey = formatDateKey(journal.date || journal.createdAt || new Date());
            const matchesDate = !selectedDate || dateKey === selectedDate;
            const matchesText = !term || `${journal.asset || ''} ${journal.type || ''} ${journal.result || ''}`.toLowerCase().includes(term);
            return matchesDate && matchesText;
        }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }, [journals, selectedDate, search]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete journal?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Delete',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteJournal(id);
            setJournals((items) => items.filter((entry) => (entry._id || entry.id) !== id));
            toast.success('Journal deleted.');
        } catch {
            toast.error('Unable to delete journal.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-sm text-slate-400">Trading journal</div>
                    <h2 className="text-2xl font-bold text-white">Journal history</h2>
                </div>
                <button onClick={() => navigate('/journal/new')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-400">
                    <Plus className="h-4 w-4" />
                    New entry
                </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by pair or result" className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, index) => <SkeletonRow key={index} />)}
                </div>
            ) : visibleJournals.length ? (
                <div className="space-y-4">
                    {visibleJournals.map((journal) => {
                        const tradeId = journal._id || journal.id;
                        const route = `/journal/${tradeId}${selectedDate ? `?date=${selectedDate}` : ''}`;
                        const handleTradeOpen = () => navigate(route);

                        return (
                            <article
                                key={tradeId}
                                role="button"
                                tabIndex={0}
                                onClick={handleTradeOpen}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        handleTradeOpen();
                                    }
                                }}
                                className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow transition hover:border-slate-700 hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-white">{journal.asset || 'Unknown pair'}</span>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getResultBadge(journal.result || (Number(journal.pnl || 0) >= 0 ? 'Win' : 'Loss'))}`}>
                                                {journal.result || (Number(journal.pnl || 0) >= 0 ? 'Win' : 'Loss')}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-400">{journal.type || 'LONG'} • {formatTradeDate(journal.date || journal.createdAt)}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate(`/journal/${tradeId}/edit${selectedDate ? `?date=${selectedDate}` : ''}`);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDelete(tradeId);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/15"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 md:grid-cols-4">
                                    <InfoChip label="Entry" value={journal.entryPrice ?? '—'} />
                                    <InfoChip label="Exit" value={journal.exitPrice ?? '—'} />
                                    <InfoChip label="Risk" value={journal.risk ?? '—'} />
                                    <InfoChip label="PnL" value={currency(journal.pnl || 0)} tone={Number(journal.pnl || 0) >= 0 ? 'green' : 'red'} />
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <EmptyState title="No journals found" description={selectedDate ? `There are no trades recorded for ${selectedDate}.` : 'Start by logging your first trade.'} action={{ label: 'Create journal', onClick: () => navigate('/journal/new') }} />
            )}
        </div>
    );
}
