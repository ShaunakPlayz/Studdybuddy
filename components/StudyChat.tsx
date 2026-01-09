
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Sparkles, HelpCircle, History, 
  Plus, Trash2, MessageSquare, ShieldAlert, AlertCircle, CheckCircle2, UserCog 
} from 'lucide-react';
import { Message, AIMode, Subject, ChatSession, Flashcard, LearnerProfile } from '../types';
import { chatWithStuddyBuddy, validateInput, updateLearnerProfile } from '../services/geminiService';

interface StudyChatProps {
  subjects: Subject[];
  onSafetyStrike: () => void;
  onAddCards: (cards: Flashcard[]) => void;
  learnerProfile: LearnerProfile;
  onUpdateProfile: (profile: LearnerProfile) => void;
}

const STORAGE_KEY = 'studdybuddy_chat_sessions';

export default function StudyChat({ subjects, onSafetyStrike, onAddCards, learnerProfile, onUpdateProfile }: StudyChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [autoSavedMessageId, setAutoSavedMessageId] = useState<string | null>(null);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    // Always sync with storage, even if empty, to ensure clear operations persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, loading, safetyWarning]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: 'welcome',
        role: 'model',
        content: "Hi! I'm StuddyBuddy. Select a subject and a mode, and I'll help you master it.",
        timestamp: Date.now()
      }],
      subjectId: subjects[0].id,
      mode: AIMode.SIMPLE,
      lastModified: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const updateActiveSession = (updates: Partial<ChatSession>) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, ...updates, lastModified: Date.now() } : s
    ));
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !activeSessionId) return;

    // Safety Filter Check
    const validation = validateInput(input);
    if (!validation.isValid) {
        setSafetyWarning(`Inappropriate language is not allowed. Please rephrase your question.`);
        onSafetyStrike();
        return;
    } else {
        setSafetyWarning(null);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...(activeSession?.messages || []), userMsg];
    const isFirstUserMessage = activeSession?.messages.filter(m => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage ? (input.length > 25 ? input.substring(0, 25) + '...' : input) : activeSession?.title;

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, messages: updatedMessages, title: newTitle || s.title, lastModified: Date.now() } : s
    ));
    
    setInput('');
    setLoading(true);

    try {
      const subjectName = subjects.find(s => s.id === (activeSession?.subjectId || subjects[0].id))?.name || "General";
      const apiHistory = updatedMessages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      // Pass the learner profile to the chat service so it can adapt
      const aiResponseText = await chatWithStuddyBuddy(
        userMsg.content, 
        activeSession?.mode || AIMode.SIMPLE, 
        subjectName, 
        apiHistory,
        learnerProfile
      );

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'model',
        content: aiResponseText,
        timestamp: Date.now(),
        mode: activeSession?.mode
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, messages: [...updatedMessages, aiMsg], lastModified: Date.now() } : s
      ));

      // Trigger Profile Analysis in Background
      if (activeSession && updatedMessages.length > 3) {
          setIsProfileUpdating(true);
          updateLearnerProfile(learnerProfile, [...updatedMessages, aiMsg].map(m => ({ role: m.role, content: m.content })))
            .then(newProfile => {
                onUpdateProfile(newProfile);
                setIsProfileUpdating(false);
            })
            .catch(() => setIsProfileUpdating(false));
      }

      // Autosave Logic for Flashcards
      if (activeSession?.mode === AIMode.FLASHCARD_GENERATOR) {
        try {
          // Attempt to clean JSON if wrapped in code blocks
          let cleanJson = aiResponseText;
          if (cleanJson.includes("```json")) {
            cleanJson = cleanJson.split("```json")[1].split("```")[0];
          } else if (cleanJson.includes("```")) {
            cleanJson = cleanJson.split("```")[1].split("```")[0];
          }
          
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const newCards: Flashcard[] = parsed.map((c: any) => ({
              id: Date.now().toString() + Math.random().toString(),
              statement: c.statement,
              isTrue: c.isTrue,
              subjectId: activeSession.subjectId,
              topic: userMsg.content.substring(0, 20), // Use query as topic or improve
              streak: 0,
              correctCount: 0,
              wrongCount: 0,
              mastery: 0,
              nextReview: Date.now()
            }));

            // Filter out invalids
            const validCards = newCards.filter(c => c.statement && typeof c.isTrue === 'boolean');
            
            if (validCards.length > 0) {
              onAddCards(validCards);
              setAutoSavedMessageId(aiMsgId);
            }
          }
        } catch (e) {
          console.warn("Autosave failed: Could not parse flashcards.", e);
        }
      }

    } catch (error) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "Sorry, I encountered a connection error. Please try again.",
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, messages: [...updatedMessages, errorMsg], lastModified: Date.now() } : s
      ));
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.role === 'model' && msg.mode === AIMode.FLASHCARD_GENERATOR) {
      try {
        let cleanContent = msg.content;
        if (cleanContent.includes("```json")) {
            cleanContent = cleanContent.split("```json")[1].split("```")[0];
        } else if (cleanContent.includes("```")) {
            cleanContent = cleanContent.split("```")[1].split("```")[0];
        }

        const cards = JSON.parse(cleanContent);
        if (Array.isArray(cards)) {
          return (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                 <p className="font-medium">I've generated and autosaved these flashcards:</p>
                 {autoSavedMessageId === msg.id && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold animate-pulse">
                        <CheckCircle2 size={10} /> Saved to Deck
                    </span>
                 )}
              </div>
              <div className="grid gap-3">
                {cards.map((card: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm flex justify-between items-center">
                    <div className="font-semibold text-slate-700">{card.statement}</div>
                    <div className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${card.isTrue ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {card.isTrue ? 'True' : 'False'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      } catch (e) {
        return <div className="whitespace-pre-wrap">{msg.content}</div>;
      }
    }

    if (msg.role === 'model' && msg.mode === AIMode.PRACTICE) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 mb-2 border-b border-indigo-100 pb-2">
                    <HelpCircle size={16} />
                    <span className="font-bold text-xs uppercase tracking-wider">Practice Questions</span>
                </div>
                <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
            </div>
        )
    }

    return <div className="whitespace-pre-wrap">{msg.content}</div>;
  };

  const handleClearAllHistory = () => {
    if (confirm("Clear all chat history? This cannot be undone.")) {
      setSessions([]);
      setActiveSessionId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Session History Sidebar */}
      <div className={`transition-all duration-300 border-r border-slate-100 flex flex-col bg-slate-50 ${showHistory ? 'w-72' : 'w-0 opacity-0 -translate-x-10 pointer-events-none'}`}>
        <div className="p-4 flex flex-col h-full">
            <button 
                onClick={createNewSession}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm mb-6"
            >
                <Plus size={18} /> New Conversation
            </button>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {sessions.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm text-slate-400">No chat history yet. Start a new chat above!</p>
                    </div>
                ) : (
                    sessions.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => setActiveSessionId(s.id)}
                            className={`group p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${activeSessionId === s.id ? 'bg-white border border-slate-100 shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-slate-200/50'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <MessageSquare size={16} className={activeSessionId === s.id ? 'text-indigo-500' : 'text-slate-400'} />
                                <span className="text-sm font-semibold truncate whitespace-nowrap">{s.title}</span>
                            </div>
                            <button 
                                onClick={(e) => deleteSession(s.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
                <button 
                   onClick={handleClearAllHistory}
                   className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition"
                >
                    Clear All History
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {!activeSessionId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 animate-pulse">
                    <Bot size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your AI Study Companion</h2>
                    <p className="text-slate-500 max-w-sm">Pick a past chat or start a fresh one to dive back into learning.</p>
                </div>
                <button 
                    onClick={createNewSession}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition active:scale-95"
                >
                    New Chat
                </button>
            </div>
        ) : (
            <>
                <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-xl transition ${showHistory ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                            title="Toggle History"
                        >
                            <History size={20} />
                        </button>
                        <div className="w-px h-6 bg-slate-100" />
                        <div>
                            <h2 className="font-black text-slate-800 tracking-tight text-sm uppercase">{activeSession.title}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {subjects.find(s => s.id === activeSession.subjectId)?.name} • {activeSession.mode}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto items-center">
                        {/* Profile Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 border border-slate-100 mr-2" title="AI Learner Profile Active">
                             <UserCog size={14} className={isProfileUpdating ? "text-indigo-500 animate-pulse" : "text-slate-400"} />
                             <span className="hidden md:inline">{learnerProfile.style} • {learnerProfile.tolerance}</span>
                        </div>

                        <select 
                            className="flex-1 md:w-36 p-2 text-xs font-bold border-0 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            value={activeSession.subjectId}
                            onChange={(e) => updateActiveSession({ subjectId: e.target.value })}
                        >
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>

                        <select 
                            className="flex-1 md:w-36 p-2 text-xs font-bold border-0 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            value={activeSession.mode}
                            onChange={(e) => updateActiveSession({ mode: e.target.value as AIMode })}
                        >
                            {Object.values(AIMode).map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar"
                >
                    {activeSession.messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[85%] md:max-w-[75%] rounded-3xl p-5 shadow-sm text-sm md:text-base leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300
                                ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
                                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none'}
                            `}>
                                {msg.role === 'model' && msg.id !== 'welcome' && msg.mode && (
                                    <div className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                                        <Sparkles size={12} /> 
                                        {msg.mode === AIMode.FLASHCARD_GENERATOR ? 'Generated' : msg.mode}
                                    </div>
                                )}
                                {renderMessageContent(msg)}
                                <div className={`text-[9px] mt-2 font-bold uppercase opacity-40 ${msg.role === 'user' ? 'text-white text-right' : 'text-slate-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 rounded-bl-none shadow-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    {safetyWarning && (
                        <div className="flex justify-center p-4">
                            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in zoom-in-95 duration-200 shadow-sm">
                                <ShieldAlert size={20} className="shrink-0" />
                                <span>{safetyWarning}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 focus:ring-0 focus:border-indigo-100 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 shadow-sm"
                                placeholder={`Ask about ${subjects.find(s => s.id === activeSession.subjectId)?.name}...`}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (safetyWarning) setSafetyWarning(null);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={loading}
                            />
                            <div className="absolute left-0 bottom-full mb-2 opacity-0 group-focus-within:opacity-100 transition pointer-events-none">
                                <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg font-bold uppercase">Press Enter to Send</div>
                            </div>
                        </div>
                        <button 
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 text-white p-4 rounded-[1.5rem] hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            <Send size={22} />
                        </button>
                    </div>
                    <div className="mt-3 text-center">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                             <AlertCircle size={10} /> StuddyBuddy is a respectful learning space. Abusive language is not allowed.
                        </p>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
