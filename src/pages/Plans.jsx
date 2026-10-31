import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import { createPlan, deletePlan, getPlans } from '../api/plans.api';
import EmptyState from '../components/common/EmptyState';
import { SkeletonRow } from '../components/common/Skeletons';

export default function Plans() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPlans();
            const items = Array.isArray(response) ? response : response?.plans || [];
            setPlans(items);
        } catch {
            toast.error('Could not fetch trading plans.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPlans();
    }, [fetchPlans]);

    const filteredPlans = useMemo(() => {
        const term = search.trim().toLowerCase();
        return plans.filter((plan) => !term || `${plan.name || ''} ${plan.description || ''}`.toLowerCase().includes(term));
    }, [plans, search]);

    const handleCreate = async () => {
        if (!name.trim()) return toast.error('Plan name is required.');
        try {
            await createPlan({
                name: name.trim(),
                description: description.trim(),
                rules: rules.split('\n').map((line) => line.trim()).filter(Boolean),
            });
            toast.success('Trading plan created.');
            setName('');
            setDescription('');
            setRules('');
            fetchPlans();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not create trading plan.');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete plan?',
            text: 'This trading plan will be removed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Delete',
        });

        if (!result.isConfirmed) return;

        try {
            await deletePlan(id);
            toast.success('Plan deleted.');
            fetchPlans();
        } catch {
            toast.error('Unable to delete plan.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm text-slate-400">Trading playbook</div>
                        <h2 className="text-2xl font-bold text-white">Strategy library</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plans" className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Plan name" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                    <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                </div>
                <textarea value={rules} onChange={(event) => setRules(event.target.value)} rows="4" placeholder="Rules, one per line" className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                <div className="mt-4 flex justify-end">
                    <button onClick={handleCreate} className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-400">Create plan</button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, index) => <SkeletonRow key={index} />)}</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredPlans.length ? filteredPlans.map((plan) => (
                        <div key={plan._id || plan.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                            <div className="flex items-center justify-between">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">{(plan.name || 'P').slice(0, 1).toUpperCase()}</div>
                                <button onClick={() => handleDelete(plan._id || plan.id)} className="rounded-xl border border-red-500/25 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/15"><Trash2 className="h-4 w-4" /></button>
                            </div>
                            <div className="mt-4 text-lg font-semibold text-white">{plan.name}</div>
                            <div className="mt-2 text-sm text-slate-400">{plan.description || 'Trading plan description coming soon.'}</div>
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                <span>{(plan.rules || []).length} rules</span>
                                <button onClick={() => navigate(`/plans/${plan._id || plan.id}`)} className="font-medium text-blue-300">View details</button>
                            </div>
                        </div>
                    )) : <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No strategy plans yet" description="Your trading plans will appear here after they are created." /></div>}
                </div>
            )}
        </div>
    );
}
