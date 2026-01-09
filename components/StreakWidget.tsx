
import React, { useMemo } from 'react';
import { UserStats, StudySession } from '../types';
import { Flame, Layers, Zap, Snowflake, Check, CalendarDays } from 'lucide-react';

interface StreakWidgetProps {
  stats: UserStats;
  sessions: StudySession[];
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ stats, sessions }) => {
  const { daily } = stats.streaks;

  // Calculate last 7 days activity
  const weekActivity = useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const hasActivity = sessions.some(s => s.date === dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      
      days.push({ date: dateStr, dayName, active: hasActivity, isToday: i === 0 });
    }
    return days;
  }, [sessions]);

  const getMotivation = (current: number) => {
    if (current === 0) return "Start your engine!";
    if (current < 3) return "Heating up...";
    if (current < 7) return "Momentum building!";
    if (current < 30) return "Unstoppable force! 🔥";
    return "Legendary status! 🚀";
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden h-full flex flex-col justify-between group hover:border-orange-200 transition-colors">
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60 group-hover:bg-orange-100 transition-colors"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <Flame size={18} fill="currentColor" />
                    </div>
                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Daily Streak</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{daily.current}</span>
                    <span className="text-sm font-bold text-slate-400">days</span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">{getMotivation(daily.current)}</p>
            </div>
            
            {/* Freeze Feature Teaser */}
            <div className="group/freeze relative">
                <button className="p-2 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-100 hover:text-blue-600 transition">
                    <Snowflake size={20} />
                </button>
            </div>
        </div>

        {/* 7 Day Visualizer */}
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 7 Days</span>
                <span className="text-[10px] font-bold text-slate-300">{weekActivity.filter(d => d.active).length}/7 Active</span>
            </div>
            <div className="flex justify-between gap-1">
                {weekActivity.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-2">
                         <div 
                            className={`w-9 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                day.active 
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
                                    : day.isToday 
                                        ? 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300'
                                        : 'bg-slate-50 text-slate-300'
                            }`}
                         >
                             {day.active ? <Check size={16} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>}
                         </div>
                         <span className={`text-[9px] font-bold uppercase ${day.isToday ? 'text-orange-600' : 'text-slate-300'}`}>
                            {day.dayName}
                         </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default StreakWidget;
