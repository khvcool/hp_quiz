import React from 'react';
import type { Question, Difficulty } from '../types/quiz';

interface Props {
  step: number; total: number; score: number; timeLeft: number;
  difficulty: Difficulty; question: Question; shuffledAnswers: string[];
  isAnswering: boolean; onAnswer: (idx: number) => void; onFinish: () => void;
  vfxStatus: string; lastSelectedIdx: number | null; combo: number;
  isAdmin: boolean; faculty: string;
}

const facultyTheme: Record<string, { color: string, glow: string }> = {
  Gryffindor: { color: '#FF4D4D', glow: '#FF4D4D' },
  Slytherin: { color: '#4ADE80', glow: '#4ADE80' },
  Ravenclaw: { color: '#60A5FA', glow: '#60A5FA' },
  Hufflepuff: { color: '#FACC15', glow: '#FACC15' },
};

const tg = (window as any).Telegram?.WebApp;

export const QuizView: React.FC<Props> = ({ 
  isAdmin, step, total, score, timeLeft, difficulty, question, 
  shuffledAnswers, isAnswering, onAnswer, onFinish, 
  vfxStatus, lastSelectedIdx, combo, faculty 
}) => {
  const maxTime = difficulty === 'Легкая' ? 15 : difficulty === 'Средняя' ? 10 : 5;
  const theme = facultyTheme[faculty] || { color: '#d4af37', glow: '#d4af37' };
  const isComboHigh = combo >= 5;

  const handleExitClick = () => {
    if (tg?.showConfirm) {
      tg.showConfirm("Завершить игру и сохранить текущий результат?", (ok: boolean) => {
        if (ok) onFinish();
      });
    } else {
      if (window.confirm("Завершить игру и сохранить результат?")) {
        onFinish();
      }
    }
  };

  return (
    <div className={`view flex flex-col h-screen p-5 fade-in bg-[var(--tg-bg)] overflow-hidden transition-all duration-700 ${isComboHigh ? 'combo-mode-active' : ''}`}>
      
      {/* ЭФФЕКТЫ ТЕПЕРЬ СТРОГО ПОЗАДИ (z-0 и pointer-events-none) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars-bg opacity-30" />
        {isComboHigh && <div className="combo-sparks opacity-40" />}
      </div>

      {/* Header */}
      <div className="flex-none flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="text-[10px] font-magic tracking-[0.2em] opacity-50 uppercase text-[var(--tg-text)]">
            Прогресс
          </div>
          <div className="text-xl font-magic text-[var(--tg-text)]">
            Вопрос <span>{step + 1}</span> 
            <span className="opacity-30 text-sm ml-1">/ {total}</span>
          </div>
        </div>
        <button 
          onClick={handleExitClick} 
          className="px-4 py-2 rounded-full border border-white/10 text-[10px] font-magic tracking-widest text-[var(--tg-text)] active:scale-90 transition-all uppercase bg-black/20"
        >
          Завершить
        </button>
      </div>

      {/* Score and Combo */}
      <div className="flex-none flex justify-between items-end mb-2 relative z-10">
        <div className="score-badge-magic px-4 py-1">
          <span className="text-[9px] font-magic opacity-50 uppercase block text-[var(--tg-text)]">Ваш счет</span>
          <span className="text-lg font-bold text-[var(--tg-text)]">{score}</span>
        </div>
        
        {combo >= 2 && (
          <div className={`animate-bounce px-3 py-1 rounded-full text-[10px] font-black tracking-tighter transition-colors duration-500 ${isComboHigh ? 'bg-[#d4af37] text-black shadow-[0_0_15px_#d4af37]' : 'bg-white/10 text-white'}`}>
            COMBO X{combo} {isComboHigh ? '🔥' : '✨'}
          </div>
        )}
      </div>

      {/* Timer Line */}
      <div className="flex-none relative z-10 mb-6">
        <div className="timer-line-container">
          <div 
            className="h-full transition-all duration-1000 ease-linear shadow-[0_0_10px]"
            style={{ 
              width: `${(timeLeft / maxTime) * 100}%`,
              backgroundColor: timeLeft < 4 ? '#ff4d4d' : (isComboHigh ? '#d4af37' : theme.color),
            }} 
          />
        </div>
      </div>

      {/* Question Card - Центрирована */}
      <div className="flex-1 flex flex-col justify-center mb-8 relative z-10">
        <div 
          className={`magic-card-quiz p-6 relative overflow-hidden transition-all duration-500 
            ${isComboHigh ? 'border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.4)] border-2' : 'border-white/10'} 
            ${vfxStatus === 'shake' ? 'vfx-shake' : ''}`}
        >
          <h2 className="text-[22px] text-center leading-tight font-book italic text-[var(--tg-text)]">
            {question?.q}
          </h2>
          {isComboHigh && (
             <div className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-magic tracking-[0.4em] text-[#d4af37] animate-pulse">
               МАГИЧЕСКИЙ КУРАЖ
             </div>
          )}
        </div>
      </div>

      {/* Answers Grid - Крупные блоки */}
      <div className="flex-none space-y-3 mb-6 relative z-10">
        {shuffledAnswers.map((opt, i) => {
          const isCorrect = opt === question?.a[question?.correct];
          const isSelected = lastSelectedIdx === i;

          return (
            <button 
              key={i} 
              disabled={isAnswering}
              onClick={() => onAnswer(i)}
              className={`w-full p-5.5 btn-answer-magic rounded-2xl flex items-center group transition-all duration-300
                ${isSelected ? 'scale-[0.98]' : 'active:scale-[0.97]'}
                min-h-[70px] border-2
              `}
              style={{ 
                borderColor: isSelected ? (isComboHigh ? '#d4af37' : theme.color) : 'rgba(255, 255, 255, 0.08)',
                backgroundColor: isSelected ? `${isComboHigh ? '#d4af37' : theme.color}25` : 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <span 
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-[12px] font-magic mr-4 shrink-0 transition-colors
                ${isSelected ? 'bg-white text-black border-white' : 'border-white/20 text-[var(--tg-text)] opacity-60'}
              `}>
                {String.fromCharCode(65 + i)}
              </span>
              
              <span className="flex-1 text-left text-[17px] leading-snug font-book text-[var(--tg-text)]">
                {opt}
                {isAdmin && isCorrect && <span className="ml-2 opacity-50">✨</span>}
              </span>

              {isSelected && (
                <span className="text-xl animate-pulse ml-2" style={{ color: isComboHigh ? '#d4af37' : theme.color }}>🪄</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};