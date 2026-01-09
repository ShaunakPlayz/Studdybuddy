import React from 'react';
import { Mistake, Subject, Flashcard } from '../types';
import { AlertTriangle, Play, Trash2, TrendingDown, BookOpen, AlertCircle } from 'lucide-react';

interface MistakesReviewProps {
  mistakes: Mistake[];
  subjects: Subject[];
  onReviewAll: (mistakesToReview: Mistake[]) => void;
  onClearMistake: (id: string) => void;
}

const MistakesReview: React.FC<MistakesReviewProps> = ({ mistakes, subjects, onReviewAll, onClearMistake }) => {
  // Calculate analytics
  const mistakesBySubject = mistakes.reduce((acc, curr) => {
    acc[curr.subjectId] = (acc[curr.subjectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weakestSubjectId = Object.keys(mistakesBySubject).sort((a, b) => mistakesBySubject[b] - mistakesBySubject[a])[0];
  const weakestSubject = subjects.find(s => s.id === weakestSubjectId);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={32} />
            Mistake Tracker
          </h1>
          <p className="text-slate-500 mt-2">Identify weak spots and turn them into strengths.</p>
        </div>
        
        {mistakes.length > 0 && (
          <button 
            onClick={() => onReviewAll(mistakes)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Play size={20} fill="currentColor" />
            Review All {mistakes.length} Mistakes
          </button>
        )}
      </header>

      {mistakes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Zero Mistakes!</h2>
          <p className="text-slate-500 mt-1">You're doing great. Go practice some flashcards to log new data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Analytics Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingDown size={18} className="text-slate-400"/> Analysis
                </h3>
                
                <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Weakest Subject</span>
                        <div className="text-lg font-bold text-slate-800 mt-1 flex items-center gap-2">
                            {weakestSubject ? (
                                <>
                                    <div className={`w-3 h-3 rounded-full ${weakestSubject.color}`}></div>
                                    {weakestSubject.name}
                                </>
                            ) : "N/A"}
                        </div>
                        <p className="text-xs text-amber-700/80 mt-2">
                            {weakestSubject 
                                ? `You have ${mistakesBySubject[weakestSubjectId]} active mistakes here.` 
                                : "Not enough data yet."}
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Logged</span>
                        <div className="text-2xl font-bold text-slate-800 mt-1">{mistakes.length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <BookOpen size={20} /> Smart Insight
                </h3>
                <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                    "Repetition is key. Reviewing these {mistakes.length} mistakes today will increase retention by up to 60%."
                </p>
                <button 
                   onClick={() => onReviewAll(mistakes)}
                   className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
                >
                    Start Focused Session
                </button>
            </div>
          </div>

          {/* Mistakes List */}
          <div className="lg:col-span-2 space-y-4">
            {mistakes.map((mistake) => {
                const subject = subjects.find(s => s.id === mistake.subjectId);
                return (
                    <div key={mistake.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white ${subject?.color.replace('bg-', 'bg-') || 'bg-slate-500'}`}>
                                    {subject?.name}
                                </span>
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <AlertCircle size={12} /> Missed {mistake.count}x
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onReviewAll([mistake])}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                    title="Practice this card"
                                >
                                    <Play size={16} />
                                </button>
                                <button 
                                    onClick={() => onClearMistake(mistake.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Remove from mistakes"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Question</span>
                                <p className="font-medium text-slate-800">{mistake.question}</p>
                            </div>
                            <div className="pt-3 border-t border-slate-50">
                                <span className="text-xs font-bold text-slate-400 uppercase">Correct Answer</span>
                                <p className="text-slate-600">{mistake.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakesReview;