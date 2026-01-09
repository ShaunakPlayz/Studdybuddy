
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Brain, Zap, Layers, AlertCircle, 
  TrendingUp, Users, Target, Lock, Globe, Sparkles, GraduationCap, 
  Activity, BarChart3, Clock, Rocket 
} from 'lucide-react';

export default function PitchDeck() {
  const [slide, setSlide] = useState(0);

  const nextSlide = () => setSlide(s => Math.min(s + 1, 11));
  const prevSlide = () => setSlide(s => Math.max(s - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slideClasses = "h-full w-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-right-8 duration-500";
  const bgClasses = "bg-slate-900 text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden";

  return (
    <div className={`h-full w-full ${bgClasses}`}>
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((slide + 1) / 12) * 100}%` }}></div>
      </div>

      {/* Slides */}
      <div className="h-full relative z-10">
        
        {/* Slide 1: Title */}
        {slide === 0 && (
          <div className={slideClasses}>
            <div className="mb-8 p-6 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                <GraduationCap size={64} className="text-indigo-400" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              StuddyBuddy
            </h1>
            <p className="text-2xl text-slate-400 font-light tracking-wide max-w-3xl">
              The First Adaptive Learning Operating System for Students
            </p>
          </div>
        )}

        {/* Slide 2: The Problem */}
        {slide === 1 && (
          <div className={slideClasses}>
            <div className="max-w-4xl text-left">
                <h2 className="text-6xl font-black text-white mb-12 flex items-center gap-4">
                   Learning Is <span className="text-rose-500">Broken.</span>
                </h2>
                <div className="space-y-8">
                    <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <AlertCircle className="text-rose-500 shrink-0" size={32} />
                        <div>
                            <h3 className="text-2xl font-bold mb-2">The Retention Gap</h3>
                            <p className="text-slate-400 text-lg">Students forget 70% of what they study within 24 hours because tools track time, not memory.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <Activity className="text-rose-500 shrink-0" size={32} />
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Static Education</h3>
                            <p className="text-slate-400 text-lg">Platforms don't adapt. A genius and a struggler get the same content, leading to boredom or burnout.</p>
                        </div>
                    </div>
                </div>
                <p className="text-3xl font-bold text-white mt-12 pl-6 border-l-4 border-rose-500">
                    "Education is one-size-fits-all. Learning is not."
                </p>
            </div>
          </div>
        )}

        {/* Slide 3: The Solution */}
        {slide === 2 && (
          <div className={slideClasses}>
             <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20"></div>
                <Brain size={120} className="text-white relative z-10 mb-8 mx-auto" />
             </div>
             <h2 className="text-5xl font-black mb-6">Meet StuddyBuddy</h2>
             <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
                StuddyBuddy is not just a study app. It is a <span className="text-indigo-400 font-bold">learning engine</span> that analyzes how each student thinks, where they struggle, what they forget, and how they improve.
             </p>
             <div className="mt-12 flex gap-4">
                 <span className="px-6 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold uppercase tracking-widest text-sm">Real-Time Adaptation</span>
                 <span className="px-6 py-3 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-bold uppercase tracking-widest text-sm">Cognitive Profiling</span>
             </div>
          </div>
        )}

        {/* Slide 4: Differentiation */}
        {slide === 3 && (
            <div className={`${slideClasses} !items-start`}>
                <div className="w-full max-w-5xl mx-auto">
                    <h2 className="text-5xl font-black mb-12 text-left">We Don't Just Teach.<br /><span className="text-indigo-400">We Understand.</span></h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { icon: AlertCircle, title: "Confusion Detection", desc: "Identifies WHY a student is wrong (Rushing vs. Concept Gap)" },
                            { icon: TrendingUp, title: "Forgetting Curve Modeling", desc: "Calculates personal memory decay to schedule reviews" },
                            { icon: Brain, title: "Failure Intelligence", desc: "Tracks specific failure patterns (e.g., 'Formula Misuse')" },
                            { icon: Zap, title: "Learning DNA Profile", desc: "Adapts tone, speed, and format to the user's style" },
                            { icon: Target, title: "AI Study Coach", desc: "Generates data-driven weekly strategy plans" },
                            { icon: Layers, title: "Adaptive Flashcards", desc: "Content difficulty scales with user mastery" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500 transition-colors">
                                <item.icon className="text-indigo-400 shrink-0" size={24} />
                                <div className="text-left">
                                    <h4 className="font-bold text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-right text-xl font-bold text-slate-300 mt-12 italic">"We engineer learning. Not just content."</p>
                </div>
            </div>
        )}

        {/* Slide 5: Product in Action */}
        {slide === 4 && (
            <div className={slideClasses}>
                <h2 className="text-5xl font-black mb-12">A Real Learning System</h2>
                <div className="grid grid-cols-12 gap-4 w-full max-w-6xl h-[500px]">
                    <div className="col-span-8 bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition"></div>
                        <Layers size={64} className="text-indigo-400 mb-4" />
                        <h3 className="text-2xl font-bold">Logic Verification Engine</h3>
                        <p className="text-slate-400">True/False Adaptive Cards</p>
                    </div>
                    <div className="col-span-4 grid grid-rows-2 gap-4">
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center">
                            <BarChart3 size={40} className="text-emerald-400 mb-2" />
                            <h3 className="text-lg font-bold">Mastery Matrix</h3>
                        </div>
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center">
                             <Globe size={40} className="text-amber-400 mb-2" />
                             <h3 className="text-lg font-bold">Study Circles</h3>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-xl font-medium text-indigo-300">"This is not a dashboard. This is a learning brain."</p>
            </div>
        )}

        {/* Slide 6: How It Works */}
        {slide === 5 && (
            <div className={slideClasses}>
                <h2 className="text-5xl font-black mb-16">How It Works</h2>
                <div className="flex items-center gap-4 w-full max-w-6xl">
                    <div className="flex-1 p-8 rounded-3xl bg-slate-800 border border-slate-700 relative">
                        <span className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">1</span>
                        <div className="text-4xl mb-4">🎓</div>
                        <h3 className="text-xl font-bold mb-2">Study</h3>
                        <p className="text-sm text-slate-400">Student engages with material via Chat or Cards</p>
                    </div>
                    <ChevronRight size={40} className="text-slate-600" />
                    <div className="flex-1 p-8 rounded-3xl bg-slate-800 border border-slate-700 relative">
                        <span className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">2</span>
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">Analyze</h3>
                        <p className="text-sm text-slate-400">System detects confusion, patterns, and timing</p>
                    </div>
                    <ChevronRight size={40} className="text-slate-600" />
                    <div className="flex-1 p-8 rounded-3xl bg-indigo-900 border border-indigo-500 relative shadow-2xl shadow-indigo-500/20">
                        <span className="absolute -top-4 -left-4 w-10 h-10 bg-white text-indigo-900 rounded-full flex items-center justify-center font-bold">3</span>
                        <div className="text-4xl mb-4">🧬</div>
                        <h3 className="text-xl font-bold mb-2">Adapt</h3>
                        <p className="text-sm text-indigo-200">AI modifies pacing, difficulty, and methods instantly</p>
                    </div>
                </div>
                <p className="mt-16 text-3xl font-black text-white">"StuddyBuddy learns how you learn."</p>
            </div>
        )}

        {/* Slide 7: The Technology */}
        {slide === 6 && (
            <div className={slideClasses}>
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.5em] mb-4">Architecture</h2>
                    <h1 className="text-6xl font-black text-white">Cognitive Intelligence Engine</h1>
                </div>
                
                <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center">
                    {/* Core */}
                    <div className="absolute w-48 h-48 bg-white text-slate-900 rounded-full flex items-center justify-center font-black text-xl z-20 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                        Core AI
                    </div>
                    
                    {/* Satellites */}
                    {[
                        "Confusion Detector", "Forgetting Visualizer", "Pattern Analysis", 
                        "Transfer Mode", "Exam Simulator", "Adaptive Teacher"
                    ].map((tech, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const radius = 220;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        return (
                            <div 
                                key={i}
                                className="absolute px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl font-bold text-sm text-indigo-300 z-10"
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                            >
                                {tech}
                            </div>
                        );
                    })}
                    
                    {/* Connecting Lines (Decorative) */}
                    <div className="absolute inset-0 rounded-full border border-slate-700/50 w-[440px] h-[440px] m-auto z-0 animate-spin-slow"></div>
                </div>
                <p className="mt-8 text-xl text-slate-400">"We don't optimize time. We optimize the brain."</p>
            </div>
        )}

        {/* Slide 8: Market */}
        {slide === 7 && (
            <div className={slideClasses}>
                <h2 className="text-5xl font-black mb-16">Who Is This For?</h2>
                <div className="grid grid-cols-3 gap-8 w-full max-w-6xl">
                    <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700 hover:bg-slate-700 transition">
                        <Users size={48} className="text-emerald-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Students</h3>
                        <p className="text-slate-400">Middle school to Higher Ed. Anyone needing personalized structure.</p>
                    </div>
                    <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700 hover:bg-slate-700 transition">
                        <GraduationCap size={48} className="text-amber-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Coaching Centers</h3>
                        <p className="text-slate-400">Institutions needing analytics on student performance retention.</p>
                    </div>
                    <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700 hover:bg-slate-700 transition">
                        <Globe size={48} className="text-indigo-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Ed Systems</h3>
                        <p className="text-slate-400">Schools deploying large-scale adaptive learning mandates.</p>
                    </div>
                </div>
                <p className="mt-12 text-2xl font-bold text-white">"Anyone who wants real learning, not just revision."</p>
            </div>
        )}

        {/* Slide 9: Business Model */}
        {slide === 8 && (
            <div className={slideClasses}>
                <h2 className="text-5xl font-black mb-4">Scalable by Design</h2>
                <p className="text-xl text-slate-400 mb-12">"Built for individuals. Scales to institutions."</p>

                <div className="flex gap-6 w-full max-w-5xl items-center">
                     <div className="flex-1 p-8 rounded-3xl border border-slate-700 bg-slate-800/50">
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">Free</h3>
                        <div className="text-4xl font-black mb-6">$0</div>
                        <ul className="text-left space-y-3 text-slate-400 text-sm">
                            <li className="flex gap-2"><Lock size={16}/> Basic Study</li>
                            <li className="flex gap-2"><Lock size={16}/> Limited AI</li>
                        </ul>
                     </div>

                     <div className="flex-1 p-10 rounded-3xl border-2 border-indigo-500 bg-slate-800 relative shadow-2xl shadow-indigo-500/20 transform scale-110">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Growth Engine</div>
                        <h3 className="text-3xl font-bold text-white mb-2">Pro</h3>
                        <div className="text-5xl font-black mb-6">$9.99<span className="text-lg text-slate-400">/mo</span></div>
                        <ul className="text-left space-y-4 text-white text-sm font-medium">
                            <li className="flex gap-2"><Sparkles size={16} className="text-indigo-400"/> Full Adaptive AI</li>
                            <li className="flex gap-2"><Sparkles size={16} className="text-indigo-400"/> AI Study Coach</li>
                            <li className="flex gap-2"><Sparkles size={16} className="text-indigo-400"/> Mastery Analytics</li>
                        </ul>
                     </div>

                     <div className="flex-1 p-8 rounded-3xl border border-slate-700 bg-slate-800/50">
                        <h3 className="text-2xl font-bold text-slate-300 mb-2">School</h3>
                        <div className="text-4xl font-black mb-6">B2B</div>
                        <ul className="text-left space-y-3 text-slate-400 text-sm">
                            <li className="flex gap-2"><Users size={16}/> Teacher Dashboards</li>
                            <li className="flex gap-2"><Users size={16}/> Class Analytics</li>
                        </ul>
                     </div>
                </div>
            </div>
        )}

        {/* Slide 10: Vision */}
        {slide === 9 && (
            <div className={slideClasses}>
                <div className="max-w-4xl">
                     <h2 className="text-2xl font-bold text-indigo-400 uppercase tracking-widest mb-6">The Vision</h2>
                     <h1 className="text-7xl font-black text-white mb-12 leading-tight">
                        The Student<br />Operating System.
                     </h1>
                     <div className="flex justify-center gap-8 mb-12">
                         {["Learn", "Revise", "Track", "Train", "Prepare"].map(word => (
                             <span key={word} className="text-2xl font-bold text-slate-500">{word}</span>
                         ))}
                     </div>
                     <p className="text-3xl font-medium text-white pl-6 border-l-4 border-indigo-500 text-left">
                        "We are not building a tool.<br />We are building the OS for the student mind."
                     </p>
                </div>
            </div>
        )}

        {/* Slide 11: Why Now */}
        {slide === 10 && (
            <div className={slideClasses}>
                <h2 className="text-5xl font-black mb-12">Why Now?</h2>
                <div className="space-y-6 max-w-3xl text-left">
                    <div className="p-6 bg-slate-800 rounded-2xl border-l-8 border-indigo-500">
                        <h3 className="text-2xl font-bold text-white mb-1">AI Is Mainstream</h3>
                        <p className="text-slate-400">Students are already using generic LLMs. They need structured, pedagogical AI.</p>
                    </div>
                    <div className="p-6 bg-slate-800 rounded-2xl border-l-8 border-rose-500">
                        <h3 className="text-2xl font-bold text-white mb-1">Education Is Digitizing</h3>
                        <p className="text-slate-400">Schools are moving away from textbooks to interactive platforms.</p>
                    </div>
                    <div className="p-6 bg-slate-800 rounded-2xl border-l-8 border-emerald-500">
                        <h3 className="text-2xl font-bold text-white mb-1">Demand for Personalization</h3>
                        <p className="text-slate-400">The "one-size-fits-all" classroom model is failing. Customization is the expectation.</p>
                    </div>
                </div>
                <p className="mt-12 text-2xl font-bold text-indigo-300">"The future of education is adaptive."</p>
            </div>
        )}

        {/* Slide 12: Closing */}
        {slide === 11 && (
            <div className={slideClasses}>
                 <div className="mb-12 p-8 bg-white rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.2)]">
                    <GraduationCap size={80} className="text-slate-900" />
                </div>
                <h1 className="text-8xl font-black text-white mb-6 tracking-tighter">StuddyBuddy</h1>
                <p className="text-3xl text-slate-300 mb-12">Learn how you learn.</p>
                
                <div className="flex gap-4">
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Contact</p>
                        <p className="text-lg font-bold text-white">founders@studdybuddy.edu</p>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex gap-4 z-50">
        <button 
            onClick={prevSlide}
            disabled={slide === 0}
            className="p-4 rounded-full bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition"
        >
            <ChevronLeft size={24} />
        </button>
        <button 
            onClick={nextSlide}
            disabled={slide === 11}
            className="p-4 rounded-full bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition shadow-lg shadow-indigo-900/50"
        >
            <ChevronRight size={24} />
        </button>
      </div>

      <div className="absolute bottom-8 left-8 text-slate-600 font-mono text-xs uppercase tracking-widest z-50">
         Slide {slide + 1} / 12
      </div>
    </div>
  );
}
