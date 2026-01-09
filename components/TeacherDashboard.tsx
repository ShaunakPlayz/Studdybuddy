
import React, { useState } from 'react';
import { UserStats, Subject } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, GraduationCap, ClipboardList, TrendingUp, Search, Filter, Mail, Award, Clock, X, Plus } from 'lucide-react';

interface TeacherDashboardProps {
  subjects: Subject[];
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completedCount: number;
  totalCount: number;
  subjectId: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ subjects }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', title: 'Algebra Quiz', dueDate: 'Due in 2 days', completedCount: 24, totalCount: 28, subjectId: 'math' },
    { id: '2', title: 'Physics Lab Summary', dueDate: 'Due in 5 days', completedCount: 0, totalCount: 28, subjectId: 'phys' }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.id || 'math');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDue) return;

    const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: newTitle,
        dueDate: `Due in ${newDue} days`,
        completedCount: 0,
        totalCount: 28,
        subjectId: newSubject
    };

    setAssignments(prev => [newAssignment, ...prev]);
    setIsCreating(false);
    setNewTitle('');
    setNewDue('');
  };

  const students = [
    { id: 's1', name: 'Marcus Aurelius', avgMastery: 84, focusTime: 1240, status: 'On Track', lastActive: '2m ago' },
    { id: 's2', name: 'Hypatia Alex', avgMastery: 92, focusTime: 2100, status: 'Excelling', lastActive: '1h ago' },
    { id: 's3', name: 'Ada Lovelace', avgMastery: 78, focusTime: 950, status: 'On Track', lastActive: '12m ago' },
    { id: 's4', name: 'Isaac Newton', avgMastery: 42, focusTime: 340, status: 'At Risk', lastActive: '2d ago' },
    { id: 's5', name: 'Marie Curie', avgMastery: 89, focusTime: 1800, status: 'Excelling', lastActive: 'Now' },
  ];

  const classProgressData = [
    { name: 'Week 1', mastery: 30 },
    { name: 'Week 2', mastery: 45 },
    { name: 'Week 3', mastery: 40 },
    { name: 'Week 4', mastery: 65 },
    { name: 'Week 5', mastery: 72 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Assignment Creation Modal */}
      {isCreating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl animate-in fade-in duration-200">
            <form onSubmit={handleCreateAssignment} className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600" /> New Assignment
                    </h2>
                    <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Title</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            placeholder="e.g. Chapter 4 Quiz"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Due In (Days)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                placeholder="3"
                                min="1"
                                value={newDue}
                                onChange={e => setNewDue(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Subject</label>
                            <select 
                                className="w-full p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                            >
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    >
                        Create Assignment
                    </button>
                </div>
            </form>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <GraduationCap className="text-amber-500" size={32} /> Teacher Control Center
          </h1>
          <p className="text-slate-500 mt-1">Manage your class, monitor progress, and identify students at risk.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={() => setIsCreating(true)}
                className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-sm"
            >
                <ClipboardList size={18} /> New Assignment
            </button>
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                <Mail size={18} /> Broadcast Message
            </button>
        </div>
      </header>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24} /></div>
                  <span className="text-emerald-500 font-bold text-sm">+2 this week</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Students</p>
              <h2 className="text-3xl font-black text-slate-800">28</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Award size={24} /></div>
                  <span className="text-purple-500 font-bold text-sm">Top 5% school</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Class Mastery Avg</p>
              <h2 className="text-3xl font-black text-slate-800">74%</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={24} /></div>
                  <span className="text-emerald-500 font-bold text-sm">Up 12%</span>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Avg Focus Time</p>
              <h2 className="text-3xl font-black text-slate-800">42m</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Search size={24} /></div>
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">At-Risk Students</p>
              <h2 className="text-3xl font-black text-slate-800">3</h2>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Performance List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-800">Student Roster</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all"
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg transition">
                        <Filter size={18} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Time</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                                            {student.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                                            <p className="text-[10px] text-slate-400">{student.lastActive}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.avgMastery}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{student.avgMastery}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-500">{(student.focusTime / 60).toFixed(1)}h</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                        student.status === 'Excelling' ? 'bg-emerald-50 text-emerald-600' :
                                        student.status === 'At Risk' ? 'bg-rose-50 text-rose-600' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-black text-indigo-600 hover:underline">View File</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Analytics Card */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight text-sm">
                    <TrendingUp size={18} className="text-indigo-500" /> Class Progress Trend
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={classProgressData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="mastery" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden relative group h-[300px] flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 blur-[60px] opacity-20 group-hover:opacity-40 transition"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="font-bold text-lg">Upcoming Deadlines</h3>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                
                <div className="space-y-4 relative z-10 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    {assignments.map(assignment => {
                        const subject = subjects.find(s => s.id === assignment.subjectId);
                        const progress = Math.round((assignment.completedCount / assignment.totalCount) * 100);
                        
                        return (
                            <div key={assignment.id} className="p-3 bg-white/5 rounded-2xl flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                                    subject?.color ? subject.color.replace('bg-', 'bg-').replace('500', '500/20 text-white') : 'bg-slate-700 text-slate-300'
                                }`}>
                                    <ClipboardList size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{assignment.title}</p>
                                    <p className="text-[10px] text-slate-400">{assignment.dueDate} • {assignment.completedCount}/{assignment.totalCount}</p>
                                    <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{width: `${progress}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <button className="w-full mt-4 py-2 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition shrink-0">
                    Manage Assignments
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
