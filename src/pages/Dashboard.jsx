import { useEffect, useMemo, useState } from 'react';
import { Activity, NotebookPen, Plus, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { getJournals } from '../api/journal.api';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';
import { SkeletonCard } from '../components/common/Skeletons';
import { currency, formatDateKey, getResultBadge } from '../utils/trading';

export default function Dashboard() {
    const navigate = useNavigate();
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getJournals();
                const items = Array.isArray(response) ? response : response?.data || response?.journals || [];
                setJournals(items);
            } catch {
                toast.error('Could not fetch dashboard journals.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totals = useMemo(() => {
        const totalTrades = journals.length;
        const winningTrades = journals.filter((trade) => Number(trade.pnl || 0) > 0).length;
        const totalPnl = journals.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
        const winRate = totalTrades ? Math.round((winningTrades / totalTrades) * 100) : 0;
        const recentTrades = [...journals].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 5);
        return { totalTrades, winningTrades, totalPnl, winRate, recentTrades };
    }, [journals]);

    const chartData = useMemo(() => {
        const byDate = {};
        journals.forEach((trade) => {
            const key = formatDateKey(trade.date || trade.createdAt || new Date());
            byDate[key] = (byDate[key] || 0) + Number(trade.pnl || 0);
        });
        return Object.entries(byDate).slice(-7).map(([date, pnl]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            pnl,
        }));
    }, [journals]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-400">Good morning</div>
                    <h2 className="text-3xl font-bold text-white">Trader 👋</h2>
                </div>
                <button onClick={() => navigate('/journal/new')} className="hidden rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 sm:inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New journal
                </button>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => <SkeletonCard key={index} />)}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total P&L" value={currency(totals.totalPnl)} icon={<TrendingUp className="h-5 w-5" />} accent="blue" />
                        <StatCard label="Win rate" value={`${totals.winRate}%`} icon={<Target className="h-5 w-5" />} accent="emerald" />
                        <StatCard label="Total trades" value={String(totals.totalTrades)} icon={<NotebookPen className="h-5 w-5" />} accent="violet" />
                        <StatCard label="Winning trades" value={String(totals.winningTrades)} icon={<Activity className="h-5 w-5" />} accent="amber" />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Performance overview</h3>
                                <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-300">7D</span>
                            </div>
                            {chartData.length ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.65} />
                                                    <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.08} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94A3B8" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: 12 }} />
                                            <Area type="monotone" dataKey="pnl" stroke="#60A5FA" fill="url(#pnlFill)" strokeWidth={2.5} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <EmptyState title="No trading activity yet" description="Once you log journal entries, your performance chart will appear here." />
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                            <h3 className="mb-4 text-lg font-semibold text-white">Recent trades</h3>
                            <div className="space-y-3">
                                {totals.recentTrades.length ? totals.recentTrades.map((trade) => (
                                    <div key={trade._id || trade.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{trade.asset || 'Unknown pair'}</div>
                                            <div className="text-xs text-slate-400">{trade.type || 'LONG'} • {new Date(trade.date || trade.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getResultBadge(trade.result || (Number(trade.pnl || 0) > 0 ? 'Win' : 'Loss'))}`}>
                                                {trade.result || (Number(trade.pnl || 0) > 0 ? 'Win' : 'Loss')}
                                            </div>
                                            <div className={`mt-1 text-sm font-semibold ${Number(trade.pnl || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{currency(trade.pnl || 0)}</div>
                                        </div>
                                    </div>
                                )) : <EmptyState title="No recent trades" description="Your latest trades will show up here." compact />}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
