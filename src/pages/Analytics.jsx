import { useEffect, useMemo, useState } from 'react';
import { Activity, NotebookPen, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { getJournals } from '../api/journal.api';
import LoadingState from '../components/common/LoadingState';
import StatCard from '../components/common/StatCard';
import { currency, monthNames } from '../utils/trading';

export default function Analytics() {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('ALL');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getJournals();
                const items = Array.isArray(response) ? response : response?.data || [];
                setJournals(items);
            } catch {
                toast.error('Could not fetch analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const monthOptions = useMemo(() => {
        const uniqueKeys = [...new Set(journals
            .map((item) => {
                const date = new Date(item.date || item.createdAt || new Date());
                if (Number.isNaN(date.getTime())) return null;
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            })
            .filter(Boolean))].sort();

        return uniqueKeys.map((key) => {
            const [year, month] = key.split('-');
            return {
                value: key,
                label: `${monthNames[Number(month) - 1]} ${year}`,
            };
        });
    }, [journals]);

    const filtered = useMemo(() => {
        if (selectedMonth === 'ALL') return journals;
        return journals.filter((item) => {
            const date = new Date(item.date || item.createdAt || new Date());
            if (Number.isNaN(date.getTime())) return false;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return key === selectedMonth;
        });
    }, [journals, selectedMonth]);

    const metrics = useMemo(() => {
        const total = filtered.length;
        const wins = filtered.filter((item) => Number(item.pnl || 0) > 0).length;
        const losses = filtered.filter((item) => Number(item.pnl || 0) < 0).length;
        const breakEven = filtered.filter((item) => Number(item.pnl || 0) === 0).length;
        const grossProfit = filtered.filter((item) => Number(item.pnl || 0) > 0).reduce((sum, item) => sum + Number(item.pnl || 0), 0);
        const grossLoss = filtered.filter((item) => Number(item.pnl || 0) < 0).reduce((sum, item) => sum + Math.abs(Number(item.pnl || 0)), 0);
        const winRate = total ? Math.round((wins / total) * 100) : 0;
        const profitFactor = grossLoss ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? grossProfit.toFixed(2) : '0.00';
        const bestTrade = filtered.length ? Math.max(...filtered.map((item) => Number(item.pnl || 0))) : 0;
        return { total, wins, losses, breakEven, grossProfit, grossLoss, winRate, profitFactor, bestTrade };
    }, [filtered]);

    const chartData = useMemo(() => {
        const buckets = {};
        filtered.forEach((item) => {
            const date = new Date(item.date || item.createdAt || new Date());
            if (Number.isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            buckets[key] = { label, pnl: (buckets[key]?.pnl || 0) + Number(item.pnl || 0) };
        });
        return Object.values(buckets).map(({ label, pnl }) => ({ label, pnl }));
    }, [filtered]);

    const pieData = [
        { name: 'Wins', value: metrics.wins, color: '#22C55E' },
        { name: 'Losses', value: metrics.losses, color: '#EF4444' },
        { name: 'Break Even', value: metrics.breakEven, color: '#F59E0B' },
    ];

    if (loading) return <LoadingState label="Loading analytics…" />;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm text-slate-400">Performance metrics</div>
                        <h2 className="text-2xl font-bold text-white">Analytics overview</h2>
                    </div>
                    <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                        <option value="ALL">All time</option>
                        {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total trades" value={String(metrics.total)} icon={<NotebookPen className="h-5 w-5" />} accent="blue" />
                <StatCard label="Win rate" value={`${metrics.winRate}%`} icon={<Target className="h-5 w-5" />} accent="emerald" />
                <StatCard label="Profit factor" value={metrics.profitFactor} icon={<TrendingUp className="h-5 w-5" />} accent="violet" />
                <StatCard label="Best trade" value={currency(metrics.bestTrade)} icon={<Activity className="h-5 w-5" />} accent="amber" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                    <h3 className="mb-4 text-lg font-semibold text-white">Performance over time</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid stroke="#334155" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="label" stroke="#94A3B8" axisLine={false} tickLine={false} />
                                <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: 12 }} />
                                <Bar dataKey="pnl" radius={[8, 8, 0, 0]} fill="#60A5FA" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                    <h3 className="mb-4 text-lg font-semibold text-white">Trade outcome</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
