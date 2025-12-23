import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

type Difficulty = 'Легкая' | 'Средняя' | 'Тяжелая';
interface Question { id?: string; q: string; a: string[]; correct: number; }
interface UserAnswer { question: string; selected: string; correct: string; isCorrect: boolean; }

const tg = (window as any).Telegram?.WebApp;
const ADMIN_ID = 905316819;

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'quiz' | 'result' | 'admin' | 'leaderboard' | 'settings'>('menu');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Легкая');
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState<Difficulty>('Легкая');
  const [timeLeft, setTimeLeft] = useState(15);
  const [finalTime, setFinalTime] = useState(0);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const user = tg?.initDataUnsafe?.user;

  const fetchQuestions = async () => {
    const { data, error } = await supabase.from('questions').select('*');
    if (!error && data) setAllQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    const channel = supabase.channel('questions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => {
        fetchQuestions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (view === 'quiz' && quizQuestions[step]) {
      const time = difficulty === 'Легкая' ? 15 : difficulty === 'Средняя' ? 10 : 5;
      setTimeLeft(time);
      setShuffledAnswers([...quizQuestions[step].a].sort(() => Math.random() - 0.5));
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft(p => { 
        if (p <= 1) { handleAnswer(-1); return 0; } 
        return p - 1; 
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, view, quizQuestions, difficulty]);

  const startQuiz = () => {
    if (!allQuestions.length) return;
    const len = difficulty === 'Легкая' ? 25 : difficulty === 'Средняя' ? 50 : 150;
    setQuizQuestions([...allQuestions].sort(() => Math.random() - 0.5).slice(0, len));
    setStep(0); setScore(0); setUserAnswers([]); startTimeRef.current = Date.now(); setView('quiz'); setIsAnswering(false);
    tg?.expand();
  };

  const handleAnswer = (idx: number) => {
    if (isAnswering) return; setIsAnswering(true);
    clearInterval(timerRef.current);
    const q = quizQuestions[step], sel = idx === -1 ? "Время вышло" : shuffledAnswers[idx], ok = sel === q.a[q.correct];
    if (ok) { setScore(s => s + 1); tg?.HapticFeedback.notificationOccurred('success'); }
    else { tg?.HapticFeedback.notificationOccurred('error'); }
    setUserAnswers(p => [...p, { question: q.q, selected: sel, correct: q.a[q.correct], isCorrect: ok }]);
    setTimeout(() => {
      if (step + 1 < quizQuestions.length) { setStep(s => s + 1); setIsAnswering(false); }
      else finishQuiz();
    }, 400);
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    const time = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setFinalTime(time);
    setView('result');
    if (score > 0) {
      await supabase.from('scores').insert([{ 
        name: user?.first_name || "Маг", 
        points: score, 
        totalTime: time, 
        difficulty, 
        date: new Date().toISOString() 
      }]);
    }
  };

  const loadLB = async (d: Difficulty) => {
    setLeaderboardDifficulty(d);
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('difficulty', d)
      .order('points', { ascending: false })
      .order('totalTime', { ascending: true })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  const filtered = allQuestions.filter(q => q.q.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / 10);

  if (loading) return <div className="fixed inset-0 grid place-items-center bg-tg-bg text-[#D4AF37] font-serif italic text-2xl animate-pulse">🔮 Загрузка...</div>;

  return (
    <div className="fixed inset-0 w-full bg-tg-bg text-tg-text overflow-hidden p-6 box-border select-none">
      
      {/* МЕНЮ */}
      {view === 'menu' && (
        <div className="h-full w-full grid grid-rows-[1fr_auto] items-center text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center w-full">
            <h1 className="text-6xl font-black text-[#D4AF37] tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Hogwarts</h1>
            <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-2 mb-4 opacity-50" />
            <p className="text-[10px] opacity-60 uppercase tracking-[0.6em] font-bold">⚡ Magical Quiz</p>
            <div className="mt-10 bg-[#D4AF37]/5 backdrop-blur-md border border-[#D4AF37]/20 rounded-2xl p-4 px-10">
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest opacity-60 italic">📜 Библиотека</p>
              <p className="text-3xl font-black mt-1 tracking-wider">{allQuestions.length}</p>
            </div>
          </div>
          <div className="grid gap-4 w-full pb-6">
            <button onClick={startQuiz} className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black font-black text-xl shadow-lg active:scale-[0.98] transition-all">🔥 ИГРАТЬ</button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setView('leaderboard'); loadLB(difficulty); }} className="py-4 rounded-xl bg-tg-hint/10 border border-tg-hint/20 font-bold uppercase text-[10px]">🏆 Рейтинг</button>
              <button onClick={() => setView('settings')} className="py-4 rounded-xl bg-tg-hint/10 border border-tg-hint/20 font-bold uppercase text-[10px]">⚙️ Настройки</button>
            </div>
            {user?.id === ADMIN_ID && <button onClick={() => setView('admin')} className="py-2 text-[#D4AF37] text-[10px] font-bold uppercase opacity-40">🧙‍♂️ Министерство</button>}
          </div>
        </div>
      )}

      {/* НАСТРОЙКИ */}
      {view === 'settings' && (
        <div className="h-full w-full grid grid-rows-[auto_1fr_auto] gap-8 animate-in slide-in-from-right">
          <div className="text-center"><h2 className="text-3xl font-black text-[#D4AF37] uppercase italic">⚙️ Настройки</h2></div>
          <div className="flex flex-col justify-center gap-4">
            {(['Легкая', 'Средняя', 'Тяжелая'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`grid grid-cols-[1fr_auto] items-center p-5 rounded-3xl border-2 transition-all ${difficulty === d ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-tg-hint/10 opacity-30'}`}>
                <div className="text-left">
                  <p className="font-black text-lg uppercase">{d === 'Легкая' ? '🌱 ' + d : d === 'Средняя' ? '🎓 ' + d : '💀 ' + d}</p>
                  <p className="text-[9px] font-bold opacity-60 uppercase mt-1">
                    {d === 'Легкая' ? '25 вопр. • 15 сек' : d === 'Средняя' ? '50 вопр. • 10 сек' : '150 вопр. • 5 сек'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[9px] font-black ${difficulty === d ? 'bg-[#D4AF37] text-black' : 'bg-tg-hint/20'}`}>ВЫБРАТЬ</div>
              </button>
            ))}
          </div>
          <button onClick={() => setView('menu')} className="w-full py-5 bg-tg-button text-tg-button-text rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all mb-6">Готово</button>
        </div>
      )}

      {/* ЛИДЕРБОРД */}
      {view === 'leaderboard' && (
        <div className="h-full w-full grid grid-rows-[auto_auto_1fr_auto] gap-6 overflow-hidden animate-in slide-in-from-left">
          <h2 className="text-3xl font-black text-[#D4AF37] text-center uppercase italic">🏆 Рекорды</h2>
          <div className="flex p-1 bg-tg-hint/10 rounded-2xl shrink-0">
            {(['Легкая', 'Средняя', 'Тяжелая'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => loadLB(d)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${leaderboardDifficulty === d ? 'bg-[#D4AF37] text-black shadow-lg' : 'opacity-40'}`}>{d}</button>
            ))}
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {leaderboard.length > 0 ? leaderboard.map((p, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10 gap-4">
                <span className="text-lg font-black italic text-[#D4AF37]/40">{i < 3 ? ['🥇','🥈','🥉'][i] : '#' + (i + 1)}</span>
                <p className="font-bold truncate uppercase text-sm">{p.name}</p>
                <div className="text-right font-black text-[#D4AF37] text-lg">{p.points}</div>
              </div>
            )) : <p className="text-center opacity-20 py-10 italic text-xs">Здесь пока пусто...</p>}
          </div>
          <button onClick={() => setView('menu')} className="w-full py-4 text-tg-hint font-bold text-[10px] uppercase mb-6 shrink-0">Назад</button>
        </div>
      )}

      {/* АДМИНКА */}
      {view === 'admin' && (
        <div className="h-full w-full grid grid-rows-[auto_1fr] gap-4 overflow-hidden animate-in fade-in">
          <div className="flex justify-between items-end border-b border-[#D4AF37]/30 pb-2">
            <div>
               <h2 className="font-black text-[#D4AF37] text-lg uppercase italic">🧙‍♂️ Министерство</h2>
               <p className="text-[8px] opacity-40 font-bold uppercase tracking-widest">Вопросов: {allQuestions.length}</p>
            </div>
            <button onClick={() => setView('menu')} className="text-[10px] text-red-500 font-bold uppercase pb-1">Выход</button>
          </div>
          <div className="grid overflow-hidden min-h-0">
            {editingQuestion ? (
              <div className="grid gap-2 bg-tg-hint/5 p-3 rounded-2xl border border-[#D4AF37]/20 overflow-y-auto content-start">
                <textarea className="w-full p-2.5 rounded-xl bg-tg-bg border border-tg-hint/20 text-xs outline-none focus:border-[#D4AF37]" rows={2} value={editingQuestion.q} onChange={e => setEditingQuestion({...editingQuestion, q: e.target.value})} />
                {editingQuestion.a.map((ans, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-1.5">
                    <input className={`p-2 rounded-lg text-[10px] bg-tg-bg border ${editingQuestion.correct === i ? 'border-green-500' : 'border-tg-hint/20'}`} value={ans} onChange={e => { const newA = [...editingQuestion.a]; newA[i] = e.target.value; setEditingQuestion({...editingQuestion, a: newA}); }} />
                    <button onClick={() => setEditingQuestion({...editingQuestion, correct: i})} className={`px-3 rounded-lg text-[9px] font-bold ${editingQuestion.correct === i ? 'bg-green-500 text-white' : 'bg-tg-hint/20'}`}>OK</button>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2 mt-1 shrink-0">
                  <button onClick={async () => { 
                    if(editingQuestion.id) { 
                      const {id, ...data} = editingQuestion; 
                      await supabase.from('questions').update(data).eq('id', id);
                      setEditingQuestion(null); 
                    } 
                  }} className="py-2.5 bg-green-600 text-white rounded-lg font-bold text-[10px] uppercase">Сохранить</button>
                  <button onClick={() => setEditingQuestion(null)} className="py-2.5 bg-tg-hint/20 rounded-lg font-bold text-[10px] uppercase">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-rows-[auto_1fr_auto] gap-3 overflow-hidden">
                <div className="grid gap-2 shrink-0">
                  <label htmlFor="f" className="py-3 bg-[#D4AF37] text-black rounded-xl font-black text-center text-[9px] uppercase cursor-pointer">📥 Импорт JSON</label>
                  <input type="file" id="f" className="hidden" onChange={e => { 
                    const file = e.target.files?.[0]; 
                    if(file) { 
                      const reader = new FileReader(); 
                      reader.onload = async (ev) => { 
                        try { 
                          const d = JSON.parse(ev.target?.result as string); 
                          await supabase.from('questions').insert(d);
                        } catch { alert("Err"); } 
                      }; 
                      reader.readAsText(file); 
                    } 
                  }} />
                  <input placeholder="Поиск..." className="p-3 bg-tg-hint/5 border border-tg-hint/10 rounded-xl text-xs outline-none" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 content-start custom-scrollbar">
                  {filtered.slice((currentPage-1)*10, currentPage*10).map(q => (
                    <div key={q.id} className="grid grid-cols-[1fr_auto_auto] items-center p-2.5 bg-tg-hint/5 rounded-xl border border-tg-hint/10 gap-2">
                      <span className="text-[10px] truncate font-medium opacity-80">{q.q}</span>
                      <button onClick={() => setEditingQuestion(q)} className="text-blue-400 font-bold text-[8px] uppercase px-1">⚙️</button>
                      <button onClick={async () => { if(q.id) await supabase.from('questions').delete().eq('id', q.id); }} className="text-red-500 font-bold text-xs px-1">✕</button>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 pt-2 border-t border-tg-hint/10 shrink-0">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-[#D4AF37] font-bold text-[9px] uppercase disabled:opacity-20 px-2">←</button>
                    <span className="text-[8px] font-bold opacity-30 uppercase text-center">{currentPage} / {totalPages}</span>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-[#D4AF37] font-bold text-[9px] uppercase disabled:opacity-20 px-2">→</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ВИКТОРИНА */}
      {view === 'quiz' && (
        <div className="h-full w-full grid grid-rows-[auto_auto_1fr] gap-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-tg-hint/5 p-3 rounded-2xl border border-tg-hint/10 shrink-0">
            <span className="text-xs font-black text-[#D4AF37]">✨ {step + 1} / {quizQuestions.length}</span>
            <button onClick={finishQuiz} className="text-[9px] font-black text-red-500 bg-red-500/10 px-4 py-2 rounded-xl">🛑 СТОП</button>
          </div>
          <div className="h-1.5 bg-tg-hint/10 rounded-full overflow-hidden mb-2 shrink-0">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 4 ? 'bg-red-500 animate-pulse' : 'bg-[#D4AF37]'}`} 
              style={{ width: `${(timeLeft / (difficulty === 'Легкая' ? 15 : difficulty === 'Средняя' ? 10 : 5)) * 100}%` }} 
            />
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto pb-10 custom-scrollbar">
            <div className="bg-[#D4AF37]/5 p-6 rounded-3xl border border-[#D4AF37]/20 shadow-inner"><h2 className="text-xl font-bold leading-relaxed">{quizQuestions[step]?.q}</h2></div>
            <div className="grid gap-3">
              {shuffledAnswers.map((opt, i) => (
                <button key={i} disabled={isAnswering} onClick={() => handleAnswer(i)} className="w-full p-5 rounded-2xl text-left bg-tg-button text-tg-button-text font-bold border border-white/5 active:scale-[0.98] transition-all flex gap-4 items-center shadow-md">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-tg-bg/50 text-[#D4AF37] text-xs font-black shrink-0">{String.fromCharCode(65 + i)}</span>
                  <span className="text-sm leading-tight">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {view === 'result' && (
        <div className="h-full w-full grid grid-rows-[auto_1fr_auto] gap-6 overflow-hidden animate-in slide-in-from-bottom">
          <div className="text-center py-6 flex flex-col items-center shrink-0">
            <h1 className="text-9xl font-black text-[#D4AF37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">{score}</h1>
            <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.5em] mb-2">🏆 Баллы</p>
            {score === 0 && <p className="text-[8px] text-red-500/60 uppercase font-bold mb-4">Не сохранено (нужен хотя бы 1 балл)</p>}
            <div className="flex gap-3 text-[9px] font-black uppercase tracking-wider">
              <span className="bg-tg-hint/10 px-4 py-2 rounded-xl border border-tg-hint/10">🧙‍♂️ {difficulty}</span>
              <span className="bg-tg-hint/10 px-4 py-2 rounded-xl border border-tg-hint/10">⏱️ {finalTime}с</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
            {userAnswers.map((ans, i) => (
              <div key={i} onClick={() => setExpandedIdx(expandedIdx === i ? null : i)} className={`p-4 rounded-2xl border transition-all ${ans.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-xs font-bold truncate flex-1 opacity-90">{i + 1}. {ans.question}</p>
                  <span className="text-lg">{ans.isCorrect ? '✨' : '💀'}</span>
                </div>
                {expandedIdx === i && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-[10px] animate-in fade-in">
                    <p className={ans.isCorrect ? 'text-green-500' : 'text-red-400'}>Ваш: {ans.selected}</p>
                    {!ans.isCorrect && <p className="text-green-500 font-bold mt-1 uppercase">Верно: {ans.correct}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => setView('menu')} className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black font-black text-lg shadow-xl mb-6 shrink-0">В МЕНЮ</button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-left { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-bottom { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation-duration: 0.4s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-right; }
        .slide-in-from-left { animation-name: slide-left; }
        .slide-in-from-bottom { animation-name: slide-bottom; }
      `}</style>
    </div>
  );
};

export default App;