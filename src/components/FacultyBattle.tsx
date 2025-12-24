import React from 'react';
import { facultyColors, facultyNamesRu } from '../constants/faculty';

interface FacultyStat {
  faculty: string;
  total_points: number;
}

interface Props {
  stats: FacultyStat[];
}

export const FacultyBattle: React.FC<Props> = ({ stats }) => {
  // Находим максимальное значение для масштабирования полосок
  const maxPoints = Math.max(...stats.map(s => s.total_points), 1);
  
  // Сортируем: лидеры сверху
  const sortedStats = [...stats].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="magic-card-quiz p-4 my-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-magic text-sm tracking-widest uppercase opacity-80">Битва Факультетов</h3>
        <span className="text-[18px]">🏆</span>
      </div>

      <div className="space-y-4">
        {sortedStats.map((stat, index) => {
          const color = facultyColors[stat.faculty] || '#d4af37';
          const percentage = (stat.total_points / maxPoints) * 100;
          
          return (
            <div key={stat.faculty} className="relative">
              <div className="flex justify-between text-[10px] mb-1 font-bold uppercase tracking-tighter">
                <span>
                  {index === 0 && '👑 '}
                  {facultyNamesRu[stat.faculty]}
                </span>
                <span>{stat.total_points.toLocaleString()} PTS</span>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full transition-all duration-1000 ease-out rounded-full"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}50`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-center mt-4 opacity-40 italic font-book">
        Очки всех учеников суммируются в реальном времени
      </p>
    </div>
  );
};