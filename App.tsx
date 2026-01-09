
import React, { useState, useEffect } from 'react';
import { View, Subject, UserStats, StudySession, Flashcard, Mistake, StudyPlan, StudyDay, StudyBlock, Challenge, UserTier, LearnerProfile, StudyGroup, SharedDeck, FailureType, Rank, RankTier } from './types';
import { INITIAL_SUBJECTS, MOCK_STATS, MOCK_GROUPS, RANK_CONFIG } from './constants'; // Removed LEVELS
import { LayoutDashboard, MessageSquareText, Layers, Timer, GraduationCap, Menu, Crown, AlertTriangle, CalendarDays, Trophy, BarChart3, Users, Settings, Sparkles, ShieldAlert, Lock, Clock, MailWarning, Brain, Activity, Presentation, TrendingDown } from 'lucide-react';

import Dashboard from './components/Dashboard';
import StudyChat from './components/StudyChat';
import Flashcards from './components/Flashcards';
import FocusTimer from './components/FocusTimer';
import MistakesReview from './components/MistakesReview';
import SmartPlanner from './components/SmartPlanner';
import GamificationCenter from './components/GamificationCenter';
import StudyHistory from './components/StudyHistory';
import SocialGroups from './components/SocialGroups';
import Pricing from './components/Pricing';
import TeacherDashboard from './components/TeacherDashboard';
import AIStudyCoach from './components/AIStudyCoach';
import BrainAnalytics from './components/BrainAnalytics';
import ExamSimulator from './components/ExamSimulator';
import PitchDeck from './components/PitchDeck';
import { notifySchoolAdmin, createStudySchedule } from './services/geminiService';

