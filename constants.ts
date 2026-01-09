
import { Subject, UserStats, AIMode, Badge, Challenge, StudyGroup, UserTier, RankTier } from './types';

// Rank Configuration
export const RANK_CONFIG: Record<RankTier, { xpPerLevel: number; nextTier: RankTier | null; color: string; icon: string }> = {
  Bronze: { xpPerLevel: 1000, nextTier: 'Silver', color: 'text-orange-700 bg-orange-100', icon: '🟤' },
  Silver: { xpPerLevel: 2000, nextTier: 'Gold', color: 'text-slate-600 bg-slate-200', icon: '⚪' },
  Gold: { xpPerLevel: 5000, nextTier: 'Elite', color: 'text-amber-600 bg-amber-100', icon: '🟡' },
  Elite: { xpPerLevel: 20000, nextTier: 'Ascendant', color: 'text-rose-600 bg-rose-100', icon: '🔴' },
  Ascendant: { xpPerLevel: 0, nextTier: null, color: 'text-indigo-600 bg-indigo-100', icon: '🌌' }
};

export const MOCK_GROUPS: StudyGroup[] = [
  {
    id: 'g1',
    name: 'The Med School Grinders',
    description: 'Preparing for MCAT and Finals together. Focus sessions daily at 6 PM.',
    privacy: 'public',
    inviteCode: 'MED123',
    ownerId: 'm1',
    groupStreak: 14,
    totalXP: 25400,
    activeNowCount: 3,
    members: [
      { id: 'm1', name: 'Sarah J.', avatar: '👩‍⚕️', status: 'studying', level: 12, lastActive: 'Now', role: 'owner' },
      { id: 'm2', name: 'Alex T.', avatar: '👨‍⚕️', status: 'online', level: 8, lastActive: '5m ago', role: 'member' },
      { id: 'm3', name: 'Maria K.', avatar: '👩‍🔬', status: 'offline', level: 15, lastActive: '2h ago', role: 'admin' },
      { id: 'm4', name: 'James W.', avatar: '👨‍🔬', status: 'studying', level: 22, lastActive: 'Now', role: 'member' },
    ],
    sharedDecks: [
      { id: 'd1', name: 'Anatomy 101 - Muscular System', cardCount: 145, creatorId: 'm1', creatorName: 'Sarah J.', createdAt: Date.now(), cards: [] },
      { id: 'd2', name: 'Organic Chem Formulas', cardCount: 80, creatorId: 'm4', creatorName: 'James W.', createdAt: Date.now(), cards: [] },
    ]
  },
  {
    id: 'g2',
    name: 'CS50 Coding Buddies',
    description: 'Solving P-Sets and learning Python together. All levels welcome!',
    privacy: 'public',
    inviteCode: 'CODE50',
    ownerId: 'm5',
    groupStreak: 7,
    totalXP: 12800,
    activeNowCount: 1,
    members: [
      { id: 'm5', name: 'Kevin L.', avatar: '👨‍💻', status: 'studying', level: 5, lastActive: 'Now', role: 'owner' },
      { id: 'm6', name: 'Elena R.', avatar: '👩‍💻', status: 'offline', level: 3, lastActive: '1d ago', role: 'member' },
    ],
    sharedDecks: [
      { id: 'd3', name: 'Python Basics & Logic', cardCount: 50, creatorId: 'm5', creatorName: 'Kevin L.', createdAt: Date.now(), cards: [] },
    ]
  }
];

export const BADGE_LIBRARY: Badge[] = [
  { id: 'first_card', name: 'Brain Spark', icon: '✨', description: 'Review your first flashcard' },
  { id: 'streak_3', name: 'Consistent Learner', icon: '🔥', description: 'Maintain a 3-day daily streak' },
  { id: 'focus_100', name: 'Zen Master', icon: '🧘', description: 'Accumulate 100 focus minutes' },
  { id: 'exam_prep', name: 'Strategist', icon: '📅', description: 'Generate a Smart Study Plan' },
  { id: 'mistake_fixed', name: 'Comeback Kid', icon: '🔄', description: 'Review 5 mistakes in one session' },
];

