
import { GoogleGenAI, Type } from "@google/genai";
import { AIMode, Flashcard, UserStats, StudySession, WeeklyInsight, UserTier, LearnerProfile, FailureType, ExamQuestion, ExamLog, ExamReport, Subject, StudyDay } from '../types';
import { AI_MODE_PROMPTS, SYSTEM_INSTRUCTION_BASE, PROHIBITED_PATTERNS, ACADEMIC_OVERRIDE_KEYWORDS, CONFUSION_DETECTOR_PROMPT, EXAM_ANALYSIS_PROMPT, LEARNER_PROFILE_ANALYSIS_PROMPT } from '../constants';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const notifySchoolAdmin = async (userId: string, strikeCount: number) => {
  const adminEmail = "admin-safety@school-district.edu";
  const timestamp = new Date().toLocaleString();
  
  console.group("🏫 SCHOOL SAFETY ESCALATION");
  console.warn(`ALERT: Safety Policy Violation for User ID: ${userId}`);
  console.log(`Action: Notifying ${adminEmail}...`);
  console.log(`Details: Strike ${strikeCount} reached.`);
  console.log(`Timestamp: ${timestamp}`);
  console.groupEnd();

  return true;
};

export const validateInput = (text: string): { isValid: boolean; flaggedTerms: string[] } => {
  const lowerText = text.toLowerCase();
  let foundViolations = false;
  const flaggedTerms: string[] = [];

  for (const pattern of PROHIBITED_PATTERNS) {
    const matches = lowerText.match(pattern);
    if (matches) {
      foundViolations = true;
      flaggedTerms.push(...matches);
    }
  }

  if (foundViolations && lowerText.length < 15) {
     return { isValid: false, flaggedTerms };
  }

  if (foundViolations) {
    const hasAcademicContext = ACADEMIC_OVERRIDE_KEYWORDS.some(word => lowerText.includes(word));
    if (hasAcademicContext && lowerText.length > 30) {
      return { isValid: true, flaggedTerms: [] };
    }
  }

  return { 
    isValid: !foundViolations, 
    flaggedTerms 
  };
};

export const chatWithStuddyBuddy = async (
  message: string,
  mode: AIMode,
  subjectName: string,
  history: { role: string; parts: { text: string }[] }[],
  profile?: LearnerProfile
) => {
  const ai = getAIClient();
  const profileContext = profile 
    ? `\nLEARNER PROFILE: Style: ${profile.style}, Tolerance: ${profile.tolerance}, Feedback: ${profile.feedback}, Priority: ${profile.focus}. Adjust your teaching to match.`
    : "";

  const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\nCurrent Mode: ${mode}.\nSpecific Instructions: ${AI_MODE_PROMPTS[mode]}.\nCurrent Subject Context: ${subjectName}.${profileContext}`;

  const modelId = mode === AIMode.STEP_BY_STEP || mode === AIMode.PRACTICE || mode === AIMode.FLASHCARD_GENERATOR
    ? "gemini-3-pro-preview" 
    : "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: { systemInstruction }
  });

  return response.text || "I couldn't generate a response. Please try again.";
};

export const updateLearnerProfile = async (
  currentProfile: LearnerProfile,
  recentHistory: { role: string; content: string }[]
): Promise<LearnerProfile> => {
  const ai = getAIClient();
  
  // Only analyze the last few interactions to save context and focus on immediate behavior changes
  const recentExchanges = recentHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');

  const prompt = `${LEARNER_PROFILE_ANALYSIS_PROMPT}\n\nCurrent Profile: ${JSON.stringify(currentProfile)}\n\nRecent Interactions:\n${recentExchanges}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      return JSON.parse(response.text) as LearnerProfile;
    }
  } catch (e) {
    console.error("Profile analysis failed", e);
  }
  
  return currentProfile;
};

export const getWeeklyCoachFeedback = async (
  stats: UserStats,
  sessions: StudySession[]
): Promise<WeeklyInsight> => {
  const ai = getAIClient();
  
  const statsSummary = {
    totalMinutes: stats.totalFocusMinutes,
    cardsReviewed: stats.cardsReviewed,
    mastery: stats.topicMastery.map(t => `${t.topic}: ${t.masteryScore}%`),
    recentSessions: sessions.slice(-5).map(s => `${s.date}: ${s.minutes}min on ${s.subject}`),
    challenges: stats.activeChallenges.map(c => `${c.title}: ${c.progress}/${c.goal}`)
  };

  const prompt = `Act as an elite AI Study Coach. Analyze this student's data from the last week and provide a coaching report.
  Data: ${JSON.stringify(statsSummary)}
  
  Focus on:
  1. Consistency vs Declines.
  2. Subject prioritization (if mastery is low in one area, suggest more time).
  3. Actionable study steps.
  
  Return the response in strictly JSON format matching this schema:
  {
    "summary": "Short 1-2 sentence overview of the week",
    "strength": "Identify one major positive behavior",
    "weakness": "Identify one critical area for improvement",
    "actionablePlan": ["Step 1...", "Step 2...", "Step 3..."],
    "encouragement": "A motivating closing statement"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  if (!response.text) throw new Error("No response from AI Coach");
  return JSON.parse(response.text) as WeeklyInsight;
};

export const analyzeMistake = async (
  question: string,
  userWasRight: boolean, // If false, they were wrong.
  topic: string
): Promise<{ failureType: FailureType; explanation: string } | null> => {
  const ai = getAIClient();
  
  const prompt = `The student answered incorrectly on a True/False question.
  Topic: ${topic}
  Question: "${question}"
  
  Analyze the likely confusion. Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
        systemInstruction: CONFUSION_DETECTOR_PROMPT,
        responseMimeType: "application/json" 
    }
  });

  if (!response.text) return null;

  try {
      return JSON.parse(response.text);
  } catch (e) {
      return { failureType: 'concept_confusion', explanation: 'Concepts were mixed up.' };
  }
};

