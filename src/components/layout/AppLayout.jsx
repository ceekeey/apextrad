import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart3, BriefcaseBusiness, CalendarDays, LayoutDashboard, LogOut, Menu, Settings, TrendingUp, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trades', label: 'Trades', icon: CalendarDays },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/plans', label: 'Trading Plans', icon: BriefcaseBusiness },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
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
