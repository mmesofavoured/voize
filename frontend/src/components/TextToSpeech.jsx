import { useState, useRef } from 'react';
import { Loader, Play, Pause, Download, Share2 } from 'lucide-react';
import api from '../api/axios';

const BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

const VOICES = [
  { label: '🇺🇸 American English', desc: 'Clear, Neutral, Standard', lang: 'en', tld: 'com',    slow: false },
  { label: '🇬🇧 British English',   desc: 'Refined, Crisp, Formal',   lang: 'en', tld: 'co.uk',  slow: false },
  { label: '🇳🇬 Nigerian English',  desc: 'Warm, Vibrant, Local',     lang: 'en', tld: 'com.ng', slow: false },
  { label: '🐢 Slow & Clear',       desc: 'Calm, Measured, Precise',  lang: 'en', tld: 'com',    slow: true  },
  { label: '🇫🇷 French',            desc: 'Elegant, Smooth, Rich',    lang: 'fr', tld: 'fr',     slow: false },
  { label: '🇪🇸 Spanish',           desc: 'Expressive, Bold, Warm',   lang: 'es', tld: 'es',     slow: false },
  { label: '🇩🇪 German',            desc: 'Strong, Clear, Direct',    lang: 'de', tld: 'de',     slow: false },
  { label: '🇳🇬 Yoruba',            desc: 'Cultural, Rich, Local',    lang: 'yo', tld: 'com',    slow: false },
  { label: '🇳🇬 Hausa',             desc: 'Northern, Warm, Distinct', lang: 'ha', tld: 'com',    slow: false },
  { label: '🇳🇬 Igbo',              desc: 'Eastern, Clear, Vibrant',  lang: 'ig', tld: 'com',    slow: false },
];

