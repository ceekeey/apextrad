import { useState } from 'react';
import { Loader2, ShieldCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error('Email and password are required.');
            return;
        }

        setLoading(true);
        const success = await login(email.trim(), password);
        setLoading(false);

        if (success) {
            toast.success('Welcome back to Apex Trade');
            navigate('/dashboard');
        } else {
            toast.error('Invalid email or password.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-glow">
                <div className="border-b border-slate-800 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Apex Trade</h1>
                    <p className="mt-2 text-sm text-slate-400">Master your mindset. Track your execution.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Email</label>
                        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="john@example.com" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
                    </div>

                    <div>
                        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Password</label>
                        <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3">
                            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-transparent px-2 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none" />
                            <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-2 text-xs text-blue-300">{showPassword ? 'Hide' : 'Show'}</button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="text-center text-sm text-slate-400">
                        Need an account?{' '}
                        <button type="button" onClick={() => navigate('/register')} className="font-medium text-blue-300">Create one</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
