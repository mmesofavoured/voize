import { useState } from 'react';
import Navbar         from '../components/Navbar';
import TextToSpeech   from '../components/TextToSpeech';
import SpeechToText   from '../components/SpeechToText';
import TranslateSpeak from '../components/TranslateSpeak';
import History        from '../components/History';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tts');

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#0c1322' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* pt-28 for mobile (only top nav row), pt-40 for desktop (two nav rows) */}
      <main className="relative z-10 pt-28 md:pt-40 pb-24 px-5 md:px-16 max-w-[1280px] mx-auto">
        {activeTab === 'tts'       && <TextToSpeech />}
        {activeTab === 'stt'       && <SpeechToText />}
        {activeTab === 'translate' && <TranslateSpeak />}
        {activeTab === 'history'   && <History />}
      </main>
    </div>
  );
}


// import { useState } from 'react';
// import Navbar         from '../components/Navbar';
// import TextToSpeech   from '../components/TextToSpeech';
// import SpeechToText   from '../components/SpeechToText';
// import TranslateSpeak from '../components/TranslateSpeak';
// import History        from '../components/History';
// import { AudioLines, Mic, Languages, History as HistoryIcon } from 'lucide-react';

// const TABS = [
//   { id: 'tts',       label: 'Text → Speech',     icon: AudioLines  },
//   { id: 'stt',       label: 'Speech → Text',     icon: Mic         },
//   { id: 'translate', label: 'Translate & Speak',  icon: Languages   },
//   { id: 'history',   label: 'History',            icon: HistoryIcon },
// ];

// export default function Dashboard() {
//   const [activeTab, setActiveTab] = useState('tts');

//   return (
//     <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#0c1322' }}>

//       {/* Ambient orbs */}
//       <div className="orb orb-1" />
//       <div className="orb orb-2" />

//       {/* Two-tier Navbar */}
//       <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

//       {/* Main content — pt-36 clears top nav (64px) + secondary nav (~52px) */}
//         <main className="relative z-10 pt-48 md:pt-40 pb-24 px-5 md:px-16 max-w-[1280px] mx-auto">
//         {activeTab === 'tts'       && <TextToSpeech />}
//         {activeTab === 'stt'       && <SpeechToText />}
//         {activeTab === 'translate' && <TranslateSpeak />}
//         {activeTab === 'history'   && <History />}
//       </main>

//       {/* Mobile Bottom Nav
//       <nav
//         className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full px-4 py-2 border border-white/10"
//         style={{
//           background:    'rgba(25,31,47,0.9)',
//           backdropFilter:'blur(24px)',
//           boxShadow:     '0 8px 32px rgba(0,0,0,0.5)',
//         }}>
//         {TABS.map(({ id, label, icon: Icon }) => {
//           const active = activeTab === id;
//           return (
//             <button
//               key={id}
//               onClick={() => setActiveTab(id)}
//               title={label}
//               className="flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200"
//               style={{
//                 background: active ? '#cabeff'              : 'transparent',
//                 color:      active ? '#31009a'              : 'rgba(255,255,255,0.35)',
//                 boxShadow:  active ? '0 0 12px rgba(202,190,255,0.4)' : 'none',
//               }}>
//               <Icon size={20} />
//             </button>
//           );
//         })}
//       </nav> */}
//     </div>
//   );
// }