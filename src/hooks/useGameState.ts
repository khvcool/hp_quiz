import { useState, useRef, useEffect } from 'react';
import type { Question, UserAnswer } from '../types/quiz';

export const useGameState = () => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [finalTime, setFinalTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null);
  const [vfxStatus, setVfxStatus] = useState<'normal' | 'shake' | 'combo' | 'ash'>('normal');

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (quizQuestions.length > 0 && quizQuestions[step]) {
      const currentQuestion = quizQuestions[step];
      const shuffled = [...currentQuestion.a].sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [step, quizQuestions]);

  const resetGame = (questions: Question[]) => {
    setQuizQuestions(questions);
    setStep(0);
    setScore(0);
    setUserAnswers([]);
    setCombo(0);
    setIsAnswering(false);
    setVfxStatus('normal'); // ИСПРАВЛЕНО: Сброс эффектов при старте новой сессии
    startTimeRef.current = Date.now();
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    quizQuestions, setQuizQuestions, shuffledAnswers, setShuffledAnswers,
    userAnswers, setUserAnswers, step, setStep, score, setScore,
    isAnswering, setIsAnswering, timeLeft, setTimeLeft, finalTime, setFinalTime,
    combo, setCombo, lastSelectedIdx, setLastSelectedIdx, vfxStatus, setVfxStatus,
    timerRef, startTimeRef, resetGame, stopTimer
  };
};