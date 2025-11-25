
import React, { useState, useEffect } from 'react';
import { ViewState, NAV_ITEMS } from './types';
import { DoodleCard, DoodleButton, Tape } from './components/DoodleComponents';
import { DrawingCanvas } from './components/DrawingCanvas';

// Pre-made SVG drawings for inspiration
const SAMPLE_DRAWINGS = [
  "data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M200 50 L350 150 L200 350 L50 150 Z' fill='none' stroke='%233b82f6' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='150' cy='150' r='12' fill='black'/%3E%3Ccircle cx='250' cy='150' r='12' fill='black'/%3E%3Cpath d='M150 200 Q200 260 250 200' fill='none' stroke='black' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='350' y1='150' x2='390' y2='100' stroke='black' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='50' y1='150' x2='10' y2='100' stroke='black' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='130' y1='280' x2='130' y2='380' stroke='black' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='270' y1='280' x2='270' y2='380' stroke='black' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E",
  "data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='100' y='100' width='200' height='200' fill='none' stroke='%236b7280' stroke-width='8' rx='20'/%3E%3Crect x='130' y='140' width='40' height='40' fill='none' stroke='black' stroke-width='5'/%3E%3Crect x='230' y='140' width='40' height='40' fill='none' stroke='black' stroke-width='5'/%3E%3Crect x='150' y='240' width='100' height='20' fill='none' stroke='black' stroke-width='5'/%3E%3Cline x1='200' y1='100' x2='200' y2='40' stroke='black' stroke-width='8'/%3E%3Ccircle cx='200' cy='30' r='15' fill='%23ef4444'/%3E%3Cline x1='90' y1='200' x2='40' y2='250' stroke='black' stroke-width='8'/%3E%3Cline x1='310' y1='200' x2='360' y2='250' stroke='black' stroke-width='8'/%3E%3C/svg%3E",
  "data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='200' cy='200' rx='110' ry='90' fill='none' stroke='%2378350f' stroke-width='8'/%3E%3Cpath d='M100 220 Q60 280 80 320' fill='none' stroke='%23fef3c7' stroke-width='10'/%3E%3Cpath d='M300 220 Q340 280 320 320' fill='none' stroke='%23fef3c7' stroke-width='10'/%3E%3Ccircle cx='160' cy='180' r='8' fill='black'/%3E%3Ccircle cx='240' cy='180' r='8' fill='black'/%3E%3Cpath d='M200 220 Q200 320 260 300' fill='none' stroke='%2378350f' stroke-width='8'/%3E%3Cline x1='160' y1='290' x2='160' y2='370' stroke='%2378350f' stroke-width='8'/%3E%3Cline x1='240' y1='290' x2='240' y2='370' stroke='%2378350f' stroke-width='8'/%3E%3C/svg%3E"
];

const Hero = ({ onNavigate }: { onNavigate: (v: ViewState) => void }) => (
  <div className="flex flex-col items-center gap-8 py-10 px-4 text-gray-900">
    <div className="relative">
      <h1 className="text-5xl md:text-7xl hand-font text-center text-blue-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] rotate-[-2deg] leading-tight">
        Конкурс Маскотов<br/>
        <span className="text-pink-500 text-6xl md:text-8xl block mt-2 transform rotate-2">"Цифровой Алмаз"</span>
      </h1>
      <div className="absolute -top-10 -right-10 text-6xl animate-bounce hidden md:block">💎</div>
      <div className="absolute -bottom-10 -left-10 text-6xl animate-pulse hidden md:block">✏️</div>
    </div>

    <DoodleCard className="max-w-3xl bg-white mt-8" rotate="rotate-1" borderColor="border-blue-500">
      <Tape className="-top-5" />
      <p className="text-xl md:text-2xl text-center leading-relaxed text-gray-800">
        Привет! Технопарк «Якутия» ищет <b>ГЕРОЯ</b> для форума! <br/>
        Это твой шанс создать лицо цифрового будущего. <br/>
        Придумай персонажа, который любит технологии, традиции и инновации!
      </p>
      <div className="mt-8 flex justify-center">
        <DoodleButton 
          variant="primary" 
          onClick={() => onNavigate(ViewState.DRAW)}
          className="text-2xl px-12 py-4 animate-pulse text-white"
        >
          🚀 НАЧАТЬ РИСОВАТЬ!
        </DoodleButton>
      </div>
    </DoodleCard>

    <div className="w-full max-w-5xl mt-12">
        <h2 className="text-3xl hand-font text-center mb-8 text-yellow-600 rotate-[-1deg]">🏆 Призы и Сокровища</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DoodleCard className="bg-green-100" rotate="-rotate-2" borderColor="border-green-600">
              <div className="text-4xl mb-2 text-center">🧸</div>
              <h3 className="text-xl font-bold text-center text-gray-900">Дети</h3>
              <p className="text-2xl font-bold text-center text-green-700 mt-2">5 000 ₽</p>
           </DoodleCard>
           <DoodleCard className="bg-orange-100" rotate="rotate-2" borderColor="border-orange-600">
              <div className="text-4xl mb-2 text-center">🎨</div>
               <h3 className="text-xl font-bold text-center text-gray-900">Любители</h3>
              <p className="text-2xl font-bold text-center text-orange-700 mt-2">20 000 ₽</p>
           </DoodleCard>
           <DoodleCard className="bg-purple-100" rotate="-rotate-1" borderColor="border-purple-600">
              <div className="text-4xl mb-2 text-center">💻</div>
               <h3 className="text-xl font-bold text-center text-gray-900">Профи</h3>
              <p className="text-2xl font-bold text-center text-purple-700 mt-2">50 000 ₽</p>
           </DoodleCard>
        </div>
    </div>

    <DoodleCard className="bg-white max-w-2xl mt-8" rotate="rotate-1" borderColor="border-gray-400">
        <h3 className="text-xl font-bold text-center mb-2 text-gray-900">📜 Как участвовать?</h3>
        <p className="text-center text-lg text-gray-800">1. Нарисуй маскота (жми розовую кнопку!).</p>
        <p className="text-center text-lg text-gray-800">2. Сохрани рисунок.</p>
        <p className="text-center text-lg text-gray-800">3. Отправь на <b>technopark_14@mail.ru</b></p>
        <p className="text-center text-sm text-gray-500 mt-4">Итоги 29 ноября 2025 • Якутск</p>
    </DoodleCard>
  </div>
);

