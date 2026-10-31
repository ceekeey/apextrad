import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getProfile, updateProfile } from '../api/auth.api';
import InputField from '../components/common/InputField';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
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
