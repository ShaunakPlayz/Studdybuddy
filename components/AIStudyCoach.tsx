
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, StudySession, WeeklyInsight, Subject } from '../types';
import { getWeeklyCoachFeedback } from '../services/geminiService';
import { Sparkles, TrendingUp, TrendingDown, Target, Zap, Clock, Calendar, Brain, RefreshCw, ChevronRight, LayoutList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AIStudyCoachProps {
  stats: UserStats;
  sessions: StudySession[];
  subjects: Subject[];
}

const AIStudyCoach: React.FC<AIStudyCoachProps> = ({ stats, sessions, subjects }) => {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        setLoading(true);
        const feedback = await getWeeklyCoachFeedback(stats, sessions);
        setInsight(feedback);
      } catch (e) {
        console.error("Coaching failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [stats.rank.currentXP]); // Refresh if stats change significantly

  const weeklyTrendData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dateStr);
      const mins = daySessions.reduce((acc, s) => acc + s.minutes, 0);
      data.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        minutes: mins
      });
    }
    return data;
  }, [sessions]);

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center space-y-6 text-center animate-pulse">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600">
           <RefreshCw size={40} className="animate-spin" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consulting StuddyBuddy Coach...</h2>
            <p className="text-slate-500 max-w-sm">Reviewing your weekly logs, mastery scores, and habit patterns to build your custom report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mb-1">
             <Sparkles size={16} /> Weekly Performance Report
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Weekly AI Coach</h1>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
             <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Target size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consistency Score</p>
                <p className="text-lg font-black text-slate-800">88/100</p>
             </div>
        </div>
      </header>

      {/* Coach's Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-indigo-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">💡</div>
                        <h3 className="text-xl font-bold italic tracking-tight uppercase">Executive Summary</h3>
                    </div>
                    <p className="text-xl leading-relaxed text-indigo-100 font-medium">
                        "{insight?.summary}"
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                            <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-2 text-sm uppercase">
                                <TrendingUp size={16} /> Strength
                            </h4>
                            <p className="text-sm text-indigo-50 font-medium">{insight?.strength}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                            <h4 className="flex items-center gap-2 text-rose-400 font-bold mb-2 text-sm uppercase">
                                <TrendingDown size={16} /> Weakness
                            </h4>
                            <p className="text-sm text-indigo-50 font-medium">{insight?.weakness}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-500" /> Daily Focus Distribution
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 tracking-tight uppercase">
                    <LayoutList size={20} className="text-indigo-600" /> Action Plan
                </h3>
                <div className="space-y-4">
                    {insight?.actionablePlan.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition group cursor-default">
                             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                                {i + 1}
                             </div>
                             <p className="text-sm font-semibold text-slate-700 leading-snug">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                    <Zap size={100} fill="currentColor" className="text-amber-500" />
                 </div>
                 <h4 className="text-amber-700 font-black text-sm uppercase tracking-widest mb-2">Coach's Motivation</h4>
                 <p className="text-amber-900 font-bold italic leading-relaxed relative z-10">
                    "{insight?.encouragement}"
                 </p>
                 <button className="mt-6 flex items-center gap-2 text-amber-700 font-black text-xs uppercase hover:gap-3 transition-all">
                    Schedule Next Session <ChevronRight size={14} />
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudyCoach;
