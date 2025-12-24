import React from 'react';
import { facultyColors, facultyNamesRu, getRank } from '../constants/faculty';

interface Props {
  profile: any;
  onBack: () => void;
  isAdmin?: boolean;
  onUpdate?: (id: string | number, data: any) => void;
  onDelete?: (id: string | number) => void;
}

const facultyIcons: Record<string, string> = {
  Gryffindor: '🦁', Slytherin: '🐍', Ravenclaw: '🦅', Hufflepuff: '🦡',
};

export const ProfileView: React.FC<Props> = ({ profile, onBack, isAdmin, onUpdate, onDelete }) => {
  if (!profile) return null;

  const level = profile.level || 1;
  const xp = profile.xp || 0;
  const nextLevelXp = level * 1000;
  const progress = Math.min((xp / nextLevelXp) * 100, 100);
  const color = facultyColors[profile.faculty] || '#d4af37';
  const icon = facultyIcons[profile.faculty] || '🧙‍♂️';

  // Проверка на бан (если поле есть в профиле)
  const isBanned = profile.is_banned === true;

  return (
    <div className="view fade-in p-6 flex flex-col h-screen text-[var(--tg-text)] relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-2xl p-2 opacity-50 active:opacity-100 transition-opacity">←</button>
          <h2 className="font-magic tracking-[0.3em] uppercase text-[10px] opacity-70">Личное дело мага</h2>
          <div className="w-10" /> 
        </div>

        {/* Карточка профиля */}
        <div className={`magic-card-quiz p-4 mb-6 border-l-4 bg-white/5 backdrop-blur-md transition-opacity ${isBanned ? 'grayscale opacity-60' : ''}`} 
             style={{ borderColor: isBanned ? '#ff4444' : color }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-none bg-black/20 rounded-xl flex items-center justify-center text-3xl border border-white/10"
              style={{ boxShadow: `inset 0 0 15px ${isBanned ? '#ff4444' : color}20` }}>
              {isBanned ? '🤐' : icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate mb-0.5 leading-tight">
                {profile.username || profile.name}
                {isBanned && <span className="ml-2 text-red-500 text-[10px] border border-red-500/30 px-1 rounded">BANNED</span>}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10"
                  style={{ color: isBanned ? '#ff4444' : color }}>
                  {getRank(level)}
                </span>
                <span className="text-[10px] opacity-40 font-medium italic">
                  {facultyNamesRu[profile.faculty] || 'Маг'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between text-[8px] uppercase font-bold opacity-40 mb-1.5 px-0.5">
              <span>Уровень {level}</span>
              <span>{xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%`, backgroundColor: isBanned ? '#ff4444' : color, boxShadow: `0 0 8px ${isBanned ? '#ff4444' : color}` }} />
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] opacity-30 uppercase font-bold mb-1 tracking-widest">Всего игр</span>
            <span className="text-xl font-black">{profile.total_games || 0}</span>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[8px] opacity-30 uppercase font-bold mb-1 tracking-widest">Рекорд</span>
            <span className="text-xl font-black text-[#d4af37]">{profile.best_score || 0}</span>
          </div>
        </div>

        {/* --- ПАНЕЛЬ АДМИНИСТРАТОРА --- */}
        {isAdmin && (
          <div className="mt-auto space-y-2 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-[9px] uppercase font-bold opacity-30 text-center tracking-[0.2em] mb-2">Министерство магии</p>
            
            <button 
              onClick={() => onUpdate?.(profile.tg_id || profile.id, { xp: (profile.xp || 0) + 1000, level: (profile.level || 1) + 1 })}
              className="w-full bg-[#3390ec] text-white py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-[#3390ec]/20"
            >
              ✏️ Изменить (Boost)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onUpdate?.(profile.tg_id || profile.id, { is_banned: !isBanned })}
                className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${
                  isBanned 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                }`}
              >
                {isBanned ? '🔓 Разбанить' : '🚫 Забанить'}
              </button>
              
              <button 
                onClick={() => onDelete?.(profile.tg_id || profile.id)}
                className="bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        )}

        <button onClick={onBack} className={`btn-primary font-magic tracking-widest text-xs py-4 ${!isAdmin ? 'mt-auto mb-4' : 'mb-4'}`}>
          Вернуться в замок
        </button>
      </div>
      <div className="stars-bg" />
    </div>
  );
};