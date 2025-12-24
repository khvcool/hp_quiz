import React, { useState } from 'react';
import { facultyNamesRu, facultyColors, getRank } from '../constants/faculty';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'; // Добавили Trophy для красоты
import type { Difficulty } from '../types/quiz';

interface MenuViewProps {
  faculty: string | null;
  profile: any;
  topFaculty: { name: string, points: number } | null;
  facultyStats?: { faculty: string, total_points: number }[];
  isLeaderChanged: boolean;
  onStart: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAdmin?: () => void;
  isAdmin: boolean;
  currentDifficulty: Difficulty; 
}

export const MenuView: React.FC<MenuViewProps> = ({
  faculty, profile, topFaculty, facultyStats = [], isLeaderChanged, onStart,
  onOpenLeaderboard, onOpenSettings, onOpenProfile, onOpenAdmin, isAdmin,
  currentDifficulty
}) => {
  // Сохраняем состояние в localStorage, чтобы оно не прыгало при переходах
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(() => {
    return localStorage.getItem('stats_collapsed') !== 'false'; 
  });

  const toggleStats = () => {
    const newState = !isStatsCollapsed;
    setIsStatsCollapsed(newState);
    localStorage.setItem('stats_collapsed', String(newState));
  };

  const userColor = faculty ? facultyColors[faculty] : 'var(--tg-theme-hint-color)';
  const leaderColor = topFaculty ? (facultyColors[topFaculty.name] || '#ffd700') : '#ffd700';
  const isBanned = profile?.is_banned === true;

  const diffInfo = {
    'Легкая': { time: 15, count: 15, color: '#4ade80', op: 'rgba(74,222,128,0.15)' },
    'Средняя': { time: 10, count: 25, color: '#fbbf24', op: 'rgba(251,191,36,0.15)' },
    'Сложная': { time: 5, count: 50, color: '#ef4444', op: 'rgba(239,68,68,0.15)' }
  }[currentDifficulty];

  const maxPoints = Math.max(...facultyStats.map(s => s.total_points), 1);

  const getDaysUntilSunday = () => {
    const now = new Date();
    const today = now.getDay();
    return today === 0 ? 0 : 7 - today;
  };

  return (
    <div className="view fade-in flex flex-col justify-between p-6 min-h-screen text-center overflow-y-auto custom-scrollbar bg-[var(--tg-theme-bg-color)]">
      
      <div className="mt-4 relative z-10 shrink-0">
        <h1 className="main-title text-4xl tracking-tighter text-[var(--tg-theme-text-color)] drop-shadow-sm font-magic">
          HOGWARTS QUIZ
        </h1>
      </div>

      {/* ПРОФИЛЬ И ЛИДЕР */}
      <div className="grid grid-cols-2 gap-3 relative z-10 my-4 shrink-0">
        <div 
          className={`backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-center items-center transition-all ${isBanned ? 'grayscale opacity-60' : ''}`}
          style={{ 
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderColor: isBanned ? '#ef4444' : `${userColor}40`,
          }}
        >
          <span className="text-[7px] uppercase font-black tracking-widest mb-1 opacity-40 text-[var(--tg-theme-text-color)]">
            {isBanned ? 'Статус' : 'Твой факультет'}
          </span>
          <p className="uppercase text-[11px] font-black" style={{ color: isBanned ? '#ef4444' : userColor }}>
            {isBanned ? 'ИСКЛЮЧЕН' : (faculty ? facultyNamesRu[faculty] : '---')}
          </p>
        </div>

        <div 
          className={`backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-center items-center transition-all duration-500 ${isLeaderChanged ? 'scale-105 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : ''}`}
          style={{ 
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderColor: `${leaderColor}40`,
          }}
        >
          <span className="text-[7px] uppercase font-black tracking-widest mb-1 opacity-40 text-[var(--tg-theme-text-color)] text-center w-full">Твоя статистика</span>
          {profile && !isBanned && (
            <div className="flex flex-col items-center mt-1">
              <span className="text-[10px] font-bold text-[var(--tg-theme-text-color)]">{profile.level} LVL</span>
              <span className="text-[8px] font-magic opacity-50 text-[var(--tg-theme-text-color)] uppercase tracking-tighter mt-0.5">{getRank(profile.level)}</span>
            </div>
          )}
        </div>

        {/* <div 
          className={`backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-center items-center transition-all duration-500 ${isLeaderChanged ? 'scale-105 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : ''}`}
          style={{ 
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderColor: `${leaderColor}40`,
          }}
        >
          <span className="text-[7px] uppercase font-black tracking-widest mb-1 opacity-40 text-[var(--tg-theme-text-color)] text-center w-full">Лидер битвы</span>
          <p className="uppercase text-[11px] font-black truncate w-full px-1" style={{ color: leaderColor }}>
            {topFaculty ? (facultyNamesRu[topFaculty.name] || topFaculty.name) : '...'}
          </p>
          <span className="text-[10px] font-black text-[var(--tg-theme-text-color)] mt-1">
            🏆 {topFaculty?.points.toLocaleString() || 0}
          </span>
        </div> */}
      </div>

      {/* СВОРАЧИВАЕМАЯ БИТВА ФАКУЛЬТЕТОВ */}
      <div 
        className="relative z-10 backdrop-blur-md rounded-2xl border mb-4 shrink-0 shadow-sm transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderColor: 'rgba(255,255,255,0.05)'
        }}
      >
        <button 
          onClick={toggleStats}
          className="w-full flex justify-between items-center p-4 active:opacity-60 transition-opacity"
        >
          <div className="flex flex-col items-start text-left p-4">
            <span className="text-[8px] uppercase font-black tracking-[0.2em] opacity-50 text-[var(--tg-theme-text-color)]">Битва за Кубок</span>
            <span className="text-[7px] font-mono opacity-30 uppercase mt-0.5 text-[var(--tg-theme-text-color)]">Финал через {getDaysUntilSunday()}д</span>
          </div>
          
          <div className="flex items-center gap-3">
             {/* ПОКАЗЫВАЕМ ЛИДЕРА В СВЕРНУТОМ ВИДЕ */}
             {isStatsCollapsed && topFaculty && (
               <div className="flex items-center gap-2 bg-black/10 px-2 py-1 rounded-lg border border-white/5 animate-in fade-in zoom-in duration-300">
                 <Trophy size={10} style={{ color: leaderColor }} />
                 <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: leaderColor }}>
                    {facultyNamesRu[topFaculty.name]}.
                 </span>
                 <span className="text-[9px] font-mono opacity-60 text-[var(--tg-theme-text-color)]">
                    {topFaculty.points.toLocaleString()}
                 </span>
               </div>
             )}
             
             <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter text-[var(--tg-theme-text-color)]">Live</span>
             </div>
             {isStatsCollapsed ? <ChevronDown size={14} className="opacity-40" /> : <ChevronUp size={14} className="opacity-40" />}
          </div>
        </button>

        {!isStatsCollapsed && (
          <div className="px-4 pb-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
            {facultyStats.length > 0 ? [...facultyStats].sort((a,b) => b.total_points - a.total_points).map((stat) => (
              <div key={stat.faculty}>
                <div className="flex justify-between text-[9px] mb-1 font-bold uppercase tracking-tight">
                  <span style={{ color: facultyColors[stat.faculty] }}>{facultyNamesRu[stat.faculty]}</span>
                  <span className="opacity-50 font-mono text-[var(--tg-theme-text-color)]">{stat.total_points.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(stat.total_points / maxPoints) * 100}%`, 
                      backgroundColor: facultyColors[stat.faculty],
                      boxShadow: `0 0 8px ${facultyColors[stat.faculty]}40`
                    }}
                  />
                </div>
              </div>
            )) : <div className="text-[10px] opacity-30 italic py-2 text-[var(--tg-theme-text-color)]">Загрузка очков...</div>}
          </div>
        )}
      </div>

      {/* НИЖНИЙ БЛОК (РЕЖИМ И КНОПКИ) */}
      <div className="relative z-10 w-full flex flex-col gap-4 mb-4 shrink-0">
        <div 
          className="rounded-2xl px-5 py-4 border flex justify-between items-center relative overflow-hidden"
          style={{ 
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderColor: `${diffInfo.color}40`,
            boxShadow: `inset 0 0 15px ${diffInfo.op}`
          }}
        >
          <div className="text-left relative z-10">
            <span className="block text-[8px] uppercase font-black opacity-50 tracking-[0.2em] mb-0.5 text-[var(--tg-theme-text-color)]">Режим</span>
            <span className="text-[13px] font-black tracking-wide" style={{ color: diffInfo.color }}>
              {currentDifficulty.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-4 relative z-10 text-[var(--tg-theme-text-color)]">
            <div className="text-center">
              <span className="block text-[8px] uppercase font-black opacity-40 mb-0.5">Вопросы</span>
              <span className="text-[11px] font-mono font-black">{diffInfo.count}</span>
            </div>
            <div className="text-center pl-4 border-l border-[var(--tg-theme-hint-color)] opacity-40">
              <span className="block text-[8px] uppercase font-black opacity-40 mb-0.5">Таймер</span>
              <span className="text-[11px] font-mono font-black">{diffInfo.time}с</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={isBanned ? undefined : onStart} 
            disabled={isBanned}
            className={`btn-primary btn-gold-fix py-5 text-xl font-magic tracking-[0.2em] shadow-lg transition-all ${
              isBanned ? 'opacity-50 grayscale cursor-not-allowed border-red-500/50' : ''
            }`}
            style={isBanned ? { boxShadow: 'none', background: '#333' } : {}}
          >
            {isBanned ? 'Вы исключены' : 'Начать игру'}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onOpenLeaderboard} className="btn-secondary py-4 text-[10px] font-bold uppercase bg-[var(--tg-theme-secondary-bg-color)] border-[var(--tg-theme-hint-color)] text-[var(--tg-theme-text-color)]">🏆 Рейтинг</button>
            <button onClick={onOpenProfile} className="btn-secondary py-4 text-[10px] font-bold uppercase bg-[var(--tg-theme-secondary-bg-color)] border-[var(--tg-theme-hint-color)] text-[var(--tg-theme-text-color)]">🧙‍♂️ Профиль</button>
          </div>

          <div className={isAdmin ? "grid grid-cols-2 gap-3" : "block"}>
            <button onClick={onOpenSettings} className="btn-secondary py-4 text-[10px] font-bold uppercase w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)]">
              ⚙️ Опции
            </button>
            {isAdmin && onOpenAdmin && (
               <button onClick={onOpenAdmin} className="btn-secondary border-blue-500/50 text-blue-500 font-bold py-4 text-[10px] uppercase">
                 🔑 Админ
               </button>
            )}
          </div>
        </div>
      </div>
      <div className="stars-bg opacity-10 pointer-events-none" />
    </div>
  );
};