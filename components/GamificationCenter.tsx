
import React from 'react';
import { UserStats, Badge, Challenge } from '../types';
import { Trophy, Target, Star, Lock, Award, Zap, Rocket } from 'lucide-react';
import { RANK_CONFIG } from '../constants';

interface GamificationCenterProps {
  stats: UserStats;
}

const GamificationCenter: React.FC<GamificationCenterProps> = ({ stats }) => {
  const { rank } = stats;
  const config = RANK_CONFIG[rank.tier];
  
  const currentLevelXP = rank.currentXP;
  const maxXP = config.xpPerLevel;
  const progressPercent = rank.tier === 'Ascendant' ? 100 : Math.min(100, (currentLevelXP / maxXP) * 100);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* Level Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl font-black shadow-inner ${config.color}`}>
             {config.icon}
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                    <h1 className="text-4xl font-black text-slate-900">{rank.tier}</h1>
                    {rank.tier !== 'Ascendant' && <span className="text-indigo-600 font-bold text-2xl">{rank.level}</span>}
                </div>
                <p className="text-slate-500 font-medium">
                    {rank.tier === 'Ascendant' 
                        ? "Peak Mastery Achieved. Maintain activity to hold this rank." 
                        : `Accumulate ${maxXP - currentLevelXP} more XP for Level ${rank.level === 3 ? 'Up' : rank.level + 1}`
                    }
                </p>
            </div>
            
            {rank.tier !== 'Ascendant' && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span>{currentLevelXP} XP</span>
                        <span>{maxXP} XP</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                        <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Challenges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Target className="text-rose-500" /> Active Challenges
            </h2>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Win XP Rewards</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.activeChallenges.map(challenge => (
               <div key={challenge.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                        {challenge.type === 'flashcard' && <Rocket size={20} />}
                        {challenge.type === 'streak' && <Star size={20} />}
                        {challenge.type === 'focus' && <Zap size={20} />}
                        {challenge.type === 'planner' && <Award size={20} />}
                     </div>
                     <span className="text-emerald-600 font-bold text-sm">+{challenge.xpReward} XP</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{challenge.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{challenge.description}</p>
                  
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>{challenge.progress} / {challenge.goal}</span>
                        <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-indigo-500 transition-all duration-500"
                           style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* Badges Gallery */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="text-amber-500" /> Achievements
          </h2>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <div className="grid grid-cols-3 gap-4">
                {stats.badges.map(badge => (
                   <div key={badge.id} className="flex flex-col items-center gap-2 group cursor-help">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition duration-300">
                        {badge.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 text-center uppercase leading-tight line-clamp-1">
                        {badge.name}
                      </span>
                   </div>
                ))}
                {/* Locked Badge Placeholders */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 opacity-30">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400">
                      <Lock size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Locked</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-4 bg-indigo-900 rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Next Achievement</p>
                    <h4 className="font-bold mb-2">Zen Master</h4>
                    <p className="text-xs text-indigo-100/70 mb-3">Reach 100 focus minutes to unlock this badge.</p>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-1/2"></div>
                    </div>
                </div>
                <Award className="absolute -right-4 -bottom-4 text-white/5" size={80} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationCenter;
