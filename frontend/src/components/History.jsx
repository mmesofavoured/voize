import { useEffect, useState, useRef } from 'react';
import { Loader, Play, Pause, Download, Share2, Trash2, Copy, Search } from 'lucide-react';
import api from '../api/axios';

function AudioPlayer({ audioUrl, recordId }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.src = audioUrl;
    const onTimeUpdate = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleDownload = async () => {
    try {
      const res  = await fetch(audioUrl);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `voize-audio-${recordId}.mp3`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert('Download failed.'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Voize Audio', url: audioUrl });
    } else {
      const el = document.createElement('textarea');
      el.value = audioUrl; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      alert('Audio link copied!');
    }
  };

  return (
    <div className="flex items-center gap-3 mt-3">
      <button onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
        style={{ background: '#cabeff', boxShadow: '0 0 12px rgba(202,190,255,0.4)' }}>
        {playing
          ? <Pause size={14} style={{ color: '#31009a' }} />
          : <Play  size={14} style={{ color: '#31009a' }} className="ml-0.5" />}
      </button>

      <div className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7C5CFF,#4F8CFF)' }} />
      </div>

      <button onClick={handleDownload}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: '#938ea1' }}
        onMouseEnter={e => e.currentTarget.style.color = '#cabeff'}
        onMouseLeave={e => e.currentTarget.style.color = '#938ea1'}>
        <Download size={15} />
      </button>

      <button onClick={handleShare}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: '#938ea1' }}
        onMouseEnter={e => e.currentTarget.style.color = '#cabeff'}
        onMouseLeave={e => e.currentTarget.style.color = '#938ea1'}>
        <Share2 size={15} />
      </button>
    </div>
  );
}

function groupByDate(records) {
  const today     = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const groups    = {};
  records.forEach(r => {
    const d = new Date(r.created_at); d.setHours(0,0,0,0);
    let label;
    if (d.getTime() === today.getTime())          label = 'Today';
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(r);
  });
  return groups;
}

export default function History() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/history/');
      setRecords(data);
    } finally { setLoading(false); }
  };

  const deleteRecord = async (id) => {
    await api.delete(`/history/?id=${id}`);
    setRecords(r => r.filter(x => x.id !== id));
  };

  const copyText = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = records.filter(r =>
    (r.input_text || r.output_text || '').toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupByDate(filtered);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader size={24} className="animate-spin" style={{ color: '#cabeff' }} />
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#cabeff] mb-2 tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}>
          History
        </h1>
        <p className="text-[#c9c4d8] text-lg max-w-2xl mx-auto">
          Review and manage your past voice generations, transcriptions, and translations.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-10">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: '#938ea1' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transcripts, voice names, or dates..."
          className="w-full py-3.5 pl-11 pr-4 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none transition-all"
          style={{
            background: 'rgba(5,5,16,0.8)',
            border: '1px solid rgba(72,69,85,0.3)',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = '#cabeff'}
          onBlur={e  => e.target.style.borderColor = 'rgba(72,69,85,0.3)'}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 rounded-2xl"
          style={{ background: 'rgba(11,11,22,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-white/20 text-5xl mb-4">🎙️</p>
          <p className="text-white/40 text-sm">
            {search ? 'No results found.' : 'No transcriptions yet. Start converting some text or audio!'}
          </p>
        </div>
      )}

      {/* Grouped records */}
      {Object.entries(groups).map(([dateLabel, items]) => (
        <div key={dateLabel} className="mb-10">
          {/* Date divider */}
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-base font-semibold text-white whitespace-nowrap"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              {dateLabel}
            </h2>
            <div className="flex-1 h-px"
              style={{ background: 'linear-gradient(to right, rgba(72,69,85,0.2), transparent)' }} />
          </div>

          <div className="flex flex-col gap-4">
            {items.map(r => (
              <div key={r.id}
                className="rounded-2xl p-6 md:p-7 flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(11,11,22,0.7)',
                  backdropFilter: 'blur(24px)',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}>

                {/* Top row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Type badge */}
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
                      style={{
                        background: r.type === 'tts'
                          ? 'rgba(202,190,255,0.1)' : 'rgba(175,198,255,0.1)',
                        color:  r.type === 'tts' ? '#cabeff' : '#afc6ff',
                        border: `1px solid ${r.type === 'tts' ? 'rgba(202,190,255,0.2)' : 'rgba(175,198,255,0.2)'}`,
                        fontFamily: 'Geist, monospace',
                      }}>
                      {r.type === 'tts' ? 'Text → Speech' : 'Speech → Text'}
                    </span>
                    <span className="text-xs" style={{ color: '#938ea1', fontFamily: 'Geist, monospace' }}>
                      {new Date(r.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <button onClick={() => deleteRecord(r.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#484555' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffb4ab'}
                    onMouseLeave={e => e.currentTarget.style.color = '#484555'}>
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed line-clamp-2"
                  style={{ color: '#c9c4d8', fontFamily: 'Inter, sans-serif' }}>
                  {r.type === 'stt' ? <em>{r.output_text || '—'}</em> : r.input_text || '—'}
                </p>

                {/* Audio player for TTS */}
                {r.type === 'tts' && r.audio_url && (
                  <AudioPlayer audioUrl={r.audio_url} recordId={r.id} />
                )}

                {/* Copy for STT */}
                {r.type === 'stt' && r.output_text && (
                  <div className="flex justify-end">
                    <button onClick={() => copyText(r.output_text)}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: '#938ea1', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#cabeff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#938ea1'}>
                      <Copy size={14} /> Copy Transcript
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}