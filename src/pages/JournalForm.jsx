import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, ImagePlus, Target } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import { createJournal, deleteJournal, getJournalById, updateJournal } from '../api/journal.api';
import { getPlans } from '../api/plans.api';
import ImageUploadField from '../components/common/ImageUploadField';
import InputField from '../components/common/InputField';
import LoadingState from '../components/common/LoadingState';
import SelectField from '../components/common/SelectField';
import VoiceInput from '../components/common/VoiceInput';
import { defaultPairs, getChartImageValue, moodValues } from '../utils/trading';

export default function JournalForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [screenshots, setScreenshots] = useState({ '4H': null, '15M': null, '5M': null });
    const [existingScreenshots, setExistingScreenshots] = useState({ '4H': null, '15M': null, '5M': null });
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        asset: 'EURUSD',
        type: 'LONG',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        exitPrice: '',
        risk: '',
        lotSize: '1',
        pnl: '',
        result: 'Win',
        beforeMood: 'CALM',
        afterMood: 'CALM',
        notes: '',
        lesson: '',
        date: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getPlans();
                const list = Array.isArray(response) ? response : response?.plans || [];
                setPlans(list);
            } catch {
                toast.error('Unable to load trading plans.');
            }
        };
        fetchPlans();
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchEntry = async () => {
            try {
                setLoading(true);
                const response = await getJournalById(id);
                const journal = response?.data || response?.journal || response;
                const currentScreenshots = {
                    '4H': getChartImageValue(journal, '4H'),
                    '15M': getChartImageValue(journal, '15M'),
                    '5M': getChartImageValue(journal, '5M'),
                };

                setForm({
                    asset: journal.asset || 'EURUSD',
                    type: journal.type || 'LONG',
                    entryPrice: journal.entryPrice ?? '',
                    stopLoss: journal.stopLoss ?? '',
                    takeProfit: journal.takeProfit ?? '',
                    exitPrice: journal.exitPrice ?? '',
                    risk: journal.risk ?? '',
                    lotSize: journal.lotSize ?? '1',
                    pnl: journal.pnl ?? '',
                    result: journal.result || 'Win',
                    beforeMood: journal.emotion || 'CALM',
                    afterMood: journal.afterEmotion || 'CALM',
                    notes: journal.notes || '',
                    lesson: '',
                    date: journal.date ? new Date(journal.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                });
                setExistingScreenshots(currentScreenshots);
                setScreenshots(currentScreenshots);
                if (journal.plan) setSelectedPlanId(journal.plan);
            } catch {
                toast.error('Unable to load journal entry.');
            } finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id]);

    const updateField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.asset) return toast.error('Select a trading pair before saving.');
        if (!form.entryPrice) return toast.error('Entry price is required.');

        try {
            const formData = new FormData();
            formData.append('asset', form.asset);
            formData.append('type', form.type);
            formData.append('pnl', String(Number(form.pnl || 0)));
            formData.append('entryPrice', String(Number(form.entryPrice || 0)));
            formData.append('stopLoss', String(Number(form.stopLoss || 0)));
            formData.append('takeProfit', String(Number(form.takeProfit || 0)));
            formData.append('exitPrice', String(Number(form.exitPrice || 0)));
            formData.append('lotSize', String(Number(form.lotSize || 1)));
            formData.append('risk', String(Number(form.risk || 0)));
            formData.append('result', form.result);
            formData.append('setup', plans.find((plan) => (plan._id || plan.id) === selectedPlanId)?.name || 'General Setup');
            formData.append('emotion', String(form.beforeMood || 'CALM'));
            formData.append('afterEmotion', String(form.afterMood || 'CALM'));
            const combinedNotes = `${form.notes || ''}${form.lesson ? `\nLesson: ${form.lesson}` : ''}`.trim();
            formData.append('notes', combinedNotes || '');
            if (selectedPlanId) formData.append('plan', selectedPlanId);
            formData.append('date', new Date(form.date).toISOString());

            Object.entries(screenshots).forEach(([key, file]) => {
                const fieldName = key === '4H' ? 'highTimeFrameImage' : key === '15M' ? 'mediumTimeFrameImage' : 'lowTimeFrameImage';

                if (file instanceof File) {
                    formData.append(fieldName, file, file.name || `${key}.png`);
                    return;
                }

                if (id && file === null && existingScreenshots[key]) {
                    formData.append(fieldName, '');
                }
            });

            if (id) {
                await updateJournal(id, formData);
            } else {
                await createJournal(formData);
            }
            toast.success(id ? 'Journal updated successfully.' : 'Journal created successfully.');
            navigate('/journal');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not save journal entry.');
        }
    };

    if (loading && id) {
        return <LoadingState label="Loading journal…" />;
    }

    const selectedDate = searchParams.get('date');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-400">{id ? 'Edit' : 'Create'} journal</div>
                    <h2 className="text-2xl font-bold text-white">{id ? 'Trade details' : 'New trade journal'}</h2>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(`/journal${selectedDate ? `?date=${selectedDate}` : ''}`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                    <div className="mb-4 flex items-center gap-2 text-white"><Target className="h-4 w-4 text-blue-300" /> <span className="font-semibold">Trade details</span></div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <SelectField label="Trading pair" value={form.asset} onChange={(value) => updateField('asset', value)} options={defaultPairs} />
                        <SelectField label="Direction" value={form.type} onChange={(value) => updateField('type', value)} options={['LONG', 'SHORT']} />
                        <InputField label="Entry price" type="number" value={form.entryPrice} onChange={(value) => updateField('entryPrice', value)} />
                        <InputField label="Exit price" type="number" value={form.exitPrice} onChange={(value) => updateField('exitPrice', value)} />
                        <InputField label="Stop loss" type="number" value={form.stopLoss} onChange={(value) => updateField('stopLoss', value)} />
                        <InputField label="Take profit" type="number" value={form.takeProfit} onChange={(value) => updateField('takeProfit', value)} />
                        <InputField label="Risk" type="number" value={form.risk} onChange={(value) => updateField('risk', value)} />
                        <InputField label="Lot size" type="number" value={form.lotSize} onChange={(value) => updateField('lotSize', value)} />
                        <InputField label="PnL" type="number" value={form.pnl} onChange={(value) => updateField('pnl', value)} />
                        <SelectField label="Trade result" value={form.result} onChange={(value) => updateField('result', value)} options={['Win', 'Loss', 'Break Even']} />
                        <SelectField label="Before trade mood" value={form.beforeMood} onChange={(value) => updateField('beforeMood', value)} options={moodValues} />
                        <SelectField label="After trade mood" value={form.afterMood} onChange={(value) => updateField('afterMood', value)} options={moodValues} />
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Trading plan</label>
                            <select value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none">
                                <option value="">General setup</option>
                                {plans.map((plan) => <option key={plan._id || plan.id} value={plan._id || plan.id}>{plan.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Date</label>
                            <input type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                    <div className="mb-4 flex items-center gap-2 text-white"><FileText className="h-4 w-4 text-blue-300" /> <span className="font-semibold">Journal notes</span></div>
                    <div className="space-y-4">
                        <VoiceInput
                            label="Trade notes"
                            value={form.notes}
                            onChange={(value) => updateField('notes', value)}
                            placeholder="Describe the setup, execution, and market context…"
                            rows={5}
                        />
                        <VoiceInput
                            label="Lessons learned"
                            value={form.lesson}
                            onChange={(value) => updateField('lesson', value)}
                            placeholder="Lesson learned / takeaway…"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
                    <div className="mb-4 flex items-center gap-2 text-white"><ImagePlus className="h-4 w-4 text-blue-300" /> <span className="font-semibold">Chart screenshots</span></div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <ImageUploadField label="4H" value={screenshots['4H']} onChange={(file) => setScreenshots((previous) => ({ ...previous, '4H': file }))} onRemove={() => setScreenshots((previous) => ({ ...previous, '4H': null }))} />
                        <ImageUploadField label="15M" value={screenshots['15M']} onChange={(file) => setScreenshots((previous) => ({ ...previous, '15M': file }))} onRemove={() => setScreenshots((previous) => ({ ...previous, '15M': null }))} />
                        <ImageUploadField label="5M" value={screenshots['5M']} onChange={(file) => setScreenshots((previous) => ({ ...previous, '5M': file }))} onRemove={() => setScreenshots((previous) => ({ ...previous, '5M': null }))} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    {id && (
                        <button type="button" onClick={async () => {
                            const result = await Swal.fire({ title: 'Delete this journal?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', cancelButtonColor: '#334155', confirmButtonText: 'Delete' });
                            if (result.isConfirmed) {
                                await deleteJournal(id);
                                toast.success('Journal deleted');
                                navigate('/journal');
                            }
                        }} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300">
                            Delete
                        </button>
                    )}
                    <button type="submit" className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-400">Save journal</button>
                </div>
            </form>
        </div>
    );
}
