import React, { useState } from 'react';

// Доступ к Telegram WebApp SDK
const tg = (window as any).Telegram?.WebApp;

interface Props {
  onSorted: (facultyId: string) => void;
}

const houses = [
  { id: "Gryffindor", name: "ГРИФФИНДОР", color: "#740001", bg: "#1a0505", quote: "О, я вижу храброе сердце!" },
  { id: "Slytherin", name: "СЛИЗЕРИН", color: "#1a472a", bg: "#051205", quote: "Хитрость и жажда власти... Да..." },
  { id: "Ravenclaw", name: "КОГТЕВРАН", color: "#0e1a40", bg: "#050512", quote: "Разум превыше всего? Понятно..." },
  { id: "Hufflepuff", name: "ПУФФЕНДУЙ", color: "#ecb939", bg: "#121205", quote: "Трудолюбие? Вы очень добры." }
];

const hatPhrases = [
  "Так, так... что тут у нас?",
  "Интересно... очень интересно...",
  "Трудно. Очень трудно...",
  "Много смелости, я вижу...",
  "Куда же вас направить?"
];

export const SortingHat: React.FC<Props> = ({ onSorted }) => {
  const [phase, setPhase] = useState<'idle' | 'sorting' | 'finished'>('idle');
  const [speech, setSpeech] = useState("Хмм... Вижу отвагу. И неплохой ум. Куда же вас определить?");
  const [selectedHouse, setSelectedHouse] = useState<typeof houses[0] | null>(null);

  const startSorting = () => {
    // Вибрация при начале
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    setPhase('sorting');
    let i = 0;
    const interval = setInterval(() => {
      setSpeech(hatPhrases[i % hatPhrases.length]);
      i++;
      if (i > 6) {
        clearInterval(interval);
        finalizeSorting();
      }
    }, 600);
  };

  const finalizeSorting = () => {
    const house = houses[Math.floor(Math.random() * houses.length)];
    setSelectedHouse(house);
    setPhase('finished');

    // Вибрация при успехе
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    // Настройка цвета хедера Telegram под факультет
    if (tg) {
      tg.setHeaderColor(tg.colorScheme === 'dark' ? house.bg : house.color);
    }
  };

  return (
    <div 
      className="view h-screen flex flex-col justify-center items-center text-center p-6 transition-all duration-1000"
      style={{ backgroundColor: (phase === 'finished' && tg?.colorScheme === 'dark') ? selectedHouse?.bg : 'var(--tg-bg)' }}
    >
      <div className="stars-bg" />
      
      <div className="fade-in flex flex-col items-center w-full max-w-xs">
        <div 
          className="hat-animation mb-8 transition-all duration-1000"
          style={{ filter: selectedHouse ? `drop-shadow(0 0 20px ${selectedHouse.color})` : 'none' }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <path d="M15 85C30 80 70 80 85 85C80 75 70 70 50 70C30 70 20 75 15 85Z" fill="#3D2B1F" stroke="#2A1E15" strokeWidth="2"/>
            <path d="M50 15L30 70H70L50 15Z" fill="#3D2B1F" stroke="#2A1E15" strokeWidth="2"/>
            <path d="M40 45C40 45 45 40 50 45C55 50 60 45 60 45" stroke="#1A110A" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 55C45 58 55 58 58 55" stroke="#1A110A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="h-32 flex flex-col items-center justify-center mb-8">
          {phase === 'finished' && selectedHouse ? (
            <div className="fade-in">
              <h2 className="text-3xl font-black font-magic tracking-widest mb-2" style={{ color: selectedHouse.color }}>
                {selectedHouse.name}
              </h2>
              <p className="text-sm italic" style={{ color: 'var(--tg-text)', opacity: 0.8 }}>{selectedHouse.quote}</p>
            </div>
          ) : (
            <p className="text-xl italic leading-relaxed" style={{ color: 'var(--tg-text)' }}>
              {speech}
            </p>
          )}
        </div>

        <div className="w-full">
          {phase === 'idle' && (
            <button 
              onClick={startSorting}
              className="w-full py-5 font-black font-magic rounded-full shadow-lg active:scale-95 transition-all text-sm tracking-[0.2em] btn-gold-fix"
            >
              НАДЕТЬ ШЛЯПУ
            </button>
          )}

          {phase === 'sorting' && (
            <div className="flex justify-center py-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce bg-[#d4af37]" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-[#d4af37]" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full animate-bounce bg-[#d4af37]" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {phase === 'finished' && selectedHouse && (
            <button 
              onClick={() => onSorted(selectedHouse.id)}
              className="w-full py-5 rounded-full font-black font-magic shadow-xl active:scale-95 transition-all text-sm tracking-[0.2em] fade-in"
              style={{ 
                backgroundColor: selectedHouse.color,
                color: selectedHouse.id === 'Hufflepuff' ? '#000' : '#fff'
              }}
            >
              ВОЙТИ В ЗАЛ ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
};