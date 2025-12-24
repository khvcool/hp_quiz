import React, { useRef, useState } from 'react';
import type { Question } from '../types/quiz';
import { AdminQuestions } from './AdminQuestions';
import { AdminPlayers } from './AdminPlayers';
import { AdminStats } from './AdminStats';

interface Props {
  allQuestions: Question[];
  editingQuestion: Question | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  filtered: Question[];
  onEdit: (q: Question | null) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onClose: () => void;
  onSearch: (val: string) => void;
  setPage: (val: number | ((p: number) => number)) => void;
  onImport: (questions: any[]) => void;
  allPlayers: any[];
  onUpdatePlayer: (id: string | number, data: any) => void;
  onDeletePlayer: (id: string | number) => void;
  onWipe: () => void;
}

type AdminTab = 'menu' | 'questions' | 'players' | 'stats';

export const Admin: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) props.onImport(json);
      } catch (err) { alert("Ошибка JSON"); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="view fade-in p-6 flex flex-col h-screen bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          {activeTab !== 'menu' && (
            <button onClick={() => setActiveTab('menu')} className="text-xl opacity-50 p-1 active:opacity-100">←</button>
          )}
          <h2 className="text-xl font-magic uppercase m-0 tracking-wider">
            {activeTab === 'menu' ? 'Министерство' : 
             activeTab === 'questions' ? 'Свитки' : 
             activeTab === 'players' ? 'Маги' : 'Аналитика'}
          </h2>
        </div>
        <button onClick={props.onClose} className="text-[10px] px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold uppercase">Закрыть</button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'menu' && (
        <div className="flex-1 flex flex-col justify-center gap-4">
          <button onClick={() => setActiveTab('questions')} className="p-6 flex items-center justify-between bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl border border-white/5 active:scale-95 transition-all">
            <div className="text-left"><span className="block font-bold text-lg">📝 Вопросы</span><span className="text-[10px] opacity-40">База: {props.allQuestions.length}</span></div>
            <span className="text-2xl">⚡</span>
          </button>
          <button onClick={() => setActiveTab('players')} className="p-6 flex items-center justify-between bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl border border-white/5 active:scale-95 transition-all">
            <div className="text-left"><span className="block font-bold text-lg">🧙‍♂️ Игроки</span><span className="text-[10px] opacity-40">Всего: {props.allPlayers.length}</span></div>
            <span className="text-2xl">🔮</span>
          </button>
          <button onClick={() => setActiveTab('stats')} className="p-6 flex items-center justify-between bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl border border-white/5 active:scale-95 transition-all">
            <div className="text-left"><span className="block font-bold text-lg">📊 Статистика</span><span className="text-[10px] opacity-40">Аналитика</span></div>
            <span className="text-2xl">📜</span>
          </button>
        </div>
      )}

      {activeTab === 'questions' && (
        <>
          <AdminQuestions 
            questions={props.allQuestions} 
            editingQuestion={props.editingQuestion} 
            searchQuery={props.searchQuery}
            currentPage={props.currentPage}
            totalPages={props.totalPages}
            filtered={props.filtered}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onSave={props.onSave}
            onSearch={props.onSearch}
            setPage={props.setPage}
            fileInputRef={fileInputRef}
            onFileClick={() => fileInputRef.current?.click()}
          />
          <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </>
      )}

      {activeTab === 'players' && (
        <AdminPlayers 
          players={props.allPlayers} 
          onUpdate={props.onUpdatePlayer} 
          onDelete={props.onDeletePlayer} 
        />
      )}

      {activeTab === 'stats' && (
        <AdminStats players={props.allPlayers} onWipe={props.onWipe} />
      )}
    </div>
  );
};