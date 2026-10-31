import { useState } from 'react';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim()) return toast.error('Please enter your full name.');
        if (!email.trim()) return toast.error('Please enter your email address.');
        if (password.length < 6) return toast.error('Password must be at least 6 characters long.');
        if (password !== confirmPassword) return toast.error('Passwords do not match.');

        setLoading(true);
        const success = await register(name.trim(), email.trim(), password);
        setLoading(false);

        if (success) {
            toast.success('Account created successfully');
            navigate('/dashboard');
        } else {
            toast.error('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-glow">
                <div className="border-b border-slate-800 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Apex Account</h1>
                    <p className="mt-2 text-sm text-slate-400">Start tracking your trades and building your edge.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Full Name</label>
                        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Email</label>
                        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="john@example.com" />
                    </div>
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Password</label>
                        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Confirm Password</label>
                        <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>

                    <div className="text-center text-sm text-slate-400">
                        Already have an account? <button type="button" onClick={() => navigate('/login')} className="font-medium text-blue-300">Log in</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