const STORAGE_KEYS = {
  STATS: 'studdybuddy_stats',
  CARDS: 'studdybuddy_cards',
  MISTAKES: 'studdybuddy_mistakes',
  SESSIONS: 'studdybuddy_sessions',
  PLAN: 'studdybuddy_plan',
  PROFILE: 'studdybuddy_profile',
  GROUPS: 'studdybuddy_groups'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  
  // --- Persisted State ---
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Migration check for old users
        if (!parsed.rank) {
            return {
                ...parsed,
                rank: { tier: 'Bronze', level: 1, currentXP: parsed.xp || 0 },
                lastActivityDate: Date.now()
            }
        }
        return parsed;
    }
    return { ...MOCK_STATS, totalFocusMinutes: 0, lastActivityDate: Date.now() };
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    return saved ? JSON.parse(saved) : [];
  });

  const [mistakes, setMistakes] = useState<Mistake[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    return saved ? JSON.parse(saved) : null;
  });

  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : { style: 'step-by-step', tolerance: 'intermediate', feedback: 'socratic', focus: 'depth', observations: [] };
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : MOCK_GROUPS;
  });

  // --- Persistence Sync ---
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes)); }, [mistakes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(studyPlan)); }, [studyPlan]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(learnerProfile)); }, [learnerProfile]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(studyGroups)); }, [studyGroups]);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [decayMessage, setDecayMessage] = useState<string | null>(null);
  const [decayWarning, setDecayWarning] = useState<string | null>(null);
  const [flashcardReviewQueue, setFlashcardReviewQueue] = useState<Flashcard[] | null>(null);

  // MOCK USER ID
  const CURRENT_USER_ID = "USER_STU_123";
  const CURRENT_USER_NAME = "You";

  // --- Rank Decay Logic ---
  useEffect(() => {
    const checkRankDecay = () => {
        const now = Date.now();
        const lastActivity = stats.lastActivityDate;
        const hoursInactive = (now - lastActivity) / (1000 * 60 * 60);
        
        // Warning at 48 hours
        if (hoursInactive >= 48 && hoursInactive < 72) {
            setDecayWarning("⚠️ You’re about to lose a level. Study today to maintain your rank.");
        } else {
            setDecayWarning(null);
        }

        // Decay Trigger at 72 hours
        if (hoursInactive >= 72) {
            // Prevent multiple demotions in short span (e.g., refreshing page)
            // Only apply if we haven't applied a demotion in the last 24h
            const lastDemotion = stats.lastDemotionDate || 0;
            if (now - lastDemotion < 24 * 60 * 60 * 1000) return;

            let newRank = { ...stats.rank };
            let demoted = false;

            if (newRank.tier === 'Ascendant') {
                newRank.tier = 'Elite';
                newRank.level = 3;
                newRank.currentXP = 0;
                demoted = true;
            } else if (newRank.level > 1) {
                newRank.level -= 1;
                newRank.currentXP = 0;
                demoted = true;
            } else if (newRank.level === 1) {
                // Demote Tier
                const tiers: RankTier[] = ['Bronze', 'Silver', 'Gold', 'Elite', 'Ascendant'];
                const currentIndex = tiers.indexOf(newRank.tier);
                if (currentIndex > 0) {
                    newRank.tier = tiers[currentIndex - 1];
                    newRank.level = 3;
                    newRank.currentXP = 0;
                    demoted = true;
                }
            }

            if (demoted) {
                setStats(prev => ({ 
                    ...prev, 
                    rank: newRank, 
                    lastDemotionDate: now,
                    // Note: We DO NOT reset lastActivityDate here. 
                    // They must perform a valid action to stop the decay clock.
                }));
                setDecayMessage(`⬇️ Rank Decreased to ${newRank.tier} ${newRank.level}. Consistency is required to maintain mastery.`);
            }
        }
    };

    checkRankDecay();
  }, []); // Run once on mount

  // --- XP & Rank Logic ---
  const handleValidActivity = () => {
      setStats(prev => ({ ...prev, lastActivityDate: Date.now() }));
      setDecayWarning(null); // Clear warning immediately
  };

  const handleGainXP = (amount: number) => {
    handleValidActivity();
    setStats(prev => {
        let { tier, level, currentXP } = prev.rank;
        
        if (tier === 'Ascendant') return prev; // No XP in Ascendant

        let newXP = currentXP + amount;
        let config = RANK_CONFIG[tier];
        let leveledUp = false;
        let newTier: RankTier = tier;
        let newLevel = level;

        if (newXP >= config.xpPerLevel) {
            newXP = 0; // Reset XP on level up
            leveledUp = true;
            
            if (level < 3) {
                newLevel += 1;
                setLevelUpMessage(`Rank Up! ${tier} ${newLevel}`);
            } else {
                // Tier Up
                if (config.nextTier) {
                    newTier = config.nextTier;
                    if (newTier === 'Ascendant') {
                        newLevel = 1; // Ascendant doesn't use levels but let's keep 1 for safety
                        setLevelUpMessage(`ASCENDED! You have reached the pinnacle.`);
                    } else {
                        newLevel = 1;
                        setLevelUpMessage(`TIER UP! Welcome to ${newTier}`);
                    }
                }
            }
        }

        // XP Reset logic: XP doesn't carry over.
        // If user got 1050 XP and needed 1000, new XP is 0, not 50.
        
        return { 
            ...prev, 
            rank: {
                tier: newTier,
                level: newLevel,
                currentXP: newXP
            }
        };
    });
  };

  // --- Real-time Streak Calculation ---
  useEffect(() => {
    const calculateStreak = () => {
      const uniqueDates = new Set(sessions.map(s => s.date));
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let currentStreak = 0;
      let checkDate = new Date(today);

      // If we haven't studied today or yesterday, streak is broken (0)
      if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) {
        return 0;
      }

      // If we haven't studied today but did yesterday, the streak is alive but starts counting from yesterday
      if (!uniqueDates.has(todayStr)) {
        checkDate = yesterday;
      }

      while (uniqueDates.has(checkDate.toISOString().split('T')[0])) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      return currentStreak;
    };

    const realStreak = calculateStreak();
    
    setStats(prev => {
        if (prev.streaks.daily.current === realStreak) return prev;
        return {
            ...prev,
            streaks: {
                ...prev.streaks,
                daily: { ...prev.streaks.daily, current: realStreak }
            }
        };
    });
  }, [sessions]);

  // --- Global Time Tracker ---
  useEffect(() => {
    const interval = setInterval(() => {
        if (!document.hidden) {
            setStats(prev => ({
                ...prev,
                totalFocusMinutes: prev.totalFocusMinutes + (1/6) // Add 10 seconds worth of minutes (0.166)
            }));
        }
    }, 10000); // Update every 10 seconds for "Live" feel
    return () => clearInterval(interval);
  }, []);

  // --- Group Logic ---
  const handleCreateGroup = (name: string, description: string, privacy: 'public' | 'private') => {
    const newGroup: StudyGroup = {
        id: Date.now().toString(),
        name,
        description,
        privacy,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        ownerId: CURRENT_USER_ID,
        members: [{
            id: CURRENT_USER_ID,
            name: CURRENT_USER_NAME,
            avatar: '😎',
            status: 'online',
            level: stats.rank.level, // Use simplified level or tier
            lastActive: 'Now',
            role: 'owner'
        }],
        sharedDecks: [],
        groupStreak: 0,
        totalXP: 0,
        activeNowCount: 1
    };
    setStudyGroups(prev => [...prev, newGroup]);
  };

  const handleJoinGroup = (inviteCode: string) => {
    const group = studyGroups.find(g => g.id === inviteCode);
    if (!group) return alert("Invalid invite code.");
    if (group.members.some(m => m.id === CURRENT_USER_ID)) return alert("Already a member!");

    const updatedGroups = studyGroups.map(g => {
        if (g.id === group.id) {
            return {
                ...g,
                members: [...g.members, {
                    id: CURRENT_USER_ID,
                    name: CURRENT_USER_NAME,
                    avatar: '😎',
                    status: 'online' as const,
                    level: stats.rank.level,
                    lastActive: 'Now',
                    role: 'member' as const
                }]
            };
        }
        return g;
    });
    setStudyGroups(updatedGroups);
  };

  const handleShareDeckToGroup = (groupId: string, topic: string) => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    const cardsToShare = cards.filter(c => c.topic === topic);
    if (cardsToShare.length === 0) return alert("No cards found for this topic.");

    const newDeck: SharedDeck = {
        id: Date.now().toString(),
        name: `${topic} - Shared`,
        cards: cardsToShare,
        creatorId: CURRENT_USER_ID,
        creatorName: CURRENT_USER_NAME,
        createdAt: Date.now(),
        cardCount: cardsToShare.length
    };

    setStudyGroups(prev => prev.map(g => {
        if (g.id === groupId) {
            return { ...g, sharedDecks: [...g.sharedDecks, newDeck] };
        }
        return g;
    }));
    alert("Deck shared successfully!");
  };

  const handleImportSharedDeck = (deck: SharedDeck) => {
      const newCards = deck.cards.map(c => ({
          ...c,
          id: Date.now().toString() + Math.random().toString(),
          streak: 0,
          correctCount: 0,
          wrongCount: 0,
          mastery: 0,
          lastReviewed: undefined,
          nextReview: Date.now()
      }));
      setCards(prev => [...prev, ...newCards]);
      alert(`Imported ${newCards.length} cards from ${deck.name}`);
  };

  // --- Safety Strike Handling ---
  const handleAddSafetyStrike = () => {
    setStats(prev => {
      const newStrikes = prev.safetyStrikes + 1;
      let lockUntil = prev.lockUntil;

      if (newStrikes === 2) {
        lockUntil = Date.now() + 60 * 1000;
        if (prev.tier === UserTier.SCHOOL) notifySchoolAdmin(CURRENT_USER_ID, 2);
      } else if (newStrikes >= 3) {
        lockUntil = Date.now() + 48 * 60 * 60 * 1000;
        if (prev.tier === UserTier.SCHOOL) notifySchoolAdmin(CURRENT_USER_ID, 3);
      }
      
      return { ...prev, safetyStrikes: newStrikes, lockUntil };
    });
  };

  const isLocked = stats.lockUntil && Date.now() < stats.lockUntil;
  const isHardLocked = isLocked && stats.safetyStrikes >= 3;
  const isSoftLocked = isLocked && stats.safetyStrikes === 2;

  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((stats.lockUntil! - Date.now()) / 1000));
      setLockoutTimeLeft(remaining);
      if (remaining === 0) window.location.reload();
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, stats.lockUntil]);

  const formatLockoutTime = (seconds: number) => {
    if (seconds > 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m ${seconds % 60}s`;
    }
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const isFeatureLocked = (view: View) => {
    if (stats.tier === UserTier.PRO || stats.tier === UserTier.SCHOOL) return false;
    const proViews = [View.PLANNER, View.MISTAKES, View.HISTORY, View.COACH, View.BRAIN_ANALYTICS, View.EXAM_SIMULATOR];
    return proViews.includes(view);
  };

  const handleUpdateChallenge = (type: Challenge['type'], progressIncrement: number = 1) => {
    setStats(prev => {
        const newChallenges = prev.activeChallenges.map(c => {
            if (c.type === type && !c.isCompleted) {
                const newProgress = c.progress + progressIncrement;
                const completed = newProgress >= c.goal;
                if (completed) handleGainXP(c.xpReward);
                return { ...c, progress: Math.min(newProgress, c.goal), isCompleted: completed };
            }
            return c;
        });
        return { ...prev, activeChallenges: newChallenges };
    });
  };

  const handleSessionComplete = (minutes: number, subjectId: string) => {
    const newSession: StudySession = { date: new Date().toISOString().split('T')[0], minutes, subject: subjectId };
    setSessions(prev => [...prev, newSession]);
    setStats(prev => ({ ...prev, totalFocusMinutes: prev.totalFocusMinutes + minutes }));
    handleGainXP(100);
    handleUpdateChallenge('focus', 1);

    if (activeGroupId) {
        setStudyGroups(prev => prev.map(g => {
            if (g.id === activeGroupId) {
                return { ...g, totalXP: g.totalXP + 100, groupStreak: g.groupStreak + 1 }; 
            }
            return g;
        }));
    }
  };

  const handleLogMistake = (card: Flashcard, failureType: FailureType = 'concept_confusion') => {
    handleValidActivity();
    setMistakes(prev => {
        const existing = prev.find(m => m.question === card.statement && m.subjectId === card.subjectId);
        if (existing) return prev.map(m => m.id === existing.id ? { ...m, count: m.count + 1, timestamp: Date.now(), failureType: failureType } : m);
        return [...prev, { id: Date.now().toString(), question: card.statement, answer: card.isTrue ? "True" : "False", subjectId: card.subjectId, topic: card.topic, timestamp: Date.now(), count: 1, failureType: failureType }];
    });

    setStats(prev => {
       const newProfile = { ...prev.failureProfile };
       if (!newProfile[failureType]) newProfile[failureType] = 0;
       newProfile[failureType] += 1;
       return { ...prev, failureProfile: newProfile };
    });
  };

  const handleUpdateMastery = (topic: string | undefined, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!topic) return;
    setStats(prev => {
        const existingTopicIndex = prev.topicMastery.findIndex(t => t.topic === topic);
        let newMasteryStats = [...prev.topicMastery];
        if (existingTopicIndex !== -1) {
            let newMastery = newMasteryStats[existingTopicIndex].masteryScore;
            if (difficulty === 'easy') newMastery = Math.min(100, newMastery + 10);
            else if (difficulty === 'medium') newMastery = Math.min(100, newMastery + 5);
            else newMastery = Math.max(0, newMastery - 15);
            newMasteryStats[existingTopicIndex] = { ...newMasteryStats[existingTopicIndex], masteryScore: newMastery };
        } else {
            const mastery = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 10 : 0;
            newMasteryStats.push({ topic, subjectId: 'math', masteryScore: mastery, cardsLearned: 1 });
        }
        return { ...prev, topicMastery: newMasteryStats };
    });
  };

  const handleBlockAction = (dayIndex: number, blockId: string, action: 'completed' | 'skipped') => {
    setStudyPlan(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = { ...newSchedule[dayIndex] };
      const newBlocks = day.blocks.map(block => {
        if (block.id === blockId) {
          if (action === 'completed' && block.status !== 'completed') {
            handleSessionComplete(block.duration, block.subjectId);
          }
          return { ...block, status: action };
        }
        return block;
      });
      day.blocks = newBlocks;
      newSchedule[dayIndex] = day;
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleGeneratePlan = async (examDate: string, hoursPerDay: number, subjectIds: string[]) => {
      const selected = subjects.filter(s => subjectIds.includes(s.id));
      const schedule = await createStudySchedule(examDate, hoursPerDay * 60, selected);
      setStudyPlan({
          examDate,
          dailyMinutes: hoursPerDay * 60,
          selectedSubjectIds: subjectIds,
          schedule
      });
  };

  const NavItem = ({ view, icon: Icon, label, badge, isPro }: { view: View; icon: any; label: string, badge?: number, isPro?: boolean }) => {
    const isLocked = isFeatureLocked(view);
    return (
        <button
          onClick={() => { 
            if (isLocked) setCurrentView(View.PRICING);
            else { setCurrentView(view); if (view !== View.FOCUS) setActiveGroupId(null); }
            setIsSidebarOpen(false); 
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
            currentView === view ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="flex items-center gap-2">
                {label}
                {isPro && !isLocked && <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase">Pro</span>}
                {isLocked && <Crown size={12} className="text-amber-500" />}
            </span>
          </div>
          {badge ? <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span> : null}
        </button>
    );
  };

  if (isHardLocked) {
    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-6 z-[100] animate-in fade-in duration-700">
            <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full text-center space-y-10 shadow-2xl">
                <div className="w-28 h-28 bg-rose-100 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                    <ShieldAlert size={56} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Suspended</h1>
                    <p className="text-slate-500 leading-relaxed text-lg font-medium">StuddyBuddy is a respectful learning community. Access suspended for 48 hours for policy violations.</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Clock size={12} /> Access Resumes In</p>
                    <div className="text-3xl font-black text-indigo-600 font-mono">{formatLockoutTime(lockoutTimeLeft)}</div>
                </div>
            </div>
        </div>
    );
  }

  // --- RENDER PITCH DECK VIEW (Full Screen Override) ---
  if (currentView === View.PITCH_DECK) {
      return (
          <div className="h-screen w-full relative">
              <button 
                onClick={() => setCurrentView(View.DASHBOARD)}
                className="absolute top-6 left-6 z-[100] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition"
              >
                  <Menu size={24} />
              </button>
              <PitchDeck />
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
          {levelUpMessage && (
              <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl animate-in slide-in-from-right-10 flex items-center gap-3">
                  <Crown size={20} />
                  <span className="font-bold">{levelUpMessage}</span>
                  <button onClick={() => setLevelUpMessage(null)} className="pointer-events-auto ml-2 hover:opacity-80">×</button>
              </div>
          )}
          {decayMessage && (
              <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-xl animate-in slide-in-from-right-10 flex items-center gap-3">
                  <TrendingDown size={20} />
                  <span className="font-bold">{decayMessage}</span>
                  <button onClick={() => setDecayMessage(null)} className="pointer-events-auto ml-2 hover:opacity-80">×</button>
              </div>
          )}
      </div>

      {/* Decay Warning Overlay */}
      {decayWarning && (
          <div className="absolute top-0 left-0 w-full bg-amber-500 text-white text-xs font-bold py-1 text-center z-[60] flex items-center justify-center gap-2">
              <AlertTriangle size={12} /> {decayWarning}
          </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      {isSoftLocked && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[90] flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-8 shadow-2xl">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Lock size={40} /></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cooldown Active</h2>
                    <p className="text-slate-500 mt-2 font-medium">Respectful learning is mandatory. Resume shortly.</p>
                </div>
                <div className="font-mono text-4xl font-black text-indigo-600 bg-slate-50 py-6 rounded-2xl border border-slate-100">{formatLockoutTime(lockoutTimeLeft)}</div>
             </div>
        </div>
      )}

      <aside className={`fixed md:relative z-50 w-72 h-full bg-white border-r border-slate-200 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><GraduationCap size={24} /></div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">StuddyBuddy</span>
          </div>
          <nav className="space-y-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={View.COACH} icon={Sparkles} label="AI Coach" isPro />
            <NavItem view={View.GROUPS} icon={Users} label="Study Circles" />
            <NavItem view={View.HISTORY} icon={BarChart3} label="Study Logs" isPro />
            <NavItem view={View.BRAIN_ANALYTICS} icon={Brain} label="Brain Analytics" isPro />
            <NavItem view={View.EXAM_SIMULATOR} icon={Activity} label="Exam Simulator" isPro />
            <NavItem view={View.PLANNER} icon={CalendarDays} label="Study Plan" isPro />
            <NavItem view={View.CHAT} icon={MessageSquareText} label="AI Tutor" />
            <NavItem view={View.FLASHCARDS} icon={Layers} label="Flashcards" />
            <NavItem view={View.ACHIEVEMENTS} icon={Trophy} label="Rank & Rewards" />
            <NavItem view={View.MISTAKES} icon={AlertTriangle} label="Mistakes" badge={mistakes.length} isPro />
            <NavItem view={View.FOCUS} icon={Timer} label="Focus Mode" />
            {stats.tier === UserTier.SCHOOL && <NavItem view={View.TEACHER_DASHBOARD} icon={GraduationCap} label="Teacher Dashboard" />}
          </nav>
        </div>
        
        <div className="space-y-3 mt-4">
             <button 
                onClick={() => setCurrentView(View.PITCH_DECK)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
                <Presentation size={18} /> <span className="text-sm font-bold">About StuddyBuddy</span>
            </button>

            <div onClick={() => setCurrentView(View.PRICING)} className={`rounded-2xl p-4 text-white relative overflow-hidden group cursor-pointer transition-all ${stats.tier === UserTier.FREE ? 'bg-slate-900' : 'bg-indigo-900 shadow-xl'}`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 blur-[40px] opacity-40"></div>
                <div className="flex items-center gap-2 mb-1">
                    <Crown size={16} className={stats.tier === UserTier.FREE ? 'text-amber-400' : 'text-white'} />
                    <span className="font-bold text-xs tracking-tight">{stats.tier} Access</span>
                </div>
            </div>
            <button onClick={() => { if(confirm("Reset data?")) { localStorage.clear(); window.location.reload(); }}} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-rose-500 transition">
                <Settings size={18} /> <span className="text-sm font-medium">Reset</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200 z-30">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-md text-white"><GraduationCap size={18} /></div>
                <span className="font-bold text-slate-900">StuddyBuddy</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu size={24} /></button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative mobile-p-reduction">
          {currentView === View.DASHBOARD && <Dashboard 
                stats={stats} 
                sessions={sessions} 
                subjects={subjects} 
                totalCards={cards.length} 
                onReviseTopic={(t) => { 
                    if (!t) {
                        setCurrentView(View.FLASHCARDS);
                        return;
                    }
                    const c = cards.filter(cd => cd.topic === t); 
                    if(c.length) { 
                        setFlashcardReviewQueue(c); 
                        setCurrentView(View.FLASHCARDS); 
                    } else {
                        setCurrentView(View.FLASHCARDS);
                    }
                }} 
                onQuickStudy={() => setCurrentView(View.CHAT)}
            />}
          {currentView === View.HISTORY && <StudyHistory sessions={sessions} subjects={subjects} />}
          {currentView === View.COACH && <AIStudyCoach stats={stats} sessions={sessions} subjects={subjects} />}
          {currentView === View.BRAIN_ANALYTICS && <BrainAnalytics stats={stats} subjects={subjects} />}
          {currentView === View.EXAM_SIMULATOR && <ExamSimulator subjects={subjects} />}
          {currentView === View.GROUPS && <SocialGroups 
              groups={studyGroups} 
              userCards={cards}
              currentUser={{ id: CURRENT_USER_ID, name: CURRENT_USER_NAME }}
              onJoinSession={(id) => { setActiveGroupId(id); setCurrentView(View.FOCUS); }} 
              onImportDeck={handleImportSharedDeck}
              onCreateGroup={handleCreateGroup}
              onJoinGroup={handleJoinGroup}
              onShareDeck={handleShareDeckToGroup}
          />}
          {currentView === View.PLANNER && <SmartPlanner subjects={subjects} plan={studyPlan} onGeneratePlan={handleGeneratePlan} onBlockAction={handleBlockAction} />}
          {currentView === View.CHAT && <StudyChat 
            subjects={subjects} 
            onSafetyStrike={handleAddSafetyStrike} 
            onAddCards={(newCards) => setCards(prev => [...prev, ...newCards])}
            learnerProfile={learnerProfile}
            onUpdateProfile={setLearnerProfile}
          />}
          {currentView === View.FLASHCARDS && <Flashcards subjects={subjects} cards={cards} setCards={setCards} onLogMistake={handleLogMistake} onUpdateMastery={handleUpdateMastery} reviewQueue={flashcardReviewQueue} onExitReview={() => setFlashcardReviewQueue(null)} onGainXP={handleGainXP} />}
          {currentView === View.MISTAKES && <MistakesReview mistakes={mistakes} subjects={subjects} onReviewAll={(m) => { setFlashcardReviewQueue(m.map(mi => ({ id: mi.id, statement: mi.question, isTrue: mi.answer === "True", subjectId: mi.subjectId, topic: mi.topic, streak: 0, correctCount: 0, wrongCount: 0, mastery: 0 }))); setCurrentView(View.FLASHCARDS); }} onClearMistake={(id) => setMistakes(prev => prev.filter(m => m.id !== id))} />}
          {currentView === View.FOCUS && <FocusTimer subjects={subjects} onSessionComplete={handleSessionComplete} activeGroupId={activeGroupId} />}
          {currentView === View.ACHIEVEMENTS && <GamificationCenter stats={stats} />}
          {currentView === View.PRICING && <Pricing currentTier={stats.tier} onUpgrade={(t) => setStats(p => ({...p, tier: t}))} />}
          {currentView === View.TEACHER_DASHBOARD && <TeacherDashboard subjects={subjects} />}
        </div>
      </main>
    </div>
  );
};

export default App;
