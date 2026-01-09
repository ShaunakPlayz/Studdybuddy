
import React, { useState } from 'react';
import { StudyGroup, GroupMember, Flashcard, SharedDeck, UserStats } from '../types';
import { Users, Shield, Plus, Lock, Globe, Flame, Layers, Zap, Info, ArrowRight, UserPlus, Download, Check, Copy } from 'lucide-react';

interface SocialGroupsProps {
  groups: StudyGroup[];
  userCards: Flashcard[];
  currentUser: { id: string; name: string };
  onJoinSession: (groupId: string) => void;
  onImportDeck: (deck: SharedDeck) => void;
  onCreateGroup: (name: string, description: string, privacy: 'public' | 'private') => void;
  onJoinGroup: (inviteCode: string) => void;
  onShareDeck: (groupId: string, topic: string) => void;
}

const SocialGroups: React.FC<SocialGroupsProps> = ({ 
    groups, 
    userCards, 
    currentUser, 
    onJoinSession, 
    onImportDeck,
    onCreateGroup,
    onJoinGroup,
    onShareDeck
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [view, setView] = useState<'my' | 'discover'>('my');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Create Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrivacy, setNewPrivacy] = useState<'public' | 'private'>('public');

  // Join Form State
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // Share Modal State
  const [isSharing, setIsSharing] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const myGroups = groups.filter(g => g.members.some(m => m.id === currentUser.id));
  const otherGroups = groups.filter(g => !g.members.some(m => m.id === currentUser.id) && g.privacy === 'public');

  // Extract topics for sharing
  const availableTopics = Array.from(new Set(userCards.map(c => c.topic).filter(Boolean))) as string[];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onCreateGroup(newName, newDesc, newPrivacy);
    setIsCreating(false);
    setNewName('');
    setNewDesc('');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput) return;
    onJoinGroup(inviteCodeInput);
    setInviteCodeInput('');
    setIsJoining(false);
  };

  const StatusBadge = ({ status }: { status: GroupMember['status'] }) => {
    if (status === 'studying') return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest"><Zap size={10} fill="currentColor" /> Studying</span>;
    if (status === 'online') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online</span>;
    return <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offline</span>;
  };

  if (selectedGroup) {
    const isMember = selectedGroup.members.some(m => m.id === currentUser.id);
    const userRole = selectedGroup.members.find(m => m.id === currentUser.id)?.role;

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-10 duration-500 pb-24">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
             <button 
                onClick={() => setSelectedGroupId(null)}
                className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 mb-2 hover:translate-x-[-4px] transition"
             >
                <ArrowRight size={14} className="rotate-180" /> Back to Groups
             </button>
             <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-slate-900">{selectedGroup.name}</h1>
                 {selectedGroup.privacy === 'private' && <Lock size={20} className="text-slate-400" />}
             </div>
             <p className="text-slate-500 max-w-2xl">{selectedGroup.description}</p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm shadow-orange-100">
                <Flame size={20} fill="currentColor" /> {selectedGroup.groupStreak} Day Streak
             </div>
             {isMember ? (
                 <button 
                    onClick={() => onJoinSession(selectedGroup.id)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                 >
                    <Plus size={20} /> Join Session
                 </button>
             ) : (
                 <button 
                    onClick={() => onJoinGroup(selectedGroup.inviteCode)} 
                    className="bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-emerald-700 transition"
                 >
                    Join Circle
                 </button>
             )}
          </div>
        </header>

        {isMember && (userRole === 'owner' || userRole === 'admin') && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 rounded-lg"><Shield size={16} className="text-slate-600"/></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Admin Controls</p>
                        <p className="text-sm font-semibold text-slate-800">Invite Code: <span className="font-mono text-indigo-600 select-all">{selectedGroup.inviteCode}</span></p>
                    </div>
                </div>
                <button 
                    onClick={() => navigator.clipboard.writeText(selectedGroup.inviteCode)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                    <Copy size={14} /> Copy Code
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Members */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-indigo-500" /> Circle Members ({selectedGroup.members.length})
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedGroup.members.map(member => (
                            <div key={member.id} className="p-4 rounded-2xl border border-slate-50 hover:border-slate-100 flex items-center gap-4 transition group">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl relative">
                                    {member.avatar}
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                        member.status === 'studying' ? 'bg-amber-500' :
                                        member.status === 'online' ? 'bg-emerald-500' :
                                        'bg-slate-300'
                                    }`}></div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        {member.name}
                                        {member.role === 'owner' && <Shield size={12} className="text-amber-500" />}
                                        <span className="text-[10px] font-black text-indigo-400 uppercase">Lv {member.level}</span>
                                    </h4>
                                    <StatusBadge status={member.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Shared Decks */}
                <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Layers size={20} className="text-indigo-500" /> Group Library
                        </h2>
                        {isMember && (
                            <button 
                                onClick={() => setIsSharing(!isSharing)}
                                className="text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                            >
                                <Plus size={14} /> Share Flashcards
                            </button>
                        )}
                    </div>
                    
                    {isSharing && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Select a Topic to Share</h4>
                            {availableTopics.length === 0 ? (
                                <p className="text-xs text-slate-400">You don't have any flashcards to share yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableTopics.map(topic => (
                                        <button
                                            key={topic}
                                            onClick={() => { onShareDeck(selectedGroup.id, topic); setIsSharing(false); }}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:border-indigo-400 hover:text-indigo-600 transition"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {selectedGroup.sharedDecks.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No shared content yet. Be the first!</div>
                        ) : (
                            selectedGroup.sharedDecks.map(deck => (
                                <div key={deck.id} className="p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 flex items-center justify-between transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{deck.name}</h4>
                                            <p className="text-xs text-slate-500">
                                                Created by <span className="font-semibold text-slate-700">{deck.creatorName}</span> • {deck.cardCount} cards
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onImportDeck(deck)}
                                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Download size={18} /> Import
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Sidebar Insights */}
            <div className="space-y-6">
                <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl shadow-inner">
                            🤝
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Collective XP</h3>
                            <p className="text-indigo-200 text-sm">Study together to boost rank!</p>
                        </div>
                        <div className="text-3xl font-black text-white">{selectedGroup.totalXP.toLocaleString()}</div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Group Total</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="p-3 bg-white rounded-2xl text-slate-400 mb-4">
                        <Info size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Live Focus Sessions</h4>
                    <p className="text-sm text-slate-500 mb-4">Joining a group session enables a shared timer and synchronized break periods.</p>
                    <div className="flex -space-x-2">
                        {selectedGroup.members.slice(0, 3).map(m => (
                            <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs" title={m.name}>
                                {m.avatar}
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                            +{selectedGroup.activeNowCount}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
             <Globe className="text-indigo-600" /> Study Circles
          </h1>
          <p className="text-slate-500 mt-2">Collaborative learning ecosystem.</p>
        </div>
        
        <div className="flex gap-2">
             <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mr-2">
                <button 
                    onClick={() => setView('my')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition ${view === 'my' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    My Groups
                </button>
                <button 
                    onClick={() => setView('discover')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition ${view === 'discover' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Discover
                </button>
            </div>
            <button 
                onClick={() => setIsJoining(!isJoining)}
                className="bg-white border border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 transition"
                title="Join via Code"
            >
                <UserPlus size={20} />
            </button>
            <button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                title="Create Group"
            >
                <Plus size={20} />
            </button>
        </div>
      </header>

      {/* Forms */}
      {isCreating && (
          <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 mb-8">
              <h3 className="font-bold text-lg mb-4">Launch New Circle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text" 
                    placeholder="Circle Name" 
                    className="p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={newName} onChange={e => setNewName(e.target.value)}
                    required
                  />
                   <select 
                     className="p-3 bg-slate-50 rounded-xl border-none outline-none font-medium"
                     value={newPrivacy} onChange={(e) => setNewPrivacy(e.target.value as any)}
                   >
                       <option value="public">Public (Visible to All)</option>
                       <option value="private">Private (Invite Only)</option>
                   </select>
              </div>
              <textarea 
                 placeholder="Description..." 
                 className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 mb-4 h-24 font-medium"
                 value={newDesc} onChange={e => setNewDesc(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Launch</button>
              </div>
          </form>
      )}

      {isJoining && (
          <form onSubmit={handleJoinSubmit} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 mb-8 flex gap-4 items-center">
              <div className="flex-1">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Enter Invite Code</label>
                 <input 
                    type="text" 
                    placeholder="e.g. MED123" 
                    className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-lg uppercase"
                    value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value)}
                    required
                 />
              </div>
              <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 h-full mt-5">
                  Join
              </button>
          </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {view === 'my' ? (
             <>
                {myGroups.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>You haven't joined any circles yet.</p>
                        <button onClick={() => setView('discover')} className="text-indigo-600 font-bold mt-2">Discover Groups</button>
                    </div>
                )}
                {myGroups.map(group => (
                    <div 
                        key={group.id} 
                        onClick={() => setSelectedGroupId(group.id)}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition">
                                🏫
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                    <Flame size={12} fill="currentColor" /> {group.groupStreak}d Streak
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                                    <Zap size={12} fill="currentColor" /> {group.activeNowCount} active
                                </span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{group.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">{group.description}</p>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <div className="flex -space-x-2">
                                {group.members.slice(0, 3).map(m => (
                                    <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs">
                                        {m.avatar}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{group.members.length} Members</span>
                        </div>
                    </div>
                ))}
             </>
         ) : (
            <>
                {otherGroups.map(group => (
                    <div 
                        key={group.id} 
                        onClick={() => setSelectedGroupId(group.id)}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group opacity-80 hover:opacity-100"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                🌐
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{group.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6">{group.description}</p>
                        <div className="flex justify-end">
                            <span className="text-xs font-bold text-indigo-600 uppercase">View Circle</span>
                        </div>
                    </div>
                ))}
                {otherGroups.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <Globe size={48} className="text-slate-200 mx-auto" />
                        <h3 className="text-xl font-bold text-slate-800">No Public Circles Found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Be the first to create a public study circle!</p>
                    </div>
                )}
            </>
         )}
      </div>
    </div>
  );
};

export default SocialGroups;
