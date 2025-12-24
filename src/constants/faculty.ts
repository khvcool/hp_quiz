export const ADMIN_ID = 905316819; // Твой ID из Telegram

export const facultyNames: Record<string, string> = {
  Gryffindor: 'Gryffindor',
  Slytherin: 'Slytherin',
  Ravenclaw: 'Ravenclaw',
  Hufflepuff: 'Hufflepuff'
};

// Добавляем экспорт, который требует Leaderboard
export const facultyNamesRu: Record<string, string> = {
  Gryffindor: 'Гриффиндор',
  Slytherin: 'Слизерин',
  Ravenclaw: 'Когтевран',
  Hufflepuff: 'Пуффендуй',
  Gryff: 'Гриффиндор', 
  Slyth: 'Слизерин',
  Rave: 'Когтевран',
  Huff: 'Пуффендуй'
};

export const facultyColors: Record<string, string> = {
  Gryffindor: '#FF4D4D',
  Slytherin: '#4ADE80',
  Ravenclaw: '#60A5FA',
  Hufflepuff: '#FACC15',
  Gryff: '#FF4D4D',
  Slyth: '#4ADE80',
  Rave: '#60A5FA',
  Huff: '#FACC15'
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const getRank = (level: number): string => {
  if (level >= 50) return 'Верховный чародей';
  if (level >= 30) return 'Профессор магии';
  if (level >= 20) return 'Мракоборец';
  if (level >= 10) return 'Мастер заклинаний';
  if (level >= 5) return 'Старшекурсник';
  return 'Первокурсник';
};