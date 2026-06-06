import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register }            = useAuth();
  const navigate                = useNavigate();
  const [form, setForm]         = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data;
      setError(msg?.username?.[0] || msg?.email?.[0] || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapStyle = {
    display: 'flex', alignItems: 'center',
    borderRadius: '12px', overflow: 'hidden',
    background: '#050510', border: '1px solid rgba(255,255,255,0.1)',
    transition: 'border-color 0.3s ease',
  };

  const inputProps = {
    className: "flex-1 bg-transparent py-3 pr-4 text-white text-sm focus:outline-none focus:ring-0 border-none",
    style: {
      fontFamily: 'Inter, sans-serif',
      WebkitBoxShadow: '0 0 0px 1000px #050510 inset',
      WebkitTextFillColor: '#dce2f7',
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: '#0c1322' }}>

      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: '#7C5CFF', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }} />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: '#4F8CFF', filter: 'blur(100px)', opacity: 0.08, zIndex: 0 }} />

      <main className="w-full relative z-10" style={{ maxWidth: '440px' }}>
        <div className="rounded-3xl flex flex-col"
          style={{ background: 'rgba(11,11,22,0.75)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>

          {/* Header */}
          <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Voize"
                style={{ width: '100px', height: '100px', objectFit: 'contain', mixBlendMode: 'screen' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0"
                style={{ background: '#cabeff', display: 'none' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="#31009a"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="8"  y1="23" x2="16" y2="23" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2"
              style={{ color: '#cabeff', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
              Voize
            </h1>
            <p className="text-sm" style={{ color: '#8a85a0', fontFamily: 'Inter, sans-serif' }}>
              Create your account to start generating.
            </p>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

          <div className="px-8 py-7 flex flex-col gap-5">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(255,70,70,0.08)', border: '1px solid rgba(255,70,70,0.2)', color: '#ffb4ab', fontFamily: 'Inter, sans-serif' }}>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Username</label>
                <div style={inputWrapStyle}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#7C5CFF'}
                  onBlurCapture={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <span className="pl-4 pr-2 flex-shrink-0" style={{ color: '#938ea1' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input name="username" value={form.username} onChange={handle} required
                    placeholder="your_username" {...inputProps} />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Email Address</label>
                <div style={inputWrapStyle}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#7C5CFF'}
                  onBlurCapture={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <span className="pl-4 pr-2 flex-shrink-0" style={{ color: '#938ea1' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input name="email" type="email" value={form.email} onChange={handle} required
                    placeholder="you@example.com" {...inputProps} />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Password</label>
                <div style={inputWrapStyle}
                  onFocusCapture={e => e.currentTarget.style.borderColor = '#7C5CFF'}
                  onBlurCapture={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <span className="pl-4 pr-2 flex-shrink-0" style={{ color: '#938ea1' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle} required
                    placeholder="Min. 6 characters"
                    className="flex-1 bg-transparent py-3 text-white text-sm focus:outline-none focus:ring-0 border-none"
                    style={{ fontFamily: 'Inter, sans-serif',
                      WebkitBoxShadow: '0 0 0px 1000px #050510 inset',
                      WebkitTextFillColor: '#dce2f7' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="pr-4 pl-2 flex-shrink-0 transition-colors" style={{ color: '#938ea1' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dce2f7'}
                    onMouseLeave={e => e.currentTarget.style.color = '#938ea1'}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group mt-1"
                style={{ background: 'linear-gradient(135deg, #7C5CFF 0%, #4F8CFF 100%)', color: '#fff',
                  boxShadow: '0 0 15px rgba(124,92,255,0.35)', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(124,92,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(124,92,255,0.35)'; }}>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading
                    ? <><Loader size={15} className="animate-spin" /><span>Creating account...</span></>
                    : <><span>Sign Up</span><ArrowRight size={15} /></>}
                </span>
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(72,69,85,0.4)' }} />
              <span className="text-[11px] uppercase tracking-widest"
                style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>Or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(72,69,85,0.4)' }} />
            </div>

            <div className="flex gap-3">
              {[
                { label: 'Google', icon: (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )},
                { label: 'Apple', icon: (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#dce2f7">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.92 3.78 2.29-3.95 2.33-3.31 7.34.45 8.91-1.03 2.71-2.43 4.88-4.88 5.76V20.28z"/>
                    <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.5-3.74 4.25z"/>
                  </svg>
                )},
              ].map(({ label, icon }) => (
                <button key={label} type="button"
                  className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#dce2f7', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-5"
          style={{ color: '#938ea1', fontFamily: 'Inter, sans-serif' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-colors"
            style={{ color: '#cabeff' }}
            onMouseEnter={e => e.target.style.color = '#e6deff'}
            onMouseLeave={e => e.target.style.color = '#cabeff'}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}