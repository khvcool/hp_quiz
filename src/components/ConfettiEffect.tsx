import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  fire: boolean;
}

export const ConfettiEffect: React.FC<Props> = ({ fire }) => {
  useEffect(() => {
    if (fire) {
      // Создаем базовые настройки
      const defaults: confetti.Options = {
        spread: 360,
        ticks: 100,
        gravity: 1.5,
        decay: 0.92,
        startVelocity: 30,
        colors: ['#FFE100', '#FF7F00', '#FF4D4D', '#8B00FF', '#60A5FA', '#4ADE80'],
        zIndex: 0, // Это свойство существует в типах и оно ключевое
      };

      // 1. Центральный залп
      confetti({
        ...defaults,
        particleCount: 60,
        scalar: 1.1,
        shapes: ['circle', 'star'],
        origin: { y: 0.6 }
      });

      // 2. Мелкие золотые искры
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 0.8,
        shapes: ['star'],
        colors: ['#FFD700'],
        origin: { y: 0.6 }
      });

      // 3. Боковые залпы
      confetti({
        ...defaults,
        particleCount: 20,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });

      confetti({
        ...defaults,
        particleCount: 20,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });
    }
  }, [fire]);

  return null;
};