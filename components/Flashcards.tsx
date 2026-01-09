
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Flashcard, FailureType } from '../types';
import { Plus, Play, RotateCw, Trash2, Wand2, Check, X, Undo2, Brain, AlertCircle, Sparkles, ArrowLeft, Trophy, Search } from 'lucide-react';
import { generateFlashcardsFromText, analyzeMistake } from '../services/geminiService';

interface FlashcardsProps {
  subjects: Subject[];
  cards: Flashcard[];
  setCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  onLogMistake: (card: Flashcard, failureType?: FailureType) => void;
  reviewQueue: Flashcard[] | null;
  onExitReview: () => void;
  onUpdateMastery: (topic: string | undefined, difficulty: 'easy' | 'medium' | 'hard') => void;
  onSessionComplete?: () => void;
  onGainXP: (amount: number) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ 
    subjects, 
    cards, 
    setCards, 
    onLogMistake, 
    reviewQueue, 
    onExitReview,
    onUpdateMastery,
    onSessionComplete,
    onGainXP
}) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'error' | 'analyzing'>('idle');
  const [feedbackText, setFeedbackText] = useState("");
  
  // Confusion Detector State
  const [confusionAnalysis, setConfusionAnalysis] = useState<{ type: string, explanation: string } | null>(null);
  const cardStartTimeRef = useRef<number>(0);

  const [showCreator, setShowCreator] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletedCard, setDeletedCard] = useState<Flashcard | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (reviewQueue && reviewQueue.length > 0) {
        setStudyQueue([...reviewQueue]);
        setIsStudyMode(true);
        setCurrentCardIndex(0);
        setFeedbackState('idle');
        cardStartTimeRef.current = Date.now();
    }
  }, [reviewQueue]);

  const startStudy = () => {
    if (cards.length === 0) return;
    const now = Date.now();
    const dueCards = cards.filter(c => !c.nextReview || c.nextReview <= now);
    
    let sessionCards = [...dueCards];
    if (sessionCards.length === 0) {
        sessionCards = cards.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    setStudyQueue(sessionCards);
    setIsStudyMode(true);
    setCurrentCardIndex(0);
    setFeedbackState('idle');
    cardStartTimeRef.current = Date.now();
  };

  const handleAnswer = async (userChoice: boolean) => {
    if (feedbackState !== 'idle') return;
    const timeTaken = Date.now() - cardStartTimeRef.current;
    
    const currentCard = studyQueue[currentCardIndex];
    const isCorrect = userChoice === currentCard.isTrue;
    
    let updatedCard = { ...currentCard, lastReviewed: Date.now() };

    if (isCorrect) {
      updatedCard.correctCount++;
      updatedCard.streak++;
      updatedCard.mastery = Math.min(100, updatedCard.mastery + 10);
      
      let nextReviewOffset = 24 * 60 * 60 * 1000; 
      if (updatedCard.streak === 2) nextReviewOffset = 3 * 24 * 60 * 60 * 1000;
      if (updatedCard.streak >= 3) nextReviewOffset = 7 * 24 * 60 * 60 * 1000;
      
      updatedCard.nextReview = Date.now() + nextReviewOffset;
      
      setFeedbackState('success');
      setFeedbackText("+5 XP • Mastery Increased");
      onUpdateMastery(currentCard.topic, 'easy');
      onGainXP(5);
      finishCard(updatedCard, 1200);

    } else {
      updatedCard.wrongCount++;
      updatedCard.streak = 0;
      updatedCard.mastery = Math.max(0, updatedCard.mastery - 15);
      updatedCard.nextReview = Date.now() + (10 * 60 * 1000); 

      // --- CONFUSION DETECTOR LOGIC ---
      let detectedFailureType: FailureType = 'concept_confusion'; // Default

      // Heuristic 1: Rushing (Answered in < 1.5s)
      if (timeTaken < 1500) {
          detectedFailureType = 'rushing';
          setFeedbackText("Too Fast • Added back for review");
      } else {
          setFeedbackText("Learning Opportunity • Added back for review");
      }

      setFeedbackState('analyzing');
      setConfusionAnalysis(null);

      // Heuristic 2: Trigger AI Analysis for non-rushing errors
      if (detectedFailureType !== 'rushing') {
           // Simulate slight delay for "Thinking"
           setTimeout(async () => {
               try {
                  const analysis = await analyzeMistake(currentCard.statement, false, currentCard.topic || "General");
                  if (analysis) {
                      setConfusionAnalysis({ type: analysis.failureType, explanation: analysis.explanation });
                      detectedFailureType = analysis.failureType; // Update type from AI
                  }
               } catch (e) {
                  // Fallback
                  setConfusionAnalysis({ type: 'concept_confusion', explanation: "You might be confusing this with a related concept." });
               }
           }, 500);
      }

      onLogMistake(currentCard, detectedFailureType);
      onUpdateMastery(currentCard.topic, 'hard');

      // Reinsert
      const reinsertIndex = Math.min(studyQueue.length, currentCardIndex + 4);
      const newQueue = [...studyQueue];
      newQueue.splice(reinsertIndex, 0, updatedCard);
      setStudyQueue(newQueue);
      
      // Don't auto-advance if we show the analysis card
      // User must click "Continue"
    }

    setCards(prev => prev.map(c => c.id === currentCard.id ? updatedCard : c));
  };

  const finishCard = (card: Flashcard, delay: number) => {
      setTimeout(() => {
        setFeedbackState('idle');
        setConfusionAnalysis(null);
        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            cardStartTimeRef.current = Date.now();
        } else {
            setIsStudyMode(false);
            onExitReview();
            if (onSessionComplete) onSessionComplete();
        }
    }, delay);
  };

  const handleManualContinue = () => {
     finishCard(studyQueue[currentCardIndex], 0);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const newCards = await generateFlashcardsFromText(topic, selectedSubject);
      const cardsWithIds = newCards.map(c => ({
        ...c,
        id: Date.now().toString() + Math.random().toString(),
        topic: topic,
        streak: 0,
        correctCount: 0,
        wrongCount: 0,
        mastery: 0,
        nextReview: Date.now()
      }));
      setCards(prev => [...prev, ...cardsWithIds]);
      setShowCreator(false);
      setTopic('');
    } catch (e) {
      alert("Failed to generate cards.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isStudyMode) {
    const currentCard = studyQueue[currentCardIndex];
    const progress = (currentCardIndex / studyQueue.length) * 100;

    return (
      <div className="h-full flex flex-col items-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="w-full max-w-2xl h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        <div className="w-full max-w-2xl flex justify-between items-center mb-10">
          <button 
            onClick={() => { setIsStudyMode(false); onExitReview(); }}
            className="text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" /> End Mission
          </button>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Trophy size={12} /> Mastery: {currentCard.mastery}%
          </div>
        </div>

        <div className={`w-full max-w-2xl aspect-[16/9] bg-white rounded-[3rem] shadow-2xl border-4 flex flex-col items-center justify-center p-12 text-center transition-all duration-300 relative ${
            feedbackState === 'success' ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-emerald-100' : 
            feedbackState === 'error' || feedbackState === 'analyzing' ? 'border-rose-500 bg-rose-50' : 'border-slate-100'
        }`}>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Logic Verification</span>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase mb-4">{currentCard.topic}</div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {currentCard.statement}
            </h2>
            
            {/* Confusion Detector Overlay */}
            {confusionAnalysis && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-300 z-20">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-pulse">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Thinking Pattern Analyzed</h3>
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg text-xs font-bold text-amber-700 uppercase tracking-wide mb-4">
                        {confusionAnalysis.type.replace('_', ' ')}
                    </div>
                    <p className="text-slate-600 font-medium max-w-md leading-relaxed mb-8">
                        {confusionAnalysis.explanation}
                    </p>
                    <button 
                        onClick={handleManualContinue}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition"
                    >
                        Got it, Continue
                    </button>
                </div>
            )}

            {feedbackState !== 'idle' && !confusionAnalysis && (
                <div className={`mt-8 font-black text-lg animate-bounce ${feedbackState === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {feedbackText}
                </div>
            )}
        </div>

        <div className="mt-12 flex gap-8">
            <button 
                onClick={() => handleAnswer(true)}
                disabled={feedbackState !== 'idle'}
                className="group flex flex-col items-center gap-4 transition-transform active:scale-90 disabled:opacity-50"
            >
                <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-xl group-hover:bg-emerald-700 transition-colors">
                    <Check size={40} strokeWidth={4} />
                </div>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">TRUE</span>
            </button>
            <button 
                onClick={() => handleAnswer(false)}
                disabled={feedbackState !== 'idle'}
                className="group flex flex-col items-center gap-4 transition-transform active:scale-90 disabled:opacity-50"
            >
                <div className="w-20 h-20 rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:bg-rose-700 transition-colors">
                    <X size={40} strokeWidth={4} />
                </div>
                <span className="text-xs font-black text-rose-700 uppercase tracking-widest">FALSE</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Logic Bank</h1>
          <p className="text-slate-500 font-medium">True/False conceptual verification engine.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreator(!showCreator)}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
          >
            <Plus size={18} /> New Module
          </button>
          <button 
            onClick={startStudy}
            disabled={cards.length === 0}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Play size={18} fill="currentColor" /> Study ({cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length})
          </button>
        </div>
      </header>

      {showCreator && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 animate-in slide-in-from-top-6 duration-500">
            <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                <Wand2 size={24} className="text-indigo-500"/> Synthesis Module
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Matter</label>
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Photosynthesis, Supply & Demand, Stoicism"
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none transition font-bold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cluster</label>
                    <select 
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold"
                    >
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-3 shadow-lg"
                >
                    {isGenerating ? 'Synthesizing...' : 'Generate Statements'}
                    {!isGenerating && <Sparkles size={18} />}
                </button>
            </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Brain size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Neural Bank Empty</h3>
            <p className="text-slate-500 font-medium">Generate logic statements to begin tracking mastery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
                const subject = subjects.find(s => s.id === card.subjectId);
                const isDue = !card.nextReview || card.nextReview <= Date.now();
                return (
                    <div key={card.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                             <div className={`w-3 h-3 rounded-full ${subject?.color || 'bg-slate-400'} shadow-sm`}></div>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-widest">{card.topic}</span>
                                {isDue && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>}
                             </div>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-6 leading-snug line-clamp-3 tracking-tight">"{card.statement}"</h4>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mastery</div>
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${card.mastery}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-600">{card.mastery}%</span>
                            </div>
                            <button 
                                onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))}
                                className="text-slate-200 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
