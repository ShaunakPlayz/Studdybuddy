import React, { useMemo } from 'react';
import { StudySession, Subject } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, Brain, Clock, BarChart3, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface StudyHistoryProps {
  sessions: StudySession[];
  subjects: Subject[];
}

const StudyHistory: React.FC<StudyHistoryProps> = ({ sessions, subjects }) => {
  // --- Data Calculations ---
  
  const heatmapData = useMemo(() => {
    const data: Record<string, number> = {};
    const today = new Date();
    
    // Last 90 days
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = 0;
    }

    sessions.forEach(s => {
      if (data[s.date] !== undefined) {
        data[s.date] += s.minutes;
      }
    });

    return Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sessions]);

  const subjectDistribution = useMemo(() => {
    const dist: Record<string, { name: string, value: number, color: string }> = {};
    sessions.forEach(s => {
      const sub = subjects.find(sub => sub.id === s.subject);
      if (!dist[s.subject]) {
        dist[s.subject] = { 
          name: sub?.name || 'Unknown', 
          value: 0, 
          color: sub?.color || 'bg-slate-400' 
        };
      }
      dist[s.subject].value += s.minutes;
    });
    return Object.values(dist);
  }, [sessions, subjects]);

  const insights = useMemo(() => {
    const results: { type: 'success' | 'warning' | 'info', text: string }[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Insight 1: Longest gap check
    subjects.forEach(sub => {
      const subSessions = sessions.filter(s => s.subject === sub.id).sort((a, b) => b.date.localeCompare(a.date));
      if (subSessions.length > 0) {
        const lastDate = new Date(subSessions[0].date);
        const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 3) {
          results.push({ 
            type: 'warning', 
            text: `You haven't studied ${sub.name} in ${diffDays} days. Time for a quick review?` 
          });
        }
      } else {
        results.push({ 
            type: 'info', 
            text: `You haven't started studying ${sub.name} yet. Add it to your next focus session!` 
        });
      }
    });

    // Insight 2: Intensity trend
    const thisWeek = sessions.filter(s => {
        const d = new Date(s.date);
        return (Date.now() - d.getTime()) < (7 * 24 * 3600 * 1000);
    }).reduce((acc, s) => acc + s.minutes, 0);

    const lastWeek = sessions.filter(s => {
        const d = new Date(s.date);
        const diff = (Date.now() - d.getTime());
        return diff >= (7 * 24 * 3600 * 1000) && diff < (14 * 24 * 3600 * 1000);
    }).reduce((acc, s) => acc + s.minutes, 0);

    if (thisWeek > lastWeek && lastWeek > 0) {
        const increase = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
        results.push({ 
            type: 'success', 
            text: `Study intensity is up ${increase}% compared to last week. Great momentum!` 
        });
    }

    return results.slice(0, 4); // Limit to top 4 insights
  }, [sessions, subjects]);

  const getColorClass = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100';
    if (minutes < 30) return 'bg-indigo-200';
    if (minutes < 60) return 'bg-indigo-400';
    if (minutes < 120) return 'bg-indigo-600';
    return 'bg-indigo-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-indigo-600" /> Study Logs & Analysis
          </h1>
          <p className="text-slate-500 mt-1">Visualize your journey to mastery.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm text-sm font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><Clock size={16} className="text-indigo-500" /> {sessions.reduce((acc, s) => acc + s.minutes, 0)}m Total</span>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-indigo-500" /> {heatmapData.filter(d => d[1] > 0).length} Days Active</span>
        </div>
      </header>

      {/* Consistency Heatmap */}
      <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Consistency Heatmap
        </h2>
        <div className="flex gap-1.5 min-w-[800px]">
           {heatmapData.map(([date, minutes], i) => (
             <div key={date} className="group relative">
                <div 
                  className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-indigo-300 ${getColorClass(minutes)}`}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition z-20 whitespace-nowrap">
                  {new Date(date).toLocaleDateString()} : {minutes}m
                </div>
             </div>
           ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>90 Days Ago</span>
            <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                <div className="w-3 h-3 rounded-sm bg-indigo-800"></div>
                <span>More</span>
            </div>
            <span>Today</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Subject Distribution</h2>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={subjectDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {subjectDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} className={entry.color.replace('bg-', 'fill-')} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800">{subjectDistribution.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subjects</span>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {subjectDistribution.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                            <span className="text-slate-600 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{item.value}m</span>
                    </div>
                ))}
            </div>
        </div>

        {/* AI Insights & History List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-indigo-300" /> StuddyBuddy Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border flex gap-3 items-start transition hover:scale-[1.02] ${
                            insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' :
                            insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-100' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-100'
                        }`}>
                            {insight.type === 'success' ? <TrendingUp size={20} className="shrink-0" /> :
                             insight.type === 'warning' ? <AlertCircle size={20} className="shrink-0" /> :
                             <Brain size={20} className="shrink-0" />}
                            <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                        </div>
                    ))}
                    {insights.length === 0 && (
                        <p className="text-indigo-300 text-sm col-span-2">Keep studying to unlock personalized AI insights!</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800">Recent Sessions</h2>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Last 10 entries</span>
                </div>
                <div className="divide-y divide-slate-50">
                    {sessions.slice().reverse().slice(0, 10).map((session, i) => {
                        const subject = subjects.find(s => s.id === session.subject);
                        return (
                            <div key={i} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl text-white ${subject?.color || 'bg-slate-400'}`}>
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{subject?.name || 'General Study'}</p>
                                        <p className="text-xs text-slate-400">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                    {session.minutes}m
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudyHistory;