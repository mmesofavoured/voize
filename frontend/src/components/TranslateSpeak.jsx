import { useState, useRef, useEffect } from 'react';
import { Loader, Play, Pause, Download, Share2, Copy, Check } from 'lucide-react';
import api from '../api/axios';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

const LANGUAGES = [
  { label: '🌐 Auto Detect', code: 'auto'  },
  { label: '🇺🇸 English',    code: 'en'    },
  { label: '🇫🇷 French',     code: 'fr'    },
  { label: '🇪🇸 Spanish',    code: 'es'    },
  { label: '🇩🇪 German',     code: 'de'    },
  { label: '🇵🇹 Portuguese', code: 'pt'    },
  { label: '🇸🇦 Arabic',     code: 'ar'    },
  { label: '🇨🇳 Chinese',    code: 'zh-CN' },
  { label: '🇯🇵 Japanese',   code: 'ja'    },
  { label: '🇰🇷 Korean',     code: 'ko'    },
  { label: '🇷🇺 Russian',    code: 'ru'    },
  { label: '🇮🇹 Italian',    code: 'it'    },
  { label: '🇳🇱 Dutch',      code: 'nl'    },
  { label: '🇮🇳 Hindi',      code: 'hi'    },
  { label: '🇰🇪 Swahili',    code: 'sw'    },
  { label: '🇳🇬 Yoruba',     code: 'yo'    },
  { label: '🇳🇬 Igbo',       code: 'ig'    },
  { label: '🇳🇬 Hausa',      code: 'ha'    },
  { label: '🇿🇦 Afrikaans',  code: 'af'    },
  { label: '🇹🇷 Turkish',    code: 'tr'    },
];

const ACCENTS = [
  { label: '🇺🇸 American',   tld: 'com',    lang: 'en'             },
  { label: '🇬🇧 British',    tld: 'co.uk',  lang: 'en'             },
  { label: '🇳🇬 Nigerian',   tld: 'com.ng', lang: 'en'             },
  { label: '🇦🇺 Australian', tld: 'com.au', lang: 'en'             },
  { label: '🇮🇳 Indian',     tld: 'co.in',  lang: 'en'             },
  { label: '🐢 Slow',        tld: 'com',    lang: 'en', slow: true },
];

function LangDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find(l => l.code === value);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 30 }}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 transition-all duration-200"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span className="text-lg leading-none">{selected?.label.split(' ')[0]}</span>
        <span className="text-white font-semibold text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          {selected?.label.split(' ').slice(1).join(' ')}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#938ea1" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 rounded-xl overflow-hidden"
          style={{
            minWidth: '200px',
            background: 'rgba(14,20,36,0.98)',
            border: '1px solid rgba(202,190,255,0.15)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(24px)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}>
          {options.map(l => (
            <button key={l.code} onClick={() => { onChange(l.code); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-all duration-150"
              style={{
                background:  value === l.code ? 'rgba(202,190,255,0.1)' : 'transparent',
                color:       value === l.code ? '#cabeff' : '#c9c4d8',
                fontFamily:  'Inter, sans-serif',
                borderLeft:  value === l.code ? '2px solid #cabeff' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (value !== l.code) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#dce2f7'; }}}
              onMouseLeave={e => { if (value !== l.code) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9c4d8'; }}}>
              <span className="text-base leading-none flex-shrink-0">{l.label.split(' ')[0]}</span>
              <span className="flex-1">{l.label.split(' ').slice(1).join(' ')}</span>
              {value === l.code && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cabeff" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button onClick={copy} disabled={!text}
      className="flex items-center gap-1.5 text-xs transition-all px-2 py-1 rounded-lg"
      style={{
        color:      copied ? '#4ade80' : '#938ea1',
        background: 'rgba(255,255,255,0.04)',
        border:     '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Geist, monospace',
        opacity:    text ? 1 : 0.3,
        cursor:     text ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (text && !copied) e.currentTarget.style.color = '#dce2f7'; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = '#938ea1'; }}>
      {copied ? <><Check size={11} /><span>Copied!</span></> : <><Copy size={11} /><span>Copy</span></>}
    </button>
  );
}

export default function TranslateSpeak() {
  const [text, setText]             = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [accentIdx, setAccentIdx]   = useState(0);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [switching, setSwitching]   = useState(false);
  const audioRef = useRef(new Audio());

  const switchLangs = () => {
    if (sourceLang === 'auto') return;
    setSwitching(true);
    setTimeout(() => setSwitching(false), 400);
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const convert = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setResult(null); setProgress(0);
    const accent = ACCENTS[accentIdx];
    try {
      const { data } = await api.post('/translate/', {
        text, source_lang: sourceLang, target_lang: targetLang,
        tld: accent.lang === 'en' ? accent.tld : 'com',
        slow: accent.slow || false,
      });
      const url = `${BASE}${data.audio_url}`;
      setResult({ translatedText: data.translated_text, audioUrl: url });
      const audio = audioRef.current;
      audio.src = url;
      audio.ontimeupdate = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
      audio.onended = () => { setPlaying(false); setProgress(0); };
    } catch {
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) { audio.pause(); setPlaying(false); }
    else          { audio.play();  setPlaying(true);  }
  };

  const handleDownload = async () => {
    try {
      const res  = await fetch(result.audioUrl);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'voize-translated.mp3';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch { alert('Download failed.'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Voize Translation', url: result.audioUrl });
    } else {
      const el = document.createElement('textarea');
      el.value = result.audioUrl; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
      alert('Audio link copied!');
    }
  };

  const panelStyle = {
    background:    'rgba(11,11,22,0.7)',
    backdropFilter:'blur(24px)',
    borderTop:     '1px solid rgba(255,255,255,0.1)',
    borderLeft:    '1px solid rgba(255,255,255,0.05)',
    boxShadow:     '0 20px 50px rgba(0,0,0,0.5)',
  };

  return (
    <div className="w-full">

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#cabeff] mb-2 tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
          Translate &amp; Speak
        </h1>
        <p className="text-[#c9c4d8] text-lg max-w-2xl mx-auto">
          Seamlessly convert text across languages and synthesize it into lifelike AI voices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── Source Panel ── */}
        <div className="rounded-xl p-5 flex flex-col min-h-[420px]" style={panelStyle}>
          <div className="flex items-center justify-between mb-4">
            <LangDropdown value={sourceLang} onChange={setSourceLang} options={LANGUAGES} />
            <button onClick={switchLangs} disabled={sourceLang === 'auto'}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 disabled:opacity-30"
              style={{
                background:   'rgba(35,42,58,1)',
                borderColor:  'rgba(255,255,255,0.1)',
                color:        'rgba(255,255,255,0.4)',
                transform:    switching ? 'rotate(180deg)' : 'none',
                transition:   'transform 0.4s ease, border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(202,190,255,0.5)'; e.currentTarget.style.color = '#cabeff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/>
                <path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 rounded-xl flex flex-col"
            style={{ background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type or paste text to translate..."
              className="flex-1 w-full bg-transparent p-4 border-none resize-none text-white placeholder-white/20 focus:outline-none focus:ring-0 text-sm leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif', minHeight: '240px' }}
            />
            <div className="flex items-center justify-between px-4 pb-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs" style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>
                {text.length} / 5000
              </span>
              <CopyBtn text={text} />
            </div>
          </div>
        </div>

        {/* ── Target Panel ── */}
        <div className="rounded-xl p-5 flex flex-col min-h-[420px]" style={panelStyle}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <LangDropdown
              value={targetLang}
              onChange={setTargetLang}
              options={LANGUAGES.filter(l => l.code !== 'auto')} />

            {targetLang === 'en' && (
              <div className="flex flex-wrap gap-1.5">
                {ACCENTS.map((a, i) => (
                  <button key={i} onClick={() => setAccentIdx(i)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all border"
                    style={{
                      background:  accentIdx === i ? 'rgba(202,190,255,0.15)' : 'transparent',
                      color:       accentIdx === i ? '#cabeff' : '#938ea1',
                      borderColor: accentIdx === i ? 'rgba(202,190,255,0.4)' : 'rgba(255,255,255,0.08)',
                      fontFamily:  'Inter, sans-serif',
                    }}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 rounded-xl flex flex-col"
            style={{ background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Translated text */}
            <div className="flex-1 p-4">
              {result ? (
                <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {result.translatedText}
                </p>
              ) : loading ? (
                <div className="flex items-center gap-2 text-[#cabeff] text-sm">
                  <Loader size={14} className="animate-spin" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Translating...</span>
                </div>
              ) : (
                <p className="text-white/20 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Translation will appear here...
                </p>
              )}
            </div>

            {/* Audio controls — always visible when result exists */}
            {result && (
              <div className="p-4 flex flex-col gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Progress bar */}
                <div className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#947dff,#cabeff)' }} />
                </div>

                {/* Play + waveform + actions */}
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay}
                    className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 flex-shrink-0"
                    style={{
                      background: '#cabeff', color: '#31009a',
                      boxShadow: '0 0 16px rgba(202,190,255,0.4)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(202,190,255,0.65)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(202,190,255,0.4)'}>
                    {playing
                      ? <><Pause size={14} /><span>Pause</span></>
                      : <><Play  size={14} /><span>Play</span></>}
                  </button>

                  {/* Waveform */}
                  <div className="flex items-end gap-0.5 h-5 flex-1 overflow-hidden">
                    {[3,6,8,4,7,5,9,3,6,5,8,4,7,3,6,5,4,7,3,6].map((h, i) => (
                      <div key={i} className="w-0.5 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{
                          height:     `${playing ? h * 2 : h * 0.7}px`,
                          background: playing ? '#cabeff' : 'rgba(202,190,255,0.2)',
                          animation:  playing ? `pulse 0.8s infinite ease-in-out alternate` : 'none',
                          animationDelay: `${i * 0.07}s`,
                        }} />
                    ))}
                  </div>

                  {/* Download + Share */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={handleDownload}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c9c4d8', fontFamily: 'Geist, monospace' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#c9c4d8'; }}>
                      <Download size={11} /><span>Save</span>
                    </button>
                    <button onClick={handleShare}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#c9c4d8', fontFamily: 'Geist, monospace' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#c9c4d8'; }}>
                      <Share2 size={11} /><span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer with copy */}
            <div className="flex items-center justify-between px-4 pb-3"
              style={{ borderTop: result ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs" style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>
                {result ? `${result.translatedText.length} chars` : ''}
              </span>
              <CopyBtn text={result?.translatedText || ''} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs" style={{ color: '#484555', fontFamily: 'Geist, monospace' }}>
          {text.length} characters
        </span>
        <button onClick={convert} disabled={loading || !text.trim()}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: loading || !text.trim() ? 'rgba(202,190,255,0.2)' : '#cabeff',
            color: '#31009a',
            boxShadow: loading || !text.trim() ? 'none' : '0 0 16px rgba(202,190,255,0.4)',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { if (!loading && text.trim()) e.currentTarget.style.boxShadow = '0 0 24px rgba(202,190,255,0.6)'; }}
          onMouseLeave={e => { if (!loading && text.trim()) e.currentTarget.style.boxShadow = '0 0 16px rgba(202,190,255,0.4)'; }}>
          {loading
            ? <><Loader size={14} className="animate-spin" /><span>Translating...</span></>
            : <span>Translate &amp; Speak</span>}
        </button>
      </div>
    </div>
  );
}