export const generateFlashcardsFromText = async (
  topic: string,
  subjectId: string,
  contextText: string = ""
): Promise<Omit<Flashcard, 'id' | 'lastReviewed'>[]> => {
  const ai = getAIClient();
  
  const prompt = `Generate 5 high-quality True/False study statements about "${topic}". 
  ${contextText ? `Use the following text as reference: ${contextText.substring(0, 1000)}...` : ""} 
  The statements should test deep conceptual understanding. 
  Each must have a 'statement' (string) and an 'isTrue' (boolean).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING, description: "A True/False statement" },
            isTrue: { type: Type.BOOLEAN, description: "Whether the statement is true" }
          },
          required: ["statement", "isTrue"],
        },
      },
    },
  });

  if (!response.text) return [];

  try {
    const rawCards = JSON.parse(response.text);
    return rawCards.map((c: any) => ({
      statement: c.statement,
      isTrue: c.isTrue,
      subjectId: subjectId,
      streak: 0,
      correctCount: 0,
      wrongCount: 0,
      mastery: 0,
    }));
  } catch (e) {
    console.error("Failed to parse flashcards", e);
    return [];
  }
};

export const generateExamQuestions = async (
    subjects: string[],
    count: number
  ): Promise<ExamQuestion[]> => {
    const ai = getAIClient();
    const prompt = `Generate ${count} multiple choice questions suitable for a timed exam.
    Subjects: ${subjects.join(', ')}.
    Difficulty should vary (Easy, Medium, Hard).
    Return strictly in JSON.`;
  
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              topic: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "difficulty", "topic"]
          }
        }
      }
    });
  
    if (!response.text) throw new Error("Failed to generate exam");
    
    try {
        const raw = JSON.parse(response.text);
        return raw.map((q: any) => ({
            ...q,
            id: Date.now().toString() + Math.random().toString()
        }));
    } catch (e) {
        throw new Error("Invalid format");
    }
  };
  
  export const analyzeExamSession = async (
    logs: ExamLog[],
    totalDuration: number
  ): Promise<ExamReport> => {
    const ai = getAIClient();
    
    // Pre-calculate score for context
    const score = Math.round((logs.filter(l => l.isCorrect).length / logs.length) * 100);
  
    const prompt = `Analyze this exam session log. 
    Total Duration: ${Math.floor(totalDuration/60)} minutes.
    Score: ${score}%.
    Logs: ${JSON.stringify(logs)}
    
    Detect fatigue (accuracy drop over time) and pressure errors.`;
  
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: EXAM_ANALYSIS_PROMPT,
        responseMimeType: "application/json"
      }
    });
  
    if (!response.text) return {
        score,
        totalQuestions: logs.length,
        accuracyTrend: "Stable",
        fatigueDetected: false,
        pressureWeakness: "None",
        recommendation: "Keep practicing."
    };
  
    const analysis = JSON.parse(response.text);
    return {
        score,
        totalQuestions: logs.length,
        ...analysis
    };
  };

  export const createStudySchedule = async (
    examDate: string,
    dailyMinutes: number,
    selectedSubjects: Subject[]
  ): Promise<StudyDay[]> => {
    const ai = getAIClient();
    const today = new Date();
    const targetDate = new Date(examDate);
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Cap at 7 days for the AI generation to ensure speed and quality
    const daysToGenerate = Math.min(diffDays, 7); 
    
    const subjectNames = selectedSubjects.map(s => s.name).join(', ');
    
    const prompt = `Act as an expert study planner. Create a ${daysToGenerate}-day study schedule.
    - Subjects: ${subjectNames}
    - Exam Date: ${examDate}
    - Daily Budget: ${dailyMinutes} minutes
    - Start Date: ${today.toISOString().split('T')[0]} (Today)
  
    Output strictly a JSON array of "StudyDay" objects.
    Schema:
    [
      {
        "date": "YYYY-MM-DD",
        "totalMinutes": number,
        "blocks": [
          {
            "subjectName": "string (must match one of the provided subjects exactly)",
            "topic": "string (specific concept)",
            "duration": number (minutes),
            "type": "learning" | "revision" | "practice"
          }
        ]
      }
    ]
    `;
  
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
  
    if (!response.text) return [];
  
    try {
      const rawDays = JSON.parse(response.text);
      
      // Transform to internal types
      return rawDays.map((day: any) => ({
        date: day.date,
        totalMinutes: day.totalMinutes,
        blocks: day.blocks.map((b: any) => {
          const subject = selectedSubjects.find(s => s.name.toLowerCase() === b.subjectName.toLowerCase()) || selectedSubjects[0];
          return {
            id: Math.random().toString(36).substr(2, 9),
            subjectId: subject.id,
            topic: b.topic,
            duration: b.duration,
            type: b.type,
            status: 'pending'
          };
        })
      }));
    } catch (e) {
      console.error("Plan generation failed", e);
      return [];
    }
  };
