import { useState } from 'react';
import { CheckCircle2, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import type { UserProfile } from '../types.ts';

interface ProfilePageProps {
  user: UserProfile | null;
  onUpdateProfile: (name: string, phone: string) => Promise<void>;
  onLogout: () => void;
  onRequireAuth: () => void;
}

export function ProfilePage({ user, onUpdateProfile, onLogout, onRequireAuth }: ProfilePageProps) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Protected Profile</h1>
        <p className="text-sm text-slate-400">Please sign in to view and manage your account profile.</p>
        <button
          type="button"
          onClick={onRequireAuth}
          className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(null);
    setErrorMsg(null);
    if (name.trim().length < 2) {
      setErrorMsg('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile(name.trim(), phone.trim());
      setSavedMsg('Profile details updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your personal details and session</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="bg-[#0E1525] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 pb-5 border-b border-white/10">
          <div className="w-14 h-14 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            {user.role === 'admin' ? <ShieldCheck className="w-7 h-7" /> : <User className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{user.name}</div>
            <div className="text-xs text-slate-400">
              {user.role === 'admin' ? 'Administrator Account' : 'Customer Account'} · Provider:{' '}
              {user.authProvider === 'firebase' ? 'Firebase Auth' : 'CineVault Server Auth'}
            </div>
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
          <label className="block text-xs font-medium text-slate-300">
            Full Name
            <div className="relative mt-1.5">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </label>

          <label className="block text-xs font-medium text-slate-300">
            Email Address
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#060913]/60 border border-white/5 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </label>

          <label className="block text-xs font-medium text-slate-300">
            Phone Number
            <div className="relative mt-1.5">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#060913] border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
