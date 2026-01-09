
import React, { useState } from 'react';
import { Subject, StudyPlan, StudyDay, StudyBlock } from '../types';
import { Calendar, Clock, BookOpen, CheckCircle, ArrowRight, XCircle, RefreshCw, CalendarDays, Rocket } from 'lucide-react';

interface SmartPlannerProps {
  subjects: Subject[];
  plan: StudyPlan | null;
  onGeneratePlan: (examDate: string, hoursPerDay: number, subjectIds: string[]) => Promise<void>;
  onBlockAction: (dayIndex: number, blockId: string, action: 'completed' | 'skipped') => void;
}

const SmartPlanner: React.FC<SmartPlannerProps> = ({ subjects, plan, onGeneratePlan, onBlockAction }) => {
  const [step, setStep] = useState<'setup' | 'view'>(plan ? 'view' : 'setup');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Setup State
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState(2);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subjects.map(s => s.id));

  const handleGenerate = async () => {
    if (!examDate) return alert("Please select an exam date");
    setIsGenerating(true);
    try {
      await onGeneratePlan(examDate, hours, selectedSubjects);
      setStep('view');
    } catch (e) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getDaysUntilExam = () => {
    if (!plan) return 0;
    const diff = new Date(plan.examDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto p-8 animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Your Smart Study Plan</h1>
          <p className="text-slate-500 mt-2">Tell us your goals, and we'll build a dynamic schedule that adapts to you.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">When is your exam?</label>
            <input 
              type="date" 
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">How many hours can you study daily?</label>
            <div className="flex items-center gap-4">
               <input 
                 type="range" 
                 min="1" max="8" step="0.5"
                 value={hours}
                 onChange={(e) => setHours(parseFloat(e.target.value))}
                 className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
               />
               <span className="font-mono font-bold text-lg w-16 text-center">{hours}h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">Select Subjects to Include</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    selectedSubjects.includes(sub.id)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${sub.color}`}></div>
                  <span className="font-medium text-sm">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={selectedSubjects.length === 0 || !examDate || isGenerating}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
                <>
                    <RefreshCw size={20} className="animate-spin" /> Analyzing Syllabus...
                </>
            ) : (
                <>
                    <Rocket size={20} /> Generate My Plan
                </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Helper to format date relative to today
  const getDayLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return "Today";
    
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return "Tomorrow";
    
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const today = new Date().toISOString().split('T')[0];
  const todayPlan = plan?.schedule.find(d => d.date === today);
  const futurePlans = plan?.schedule.filter(d => d.date > today).slice(0, 5); // Show next 5 days

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Study Plan</h1>
          <p className="text-slate-500 mt-1 mb-3">{getDaysUntilExam()} days until exam.</p>
          
          <div className="flex flex-wrap gap-2">
             {plan?.selectedSubjectIds.map(id => {
                 const subject = subjects.find(s => s.id === id);
                 if (!subject) return null;
                 return (
                     <div key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
                         <div className={`w-2 h-2 rounded-full ${subject.color}`}></div>
                         <span className="text-xs font-bold text-slate-700">{subject.name}</span>
                     </div>
                 )
             })}
          </div>
        </div>
        <button 
          onClick={() => setStep('setup')}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline whitespace-nowrap"
        >
          Adjust Settings
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
             
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-600" /> Today's Schedule
             </h2>

             {!todayPlan || todayPlan.blocks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No tasks scheduled for today. Enjoy your break!</p>
                </div>
             ) : (
                <div className="space-y-4 relative">
                   {/* Vertical Line */}
                   <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                   {todayPlan.blocks.map((block, idx) => {
                      const subject = subjects.find(s => s.id === block.subjectId);
                      return (
                        <div key={block.id} className="relative pl-12 group">
                           {/* Timeline Dot */}
                           <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${
                             block.status === 'completed' ? 'bg-green-500 text-white' : 
                             block.status === 'skipped' ? 'bg-slate-200 text-slate-400' : 'bg-white text-indigo-600 border-indigo-100'
                           }`}>
                             {block.status === 'completed' ? <CheckCircle size={14} /> : 
                              block.status === 'skipped' ? <ArrowRight size={14} /> :
                              <Clock size={14} />}
                           </div>

                           <div className={`p-4 rounded-xl border transition-all ${
                             block.status === 'completed' ? 'bg-green-50 border-green-100 opacity-75' :
                             block.status === 'skipped' ? 'bg-slate-50 border-slate-100 opacity-60' :
                             'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
                           }`}>
                             <div className="flex justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${subject?.color}`}>
                                        {subject?.name}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                        {block.type === 'revision' ? <RefreshCw size={10} /> : <BookOpen size={10} />}
                                        {block.type}
                                      </span>
                                   </div>
                                   <h3 className={`font-semibold text-slate-800 ${block.status !== 'pending' && 'line-through decoration-slate-300'}`}>
                                      {block.topic}
                                   </h3>
                                   <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                      <Clock size={12} /> {block.duration} min
                                   </div>
                                </div>

                                {block.status === 'pending' && (
                                  <div className="flex gap-2">
                                     <button 
                                       onClick={() => onBlockAction(0, block.id, 'completed')}
                                       className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition"
                                       title="Mark Complete"
                                     >
                                       <CheckCircle size={20} />
                                     </button>
                                     <button 
                                       onClick={() => onBlockAction(0, block.id, 'skipped')}
                                       className="p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-amber-500 rounded-lg transition"
                                       title="Skip & Reschedule"
                                     >
                                       <ArrowRight size={20} />
                                     </button>
                                  </div>
                                )}
                             </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             )}
          </div>
        </div>

        {/* Upcoming Days */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Upcoming</h2>
          <div className="space-y-4">
            {futurePlans?.map((day, i) => (
               <div key={day.date} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                     <span className="font-semibold text-slate-700">{getDayLabel(day.date)}</span>
                     <span className="text-xs font-medium text-slate-400">{day.totalMinutes}m planned</span>
                  </div>
                  <div className="space-y-2">
                     {day.blocks.slice(0, 3).map((block, bIdx) => {
                       const subject = subjects.find(s => s.id === block.subjectId);
                       return (
                         <div key={bIdx} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${subject?.color}`}></div>
                            <span className="text-slate-600 truncate flex-1">{block.topic}</span>
                         </div>
                       );
                     })}
                     {day.blocks.length > 3 && (
                       <div className="text-xs text-slate-400 pl-4">+ {day.blocks.length - 3} more tasks</div>
                     )}
                  </div>
               </div>
            ))}
            
            {!futurePlans || futurePlans.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-4">No upcoming days scheduled.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPlanner;
