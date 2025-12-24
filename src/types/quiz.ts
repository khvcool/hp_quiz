export type Difficulty = 'Легкая' | 'Средняя' | 'Сложная';

export interface Question {
  id?: string;
  q: string;
  a: string[];
  correct: number;
  difficulty: 'Легкая' | 'Средняя' | 'Сложная'; // Добавь это
}

export interface UserAnswer { 
  question: string; 
  selected: string; 
  correct: string; 
  isCorrect: boolean; 
}