const Gallery = ({ drawings }: { drawings: string[] }) => {
  // Combine user drawings with sample drawings for a full gallery
  const allMasterpieces = [...drawings, ...SAMPLE_DRAWINGS];

  return (
    <div className="max-w-6xl mx-auto p-4 py-10 text-gray-900">
      <div className="relative mb-12 text-center">
          <h2 className="text-4xl md:text-5xl hand-font text-pink-600 rotate-1 inline-block">
             🖼️ Мои Шедевры
          </h2>
          <div className="absolute top-0 right-1/4 hidden lg:block text-5xl animate-bounce">🎨</div>
      </div>
      
      {/* Combined Drawings Section */}
      <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {allMasterpieces.map((src, idx) => (
              <div key={idx} className="relative group">
                  <DoodleCard className="bg-white p-4" rotate={idx % 2 === 0 ? 'rotate-1' : '-rotate-2'}>
                      <Tape className="-top-3 left-1/2 w-24" />
                      <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center relative">
                          <img src={src} alt={`Рисунок ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                      </div>
                      <p className="text-center mt-4 hand-font text-gray-500 font-bold">
                        {idx < drawings.length ? `Твой шедевр #${drawings.length - idx}` : `Идея для маскота #${idx - drawings.length + 1}`}
                      </p>
                  </DoodleCard>
              </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [drawings, setDrawings] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('my_mascot_drawings');
    if (saved) {
        try {
            setDrawings(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load drawings", e);
        }
    }
  }, []);

  const handleSaveDrawing = (data: string) => {
      const newList = [data, ...drawings];
      setDrawings(newList);
      localStorage.setItem('my_mascot_drawings', JSON.stringify(newList));
      setCurrentView(ViewState.GALLERY);
      window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden bg-[#fff9e6] text-gray-900">
      {/* Navigation */}
      <nav className="p-4 flex flex-wrap justify-center gap-4 sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b-4 border-black/10 shadow-sm">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentView(item.view)}
            className={`
              hand-font font-bold text-lg px-6 py-2 rounded-xl transition-all border-2 border-transparent
              ${currentView === item.view 
                ? `${item.color} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black -translate-y-1` 
                : 'bg-white hover:bg-gray-100 text-gray-700 hover:border-gray-200'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="container mx-auto">
        {currentView === ViewState.HOME && <Hero onNavigate={setCurrentView} />}
        {currentView === ViewState.DRAW && <DrawingCanvas onSave={handleSaveDrawing} />}
        {currentView === ViewState.GALLERY && <Gallery drawings={drawings} />}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center border-t-2 border-dashed border-gray-300">
        <p className="hand-font text-gray-500 text-lg">
          📍 Якутск, 2025 | Цифровой Алмаз
        </p>
        <div className="flex justify-center gap-6 mt-4 font-bold text-blue-500">
           <a href="https://t.me/digitaldiamond22" target="_blank" rel="noreferrer" className="hover:text-blue-700 hover:underline">Telegram</a>
           <a href="https://xn--80aaewbhpinbt1cya.xn--p1ai/" target="_blank" rel="noreferrer" className="hover:text-blue-700 hover:underline">Сайт Форума</a>
        </div>
      </footer>
    </div>
  );
}
