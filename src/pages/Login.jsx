import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.full_name.trim()) { setError('Full name is required'); setLoading(false); return; }
        await register(form.email, form.password, form.full_name);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Panic Ring</h1>
          <p className="text-[#555] text-sm mt-1">Personal safety, always on</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1 mb-6">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-red-600 text-white' : 'text-[#666] hover:text-white'}`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <Field label="Full Name" type="text" value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
          )}
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 focus-within:border-red-500/40 transition-colors">
            <label className="text-[10px] uppercase tracking-widest text-[#555] block mb-1.5">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                required
                minLength={6}
                className="flex-1 bg-transparent text-white placeholder-[#333] focus:outline-none text-sm"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-[#555] hover:text-white transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[#444] text-xs mt-6">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-[#666] underline">Terms & Conditions</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-[#666] underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 focus-within:border-red-500/40 transition-colors">
      <label className="text-[10px] uppercase tracking-widest text-[#555] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-transparent text-white placeholder-[#333] focus:outline-none text-sm"
      />
    </div>
  );
}
