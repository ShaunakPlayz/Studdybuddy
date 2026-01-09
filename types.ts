
export enum View {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  FLASHCARDS = 'FLASHCARDS',
  FOCUS = 'FOCUS',
  SETTINGS = 'SETTINGS',
  MISTAKES = 'MISTAKES',
  PLANNER = 'PLANNER',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  HISTORY = 'HISTORY',
  GROUPS = 'GROUPS',
  PRICING = 'PRICING',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  COACH = 'COACH',
  BRAIN_ANALYTICS = 'BRAIN_ANALYTICS',
  EXAM_SIMULATOR = 'EXAM_SIMULATOR',
  PITCH_DECK = 'PITCH_DECK'
}

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  SCHOOL = 'SCHOOL'
}

export enum AIMode {
  SIMPLE = 'Simple',
  EXAM = 'Exam',
  STEP_BY_STEP = 'Step-by-Step',
  REVISION = 'Quick Revision',
  TEACHER = 'Teacher',
  PRACTICE = 'Practice',
  FLASHCARD_GENERATOR = 'Flashcard Generator'
}

export interface LearnerProfile {
  style: 'step-by-step' | 'summaries' | 'examples' | 'practice' | 'visual';
  tolerance: 'beginner' | 'intermediate' | 'advanced';
  feedback: 'direct' | 'gentle' | 'socratic';
  focus: 'speed' | 'depth';
  observations: string[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: AIMode;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  subjectId: string;
  mode: AIMode;
  lastModified: number;
}

export interface Flashcard {
  id: string;
  statement: string;
  isTrue: boolean;
  subjectId: string;
  topic?: string;
  streak: number;
  correctCount: number;
  wrongCount: number;
  mastery: number; // 0-100
  lastReviewed?: number;
  nextReview?: number;
}

export type FailureType = 'concept_confusion' | 'rushing' | 'formula_misuse' | 'misreading' | 'memory_gap';

export interface Mistake {
  id: string;
  question: string;
  answer: string;
  subjectId: string;
  topic?: string;
  timestamp: number;
  count: number;
  failureType?: FailureType;
  analysis?: string;
}

export interface TopicMastery {
  topic: string;
  subjectId: string;
  masteryScore: number;
  cardsLearned: number;
  lastReviewDate?: string;
  retentionRate?: number; // 0-100 projected retention
}

export interface StreakData {
  current: number;
  lastLogDate: string;
  best: number;
}

export type GroupRole = 'owner' | 'admin' | 'member';

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'studying' | 'offline';
  level: number; // Keeping simple level for group display compatibility or map from rank
  lastActive: string;
  role: GroupRole;
}

export interface SharedDeck {
  id: string;
  name: string;
  cards: Flashcard[];
  creatorId: string;
  creatorName: string;
  createdAt: number;
  cardCount: number; // retained for UI convenience
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  inviteCode: string;
  ownerId: string;
  members: GroupMember[];
  sharedDecks: SharedDeck[];
  groupStreak: number;
  totalXP: number;
  activeNowCount: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  xpReward: number;
  type: 'flashcard' | 'focus' | 'streak' | 'planner';
  isCompleted: boolean;
}

// New Rank Types
export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Elite' | 'Ascendant';

export interface Rank {
  tier: RankTier;
  level: number; // 1, 2, 3 (1 for Ascendant)
  currentXP: number;
}

export interface UserStats {
  tier: UserTier; // Subscription tier
  aiTokensRemaining: number;
  streaks: {
    daily: StreakData;
    flashcards: StreakData;
    focus: StreakData;
  };
  rank: Rank; // New structured rank
  lastActivityDate: number; // Timestamp for decay
  lastDecayWarningDate?: number; 
  lastDemotionDate?: number;
  
  badges: Badge[];
  activeChallenges: Challenge[];
  totalFocusMinutes: number;
  cardsReviewed: number;
  subjectsStudied: string[];
  topicMastery: TopicMastery[];
  safetyStrikes: number;
  lockUntil?: number;
  learnerProfile?: LearnerProfile;
  failureProfile: Record<FailureType, number>;
}

export interface StudySession {
  date: string;
  minutes: number;
  subject: string;
}

export interface StudyBlock {
  id: string;
  subjectId: string;
  topic: string;
  duration: number;
  type: 'learning' | 'revision' | 'practice';
  status: 'pending' | 'completed' | 'skipped';
}

export interface StudyDay {
  date: string;
  blocks: StudyBlock[];
  totalMinutes: number;
}

export interface StudyPlan {
  examDate: string;
  dailyMinutes: number;
  selectedSubjectIds: string[];
  schedule: StudyDay[];
}

export interface WeeklyInsight {
  summary: string;
  strength: string;
  weakness: string;
  actionablePlan: string[];
  encouragement: string;
}

// Exam Simulation Types
export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface ExamLog {
  questionId: string;
  timeTaken: number; // seconds
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: number; // relative to start (seconds)
}

export interface ExamReport {
  score: number;
  totalQuestions: number;
  accuracyTrend: string;
  fatigueDetected: boolean;
  pressureWeakness: string;
  recommendation: string;
}
