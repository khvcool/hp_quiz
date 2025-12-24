import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ADMIN_ID } from '../constants/faculty';

export const useAppInit = (tg: any) => {
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<string | null>(localStorage.getItem('user_faculty'));
  const [profile, setProfile] = useState<any>(null);
  const [topFaculty, setTopFaculty] = useState<{name: string, points: number} | null>(null);
  const [isLeaderChanged, setIsLeaderChanged] = useState(false);

  const tgId = Number(tg?.initDataUnsafe?.user?.id || ADMIN_ID);

  const loadCupLeader = async () => {
    const { data } = await supabase
      .from('faculty_cup')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(1);

    if (data && data[0]) {
      const newLeaderId = data[0].faculty_id;
      
      setTopFaculty(prev => {
        // Если лидер сменился, запускаем анимацию
        if (prev && prev.name !== newLeaderId) {
          setIsLeaderChanged(true);
          setTimeout(() => setIsLeaderChanged(false), 3000);
        }
        return { name: newLeaderId, points: data[0].total_points };
      });
    }
  };

  const fetchProfile = async () => {
    // Сначала просто запрашиваем профиль
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('tg_id', tgId)
        .maybeSingle();

    if (data) {
        // 1. Источник истины — БАЗА. Обновляем локальные данные данными из БД.
        if (data.faculty) {
        localStorage.setItem('user_faculty', data.faculty);
        setFaculty(data.faculty); // Синхронизируем состояние хука
        }
        setProfile(data);
        return data;
    } else {
        // 2. Если профиля в базе вообще нет (новый юзер)
        const currentFaculty = localStorage.getItem('user_faculty');
        if (!currentFaculty) return null; // Еще не прошел шляпу

        const newProfile = {
        tg_id: tgId,
        faculty: currentFaculty,
        username: tg?.initDataUnsafe?.user?.first_name || "Маг",
        xp: 0,
        level: 1,
        total_games: 0,
        best_score: 0
        };
        
        const { data: created } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .maybeSingle();
        
        if (created) setProfile(created);
        return created;
    }
    };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: qs } = await supabase.from('questions').select('*');
      if (qs) setAllQuestions(qs);
      await loadCupLeader();
      await fetchProfile();
      setLoading(false);
      tg?.ready();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    loading, 
    allQuestions, 
    faculty, 
    setFaculty, 
    profile, 
    fetchProfile, 
    topFaculty, 
    isLeaderChanged, 
    loadCupLeader, 
    tgId 
  };
};