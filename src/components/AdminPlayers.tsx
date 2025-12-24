import React, { useState, useMemo } from 'react';
import { facultyNamesRu, facultyColors } from '../constants/faculty';

interface Props {
  players: any[];
  onUpdate: (id: string | number, data: any) => void;
  onDelete: (id: string | number) => void;
}

export const AdminPlayers: React.FC<Props> = ({ players, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const filtered = useMemo(() => {
    if (!players) return [];
    return players.filter(p => {
      const name = (p.username || p.name || '').toLowerCase();
      const id = (p.tg_id || p.id || '').toString();
      const s = search.toLowerCase();
      return name.includes(s) || id.includes(s);
    });
  }, [players, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <input 
        placeholder="Поиск мага..." 
        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-[16px] outline-none mb-4 shrink-0 focus:border-[#3390ec]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pb-10 pr-1">
        {filtered.length > 0 ? filtered.map(player => {
          const pId = player.tg_id || player.id;
          const isEditing = editingId === pId;
          const isBanned = player.is_banned === true;
          const fColor = facultyColors[player.faculty] || '#ccc';
          
          // Берем данные из твоей таблицы profiles
          const displayScore = player.best_score ?? 0;
          const displayLevel = player.level ?? 1;

          return (
            <div key={pId} className={`bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl border transition-all ${isBanned ? 'opacity-60 border-red-500/20 grayscale' : 'border-white/5 shadow-sm'}`}>
              <div className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: isBanned ? '#ef4444' : fColor }} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[16px] truncate flex items-center gap-2">
                      {player.username || player.name || 'Маг без имени'} 
                      {isBanned && <span className="text-[8px] bg-red-500 text-white px-1 rounded font-black uppercase">BAN</span>}
                    </span>
                    <span className="text-[10px] opacity-30 font-mono">ID: {pId}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing && (
                    <div className="flex gap-3 mr-1">
                      <div className="text-right">
                        <div className="text-[14px] font-black text-[#3390ec] leading-none">{displayScore}</div>
                        <span className="text-[8px] opacity-30 uppercase font-bold tracking-tighter">BEST</span>
                      </div>
                      <div className="w-[1px] h-6 bg-white/5 self-center" />
                      <div className="text-right">
                        <div className="text-[14px] font-black leading-none">{displayLevel}</div>
                        <span className="text-[8px] opacity-30 uppercase font-bold tracking-tighter">LVL</span>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => setEditingId(isEditing ? null : pId)} 
                    className={`w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 ${isEditing ? 'bg-[#3390ec] text-white' : 'bg-white/5'}`}
                  >
                    {isEditing ? '✕' : '✏️'}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="p-4 bg-black/20 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase opacity-40 font-bold ml-1">Рекорд</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-sm outline-none focus:border-[#3390ec]" 
                        defaultValue={displayScore} 
                        onBlur={(e) => onUpdate(pId, { best_score: Number(e.target.value) })} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase opacity-40 font-bold ml-1">Уровень</label>
                      <input 
                        type="number" 
                        className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-sm outline-none focus:border-[#3390ec]" 
                        defaultValue={displayLevel} 
                        onBlur={(e) => onUpdate(pId, { level: Number(e.target.value) })} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'].map(fId => (
                      <button 
                        key={fId} 
                        onClick={() => onUpdate(pId, { faculty: fId })} 
                        className={`py-2 rounded-lg text-[10px] font-bold border ${player.faculty === fId ? 'border-white' : 'border-white/10 opacity-40'}`} 
                        style={player.faculty === fId ? { backgroundColor: facultyColors[fId] } : {}}
                      >
                        {facultyNamesRu[fId]}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => onUpdate(pId, { is_banned: !isBanned })} 
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border ${isBanned ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                    >
                      {isBanned ? 'Разбанить' : 'Забанить'}
                    </button>
                    <button 
                      onClick={() => onDelete(pId)} 
                      className="w-12 py-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"
                    >
                      🗑️
                    </button>
                  </div>
                  <button onClick={() => setEditingId(null)} className="w-full py-3 bg-[#3390ec] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest">Готово</button>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-20 opacity-20 text-sm italic">Маги не найдены</div>
        )}
      </div>
    </div>
  );
};