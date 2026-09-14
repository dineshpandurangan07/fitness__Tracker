// Format Date to friendly string: e.g. "Sep 13, 2026"
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Format Date with day of week: e.g. "Sunday, Sep 13, 2026"
export const formatDateWithDay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Format Duration in minutes to "Xh Ym" or "X min"
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '0 min';
  const mins = Math.round(minutes);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

// Format seconds into MM:SS
export const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Dynamic greeting based on current local hour
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// BMI Status badge color
export const getBmiColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'underweight':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'normal':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    case 'overweight':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    case 'obese':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};
