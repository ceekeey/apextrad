import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImagePlus,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { getJournals, getJournalById, createJournal, updateJournal, deleteJournal } from './api/journal.api';
import { getPlans, createPlan, deletePlan, getPlanById } from './api/plans.api';
import { getProfile, updateProfile } from './api/auth.api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trades', label: 'Trades', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/plans', label: 'Trading Plans', icon: BriefcaseBusiness },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'XAUUSD', 'ETHUSD'];
const moodValues = ['FOCUSED', 'CONFIDENT', 'CALM', 'UNCERTAIN', 'FEARFUL', 'GREEDY'];

const formatDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currency = (value) => {
  const number = Number(value || 0);
  return `${number >= 0 ? '+' : '-'}$${Math.abs(number).toFixed(2)}`;
};

const getResultBadge = (result) => {
  const normalized = String(result || '').toLowerCase();
  if (normalized.includes('win')) return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  if (normalized.includes('loss')) return 'bg-red-500/15 text-red-300 border border-red-500/30';
  return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-glow">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-sm font-medium">Loading Apex Trade…</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/new" element={<JournalFormPage />} />
        <Route path="/journal/:id" element={<JournalFormPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:id" element={<PlanDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

function PublicRoute() {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function ProtectedRoute() {
  const { token } = useAuth();
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/trades')) return 'Trading Journal';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/journal')) return 'Journal';
    if (path.startsWith('/plans')) return 'Trading Plans';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/about')) return 'About';
    return 'Apex Trade';
  }, [location.pathname]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Log out?',
      text: 'You will be signed out of Apex Trade.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Log out',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
        toast.success('You have been logged out.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-lg">
          <Menu className="h-5 w-5 text-slate-100" />
        </button>
      </div>

      <div className="fixed inset-0 z-30 bg-slate-950/80 lg:hidden" style={{ display: sidebarOpen ? 'block' : 'none' }} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-800 bg-slate-900/95 p-4 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Apex Trade</div>
              <div className="text-[11px] text-slate-400">Trading journal</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">AT</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Performance Edge</div>
              <div className="text-[11px] text-slate-400">Journal every trade</div>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-200 hover:border-red-500/40 hover:text-red-300">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="ml-0 lg:ml-72">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Apex Trade</div>
              <h1 className="mt-1 text-xl font-semibold text-white">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600">
                <Activity className="h-4 w-4 inline-block mr-2" />
                Live
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function LoginPage() {
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

function RegisterPage() {
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

function DashboardPage() {
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

function TradesPage() {
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

function JournalPage() {
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
          {visibleJournals.map((journal) => (
            <div key={journal._id || journal.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">{journal.asset || 'Unknown pair'}</span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getResultBadge(journal.result || (Number(journal.pnl || 0) >= 0 ? 'Win' : 'Loss'))}`}>
                      {journal.result || (Number(journal.pnl || 0) >= 0 ? 'Win' : 'Loss')}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{journal.type || 'LONG'} • {new Date(journal.date || journal.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/journal/${journal._id || journal.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(journal._id || journal.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/15">
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
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No journals found" description={selectedDate ? `There are no trades recorded for ${selectedDate}.` : 'Start by logging your first trade.'} action={{ label: 'Create journal', onClick: () => navigate('/journal/new') }} />
      )}
    </div>
  );
}

function JournalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [screenshots, setScreenshots] = useState({ '4H': null, '15M': null, '5M': null });
  const [existingScreenshots, setExistingScreenshots] = useState({ '4H': null, '15M': null, '5M': null });
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
          '4H': journal?.highTimeFrameImage || journal?.highTimeFrame || null,
          '15M': journal?.mediumTimeFrameImage || journal?.mediumTimeFrame || null,
          '5M': journal?.lowTimeFrameImage || journal?.lowTimeFrame || null,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">{id ? 'Edit' : 'Create'} journal</div>
          <h2 className="text-2xl font-bold text-white">{id ? 'Trade details' : 'New trade journal'}</h2>
        </div>
        <button onClick={() => navigate('/journal')} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600">
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
            <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows="5" placeholder="Describe the setup, execution, and market context…" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
            <textarea value={form.lesson} onChange={(event) => updateField('lesson', event.target.value)} rows="3" placeholder="Lesson learned / takeaway…" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
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

function AnalyticsPage() {
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

function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans();
  }, []);

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

function PlanDetailPage() {
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

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', currentPassword: '', newPassword: '' });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const data = response?.data || response?.user || response;
        setProfile({
          name: data?.name || '',
          email: data?.email || '',
          bio: data?.bio || '',
          currentPassword: '',
          newPassword: '',
        });
      } catch {
        // silent
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('bio', profile.bio || '');
    if (profile.currentPassword && profile.newPassword) {
      formData.append('currentPassword', profile.currentPassword);
      formData.append('newPassword', profile.newPassword);
    }
    if (avatar) formData.append('avatar', avatar, avatar.name || 'avatar.png');

    try {
      setSaving(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Account</div>
            <h2 className="text-2xl font-bold text-white">Profile settings</h2>
          </div>
          <button onClick={() => navigate('/about')} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-slate-600">About</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/15 text-xl font-bold text-blue-300">{(profile.name || user?.name || 'A').slice(0, 1).toUpperCase()}</div>
          <div className="mt-4 text-xl font-semibold text-white">{profile.name || user?.name || 'Apex Trader'}</div>
          <div className="mt-1 text-sm text-slate-400">{profile.email || user?.email || 'No email available'}</div>
          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            <Camera className="h-4 w-4" /> Upload avatar
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setAvatar(event.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Name" value={profile.name} onChange={(value) => setProfile((previous) => ({ ...previous, name: value }))} />
            <InputField label="Email" type="email" value={profile.email} onChange={(value) => setProfile((previous) => ({ ...previous, email: value }))} />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Bio</label>
            <textarea value={profile.bio} onChange={(event) => setProfile((previous) => ({ ...previous, bio: event.target.value }))} rows="4" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="Tell the market what kind of trader you are…" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InputField label="Current password" type="password" value={profile.currentPassword} onChange={(value) => setProfile((previous) => ({ ...previous, currentPassword: value }))} />
            <InputField label="New password" type="password" value={profile.newPassword} onChange={(value) => setProfile((previous) => ({ ...previous, newPassword: value }))} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={() => { logout(); navigate('/login'); toast.success('Logged out.'); }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-200">Logout</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-glow">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Info className="h-5 w-5" /></div>
          <div>
            <div className="text-sm text-slate-400">About Apex Trade</div>
            <h2 className="text-2xl font-bold text-white">Trading journal</h2>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-7 text-slate-300">
          <p>Apex Trade is a personal trading journal designed to help you document trades, review setups, and improve decision-making over time.</p>
          <p>It stores journal entries, chart screenshots, trading plans, and performance metrics so you can review your execution without losing context.</p>
          <p>All trading results, notes, and analytics are based on the data you record in your account and the connected API.</p>
        </div>
      </div>
    </div>
  );
}

function ImageUploadField({ label, value, onChange, onRemove }) {
  const previewUrl = useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) onChange(acceptedFiles[0]);
    },
  });

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300">
        <span>{label}</span>
        {value && <button type="button" onClick={onRemove} className="text-xs text-red-300">Remove</button>}
      </div>

      <div {...getRootProps()} className={`flex min-h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed p-3 text-center transition ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-950/60'}`}>
        <input {...getInputProps()} />
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="h-28 w-full rounded-lg object-cover" />
        ) : (
          <div className="text-sm text-slate-400">
            <ImagePlus className="mx-auto mb-2 h-6 w-6 text-blue-300" />
            Drop image here
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-32 animate-pulse rounded-3xl border border-slate-800 bg-slate-900" />;
}

function SkeletonCalendar() {
  return <div className="grid grid-cols-7 gap-2">{[...Array(35)].map((_, index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-950/60" />)}</div>;
}

function SkeletonRow() {
  return <div className="h-28 animate-pulse rounded-3xl border border-slate-800 bg-slate-900" />;
}

function StatCard({ label, value, icon, accent }) {
  const accentClasses = {
    blue: 'bg-blue-500/10 text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
    violet: 'bg-violet-500/10 text-violet-300',
    amber: 'bg-amber-500/10 text-amber-300',
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-glow">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accentClasses[accent]}`}>{icon}</div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
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

function InfoChip({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'text-slate-300',
    green: 'text-emerald-300',
    red: 'text-red-300',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={`mt-2 text-sm font-semibold ${toneClasses[tone] || toneClasses.default}`}>{value}</div>
    </div>
  );
}

function EmptyState({ title, description, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center ${compact ? 'min-h-20' : 'min-h-64'}`}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-300"><BarChart3 className="h-5 w-5" /></div>
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 max-w-md text-sm text-slate-400">{description}</div>
      {action && <button onClick={action.onClick} className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">{action.label}</button>}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</label>
      <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80">
      <div className="flex items-center gap-3 text-slate-200">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export default App;
