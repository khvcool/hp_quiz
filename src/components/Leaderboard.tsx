import React, { useState, useMemo } from 'react';
import type { Difficulty } from '../types/quiz';
import { getRank, facultyColors, facultyNamesRu } from '../constants/faculty';

const tg = (window as any).Telegram?.WebApp;

interface Props {
  data: any[];
  currentDifficulty: Difficulty;
  onLoad: (d: Difficulty) => void;
  onBack: () => void;
  onOpenProfile: (p: any) => void;
  formatTime: (s: number) => string;
  currentUserId: any; // ДОБАВЬ ЭТУ СТРОКУ
}

const facultyIcons: Record<string, string> = {
  Gryffindor: '🦁', Slytherin: '🐍', Ravenclaw: '🦅', Hufflepuff: '🦡',
  Gryff: '🦁', Slyth: '🐍', Rave: '🦅', Huff: '🦡'
};

export const Leaderboard: React.FC<Props> = ({ data, currentDifficulty, onLoad, onBack, onOpenProfile, formatTime, currentUserId }) => {
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  
  // Мой ID для подсветки
  // const MY_ID = 905316819;

  const handleDifficultyChange = (d: Difficulty) => {
    if (tg?.isVersionAtLeast?.('6.1')) {
      tg.HapticFeedback.impactOccurred('light');
    }
    onLoad(d);
  };

  // Фильтрация по факультету на клиенте
  const filteredData = useMemo(() => {
    if (facultyFilter === 'all') return data;
    return data.filter(item => item.faculty === facultyFilter);
  }, [data, facultyFilter]);

  const renderRank = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return <span className="text-[10px] font-mono opacity-30 w-4">#{index + 1}</span>;
  };

  return (
    <div className="view flex flex-col h-screen p-5 fade-in bg-[var(--tg-theme-bg-color)]">
      <div className="stars-bg opacity-10" />

      {/* ЗАГОЛОВОК */}
      <div className="flex-none text-center mb-2 relative z-10">
        <h2 className="text-2xl font-magic tracking-widest uppercase mb-4 text-[var(--tg-theme-text-color)] opacity-90">
          Доска Почета
        </h2>
        
        {/* ТАБЫ СЛОЖНОСТИ */}
        <div className="flex justify-around border-b border-[var(--tg-theme-hint-color)] opacity-30 mb-4">
          {(['Легкая', 'Средняя', 'Тяжелая'] as Difficulty[]).map((d) => {
            const isActive = currentDifficulty === d;
            return (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`pb-2 px-2 font-magic text-[10px] transition-all duration-300 relative
                  ${isActive ? 'text-[var(--tg-theme-button-color)] opacity-100' : 'text-[var(--tg-theme-text-color)] opacity-40'}
                `}
              >
                {d.toUpperCase()}
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--tg-theme-button-color)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ФИЛЬТР ФАКУЛЬТЕТОВ (Иконки) */}
        <div className="flex justify-center gap-2 mb-2 overflow-x-auto no-scrollbar py-1">
          <button 
            onClick={() => setFacultyFilter('all')}
            className={`w-8 h-8 rounded-full border transition-all ${facultyFilter === 'all' ? 'border-[#d4af37] bg-[#d4af37]/20 scale-110' : 'border-white/10 opacity-40'}`}
          >
            🏰
          </button>
          {['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'].map(f => (
            <button 
              key={f}
              onClick={() => setFacultyFilter(f)}
              className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center text-sm
                ${facultyFilter === f ? 'border-[#d4af37] bg-[#d4af37]/20 scale-110' : 'border-white/10 opacity-40'}`}
              style={{ borderColor: facultyFilter === f ? facultyColors[f] : '' }}
            >
              {facultyIcons[f]}
            </button>
          ))}
        </div>
      </div>

      {/* СПИСОК ИГРОКОВ */}
      <div className="flex-1 overflow-y-auto leaderboard-list space-y-3 pr-1 py-2 custom-scrollbar relative z-10">
        {filteredData.length > 0 ? (
          filteredData.map((item, i) => {
            // Внутри data.map в Leaderboard.tsx замени определение isMe:
            const isMe = String(item.telegram_id) === String(currentUserId);
            const color = facultyColors[item.faculty] || 'var(--tg-theme-button-color)';
            
            return (
              <div 
                key={i} 
                onClick={() => onOpenProfile(item)}
                className={`magic-card-item p-3 flex items-center justify-between border-l-4 rounded-r-xl transition-all duration-300
                  ${isMe ? 'border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)] bg-[#d4af37]/5' : ''}
                `}
                style={{ 
                  borderLeftColor: isMe ? '#d4af37' : color,
                  backgroundColor: isMe ? '' : 'var(--tg-theme-secondary-bg-color)',
                  transform: isMe ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">
                    {renderRank(i)}
                  </div>
                  
                  <div className="text-xl filter drop-shadow-sm">
                    {facultyIcons[item.faculty] || '✨'}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isMe ? 'text-[#d4af37]' : 'text-[var(--tg-theme-text-color)]'}`}>
                        {item.name} {isMe && <span className="text-[9px] font-magic">(ВЫ)</span>}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/20 opacity-60 text-[var(--tg-theme-text-color)]">
                        {item.level || 1} LVL
                      </span>
                    </div>
                    <div className="text-[9px] opacity-60 uppercase tracking-widest font-magic" style={{ color: color }}>
                      {getRank(item.level || 1)} • {facultyNamesRu[item.faculty] || 'Маг'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-magic text-[12px] font-bold" style={{ color: isMe ? '#d4af37' : color }}>
                    {item.points} <span className="text-[8px] opacity-60">PTS</span>
                  </div>
                  <div className="text-[9px] opacity-40 font-mono text-[var(--tg-theme-text-color)]">
                    {formatTime(item.totalTime)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-40 font-book text-sm italic">
            Маги этого факультета еще не проявили себя...
          </div>
        )}
      </div>

      {/* КНОПКА НАЗАД */}
      <div className="flex-none pt-4 relative z-10">
        <button onClick={onBack} className="btn-primary font-magic tracking-widest text-sm uppercase flex items-center justify-center w-full py-4 shadow-xl">
          Вернуться к замку
        </button>
      </div>
    </div>
  );
};