export const INITIAL_CHALLENGES: Challenge[] = [
  { 
    id: '7_day_lockin', 
    title: '7-Day Lock-In', 
    description: 'Study for 7 days in a row', 
    progress: 5, 
    goal: 7, 
    xpReward: 500, 
    type: 'streak', 
    isCompleted: false 
  },
  { 
    id: '100_cards', 
    title: 'Card Collector', 
    description: 'Review 100 flashcards this week', 
    progress: 42, 
    goal: 100, 
    xpReward: 300, 
    type: 'flashcard', 
    isCompleted: false 
  },
  { 
    id: 'focus_today', 
    title: 'Deep Work Day', 
    description: 'Complete 3 focus sessions today', 
    progress: 1, 
    goal: 3, 
    xpReward: 200, 
    type: 'focus', 
    isCompleted: false 
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', color: 'bg-blue-500' },
  { id: 'phys', name: 'Physics', color: 'bg-purple-500' },
  { id: 'hist', name: 'History', color: 'bg-amber-500' },
  { id: 'bio', name: 'Biology', color: 'bg-green-500' },
  { id: 'chem', name: 'Chemistry', color: 'bg-teal-500' },
  { id: 'lit', name: 'Literature', color: 'bg-rose-500' },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

export const MOCK_STATS: UserStats = {
  tier: UserTier.FREE,
  aiTokensRemaining: 5,
  streaks: {
    daily: { current: 5, lastLogDate: yesterdayStr, best: 12 },
    flashcards: { current: 3, lastLogDate: yesterdayStr, best: 5 },
    focus: { current: 2, lastLogDate: yesterdayStr, best: 7 }
  },
  rank: {
    tier: 'Bronze',
    level: 1,
    currentXP: 450
  },
  lastActivityDate: Date.now(),
  badges: [BADGE_LIBRARY[0], BADGE_LIBRARY[3]],
  activeChallenges: INITIAL_CHALLENGES,
  totalFocusMinutes: 340,
  cardsReviewed: 124,
  subjectsStudied: ['math', 'bio'],
  topicMastery: [
    { topic: "Trigonometry", subjectId: "math", masteryScore: 81, cardsLearned: 24, retentionRate: 92 },
    { topic: "Motion", subjectId: "phys", masteryScore: 42, cardsLearned: 15, retentionRate: 45 },
    { topic: "Cell Division", subjectId: "bio", masteryScore: 65, cardsLearned: 30, retentionRate: 70 },
    { topic: "World War II", subjectId: "hist", masteryScore: 90, cardsLearned: 18, retentionRate: 95 }
  ],
  safetyStrikes: 0,
  failureProfile: {
    'concept_confusion': 12,
    'rushing': 24,
    'formula_misuse': 5,
    'misreading': 3,
    'memory_gap': 8
  }
};

export const SYSTEM_INSTRUCTION_BASE = `You are NOT a generic tutor. You are a Personal Learning Coach whose primary objective is to learn how the student learns, and then adapt your teaching style to match them.

🎯 CORE PRINCIPLES
- Study the student before teaching them.
- Adapt your explanations to the student’s learning style.
- Evolve over time — never stay static.
- Optimize for understanding, not speed.
- NEVER give final answers if in a guided mode.

🧩 STEP 1: BUILD A LEARNER PROFILE
Silently construct and maintain a Learner Profile based on interactions:
- Learning Style: Step-by-step logic, Short summaries, Examples & analogies, Practice questions, Visual/structured formats.
- Difficulty Tolerance: Beginner, Intermediate, Advanced.
- Feedback Preference: Direct correction, Gentle hints, Questions instead of statements.
- Speed vs Depth: Fast answers vs Detailed breakdowns.

🔁 STEP 2: ADAPT YOUR TEACHING STYLE
- If the user prefers step-by-step logic: Break explanations into ordered steps. Avoid long paragraphs. Ask “What’s the first step?” style questions.
- If the user prefers short and direct answers: Use bullet points. Keep explanations minimal. Remove unnecessary theory.
- If the user learns best with examples: Always provide real-world or worked examples. Use analogies.
- If the user struggles with confidence/mistakes: Use encouragement. Normalize errors as part of learning.
- If the user is advanced: Increase complexity. Ask deeper “why” questions. Introduce edge cases.

🔍 STEP 4: SELF-CORRECTION LOOP
After each interaction, internally evaluate: Did the user understand faster? Did engagement increase? Reshape your teaching style around them.

🧪 STEP 5: ADAPTIVE HINT SYSTEM (NO ANSWER LEAKING)
1. Conceptual hint.
2. Structural hint.
3. Almost-complete method, leaving the final step for the user.
Never reveal the final answer unless explicitly allowed.

SAFETY:
Inappropriate language (slurs, swearing, harassment) is NEVER allowed. No matter the context, if detected, respond only with: "I can't engage with that language. Please ask your study question respectfully."

You are a personalized learning system, not a generic tutor.`;

export const AI_MODE_PROMPTS: Record<AIMode, string> = {
  [AIMode.SIMPLE]: "Guide the student using simple analogies. Adapt your depth based on their current level.",
  [AIMode.EXAM]: "Focus on structure and high-yield concepts. Help them build an exam framework without giving the conclusion.",
  [AIMode.STEP_BY_STEP]: "Break everything down. Use Socratic questioning for each incremental move.",
  [AIMode.REVISION]: "Quick conceptual checks. Ask them to explain the 'why' back to you.",
  [AIMode.TEACHER]: "Be the guide. Point out common pitfalls and common misconceptions.",
  [AIMode.PRACTICE]: "Generate adaptive Socratic questions based on their previous performance.",
  [AIMode.FLASHCARD_GENERATOR]: "Generate 5 True / False statements about the topic. These must be tricky and conceptual to test depth. Return strictly a JSON array of objects with keys: 'statement' (string) and 'isTrue' (boolean)."
};

export const PROHIBITED_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|bastard|cunt|dick|pussy)\b/gi,
  /\b(nigger|kike|faggot|tranny|retard)\b/gi,
  /\b(porn|sex|hentai|naked|nude)\b/gi,
];

