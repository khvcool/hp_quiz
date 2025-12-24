import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import './styles/App.css';

import { ADMIN_ID, formatTime } from './constants/faculty';
import { useAppInit } from './hooks/useAppInit';
import { useGameState } from './hooks/useGameState';
import type { Difficulty, Question } from './types/quiz';

import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { SettingsView } from './components/SettingsView';
import { Leaderboard } from './components/Leaderboard';
import { Admin } from './components/Admin';
import { SortingHat } from './components/SortingHat';
import { ConfettiEffect } from './components/ConfettiEffect';
import { MenuView } from './components/MainMenuView';
import { ProfileView } from './components/ProfileView';

const tg = (window as any).Telegram?.WebApp;

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'quiz' | 'result' | 'admin' | 'leaderboard' | 'settings' | 'sorting' | 'profile'>(
    localStorage.getItem('user_faculty') ? 'menu' : 'sorting'
  );
  const [difficulty, setDifficulty] = useState<Difficulty>('Легкая');
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // --- СОСТОЯНИЯ ДЛЯ АДМИНКИ (ВОПРОСЫ) ---
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- СОСТОЯНИЯ ДЛЯ АДМИНКИ (ИГРОКИ) ---
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  const init = useAppInit(tg);
  const game = useGameState();

  // Фильтрация вопросов для админки
  const filteredQuestions = useMemo(() => {
    return init.allQuestions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [init.allQuestions, searchQuery]);

  const totalPages = Math.ceil(filteredQuestions.length / 10);

  // --- ФУНКЦИИ АДМИНКИ (ВОПРОСЫ) ---
  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    const { error } = await supabase
      .from('questions')
      .upsert(editingQuestion);
    
    if (!error) {
      setEditingQuestion(null);
      // Перезагружаем вопросы в init хуке (если там есть такая функция) или просто через window.location.reload() для простоты
      tg?.showAlert?.("Сохранено!");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    tg?.showConfirm?.("Удалить вопрос безвозвратно?", async (ok: boolean) => {
      if (ok) {
        await supabase.from('questions').delete().eq('id', id);
        tg?.showAlert?.("Удалено");
      }
    });
  };

  const handleImportQuestions = async (questions: any[]) => {
    const { error } = await supabase.from('questions').insert(questions);
    if (!error) tg?.showAlert?.(`Успешно импортировано ${questions.length} вопросов`);
    else tg?.showAlert?.("Ошибка импорта");
  };

  // --- ФУНКЦИИ АДМИНКИ (ИГРОКИ) ---
  const fetchAllPlayers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('level', { ascending: false });

    if (data) {
      setAllPlayers(data.map(p => ({
        // Оставляем оригинальные названия из БД, чтобы компоненты их видели
        tg_id: p.tg_id,
        username: p.username || "Неизвестный маг",
        faculty: p.faculty,
        level: p.level || 1,
        best_score: p.best_score || 0,
        xp: p.xp || 0,
        total_games: p.total_games || 0,
        is_banned: p.is_banned || false
      })));
    }
  };

  const handleGlobalWipe = async () => {
    const confirmWipe = window.confirm("ВНИМАНИЕ! Это действие полностью обнулит очки игроков, уровни и статистику факультетов. Это необратимо. Продолжить?");
    
    if (!confirmWipe) return;

    try {
      // 1. Сброс кубка факультетов
      const { error: fError } = await supabase
        .from('faculty_cup')
        .update({ total_points: 0 })
        .neq('faculty_id', ''); // Обновить все записи

      // 2. Сброс профилей (кроме банов и имен)
      const { error: pError } = await supabase
        .from('profiles')
        .update({ 
          xp: 0, 
          level: 1, 
          total_games: 0, 
          best_score: 0 
        })
        .neq('tg_id', 0);

      // 3. Очистка таблицы истории игр
      const { error: sError } = await supabase
        .from('scores')
        .delete()
        .neq('points', -1); // Удалить всё

      if (fError || pError || sError) throw new Error("Ошибка при очистке");

      alert("Магический мир обновлен! Все показатели сброшены.");
      
      // Перезагружаем данные, чтобы админка обновилась
      init.fetchProfile();
      fetchAllPlayers();
      init.loadCupLeader();
      
    } catch (err) {
      console.error(err);
      alert("Не удалось провести очистку");
    }
  };

  const handleUpdatePlayer = async (id: string | number, updatedData: any) => {
    const numericId = Number(id);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('tg_id', numericId)
      .select();

    if (error) {
      tg?.showAlert?.(`Ошибка: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      // Обновляем список в админке
      setAllPlayers(prev => prev.map(p => 
        (p.tg_id === numericId || p.id === numericId) ? { ...p, ...updatedData } : p
      ));

      // Если обновили себя
      if (numericId === Number(init.tgId)) {
        await init.fetchProfile();
      }
      
      tg?.HapticFeedback?.notificationOccurred('success');
    }
  };

  const handleDeletePlayer = async (id: string | number) => { // Добавили | number
    tg?.showConfirm?.("Удалить профиль игрока?", async (ok: boolean) => {
      if (ok) {
        // Приводим к строке для соответствия логике API
        await supabase.from('profiles').delete().eq('tg_id', id.toString());
        setAllPlayers(prev => prev.filter(p => p.id.toString() !== id.toString()));
        
        // Если удалили сами себя (для тестов), выходим в сортровку
        if (Number(id) === Number(init.tgId)) {
          localStorage.clear();
          window.location.reload();
        } else {
          setView('menu'); // Возвращаем админа в меню после удаления игрока
        }
      }
    });
  };

  // --- ОСТАЛЬНАЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ---
  useEffect(() => {
    if (view === 'quiz' && game.quizQuestions[game.step]) {
      const time = difficulty === 'Легкая' ? 15 : difficulty === 'Средняя' ? 10 : 5;
      game.setTimeLeft(time);
      game.stopTimer();
      game.timerRef.current = setInterval(() => {
        game.setTimeLeft(p => {
          if (p <= 1) { handleAnswer(-1); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => game.stopTimer();
  }, [game.step, view, game.quizQuestions, difficulty]);

  const handleCompleteSorting = async (selectedFaculty: string) => {
    // 1. Сохраняем локально
    localStorage.setItem('user_faculty', selectedFaculty);
    init.setFaculty(selectedFaculty);

    // 2. Записываем в базу данных
    const userId = Number(init.tgId);
    const { error } = await supabase
      .from('profiles')
      .update({ faculty: selectedFaculty })
      .eq('tg_id', userId);

    if (error) {
      console.error("Ошибка сохранения факультета в БД:", error);
    }

    // 3. Обновляем профиль в приложении и идем в меню
    await init.fetchProfile();
    setView('menu');
  };

  const startQuiz = () => {
    if (!init.profile) {
      tg?.showAlert?.("Магия загружается...");
      init.fetchProfile();
      return;
    }
    const available = init.allQuestions.filter(q => 
      difficulty === 'Легкая' ? q.difficulty === 'Легкая' : 
      difficulty === 'Средняя' ? q.difficulty !== 'Сложная' : true
    );
    const len = difficulty === 'Легкая' ? 15 : difficulty === 'Средняя' ? 25 : 50;
    game.resetGame([...available].sort(() => Math.random() - 0.5).slice(0, len));
    setView('quiz');
    tg?.expand();
  };

  const handleAnswer = (idx: number) => {
    if (game.isAnswering) return;
    game.setIsAnswering(true);
    game.setLastSelectedIdx(idx);
    const q = game.quizQuestions[game.step];
    const isCorrect = idx !== -1 && game.shuffledAnswers[idx] === q.a[q.correct];
    
    game.setUserAnswers(prev => [...prev, { 
      question: q.q, selected: idx === -1 ? "Время вышло" : game.shuffledAnswers[idx], 
      correct: q.a[q.correct], isCorrect 
    }]);

    if (isCorrect) {
      game.setScore(s => s + 1);
      game.setCombo(c => {
        if (c + 1 >= 5) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 50); }
        return c + 1;
      });
    } else {
      game.setCombo(0);
      game.setVfxStatus('shake');
      if (tg?.isVersionAtLeast?.('6.1')) tg.HapticFeedback.notificationOccurred('error');
    }

    setTimeout(() => {
      game.setVfxStatus('normal');
      game.setLastSelectedIdx(null);
      if (game.step + 1 < game.quizQuestions.length) {
        game.setStep(s => s + 1);
        game.setIsAnswering(false);
      } else {
        finishQuiz(game.score + (isCorrect ? 1 : 0));
      }
    }, 600);
  };

  const finishQuiz = async (finalScoreValue: number) => {
    const time = Math.floor((Date.now() - game.startTimeRef.current) / 1000);
    game.setFinalTime(time);
    game.stopTimer();
    setView('result');

    // Если набрано 0 или больше
    if (finalScoreValue >= 0) {
      if (finalScoreValue > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      const userId = Number(init.tgId);
      
      try {
        // 1. Сохраняем результат в историю (scores)
        await supabase.from('scores').insert([{ 
          tg_id: userId, 
          name: tg?.initDataUnsafe?.user?.first_name || "Маг", 
          points: finalScoreValue, 
          totalTime: time, 
          difficulty, 
          faculty: init.faculty 
        }]);

        // 2. Обновляем очки ФАКУЛЬТЕТА (faculty_cup)
        if (init.faculty && finalScoreValue > 0) {
          // Используем RPC (хранимую процедуру), чтобы избежать потери очков при одновременной игре
          const { error: cupError } = await supabase.rpc('increment_faculty_score', { 
            f_id: init.faculty, 
            points_to_add: finalScoreValue 
          });

          // Если RPC не настроен, используем обычный запрос (запасной вариант)
          if (cupError) {
             console.warn("RPC не найден, обновляю через обычный update");
             const { data: currentCup } = await supabase
              .from('faculty_cup')
              .select('total_points')
              .eq('faculty_id', init.faculty)
              .single();
            
            await supabase
              .from('faculty_cup')
              .update({ total_points: (currentCup?.total_points || 0) + finalScoreValue })
              .eq('faculty_id', init.faculty);
          }
        }

        // 3. Обновляем ПРОФИЛЬ игрока
        if (init.profile) {
          const isNewRecord = finalScoreValue > (init.profile.best_score || 0);
          const addedXp = finalScoreValue * 10; 
          const newXp = (init.profile.xp || 0) + addedXp;
          const newLevel = Math.floor(newXp / 1000) + 1;

          await supabase
            .from('profiles')
            .update({
              best_score: isNewRecord ? finalScoreValue : init.profile.best_score,
              xp: newXp,
              level: newLevel,
              total_games: (init.profile.total_games || 0) + 1
            })
            .eq('tg_id', userId);
        }

        // 4. СИНХРОНИЗАЦИЯ: Обновляем всё локально, чтобы на главной всё изменилось
        await Promise.all([
          init.fetchProfile(),     // Обновит уровень/рекорд в меню
          init.loadCupLeader()     // Обновит лидера и проценты на главной
        ]);

      } catch (err) {
        console.error("Ошибка при сохранении магических данных:", err);
      }
    } else { 
      game.setVfxStatus('ash'); 
    }
  };

  const loadLB = async (d: Difficulty) => {
    setDifficulty(d);
    const { data } = await supabase.from('scores')
      .select(`points, totalTime, faculty, name, tg_id, profiles!inner(level, username)`)
      .eq('difficulty', d).order('points', { ascending: false }).limit(20);
    if (data) setLeaderboard(data.map((item: any) => ({ ...item, level: item.profiles?.level || 1, name: item.profiles?.username || item.name })));
  };

  // 1. Добавь состояние в начало компонента App
  const [facultyStats, setFacultyStats] = useState<any[]>([]);

  // 2. Создай функцию загрузки (можно разместить внутри App или вынести)
  const loadFacultyStats = async () => {
    // Запрашиваем агрегированные данные из таблицы faculty_cup
    // (Убедись, что в базе есть таблица faculty_cup с колонками faculty_id и total_points)
    const { data } = await supabase
      .from('faculty_cup')
      .select('faculty_id, total_points')
      .order('total_points', { ascending: false });

    if (data) {
      setFacultyStats(data.map(d => ({
        faculty: d.faculty_id,
        total_points: d.total_points
      })));
    }
  };

  // 1. Исправленная функция внутри App компонента
  const handleResetFaculty = async () => {
    try {
      const userId = Number(init.tgId);
      
      // Обнуляем факультет в таблице profiles (согласно вашей логике БД)
      const { error } = await supabase
        .from('profiles')
        .update({ faculty: null }) 
        .eq('tg_id', userId);

      if (error) throw error;

      // Сбрасываем локальное хранилище, чтобы при перезагрузке не кидало в меню
      localStorage.removeItem('user_faculty');

      // Обновляем состояние через объект init из вашего хука useAppInit
      // Если в useAppInit нет setFaculty, убедитесь что вы обновляете нужное поле
      init.setFaculty(null); 
      
      // ВАЖНО: Переходим на экран сортировки ('sorting')
      setView('sorting'); 
      
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (err) {
      console.error("Ошибка при сбросе факультета:", err);
      tg?.showAlert?.("Не удалось связаться с Министерством Магии...");
    }
  };

  // 3. Добавь вызов загрузки в useEffect при инициализации
  useEffect(() => {
    loadFacultyStats();
  }, []);

  // 4. Обнови функцию goToMenu, чтобы данные освежались при возврате на главный экран
  const goToMenu = async () => {
    game.setVfxStatus('normal');
    setShowConfetti(false);
    
    await Promise.all([
      init.loadCupLeader(),
      init.fetchProfile(),
      loadFacultyStats() // Добавили обновление полосок битвы
    ]);
    
    setView('menu');
  };

  if (init.loading) return <div className="loader">✨</div>;

  return (
    <div className={`app-container ${game.vfxStatus === 'ash' ? 'vfx-ash' : ''}`}>
      <ConfettiEffect fire={showConfetti} />
      {view === 'sorting' && <SortingHat onSorted={handleCompleteSorting} />}
      
      {view === 'menu' && (
        <MenuView 
          faculty={init.faculty} profile={init.profile} topFaculty={init.topFaculty} 
          facultyStats={facultyStats}
          isLeaderChanged={init.isLeaderChanged} onStart={startQuiz} 
          onOpenLeaderboard={() => { setView('leaderboard'); loadLB(difficulty); }} 
          onOpenSettings={() => setView('settings')}
          onOpenProfile={() => { setSelectedProfile(init.profile); setView('profile'); }}
          onOpenAdmin={() => { fetchAllPlayers(); setView('admin'); }} 
          isAdmin={Number(init.tgId) === ADMIN_ID}
          currentDifficulty={difficulty}
        />
      )}

      {view === 'leaderboard' && (
        <Leaderboard data={leaderboard} currentDifficulty={difficulty} onLoad={loadLB} onBack={goToMenu} onOpenProfile={(p) => { setSelectedProfile(p); setView('profile'); }} formatTime={formatTime} currentUserId={tg?.initDataUnsafe?.user?.id || ''} />
      )}

      {view === 'profile' && <ProfileView profile={selectedProfile} onBack={() => setView('menu')} isAdmin={Number(init.tgId) === ADMIN_ID} onUpdate={handleUpdatePlayer} onDelete={handleDeletePlayer} />}

      {view === 'quiz' && game.quizQuestions[game.step] && (
        <QuizView {...game} total={game.quizQuestions.length} difficulty={difficulty} question={game.quizQuestions[game.step]} onAnswer={handleAnswer} onFinish={() => finishQuiz(game.score)} isAdmin={Number(init.tgId) === ADMIN_ID} faculty={init.faculty || 'Gryffindor'} />
      )}

      {view === 'result' && <ResultView score={game.score} finalTime={formatTime(game.finalTime)} difficulty={difficulty} userAnswers={game.userAnswers} onRestart={goToMenu} expandedIdx={expandedIdx} setExpandedIdx={setExpandedIdx} faculty={init.faculty ?? undefined} level={init.profile?.level} />}

      {view === 'settings' && <SettingsView currentDifficulty={difficulty} onSelect={setDifficulty} onSave={goToMenu} onResetFaculty={handleResetFaculty} />}

      {view === 'admin' && (
        <Admin 
          allQuestions={init.allQuestions} 
          editingQuestion={editingQuestion} 
          searchQuery={searchQuery} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          filtered={filteredQuestions} 
          onEdit={setEditingQuestion} 
          onDelete={handleDeleteQuestion} 
          onSave={handleSaveQuestion} 
          onClose={goToMenu} 
          onSearch={setSearchQuery} 
          setPage={setCurrentPage} 
          onImport={handleImportQuestions}
          allPlayers={allPlayers}
          onUpdatePlayer={handleUpdatePlayer}
          onDeletePlayer={handleDeletePlayer}
          onWipe={handleGlobalWipe}
        />
      )}
    </div>
  );
};

export default App;