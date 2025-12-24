import React, { useMemo } from 'react';
import { facultyNamesRu, facultyColors } from '../constants/faculty';

interface Props {
  players: any[];
  onWipe: () => void;
}

export const AdminStats: React.FC<Props> = ({ players, onWipe }) => {
  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const totalPoints = players.reduce((sum, p) => sum + (p.best_score || 0), 0);
    const avgLevel = totalPlayers ? (players.reduce((sum, p) => sum + (p.level || 1), 0) / totalPlayers).toFixed(1) : 0;
    const bannedCount = players.filter(p => p.is_banned === true).length;
    const facultyDist = players.reduce((acc, p) => {
      if (p.faculty) acc[p.faculty] = (acc[p.faculty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalPlayers, totalPoints, avgLevel, bannedCount, facultyDist };
  }, [players]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pb-10 pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl text-center border border-white/5 shadow-sm">
          <span className="block text-[9px] opacity-40 uppercase font-black mb-1">Магов</span>
          <span className="text-2xl font-black">{stats.totalPlayers}</span>
        </div>
        <div className="p-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl text-center border border-white/5 shadow-sm">
          <span className="block text-[9px] opacity-40 uppercase font-black mb-1">Ср. LVL</span>
          <span className="text-2xl font-black text-[#3390ec]">{stats.avgLevel}</span>
        </div>
      </div>

      <div className="p-5 bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl border border-white/5 shadow-sm">
        <span className="block text-[10px] opacity-40 uppercase mb-5 font-black text-center tracking-widest">Демография</span>
        {['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'].map((id) => {
          const count = stats.facultyDist[id] || 0;
          const percent = stats.totalPlayers ? (count / stats.totalPlayers) * 100 : 0;
          return (
            <div key={id} className="mb-4 last:mb-0">
              <div className="flex justify-between text-[11px] mb-1 font-bold">
                <span>{facultyNamesRu[id]}</span>
                <span className="opacity-50">{count}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: facultyColors[id] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl mt-4">
        <h4 className="text-red-500 text-[10px] font-black uppercase mb-3 text-center tracking-[0.2em]">Danger Zone</h4>
        <button onClick={onWipe} className="w-full py-4 bg-red-600 text-white rounded-xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-900/20">
          💀 Глобальный Wipe
        </button>
      </div>
    </div>
  );
};