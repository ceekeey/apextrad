import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getPlanById } from '../api/plans.api';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';

export default function PlanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setLoading(true);
                const response = await getPlanById(id);
                setPlan(response?.plan || response?.data || response);
            } catch {
                toast.error('Plan not found.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPlan();
    }, [id]);

    if (loading) return <LoadingState label="Loading strategy…" />;
    if (!plan) return <EmptyState title="Strategy not found" description="The requested trading plan could not be loaded." action={{ label: 'Back to plans', onClick: () => navigate('/plans') }} />;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/plans')} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"><ArrowLeft className="h-4 w-4" /> Back</button>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-glow">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 text-xl font-bold">{(plan.name || 'P').slice(0, 1).toUpperCase()}</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                        <div className="text-sm text-slate-400">{plan.description || 'Core trading rule set.'}</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Rules</div>
                    <ul className="space-y-3">
                        {(plan.rules || []).map((rule, index) => (
                            <li key={index} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-300">{index + 1}</span>
                                <span>{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
