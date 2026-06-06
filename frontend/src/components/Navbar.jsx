import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, LogOut, Settings, X, Eye, EyeOff, Loader, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TOP_LINKS = ['Explore', 'Studio', 'Pricing', 'Community'];

const FEATURE_TABS = [
  { id: 'tts',       label: 'Text → Speech'    },
  { id: 'stt',       label: 'Speech → Text'    },
  { id: 'translate', label: 'Translate & Speak' },
  { id: 'history',   label: 'History'           },
];

function SettingsModal({ onClose, currentUser }) {
  const [form, setForm]         = useState({ username: currentUser || '', email: '', bio: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/stats/').then(({ data }) => {
      setForm(f => ({
        ...f,
        username: data.username || currentUser || '',
        email:    data.email    || '',
      }));
    }).catch(() => {});
  }, []);

  const save = async () => {
    if (form.password && form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { username: form.username, email: form.email };
      if (form.bio)      payload.bio      = form.bio;
      if (form.password) payload.password = form.password;
      await api.put('/profile/update/', payload);
      if (form.username) localStorage.setItem('voize_user', form.username);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Try again.');
    } finally { setSaving(false); }
  };

  const inputStyle = {
    background: 'rgba(5,5,16,0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontFamily: 'Inter, sans-serif',
    WebkitBoxShadow: '0 0 0px 1000px rgba(5,5,16,0.9) inset',
    WebkitTextFillColor: '#dce2f7',
    color: '#dce2f7',
    width: '100%',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full rounded-2xl overflow-hidden my-auto"
        style={{ maxWidth: '760px', background: 'rgba(14,20,36,0.98)',
          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-base font-bold text-white"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Edit Profile</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#938ea1', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col items-center justify-center gap-4 p-8 md:w-64 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
              style={{ background: 'linear-gradient(135deg,#947dff,#603ce2)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
              {(form.username || currentUser || '?')[0].toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {form.username || currentUser}
              </p>
              <p className="text-xs mt-1" style={{ color: '#938ea1' }}>Voize Member</p>
            </div>
            <div className="w-full p-3 rounded-xl text-center"
              style={{ background: 'rgba(202,190,255,0.05)', border: '1px solid rgba(202,190,255,0.1)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>
                Username or password changes apply on next login
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }} />

          <div className="flex-1 p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="your_username" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#cabeff'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  type="email" placeholder="you@email.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#cabeff'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..." rows={3}
                className="w-full resize-none focus:outline-none transition-all"
                style={{ background: 'rgba(5,5,16,0.9)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', padding: '10px 16px', fontSize: '14px',
                  color: '#dce2f7', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#cabeff'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>New Password</label>
              <div className="relative">
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  type={showPass ? 'text' : 'password'} placeholder="Leave blank to keep current"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = '#cabeff'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#938ea1' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dce2f7'}
                  onMouseLeave={e => e.currentTarget.style.color = '#938ea1'}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {form.password && (
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2"
                  style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>Confirm Password</label>
                <input value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  type={showPass ? 'text' : 'password'} placeholder="Repeat new password"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#cabeff'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            )}

            {error && <p className="text-red-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>}

            <button onClick={save} disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: success ? '#4ade80' : '#cabeff', color: success ? '#052e16' : '#31009a',
                boxShadow: '0 0 20px rgba(202,190,255,0.2)', fontFamily: 'Inter, sans-serif' }}>
              {saving   ? <><Loader size={14} className="animate-spin" /><span>Saving...</span></>
              : success  ? <><Check size={14} /><span>Saved!</span></>
              :             <span>Save Changes</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout }            = useAuth();
  const navigate                    = useNavigate();
  const [dropdownOpen, setDropdown] = useState(false);
  const [showSettings, setSettings] = useState(false);
  const [stats, setStats]           = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (dropdownOpen && !stats)
      api.get('/stats/').then(({ data }) => setStats(data)).catch(() => {});
  }, [dropdownOpen]);

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(10,16,30,0.92)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

        {/* ── Row 1: Marketing Nav ── */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 h-16 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1 flex-shrink-0 group"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src="/logo.png" alt="Voize"
              className="object-contain transition-opacity duration-200 group-hover:opacity-80"
              style={{ width: '42px', height: '42px', mixBlendMode: 'screen' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="w-8 h-8 rounded-lg items-center justify-center flex-shrink-0"
              style={{ background: '#cabeff', display: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="#31009a"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="8"  y1="23" x2="16" y2="23" stroke="#31009a" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[22px] font-bold transition-colors duration-200 group-hover:text-[#e6deff]"
              style={{ color: '#cabeff', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
              Voize
            </span>
          </button>

          {/* Desktop center links — with Coming soon tooltip */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {TOP_LINKS.map(link => (
              <div key={link} className="relative group">
                <span className="text-[13px] font-medium tracking-wide select-none"
                  style={{ color: '#8a85a0', fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.01em', cursor: 'default' }}>
                  {link}
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'rgba(14,20,36,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#938ea1', fontFamily: 'Geist, monospace', zIndex: 99 }}>
                  Coming soon
                </div>
              </div>
            ))}
          </nav>

          {/* Right: profile + hamburger */}
          <div className="flex items-center gap-2">

            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdown(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: dropdownOpen ? 'rgba(202,190,255,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${dropdownOpen ? 'rgba(202,190,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#947dff,#603ce2)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                  {(user || '?')[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-[13px] font-medium"
                  style={{ color: '#dce2f7', fontFamily: 'Inter, sans-serif' }}>{user}</span>
                <ChevronDown size={13}
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: '#938ea1' }} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-[100]"
                  style={{ background: 'rgba(14,20,36,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)' }}>

                  <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#947dff,#603ce2)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                        {(user || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate"
                          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>{user}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: '#938ea1' }}>
                          {stats?.email || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[11px] uppercase tracking-[0.12em] mb-3"
                      style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>Usage Stats</p>
                    {stats ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {[
                            { label: 'Total',     value: stats.total     },
                            { label: 'Today',     value: stats.today     },
                            { label: 'This Week', value: stats.this_week },
                          ].map(s => (
                            <div key={s.label} className="text-center py-2.5 rounded-xl"
                              style={{ background: 'rgba(202,190,255,0.04)', border: '1px solid rgba(202,190,255,0.08)' }}>
                              <p className="text-xl font-bold leading-none mb-1"
                                style={{ color: '#cabeff', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                {s.value}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider"
                                style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>{s.label}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 text-center py-1.5 rounded-lg text-xs"
                            style={{ background: 'rgba(202,190,255,0.05)', color: '#cabeff', fontFamily: 'Geist, monospace' }}>
                            🔊 {stats.tts} TTS
                          </div>
                          <div className="flex-1 text-center py-1.5 rounded-lg text-xs"
                            style={{ background: 'rgba(175,198,255,0.05)', color: '#afc6ff', fontFamily: 'Geist, monospace' }}>
                            🎤 {stats.stt} STT
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#484555' }}>
                        <Loader size={11} className="animate-spin" />
                        <span style={{ fontFamily: 'Geist, monospace' }}>Loading stats...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    {[
                      { label: 'Settings & Profile', icon: Settings, action: () => { setSettings(true); setDropdown(false); }, color: '#c9c4d8' },
                      { label: 'Log Out',            icon: LogOut,   action: logout,                                          color: '#ffb4ab' },
                    ].map(({ label, icon: Icon, action, color }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
                        style={{ color, fontFamily: 'Inter, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.background = color === '#ffb4ab' ? 'rgba(255,70,70,0.08)' : 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Icon size={14} style={{ color, opacity: 0.7 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 ml-1"
              style={{ color: '#c9c4d8' }}>
              <span className={`block h-0.5 bg-current rounded transition-all origin-center ${mobileMenu ? 'rotate-45 translate-y-2' : 'w-5'}`} />
              <span className={`block h-0.5 bg-current rounded transition-all ${mobileMenu ? 'opacity-0 w-3' : 'w-4'}`} />
              <span className={`block h-0.5 bg-current rounded transition-all origin-center ${mobileMenu ? '-rotate-45 -translate-y-2' : 'w-5'}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile menu: top links + feature tabs ── */}
        {mobileMenu && (
          <div className="md:hidden flex flex-col"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,16,30,0.98)' }}>

            {/* Top links with "Soon" badge */}
            <div className="px-5 py-2 flex flex-col">
              {TOP_LINKS.map(link => (
                <div key={link}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'default' }}>
                  <span className="text-sm font-medium select-none"
                    style={{ color: '#8a85a0', fontFamily: 'Inter, sans-serif' }}>
                    {link}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: 'rgba(202,190,255,0.06)', color: '#484555', fontFamily: 'Geist, monospace' }}>
                    Soon
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 20px' }} />

            {/* Feature tabs */}
            <div className="px-5 py-3 grid grid-cols-2 gap-2">
              {FEATURE_TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenu(false); }}
                  className="py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
                  style={{
                    background:    activeTab === tab.id ? '#cabeff'             : 'rgba(255,255,255,0.04)',
                    color:         activeTab === tab.id ? '#31009a'             : '#8a85a0',
                    fontFamily:    'Inter, sans-serif',
                    letterSpacing: '0.02em',
                    border:        `1px solid ${activeTab === tab.id ? 'rgba(202,190,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow:     activeTab === tab.id ? '0 0 12px rgba(202,190,255,0.2)' : 'none',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Row 2: Feature Nav — desktop only ── */}
        <div className="hidden md:block"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7,12,24,0.7)' }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="flex justify-center py-2.5">
              <div className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {FEATURE_TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-1.5 rounded-lg text-[13px] font-medium tracking-wide transition-all duration-200"
                    style={{
                      background:    activeTab === tab.id ? '#cabeff'    : 'transparent',
                      color:         activeTab === tab.id ? '#31009a'    : '#8a85a0',
                      fontFamily:    'Inter, sans-serif',
                      letterSpacing: '0.005em',
                      boxShadow:     activeTab === tab.id ? '0 0 14px rgba(202,190,255,0.25)' : 'none',
                    }}
                    onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#dce2f7'; }}
                    onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#8a85a0'; }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setSettings(false)} currentUser={user} />}
    </>
  );
}