export default function TextToSpeech() {
  const [text, setText]         = useState('');
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState('');
  const audioRef = useRef(new Audio());

  const convert = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(''); setAudioUrl(''); setProgress(0);
    const voice = VOICES[voiceIdx];
    try {
      const { data } = await api.post('/tts/', {
        text, lang: voice.lang, tld: voice.tld, slow: voice.slow,
      });
      const url = `${BASE}${data.audio_url}`;
      setAudioUrl(url);
      const audio = audioRef.current;
      audio.src = url;
      audio.ontimeupdate = () =>
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
      audio.onended = () => { setPlaying(false); setProgress(0); };
    } catch {
      setError('Conversion failed. Please try again.');
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
      const res  = await fetch(audioUrl);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'voize-audio.mp3';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert('Download failed. Please try again.'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Voize Audio', url: audioUrl });
    } else {
      const el = document.createElement('textarea');
      el.value = audioUrl; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      alert('Audio link copied to clipboard!');
    }
  };

  return (
    <div className="w-full">

      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#cabeff] mb-2 tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}>
          Text to Speech
        </h1>
        <p className="text-[#c9c4d8] text-lg max-w-2xl mx-auto">
          Transform your text into lifelike speech using cinematic AI voices. Select a voice profile and type your script below.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Voice Selection — Left Column */}
        <div className="lg:col-span-4">
          <div className="rounded-xl p-6 flex flex-col gap-4 h-full"
            style={{
              background: 'rgba(11,11,22,0.7)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Voice Profiles
              </h2>
              <span className="text-white/30 text-xs uppercase tracking-wider">Select one</span>
            </div>

            {/* Voice Cards */}
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: '480px' }}>
              {VOICES.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVoiceIdx(i)}
                  className="flex items-center justify-between p-4 rounded-lg border text-left w-full transition-all duration-300 group"
                  style={{
                    background: voiceIdx === i
                      ? 'rgba(124,92,255,0.15)'
                      : 'rgba(11,11,22,0.5)',
                    borderColor: voiceIdx === i
                      ? 'rgba(124,92,255,0.8)'
                      : 'rgba(255,255,255,0.05)',
                    boxShadow: voiceIdx === i
                      ? '0 0 20px rgba(124,92,255,0.2) inset'
                      : 'none',
                    transform: voiceIdx === i ? 'translateY(-2px)' : 'none',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0"
                      style={{
                        background: voiceIdx === i ? 'rgba(202,190,255,0.1)' : 'rgba(50,57,73,1)',
                        borderColor: voiceIdx === i ? 'rgba(202,190,255,0.3)' : 'rgba(255,255,255,0.05)',
                      }}>
                      <span className="text-lg leading-none">{v.label.split(' ')[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold"
                        style={{ color: voiceIdx === i ? '#cabeff' : '#dce2f7', fontFamily: 'Inter, sans-serif' }}>
                        {v.label.split(' ').slice(1).join(' ')}
                      </p>
                      <p className="text-xs text-white/40">{v.desc}</p>
                    </div>
                  </div>
                  {voiceIdx === i && (
                    <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
                      {[3,5,4,6,3,5].map((h, j) => (
                        <div key={j} className="w-0.5 rounded-full"
                          style={{
                            height: `${h * 3}px`,
                            background: '#cabeff',
                            animation: 'pulse 0.8s infinite ease-in-out alternate',
                            animationDelay: `${j * 0.1}s`,
                          }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor — Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Textarea Container */}
          <div className="rounded-xl p-6 flex flex-col"
            style={{
              background: 'rgba(11,11,22,0.7)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              minHeight: '380px',
            }}>

            {/* Editor header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/50"
                  style={{ background: 'rgba(50,57,73,1)', fontFamily: 'Geist, monospace' }}>
                  {VOICES[voiceIdx].label.split(' ').slice(1).join(' ')}
                </span>
                <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/50"
                  style={{ background: 'rgba(50,57,73,1)', fontFamily: 'Geist, monospace' }}>
                  {VOICES[voiceIdx].slow ? 'Slow' : 'Standard'}
                </span>
              </div>
              <button
                onClick={() => setText('')}
                className="text-white/30 hover:text-white/70 transition text-xs">
                Clear
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter your script here to generate lifelike speech..."
              className="flex-1 w-full bg-transparent border-none resize-none text-white placeholder-white/20 focus:outline-none focus:ring-0 text-base leading-relaxed"
              style={{ minHeight: '220px', fontFamily: 'Inter, sans-serif' }}
            />

            {/* Editor footer */}
            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
              <span className="text-xs text-white/30" style={{ fontFamily: 'Geist, monospace' }}>
                <span className="text-[#cabeff]">{text.length}</span> / 5000 characters
              </span>

              <button
                onClick={convert}
                disabled={loading || !text.trim()}
                className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{
                  background: '#cabeff',
                  color: '#31009a',
                  boxShadow: loading || !text.trim() ? 'none' : '0 0 16px rgba(202,190,255,0.4)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                <span className="relative z-10 flex items-center gap-2">
                  {loading
                    ? <><Loader size={15} className="animate-spin" /><span>Generating...</span></>
                    : <span className='text-xs'>Generate Audio</span>}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-red-400 text-sm border border-red-500/20"
              style={{ background: 'rgba(255,70,70,0.08)' }}>
              {error}
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div className="rounded-xl p-5"
              style={{
                background: 'rgba(202,190,255,0.05)',
                border: '1px solid rgba(202,190,255,0.2)',
                backdropFilter: 'blur(24px)',
              }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3"
                style={{ color: '#cabeff', fontFamily: 'Geist, monospace' }}>
                Audio Ready — {VOICES[voiceIdx].label.split(' ').slice(1).join(' ')}
              </p>

              {/* Progress bar */}
              <div className="h-1 rounded-full overflow-hidden mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(to right, #cabeff, #947dff)' }} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    background: '#cabeff',
                    color: '#31009a',
                    boxShadow: '0 0 16px rgba(202,190,255,0.4)',
                  }}>
                  {playing
                    ? <Pause size={17} />
                    : <Play  size={17} className="ml-0.5" />}
                </button>

                <div className="flex-1">
                  <p className="text-white text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {playing ? 'Playing...' : 'Click to play'}
                  </p>
                  <p className="text-white/30 text-xs">{VOICES[voiceIdx].desc}</p>
                </div>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                  style={{ background: 'rgba(35,42,58,0.8)' }}>
                  <Download size={13} /><span>Download</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all border border-white/10 hover:border-white/30 text-white/60 hover:text-white"
                  style={{ background: 'rgba(35,42,58,0.8)' }}>
                  <Share2 size={13} /><span>Share</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}