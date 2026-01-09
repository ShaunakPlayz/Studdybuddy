
import React, { useState } from 'react';
import { UserTier } from '../types';
import { Check, Sparkles, Zap, Shield, GraduationCap, ArrowRight, Star, CheckCircle } from 'lucide-react';

interface PricingProps {
  currentTier: UserTier;
  onUpgrade: (tier: UserTier) => void;
}

const Pricing: React.FC<PricingProps> = ({ currentTier, onUpgrade }) => {
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleInstitutionalContact = () => {
    setContactStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setContactStatus('success');
      // Reset after 3 seconds
      setTimeout(() => setContactStatus('idle'), 3000);
    }, 1500);
  };

  const tiers = [
    {
      id: UserTier.FREE,
      name: 'Free',
      price: '₹0',
      description: 'The core study kit for every student.',
      features: [
        'Limited AI Assistant (5 calls/day)',
        'Basic Flashcard Review',
        'Focus Timer & Music',
        'Daily Streak Tracking'
      ],
      notIncluded: [
        'Unlimited AI Tutor',
        'Spaced Repetition (SRS)',
        'Smart Study Planner',
        'Mistake Tracker',
        'Mastery Analytics'
      ],
      buttonText: 'Current Plan',
      accentColor: 'slate'
    },
    {
      id: UserTier.PRO,
      name: 'Pro',
      price: '₹599',
      period: '/mo',
      description: 'Unleash the full power of AI learning.',
      features: [
        'Unlimited AI Assistant',
        'Spaced Repetition System',
        'Smart Adaptive Study Planner',
        'AI Mistake Tracker',
        'Advanced Topic Mastery Analytics',
        'Priority AI Models'
      ],
      buttonText: 'Upgrade to Pro',
      accentColor: 'indigo',
      popular: true
    },
    {
      id: UserTier.SCHOOL,
      name: 'School',
      price: 'Custom',
      description: 'Collaborative tools for classes & teams.',
      features: [
        'Everything in Pro',
        'Teacher Analytics Dashboard',
        'Student Assignment Tracking',
        'Detailed Progress Reports',
        'Team Study Circles',
        'Dedicated Support'
      ],
      buttonText: 'Contact for School',
      accentColor: 'amber'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Simple Pricing, Smarter Studying</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Choose the plan that fits your academic goals. Upgrade anytime to unlock advanced AI capabilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all relative flex flex-col ${
              tier.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100 scale-105 z-10' : 'border-slate-100 shadow-sm'
            } ${currentTier === tier.id ? 'ring-4 ring-offset-4 ring-indigo-500/20' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Star size={12} fill="currentColor" /> Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className={`text-2xl font-black mb-2 text-${tier.accentColor}-600`}>{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                {tier.period && <span className="text-slate-400 font-bold">{tier.period}</span>}
              </div>
              <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">{tier.description}</p>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-${tier.accentColor}-100 text-${tier.accentColor}-600`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{feature}</span>
                </div>
              ))}
              {tier.notIncluded?.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 opacity-40 grayscale">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 ml-1.5"></div>
                  <span className="text-sm font-medium text-slate-500">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onUpgrade(tier.id)}
              disabled={currentTier === tier.id}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                currentTier === tier.id 
                  ? 'bg-slate-100 text-slate-400 cursor-default' 
                  : tier.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    : `bg-${tier.accentColor}-50 text-${tier.accentColor}-600 hover:bg-${tier.accentColor}-100`
              }`}
            >
              {currentTier === tier.id ? 'Current Plan' : tier.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
              <h2 className="text-3xl font-black">StuddyBuddy for Teams</h2>
              <p className="text-slate-400 font-medium">Equip your entire class or study group with the ultimate learning toolkit. Bulk discounts and advanced management tools included.</p>
          </div>
          <button 
            onClick={handleInstitutionalContact}
            disabled={contactStatus !== 'idle'}
            className={`px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition whitespace-nowrap ${
              contactStatus === 'success' 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-white text-slate-900 hover:bg-indigo-50'
            }`}
          >
              {contactStatus === 'idle' && (
                <>
                  Learn More about Institutional Access <ArrowRight size={20} />
                </>
              )}
              {contactStatus === 'sending' && (
                <>
                  Sending Request...
                </>
              )}
              {contactStatus === 'success' && (
                <>
                  Request Sent! We'll contact you. <CheckCircle size={20} />
                </>
              )}
          </button>
      </div>
    </div>
  );
};

export default Pricing;
