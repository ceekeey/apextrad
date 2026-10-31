import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import AppLayout from '../components/layout/AppLayout';
import LoadingState from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Trades from '../pages/Trades';
import Journal from '../pages/Journal';
import JournalForm from '../pages/JournalForm';
import JournalDetail from '../pages/JournalDetail';
import Analytics from '../pages/Analytics';
import Plans from '../pages/Plans';
import PlanDetail from '../pages/PlanDetail';
import Settings from '../pages/Settings';
import About from '../pages/About';

export default function AppRoutes() {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-glow">
                    <LoadingState label="Loading Apex Trade…" />
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/new" element={<JournalForm />} />
                <Route path="/journal/:id/edit" element={<JournalForm />} />
                <Route path="/journal/:id" element={<JournalDetail />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/plans/:id" element={<PlanDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
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