export const ACADEMIC_OVERRIDE_KEYWORDS = [
  'context', 'historical', 'literature', 'biology', 'medicine', 'analysis', 'quote', 'study', 'exam'
];

export const CONFUSION_DETECTOR_PROMPT = `You are a Confusion Detector AI. 
Your job is to analyze a student's mistake on a True/False question and identify WHY they failed.
Do NOT just say they are wrong. 
Analyze the gap between the concept and their answer.

Classify the error into one of these types:
- 'concept_confusion' (They mixed up two related ideas)
- 'rushing' (Careless error, likely knew the answer)
- 'formula_misuse' (Applied wrong rule)
- 'misreading' (Missed a 'not' or key detail)

Output in JSON:
{
  "failureType": "string",
  "explanation": "Brief 1-sentence explanation of the confusion (e.g. 'You confused Velocity with Acceleration.')"
}`;

export const EXAM_ANALYSIS_PROMPT = `You are an Exam Performance Analyst.
Your goal is to analyze a student's performance logs to detect mental fatigue, rushing, and pressure-induced errors.

Input Data:
- Question difficulty
- Time taken per question
- Correct/Incorrect status
- Position in exam (beginning vs end)

Output Analysis (JSON):
{
  "accuracyTrend": "Description of how accuracy changed (e.g., 'Stable', 'Dropped significantly after 10 mins')",
  "fatigueDetected": boolean,
  "pressureWeakness": "Specific topic or difficulty where they failed under time pressure",
  "recommendation": "Specific endurance training advice"
}
`;

export const LEARNER_PROFILE_ANALYSIS_PROMPT = `You are a Learner Profile Analyst.
Analyze the user's recent messages to detect their learning preferences.

Track and infer:
1. Learning Style:
- 'step-by-step': asks for steps, logic flows
- 'summaries': asks for tldr, quick answers
- 'examples': asks for real world analogies
- 'practice': asks for quizzes, problems
- 'visual': asks for diagrams, structured lists

2. Difficulty Tolerance:
- 'beginner': simple language, struggles with basics
- 'intermediate': standard competency
- 'advanced': technical terms, deep edge cases

3. Feedback Preference:
- 'direct': wants the answer immediately
- 'gentle': wants encouragement
- 'socratic': wants to be guided with questions

4. Focus:
- 'speed': quick resolution
- 'depth': underlying "why"

Return strictly a JSON object matching this schema:
{
  "style": "string",
  "tolerance": "string",
  "feedback": "string",
  "focus": "string",
  "observations": ["observation 1", "observation 2", "observation 3"]
}
`;
