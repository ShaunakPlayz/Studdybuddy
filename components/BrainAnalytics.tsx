
import React from 'react';
import { UserStats, Subject } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Brain, AlertCircle, Clock, Zap, TrendingDown, Info } from 'lucide-react';

interface BrainAnalyticsProps {
  stats: UserStats;
  subjects: Subject[];
}

const BrainAnalytics: React.FC<BrainAnalyticsProps> = ({ stats, subjects }) => {
  // --- Failure Profile Data ---
  const failureData = [
    { name: 'Concept Confusion', value: stats.failureProfile.concept_confusion, color: '#f59e0b' },
    { name: 'Rushing', value: stats.failureProfile.rushing, color: '#ef4444' },
    { name: 'Formula Misuse', value: stats.failureProfile.formula_misuse, color: '#8b5cf6' },
    { name: 'Misreading', value: stats.failureProfile.misreading, color: '#3b82f6' },
    { name: 'Memory Gap', value: stats.failureProfile.memory_gap, color: '#64748b' },
  ].filter(d => d.value > 0);

  // --- Forgetting Curve Simulation ---
  // In a real app, this would use actual historical logs. Here we project curves based on mastery.
  const forgettingCurveData = [];
  const days = [1, 2, 3, 5, 7, 14, 21, 30];
  
  for (let day of days) {
      const point: any = { day: `Day ${day}` };
      stats.topicMastery.slice(0, 3).forEach((topic) => {
          // Ebbinghaus formula approximation: R = e^(-t/S)
          // We use masteryScore as a proxy for 'Strength' (S)
          const strength = Math.max(1, topic.masteryScore / 10); 
          const retention = Math.exp(-day / strength) * 100;
          point[topic.topic] = Math.round(retention);
      });
      forgettingCurveData.push(point);
  }

  const activeTopics = stats.topicMastery.slice(0, 3);
  const colors = ['#6366f1', '#ec4899', '#10b981'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
       <header>
          <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
              <Brain size={16} /> Neural Analytics
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Brain Profile</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
             Advanced metacognitive analysis of your learning patterns, memory decay, and error types.
          </p>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Failure Intelligence System */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
               <div className="flex justify-between items-start mb-6">
                   <div>
                       <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                           <AlertCircle size={24} className="text-rose-500" /> Failure Intelligence
                       </h2>
                       <p className="text-sm text-slate-500 mt-1">Why you make mistakes</p>
                   </div>
               </div>

               <div className="h-64 relative">
                   <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                           <Pie
                               data={failureData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               {failureData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                               ))}
                           </Pie>
                           <Tooltip 
                               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           />
                       </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-3xl font-black text-slate-800">{(Object.values(stats.failureProfile) as number[]).reduce((a, b) => a + b, 0)}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Errors Analyzed</span>
                   </div>
               </div>

               <div className="mt-6 space-y-3">
                   {failureData.sort((a,b) => b.value - a.value).map(item => (
                       <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                           <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                               <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                           </div>
                           <span className="font-mono font-bold text-slate-500">{item.value}</span>
                       </div>
                   ))}
               </div>
               
               {/* Insight based on top error */}
               {failureData.length > 0 && (
                   <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
                       <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                       <div>
                           <p className="text-sm font-bold text-indigo-900">Pattern Detected</p>
                           <p className="text-xs text-indigo-700 mt-1">
                               {failureData[0].name === 'Rushing' && "You are answering too quickly. Slow down to improve accuracy by ~30%."}
                               {failureData[0].name === 'Concept Confusion' && "You often mix up related terms. Try comparing definitions side-by-side."}
                               {failureData[0].name === 'Formula Misuse' && "Review your formula cheat sheet before starting practice problems."}
                           </p>
                       </div>
                   </div>
               )}
           </div>

           {/* Forgetting Curve Visualizer */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div>
                       <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                           <TrendingDown size={24} className="text-indigo-500" /> Forgetting Curve
                       </h2>
                       <p className="text-sm text-slate-500 mt-1">Projected memory decay over time</p>
                   </div>
               </div>
               
               <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={forgettingCurveData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} domain={[0, 100]} />
                           <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                           {activeTopics.map((topic, i) => (
                               <Line 
                                    key={topic.topic} 
                                    type="monotone" 
                                    dataKey={topic.topic} 
                                    stroke={colors[i % colors.length]} 
                                    strokeWidth={3} 
                                    dot={false} 
                                />
                           ))}
                       </LineChart>
                   </ResponsiveContainer>
               </div>

               <div className="mt-6 flex flex-wrap gap-2">
                   {activeTopics.map((topic, i) => (
                       <div key={topic.topic} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
                           <span className="text-xs font-bold text-slate-600">{topic.topic}</span>
                       </div>
                   ))}
               </div>

               <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                   <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm">
                       <Clock size={16} /> Optimal Review Time
                   </div>
                   <p className="text-xs text-amber-700 leading-relaxed">
                       Based on your decay rate, you should review <strong>{activeTopics[0]?.topic}</strong> within the next <strong>24 hours</strong> to reset the forgetting curve.
                   </p>
               </div>
           </div>
       </div>
    </div>
  );
};

export default BrainAnalytics;
