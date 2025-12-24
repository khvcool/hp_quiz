import React from 'react';
import type { Question } from '../types/quiz';

interface Props {
  questions: Question[];
  editingQuestion: Question | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  filtered: Question[];
  onEdit: (q: Question | null) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onSearch: (val: string) => void;
  setPage: (val: number | ((p: number) => number)) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileClick: () => void;
}

export const AdminQuestions: React.FC<Props> = ({
  editingQuestion, searchQuery, currentPage, totalPages, filtered,
  onEdit, onDelete, onSave, onSearch, setPage, onFileClick
}) => {
  if (editingQuestion) {
    return (
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <textarea 
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none" 
          rows={3} 
          value={editingQuestion.q} 
          onChange={e => onEdit({...editingQuestion, q: e.target.value})} 
        />
        <div className="space-y-2">
          {editingQuestion.a.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" 
                value={opt} 
                onChange={e => {
                  const newA = [...editingQuestion.a]; 
                  newA[i] = e.target.value;
                  onEdit({...editingQuestion, a: newA});
                }} 
              />
              <button 
                onClick={() => onEdit({...editingQuestion, correct: i})} 
                className={`px-3 rounded-lg text-[10px] font-bold ${editingQuestion.correct === i ? 'bg-green-500 text-white' : 'bg-white/10 opacity-40'}`}
              >
                {editingQuestion.correct === i ? '✓' : 'SET'}
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-auto pb-4">
          <button onClick={onSave} className="btn-primary py-4 rounded-xl font-bold uppercase">Сохранить</button>
          <button onClick={() => onEdit(null)} className="text-xs font-bold opacity-50 uppercase py-2 text-center">Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-2 mb-4 shrink-0">
        <input 
          placeholder="Поиск вопроса..." 
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" 
          value={searchQuery} 
          onChange={e => { onSearch(e.target.value); setPage(1); }} 
        />
        <button onClick={onFileClick} className="bg-[#3390ec] text-white px-4 rounded-xl">📥</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {filtered.slice((currentPage - 1) * 10, currentPage * 10).map((q) => (
          <div key={q.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <span className="text-[12px] truncate flex-1 opacity-80 pr-2">{q.q}</span>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => onEdit(q)} className="text-sm">✏️</button>
              <button onClick={() => q.id && onDelete(q.id)} className="text-sm text-red-400">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center py-4 shrink-0 border-t border-white/5 mt-2">
        <button disabled={currentPage === 1} onClick={() => setPage(p => p - 1)} className="text-xs font-bold opacity-50 disabled:opacity-5">← Назад</button>
        <span className="text-[10px] font-black opacity-30">{currentPage} / {totalPages}</span>
        <button disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)} className="text-xs font-bold opacity-50 disabled:opacity-5">Вперед →</button>
      </div>
    </div>
  );
};