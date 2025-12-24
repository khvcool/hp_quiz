import React from 'react';
import type { UserAnswer, Difficulty } from '../types/quiz';
import { facultyNamesRu } from '../constants/faculty'; // Проверь правильность пути к файлу

interface Props {
  score: number;
  finalTime: string;
  difficulty: Difficulty;
  userAnswers: UserAnswer[];
  expandedIdx: number | null;
  setExpandedIdx: (idx: number | null) => void;
  onRestart: () => void;
  // Добавляем новые пропсы для шеринга
  faculty?: string;
  level?: number;
}

const tg = (window as any).Telegram?.WebApp;

export const ResultView: React.FC<Props> = ({ 
  score, finalTime, difficulty, userAnswers, expandedIdx, setExpandedIdx, onRestart, faculty, level 
}) => {

  const handleShare = () => {
    if (!tg) return;

    const facultyEmoji: Record<string, string> = {
      Gryffindor: '🦁', Slytherin: '🐍', Ravenclaw: '🦅', Hufflepuff: '🦡'
    };

    const emoji = faculty ? facultyEmoji[faculty] : '🪄';

    // Используем твой готовый словарь и добавляем окончание для родительного падежа
    const rawName = faculty ? (facultyNamesRu[faculty] || faculty) : 'Хогвартса';

    // Простая проверка: если это один из основных факультетов, добавим "а" для красоты
    const facultyName = (rawName !== 'Хогвартса' && !rawName.endsWith('а')) 
      ? `${rawName}а` 
      : rawName;

    const text = `${emoji} Я защитил честь факультета ${facultyName}!\n\n` +
                `✨ Мой результат: ${score} очков\n` +
                `⏱ Время: ${finalTime}\n` +
                `🎓 Мой уровень: ${level || 1}\n\n` +
                `Сможешь превзойти меня в Potter Quiz? 👇`;

    const botLink = `https://t.me/khp_quiz_bot/khp_quiz`; 

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(text)}`;
    tg.openTelegramLink(shareUrl);
  };

  return (
    <div className="view fade-in p-6 overflow-y-auto custom-scrollbar flex flex-col">
      <div className="result-card text-center p-8 mt-4 shrink-0">
        <span className="result-label">Твой результат</span>
        <div className="result-score">{score}</div>
        <div className="result-meta">
          <span>⏱ {finalTime}</span>
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex flex-col gap-3 mt-6 shrink-0">
        <button 
          onClick={handleShare}
          className="btn-gold-fix w-full h-14 rounded-2xl font-magic flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>📣 Поделиться успехом</span>
        </button>
        
        <button 
          onClick={onRestart} 
          className="btn-primary !mt-0"
        >
          В главное меню
        </button>
      </div>

      <div className="answers-list mt-8 space-y-3 pb-10">
        <h3 className="text-center font-magic opacity-50 text-[10px] tracking-widest uppercase mb-4">Разбор полетов</h3>
        {userAnswers.map((ans, i) => (
          <div key={i} className={`answer-item ${ans.isCorrect ? 'correct' : 'wrong'}`} 
               onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="flex justify-between items-center">
              <p className="ans-q">{i + 1}. {ans.question}</p>
              <span>{ans.isCorrect ? '✓' : '✕'}</span>
            </div>
            {expandedIdx === i && (
              <div className="ans-detail mt-3">
                <p>Ваш ответ: <span className="highlight">{ans.selected}</span></p>
                {!ans.isCorrect && <p>Верный: <span className="correct-text">{ans.correct}</span></p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};