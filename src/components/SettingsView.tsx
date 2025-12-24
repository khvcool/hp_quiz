import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Difficulty } from '../types/quiz';

const tg = (window as any).Telegram?.WebApp;

interface Props {
  currentDifficulty: Difficulty;
  onSelect: (d: Difficulty) => void;
  onSave: () => void;
  onResetFaculty: () => void;
}

export const SettingsView: React.FC<Props> = ({ currentDifficulty, onSelect, onSave, onResetFaculty }) => {
  
  const handleReset = () => {
    // Виброотклик
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }

    // Если мы в Telegram, показываем их нативное окно
    if (tg?.showConfirm) {
      tg.showConfirm("Вы уверены, что хотите покинуть свой текущий факультет? Весь прогресс в битве будет сброшен.", (ok: boolean) => {
        if (ok) {
          onResetFaculty();
          onSave(); // Автоматически закрываем настройки после сброса
        }
      });
    } else {
      // Резервный вариант для браузера
      if (window.confirm("Сбросить факультет?")) {
        onResetFaculty();
        onSave();
      }
    }
  };

  return (
    <div className="view fade-in p-6 flex flex-col h-screen text-[var(--tg-theme-text-color)]">
      <div className="flex items-center mb-8 relative z-10">
        <button 
          onClick={onSave}
          className="p-2 rounded-lg mr-4 bg-white/5 hover:bg-white/10 transition-all active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="view-title !mb-0 font-magic tracking-widest uppercase text-lg">Настройки</h2>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 relative z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1">Сложность игры</p>
        
        {(['Легкая', 'Средняя', 'Сложная'] as Difficulty[]).map(d => (
          <button 
            key={d} 
            onClick={() => onSelect(d)} 
            className={`select-card !py-3 !px-5 flex items-center justify-between border-2 transition-all ${currentDifficulty === d ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/5 bg-white/5'}`}
          >
            <div className="flex flex-col items-start text-left">
              <strong className="text-sm tracking-wide">{d}</strong>
              <span className="text-[10px] opacity-50">
                {d === 'Легкая' ? '15 вопр. • 15 сек' : d === 'Средняя' ? '25 вопр. • 10 сек' : '50 вопр. • 5 сек'}
              </span>
            </div>
            {currentDifficulty === d && <div className="text-[#d4af37] text-xl">✓</div>}
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 ml-1">Аккаунт</p>
          <button 
            onClick={handleReset} 
            className="w-full py-4 rounded-xl border border-dashed border-[#ef4444]/30 text-[#ef4444]/60 text-[11px] font-bold hover:bg-[#ef4444]/5 transition-all active:scale-[0.98]"
          >
            👒 Пройти распределение заново
          </button>
        </div>
      </div>

      <button onClick={onSave} className="btn-primary mt-4 mb-8 shrink-0 shadow-lg relative z-10">
        Применить изменения
      </button>

      <div className="stars-bg opacity-10" />
    </div>
  );
};