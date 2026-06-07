import { useState, useRef } from 'react';
import { Loader, Copy, Check, AlertCircle, Globe } from 'lucide-react';
import api from '../api/axios';
// At the top of SpeechToText.jsx add:
const LANGUAGES = [
  { label: '🇺🇸 English (US)',       code: 'en-US' },
  { label: '🇬🇧 English (UK)',        code: 'en-GB' },
  { label: '🇳🇬 English (Nigerian)',  code: 'en-NG' },
  { label: '🇫🇷 French',             code: 'fr-FR' },
  { label: '🇪🇸 Spanish',            code: 'es-ES' },
  { label: '🇩🇪 German',             code: 'de-DE' },
  { label: '🇮🇹 Italian',            code: 'it-IT' },
  { label: '🇵🇹 Portuguese',         code: 'pt-PT' },
  { label: '🇷🇺 Russian',            code: 'ru-RU' },
  { label: '🇨🇳 Chinese (Mandarin)', code: 'zh-CN' },
  { label: '🇯🇵 Japanese',           code: 'ja-JP' },
  { label: '🇰🇷 Korean',             code: 'ko-KR' },
  { label: '🇸🇦 Arabic',             code: 'ar-SA' },
  { label: '🇮🇳 Hindi',              code: 'hi-IN' },
  { label: '🇹🇷 Turkish',            code: 'tr-TR' },
  { label: '🇳🇱 Dutch',              code: 'nl-NL' },
  { label: '🇰🇪 Swahili',            code: 'sw-KE' },
  { label: '🇮🇩 Indonesian',         code: 'id-ID' },
  { label: '🇻🇳 Vietnamese',         code: 'vi-VN' },
  { label: '🇬🇷 Greek',              code: 'el-GR' },
];

const WAVEFORM_HEIGHTS = [20,45,70,35,80,50,65,25,55,40,75,30,60,45,85,20,50,65,35,70,40,55,25,60,80,30,45,70,35,50,65,20];

