import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Users } from 'lucide-react';
import { Subject, StudyGroup } from '../types';
import { MOCK_GROUPS } from '../constants';

interface FocusTimerProps {
  subjects: Subject[];
  onSessionComplete: (minutes: number, subjectId: string) => void;
  activeGroupId?: string | null;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ subjects, onSessionComplete, activeGroupId }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [fullScreen, setFullScreen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const group = activeGroupId ? MOCK_GROUPS.find(g => g.id === activeGroupId) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'study') {
        onSessionComplete(25, selectedSubject);
        alert("Focus session complete! Take a break.");
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        alert("Break over! Ready to focus?");
        setMode('study');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className={`transition-all duration-500 ${fullScreen ? 'fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center' : 'p-6 max-w-2xl mx-auto'}`}>
      
      {!fullScreen && (
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Focus Mode</h1>
            <p className="text-slate-500">Eliminate distractions and study deeper</p>
        </div>
      )}

      {group && (
          <div className={`mb-4 flex items-center gap-3 px-4 py-2 rounded-2xl ${fullScreen ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
              <Users size={18} />
              <span className="font-bold text-sm">Sync Session: {group.name}</span>
              <div className="flex -space-x-1 ml-2">
                   {group.members.slice(0, 3).map(m => (
                       <div key={m.id} className="w-6 h-6 rounded-full border border-white bg-white flex items-center justify-center text-[10px]">
                           {m.avatar}
                       </div>
                   ))}
              </div>
          </div>
      )}

      <div className={`relative w-full ${fullScreen ? 'max-w-4xl text-center' : 'bg-white p-12 rounded-3xl shadow-lg border border-slate-100 text-center'}`}>
        
        <button 
            onClick={() => setFullScreen(!fullScreen)}
            className={`absolute top-4 right-4 p-2 rounded-full ${fullScreen ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
        >
            {fullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        <div className="mb-8">
            <div className={`inline-flex rounded-full p-1 ${fullScreen ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    onClick={() => { setMode('study'); setTimeLeft(25 * 60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition ${mode === 'study' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                    Focus
                </button>
                <button 
                    onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition ${mode === 'break' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                    Break
                </button>
            </div>
        </div>

        <div className={`font-mono font-bold tracking-tighter mb-8 ${fullScreen ? 'text-[12rem] leading-none text-white' : 'text-8xl text-slate-800'}`}>
            {formatTime(timeLeft)}
        </div>

        {!fullScreen && mode === 'study' && (
             <div className="mb-8">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 block">Focusing on</label>
                <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="p-2 px-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
        )}

        <div className="flex justify-center gap-4">
            <button 
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'}`}
            >
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button 
                onClick={resetTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${fullScreen ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
                <RotateCcw size={24} />
            </button>
        </div>
        
        {isActive && (
            <p className={`mt-8 animate-pulse ${fullScreen ? 'text-slate-400' : 'text-slate-400'}`}>
                {activeGroupId ? "Syncing focus with your Circle..." : "Stay focused. No distractions."}
            </p>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;