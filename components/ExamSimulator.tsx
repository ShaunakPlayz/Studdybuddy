
import React, { useState, useEffect, useRef } from 'react';
import { Subject, ExamQuestion, ExamLog, ExamReport } from '../types';
import { generateExamQuestions, analyzeExamSession } from '../services/geminiService';
import { Timer, Brain, Zap, AlertTriangle, CheckCircle, Play, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ExamSimulatorProps {
  subjects: Subject[];
}

const ExamSimulator: React.FC<ExamSimulatorProps> = ({ subjects }) => {
  const [step, setStep] = useState<'setup' | 'active' | 'loading' | 'results'>('setup');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([subjects[0].id]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [logs, setLogs] = useState<ExamLog[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [report, setReport] = useState<ExamReport | null>(null);
  
  const questionStartTimeRef = useRef<number>(0);
  const examStartTimeRef = useRef<number>(0);

  // Timer logic
  useEffect(() => {
    if (step === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 'active' && timeLeft === 0) {
      finishExam();
    }
  }, [step, timeLeft]);

  const startExam = async () => {
    setStep('loading');
    try {
        // Estimate 1 question per 1.5 minutes
        const count = Math.ceil(durationMinutes / 1.5);
        const generatedQuestions = await generateExamQuestions(
            subjects.filter(s => selectedSubjectIds.includes(s.id)).map(s => s.name), 
            Math.max(5, count)
        );
        setQuestions(generatedQuestions);
        setLogs([]);
        setCurrentQuestionIndex(0);
        setTimeLeft(durationMinutes * 60);
        setStep('active');
        examStartTimeRef.current = Date.now();
        questionStartTimeRef.current = Date.now();
    } catch (e) {
        alert("Failed to generate exam. Please try again.");
        setStep('setup');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const now = Date.now();
    const timeTaken = (now - questionStartTimeRef.current) / 1000;
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    const log: ExamLog = {
        questionId: currentQ.id,
        timeTaken,
        isCorrect,
        difficulty: currentQ.difficulty,
        timestamp: (now - examStartTimeRef.current) / 1000
    };

    setLogs(prev => [...prev, log]);

    if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        questionStartTimeRef.current = Date.now();
    } else {
        finishExam([...logs, log]);
    }
  };

  const finishExam = async (finalLogs = logs) => {
    setStep('loading');
    const totalDuration = (Date.now() - examStartTimeRef.current) / 1000;
    const reportData = await analyzeExamSession(finalLogs, totalDuration);
    setReport(reportData);
    setStep('results');
  };

  const toggleSubject = (id: string) => {
      setSelectedSubjectIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  // Helper to calculate split accuracy for graph
  const getSplitData = () => {
      if (!report) return [];
      const totalQs = report.totalQuestions;
      const partSize = Math.ceil(totalQs / 4);
      const data = [];
      
      for(let i=0; i<4; i++) {
          const slice = logs.slice(i*partSize, (i+1)*partSize);
          if (slice.length === 0) continue;
          const acc = Math.round((slice.filter(l => l.isCorrect).length / slice.length) * 100);
          data.push({ name: `Q${i+1}`, accuracy: acc });
      }
      return data;
  };

  if (step === 'setup') {
      return (
          <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
              <header className="mb-10 text-center">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Timer size={32} />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900">Exam Simulator</h1>
                  <p className="text-slate-500 mt-2 text-lg">Train your mental stamina under realistic time pressure.</p>
              </header>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
                  <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Duration</label>
                      <div className="flex gap-4">
                          {[10, 20, 30, 45, 60].map(mins => (
                              <button
                                key={mins}
                                onClick={() => setDurationMinutes(mins)}
                                className={`flex-1 py-4 rounded-xl font-bold transition ${durationMinutes === mins ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                              >
                                {mins}m
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Subjects</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {subjects.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => toggleSubject(sub.id)}
                                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition font-bold ${selectedSubjectIds.includes(sub.id) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent bg-slate-50 text-slate-500'}`}
                              >
                                  <div className={`w-3 h-3 rounded-full ${sub.color}`}></div>
                                  {sub.name}
                              </button>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={startExam}
                    disabled={selectedSubjectIds.length === 0}
                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-xl hover:bg-rose-700 transition shadow-xl shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <Play fill="currentColor" /> Start Simulation
                  </button>
              </div>
          </div>
      );
  }

  if (step === 'loading') {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
            <h2 className="text-2xl font-black text-slate-800">Preparing Exam Environment...</h2>
            <p className="text-slate-500">Generating adaptive questions and calibrating difficulty.</p>
        </div>
      );
  }

  if (step === 'results' && report) {
      return (
          <div className="max-w-5xl mx-auto p-8 animate-in slide-in-from-bottom-8 duration-700 pb-20">
              <div className="text-center mb-10">
                  <h1 className="text-3xl font-black text-slate-900">Simulation Report</h1>
                  <p className="text-slate-500">Performance analysis under simulated pressure.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Final Score</div>
                      <div className="text-5xl font-black text-indigo-600">{report.score}%</div>
                  </div>
                  <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center ${report.fatigueDetected ? 'bg-rose-50 border-rose-100' : ''}`}>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Fatigue Status</div>
                      <div className={`text-2xl font-black ${report.fatigueDetected ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {report.fatigueDetected ? 'Detected' : 'Optimal'}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{report.accuracyTrend}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Pressure Point</div>
                      <div className="text-lg font-black text-slate-800 leading-tight">{report.pressureWeakness}</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <Brain className="text-indigo-500" /> Stamina Curve
                      </h3>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getSplitData()}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                                  <YAxis hide domain={[0, 100]} />
                                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                  <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={4} dot={{r:6}} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                      <p className="text-center text-xs font-bold text-slate-400 uppercase mt-4">Exam Progression (Beginning → End)</p>
                  </div>

                  <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Zap className="text-amber-400" fill="currentColor" /> AI Coach Recommendation
                      </h3>
                      <p className="text-lg leading-relaxed font-medium text-slate-200 mb-8">
                          "{report.recommendation}"
                      </p>
                      <button 
                        onClick={() => setStep('setup')}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-50 transition"
                      >
                          New Simulation
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const currentQ = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
      <div className="h-full flex flex-col max-w-5xl mx-auto p-6 pb-24">
          <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                      {currentQuestionIndex + 1}
                  </div>
                  <div>
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1 uppercase">{currentQ.difficulty}</div>
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-mono font-bold text-xl shadow-lg">
                  <Timer size={20} className={timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl mb-8">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-8">
                      {currentQ.question}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                      {currentQ.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            className="text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm group-hover:border-indigo-600 group-hover:text-indigo-600">
                                      {String.fromCharCode(65 + i)}
                                  </div>
                                  <span className="text-lg font-medium text-slate-700 group-hover:text-indigo-900">{opt}</span>
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default ExamSimulator;