export default function SpeechToText() {
  const [recording, setRecording]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage]     = useState('en-US');
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState('');
  const [timer, setTimer]           = useState(0);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const fileRef   = useRef(null);
  const timerRef  = useRef(null);
  const langRef   = useRef(language); // ✅ always current language

  // Keep ref in sync
  const handleLangChange = (val) => {
    setLanguage(val);
    langRef.current = val;
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Microphone not available. Your browser requires HTTPS for microphone access on non-localhost addresses. Please use the file upload option instead.');
      return;
    }
    try {
      const stream  = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' } : {};

      mediaRef.current  = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRef.current.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRef.current.onstop = () => {
        const mimeType = mediaRef.current.mimeType || 'audio/webm';
        uploadAudio(new Blob(chunksRef.current, { type: mimeType }), mimeType);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRef.current.start(250);
      setRecording(true);
      setError(''); setTranscript(''); setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError')
        setError('Microphone access denied. Please allow microphone permission in your browser settings.');
      else if (err.name === 'NotFoundError')
        setError('No microphone found on this device.');
      else
        setError(`Microphone error: ${err.message}`);
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const uploadAudio = async (blob, mimeType) => {
    setLoading(true); setError('');
    const ext = mimeType.includes('webm') ? 'webm'
              : mimeType.includes('mp4')  ? 'mp4' : 'wav';
    const formData = new FormData();
    formData.append('audio', blob, `recording.${ext}`);
    formData.append('language', langRef.current); // ✅ use ref for latest value
    try {
      const { data } = await api.post('/stt/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTranscript(data.text);
    } catch (err) {
      setError(err.response?.data?.error || 'Transcription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) uploadAudio(file, file.type);
    e.target.value = '';
  };

  const copy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(transcript)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else {
      const el = document.createElement('textarea');
      el.value = transcript; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return (
    <div className="w-full flex flex-col items-center">

      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#cabeff] mb-2 tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}>
          Transcribe Audio
        </h1>
        <p className="text-[#c9c4d8] text-lg max-w-xl mx-auto">
          Speak directly or drop an audio file to begin transcribing in 20+ languages.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl rounded-2xl p-8 md:p-10 flex flex-col items-center gap-7 relative overflow-hidden"
        style={{
          background: 'rgba(20,27,43,0.5)',
          backdropFilter: 'blur(32px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}>

        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'rgba(148,125,255,0.04)', filter: 'blur(60px)' }} />

        {/* Language Selector */}
        <div className="w-full z-10">
          <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2"
            style={{ color: '#c9c4d8', fontFamily: 'Geist, monospace' }}>
            <Globe size={12} /> Speaking Language
          </label>
          <select
            value={language}
            onChange={e => handleLangChange(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
            style={{
              background: 'rgba(5,5,16,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'Inter, sans-serif',
            }}>
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} style={{ background: '#0c1322' }}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="text-white/25 text-xs mt-1.5 text-center">
            Select the language you will speak in for better accuracy
          </p>
        </div>

        {/* ── Microphone Orb — fixed sizing ── */}
        <div className="relative flex items-center justify-center z-10 mt-5" style={{ width: '80px', height: '80px' }}>
          {/* Pulse rings — constrained to orb size */}
          <div className="absolute rounded-full animate-pulse-ring"
            style={{
              inset: 0,
              background: recording ? 'rgba(239,68,68,0.25)' : 'rgba(148,125,255,0.25)',
            }} />
          <div className="absolute rounded-full animate-pulse-ring-delayed"
            style={{
              inset: 0,
              background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(202,190,255,0.15)',
            }} />

          {/* Button */}
          <button
            onClick={recording ? stopRecording : startRecording}
            className="relative rounded-full flex items-center justify-center border border-white/20 hover:scale-105 transition-all duration-300"
            style={{
              width: '52px', height: '52px',
              background: recording
                ? 'linear-gradient(135deg,#ff4444,#93000a)'
                : 'linear-gradient(135deg,#947dff,#603ce2)',
              boxShadow: recording
                ? '0 0 28px rgba(255,68,68,0.5)'
                : '0 0 24px rgba(148,125,255,0.5)',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              {recording
                ? <rect x="6" y="6" width="12" height="12" rx="2" />
                : <>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8"  y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </>}
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className="z-10 text-center mt-4">
          {recording ? (
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-medium tabular-nums">{formatTime(timer)}</span>
              <span className="text-white/40 text-sm">— tap to stop</span>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 justify-center text-[#cabeff]">
              <Loader size={15} className="animate-spin" />
              <span className="text-sm">
                Transcribing in {LANGUAGES.find(l => l.code === language)?.label}...
              </span>
            </div>
          ) : (
            <p className="text-white/40 text-sm">Tap to start recording</p>
          )}
        </div>

        {/* Waveform */}
        <div className="w-full max-w-md h-12 flex items-end justify-center gap-1 z-10 opacity-50">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div key={i} className="w-1 rounded-t-full waveform-bar"
              style={{
                height: `${h}%`,
                background: 'linear-gradient(to top, #947dff, #afc6ff)',
                animationDelay: `${(i * 0.05) % 0.5}s`,
                animationDuration: `${0.8 + (i % 5) * 0.1}s`,
              }} />
          ))}
        </div>

        {/* Upload Zone */}
        <div className="w-full z-10">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl p-7 flex flex-col items-center justify-center gap-3 transition-all duration-300"
            style={{
              border: '2px dashed rgba(72,69,85,0.5)',
              background: 'rgba(7,14,29,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(202,190,255,0.5)';
              e.currentTarget.style.background  = 'rgba(25,31,47,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(72,69,85,0.5)';
              e.currentTarget.style.background  = 'rgba(7,14,29,0.3)';
            }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(35,42,58,1)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#c9c4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">Click to upload or drag and drop</p>
              <p className="text-white/40 text-xs mt-1">MP3, WAV, WEBM, M4A (max. 100MB)</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />
        </div>

        {/* Error */}
        {error && (
          <div className="w-full z-10 flex items-start gap-2 text-red-400 text-sm px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,70,70,0.08)', border: '1px solid rgba(255,70,70,0.2)' }}>
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="w-full z-10 rounded-xl p-4"
            style={{ background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-medium"
                  style={{ color: '#c9c4d8', fontFamily: 'Geist, monospace' }}>
                  Transcript
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(202,190,255,0.1)', color: '#cabeff' }}>
                  {LANGUAGES.find(l => l.code === language)?.label}
                </span>
              </div>
              <button onClick={copy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: copied ? '#4ade80' : '#c9c4d8', background: 'rgba(255,255,255,0.05)' }}>
                {copied
                  ? <><Check size={12} /><span>Copied!</span></>
                  : <><Copy size={12} /><span>Copy</span></>}
              </button>
            </div>
            <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              {transcript}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}