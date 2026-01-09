
import React, { useMemo } from 'react';
import { UserStats, StudySession, Subject } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Clock, BookOpen, Brain, TrendingUp, AlertCircle, Trophy, Sparkles, ArrowRight, Zap, Target, Play } from 'lucide-react';
import StreakWidget from './StreakWidget';
import { RANK_CONFIG } from '../constants';

interface DashboardProps {
  stats: UserStats;
  sessions: StudySession[];
  subjects: Subject[];
  totalCards: number;
  onReviseTopic: (topic: string) => void;
  onQuickStudy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, sessions, subjects, totalCards, onReviseTopic, onQuickStudy }) => {
  const chartData = useMemo(() => {
    return sessions.slice(-7).map((s) => ({
      name: s.date.split('-').slice(1).join('/'),
      minutes: s.minutes,
    }));
  }, [sessions]);

  const { rank } = stats;
  const rankConfig = RANK_CONFIG[rank.tier];
  
  const currentLevelXP = rank.currentXP;
  const requiredXP = rankConfig.xpPerLevel;
  const progressPercent = rank.tier === 'Ascendant' ? 100 : Math.min(100, (currentLevelXP / requiredXP) * 100);

  const sortedTopics = [...stats.topicMastery].sort((a, b) => a.masteryScore - b.masteryScore);
  const weakestTopic = sortedTopics[0];
  const topTopic = [...stats.topicMastery].sort((a, b) => b.masteryScore - a.masteryScore)[0];

  const formatTotalTime = (minutes: number) => {
      if (minutes < 60) return `${Math.floor(minutes)}m`;
      const h = Math.floor(minutes / 60);
      const m = Math.floor(minutes % 60);
      return `${h}h ${m}m`;
  };

  const smartRecommendation = useMemo(() => {
    if (!weakestTopic) return { 
      title: "Initialize Learning", 
      desc: "Your mastery matrix is empty. Generate your first flashcards to begin.", 
      action: "Create Cards",
      icon: <Brain size={24} className="text-white" />,
      color: "bg-indigo-600",
      onClick: () => onReviseTopic("")
    };
    
    if (weakestTopic.masteryScore < 40) return { 
      title: `Critical Review: ${weakestTopic.topic}`, 
      desc: `Mastery at ${weakestTopic.masteryScore}%. Let's rebuild your foundation.`, 
      action: "Start Repair",
      icon: <AlertCircle size={24} className="text-white" />,
      urgent: true,
      color: "bg-rose-500",
      onClick: () => onReviseTopic(weakestTopic.topic)
    };

    if (stats.streaks.daily.current === 0) return {
        title: "Daily Goal Pending",
        desc: "Keep your streak alive! A 5-minute session counts.",
        action: "Quick Study",
        icon: <Zap size={24} className="text-white" />,
        color: "bg-amber-500",
        onClick: onQuickStudy
    };

    return { 
      title: "Challenge Mode", 
      desc: `You're crushing ${topTopic?.topic}. Ready to push to 100%?`, 
      action: "Start Challenge",
      icon: <Trophy size={24} className="text-white" />,
      color: "bg-indigo-600",
      onClick: () => topTopic && onReviseTopic(topTopic.topic)
    };
  }, [weakestTopic, topTopic, stats.streaks.daily.current, onReviseTopic, onQuickStudy]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-24">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">
            Hi, <span className="text-indigo-600">Scholar</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl">
             Your neural network is ready.
          </p>
        </div>
        
        <div className="bg-white p-1 md:p-1.5 pr-4 md:pr-6 rounded-full border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xl md:text-2xl shadow-inner ${rankConfig.color}`}>
                {rankConfig.icon}
            </div>
            <div className="flex flex-col gap-0.5 md:gap-1 w-28 md:w-36">
                 <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{rank.tier} {rank.tier !== 'Ascendant' && rank.level}</span>
                    <span>{rank.tier !== 'Ascendant' ? `${rank.currentXP}/${requiredXP}` : 'MAX'}</span>
                 </div>
                 <div className="w-full h-1 md:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${rank.tier === 'Ascendant' ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                 </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
         
         <div className="lg:col-span-8 space-y-4 md:space-y-6">
             
             <div className={`rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl group transition-all duration-500 ${smartRecommendation.color}`}>
                <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:opacity-20 transition"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                   <div className="flex items-start gap-4 md:gap-5">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
                          {smartRecommendation.icon}
                      </div>
                      <div>
                          <h3 className="text-xl md:text-2xl font-black tracking-tight mb-1">{smartRecommendation.title}</h3>
                          <p className="text-white/80 font-medium text-xs md:text-sm leading-relaxed max-w-md">{smartRecommendation.desc}</p>
                      </div>
                   </div>
                   <button 
                      onClick={smartRecommendation.onClick}
                      className="w-full md:w-auto px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                   >
                      {smartRecommendation.action} <ArrowRight size={14} />
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl p-5 md:p-6 text-white shadow-lg shadow-violet-200 relative overflow-hidden group">
                    <div className="absolute top-3 right-3 p-1.5 md:p-2 bg-white/10 rounded-xl animate-pulse">
                        <Target size={16} className="text-white" />
                    </div>
                    <div className="mt-4 md:mt-8">
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <p className="text-violet-100 text-[9px] md:text-xs font-bold uppercase tracking-widest">Active Time</p>
                        </div>
                        <p className="text-2xl md:text-4xl font-black tracking-tight">{formatTotalTime(stats.totalFocusMinutes)}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-5 md:p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                     <div className="absolute top-3 right-3 p-1.5 md:p-2 bg-white/10 rounded-xl">
                        <Brain size={16} className="text-white" />
                    </div>
                    <div className="mt-4 md:mt-8">
                        <p className="text-blue-100 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-0.5 md:mb-1">Knowledge</p>
                        <p className="text-2xl md:text-4xl font-black tracking-tight">{totalCards}<span className="text-xs md:text-lg opacity-60"> cards</span></p>
                    </div>
                </div>
             </div>

             <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4 md:mb-8">
                    <div>
                        <h2 className="text-sm md:text-lg font-black text-slate-800 flex items-center gap-2">
                        <TrendingUp size={16} className="text-slate-400" />
                        Cognitive Load
                        </h2>
                    </div>
                </div>
                <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            dy={10} 
                        />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: '#f8fafc', radius: 8}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px'}}
                            itemStyle={{color: '#1e293b', fontWeight: 700, fontSize: '11px'}}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 4, 4]}>
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={index === chartData.length - 1 ? '#6366f1' : '#cbd5e1'} 
                                className="transition-all duration-500 hover:opacity-80"
                            />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-4 md:space-y-6 flex flex-col">
             
             <div className="flex-none">
                 <StreakWidget stats={stats} sessions={sessions} />
             </div>

             <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                        <Brain size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-xs md:text-sm">Neural Health</h3>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase">Analytics Active</p>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600 bg-slate-50 p-2.5 md:p-3 rounded-xl">
                    <span>Errors Analyzed</span>
                    <span className="font-bold text-slate-900">{(Object.values(stats.failureProfile) as number[]).reduce((a, b) => a + b, 0)}</span>
                </div>
             </div>

             <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col flex-1">
                <h2 className="text-sm md:text-lg font-black text-slate-800 flex items-center gap-2 mb-4 md:mb-6">
                    <Sparkles size={16} className="text-amber-500" />
                    Mastery Matrix
                </h2>
                
                <div className="space-y-4 md:space-y-5 overflow-y-auto flex-1 pr-1 max-h-[300px] md:max-h-[400px] custom-scrollbar">
                    {sortedTopics.map((item) => {
                        const subject = subjects.find(s => s.id === item.subjectId);
                        const isWeak = item.masteryScore < 50;
                        const isMastered = item.masteryScore > 85;
                        
                        return (
                            <div key={item.topic} className="group cursor-default">
                                <div className="flex justify-between items-center mb-1.5 md:mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${subject?.color || 'bg-slate-400'}`}></div>
                                        <span className="font-bold text-slate-700 text-xs md:text-sm">{item.topic}</span>
                                    </div>
                                    <span className={`text-[10px] md:text-xs font-black ${isWeak ? 'text-rose-500' : isMastered ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {item.masteryScore}%
                                    </span>
                                </div>
                                
                                <div className="relative w-full h-1.5 md:h-2 bg-slate-50 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                                            isWeak ? 'bg-rose-500' : 
                                            isMastered ? 'bg-emerald-500' : 
                                            'bg-indigo-500'
                                        }`}
                                        style={{ width: `${item.masteryScore}%` }}
                                    ></div>
                                </div>
                                
                                {isWeak && (
                                    <button 
                                        onClick={() => onReviseTopic(item.topic)}
                                        className="w-full py-2 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-rose-100"
                                    >
                                        <Zap size={10} fill="currentColor" /> Boost
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {sortedTopics.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <Brain size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">No Data Yet</p>
                        </div>
                    )}
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default Dashboard;
