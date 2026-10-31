import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getJournals } from '../api/journal.api';
import { SkeletonCalendar } from '../components/common/Skeletons';
import { currency, formatDateKey, monthNames, weekdayShort } from '../utils/trading';

export default function Trades() {
    const navigate = useNavigate();
    const [monthOffset, setMonthOffset] = useState(0);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentDate = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1), [monthOffset]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getJournals();
                const items = Array.isArray(response) ? response : response?.data || [];
                setJournals(items);
            } catch {
                toast.error('Unable to load trading calendar.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calendarDays = useMemo(() => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstWeekday = (monthStart.getDay() + 6) % 7;
        const cells = [];
        for (let index = 0; index < firstWeekday; index += 1) cells.push(null);
        for (let day = 1; day <= totalDays; day += 1) cells.push(day);
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [currentDate]);

    const journalMap = useMemo(() => {
        const map = {};
        journals.forEach((journal) => {
            const dateKey = formatDateKey(journal.date || journal.createdAt || new Date());
            if (!map[dateKey]) map[dateKey] = { count: 0, pnl: 0 };
            map[dateKey].count += 1;
            map[dateKey].pnl += Number(journal.pnl || 0);
        });
        return map;
    }, [journals]);

    const monthSummary = useMemo(() => {
        let totalTrades = 0;
        let totalPnl = 0;
        journals.forEach((journal) => {
            const date = new Date(journal.date || journal.createdAt || new Date());
            if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
                totalTrades += 1;
                totalPnl += Number(journal.pnl || 0);
            }
        });
        return { totalTrades, totalPnl };
    }, [journals, currentDate]);

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-sm text-slate-400">Trading calendar</div>
                        <h2 className="text-2xl font-bold text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMonthOffset((value) => value - 1)} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-600"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={() => setMonthOffset(0)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">Today</button>
                        <button onClick={() => setMonthOffset((value) => value + 1)} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-600"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <MiniStat label="Trades" value={String(monthSummary.totalTrades)} tone="blue" />
                    <MiniStat label="PnL" value={currency(monthSummary.totalPnl)} tone={monthSummary.totalPnl >= 0 ? 'green' : 'red'} />
                    <MiniStat label="Avg/day" value={monthSummary.totalTrades ? currency(monthSummary.totalPnl / monthSummary.totalTrades) : '$0.00'} tone="amber" />
                </div>

                <div className="mt-6">
                    <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        {weekdayShort.map((day) => <div key={day}>{day}</div>)}
                    </div>

                    {loading ? (
                        <SkeletonCalendar />
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, index) => {
                                if (!day) return <div key={`empty-${index}`} className="h-24 rounded-xl border border-dashed border-slate-800 bg-slate-950/60" />;
                                const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const entry = journalMap[dateKey];
                                const status = entry && entry.pnl > 0 ? 'win' : entry && entry.pnl < 0 ? 'loss' : entry ? 'mixed' : 'empty';

                                return (
                                    <button key={dateKey} onClick={() => navigate(`/journal?date=${dateKey}`)} className={`flex h-24 flex-col rounded-xl border p-2 text-left transition ${status === 'win' ? 'border-emerald-500/40 bg-emerald-500/10' : status === 'loss' ? 'border-red-500/40 bg-red-500/10' : status === 'mixed' ? 'border-blue-500/40 bg-blue-500/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{day}</span>
                                            {entry && <span className={`h-2.5 w-2.5 rounded-full ${status === 'win' ? 'bg-emerald-400' : status === 'loss' ? 'bg-red-400' : 'bg-blue-400'}`} />}
                                        </div>
                                        <div className="mt-auto text-[11px] text-slate-300">{entry ? `${entry.count} trade${entry.count > 1 ? 's' : ''}` : 'No trades'}</div>
                                        {entry && <div className={`text-[11px] font-medium ${entry.pnl >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{currency(entry.pnl)}</div>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, tone }) {
    const toneClasses = {
        blue: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
        green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
        red: 'border-red-500/40 bg-red-500/10 text-red-200',
        amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    };

    return <div className={`rounded-2xl border p-3 ${toneClasses[tone] || toneClasses.blue}`}><div className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{label}</div><div className="mt-2 text-lg font-semibold">{value}</div></div>;
}
