import React from 'react';

interface HeatmapProps {
  historyLog: Record<string, number>; // "YYYY-MM-DD": count
  weeksToShow?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ historyLog, weeksToShow = 20 }) => {
  const days: { dateStr: string; count: number; dateObj: Date }[] = [];
  const today = new Date();

  const totalDays = weeksToShow * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = historyLog[dateStr] || 0;
    days.push({ dateStr, count, dateObj: d });
  }

  // Group into weeks (columns)
  const weeks: (typeof days)[] = [];
  let currentWeek: typeof days = [];

  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-200/50 dark:border-neutral-800';
    if (count < 10) return 'bg-emerald-200 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    if (count < 25) return 'bg-emerald-400 dark:bg-emerald-700 text-white border-emerald-500';
    if (count < 50) return 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700 shadow-xs';
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[500px]">
        <div className="flex gap-1.5 justify-start">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr} : ${day.count} révision${day.count > 1 ? 's' : ''}`}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColorClass(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <span>{totalDays} derniers jours d'activité</span>
          <div className="flex items-center gap-1.5">
            <span>Moins</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            <span>Plus</span>
          </div>
        </div>
      </div>
    </div>
  );
};
