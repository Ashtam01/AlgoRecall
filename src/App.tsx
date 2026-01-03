import { useState, useEffect } from 'react';
import { Play, CheckCircle2, Flame, BarChart2, Settings, Trash2, Clock, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- TYPE DEFINITIONS ---
interface Problem {
  id: string;
  title: string;
  url: string;
  platform: string;
  nextReviewDate: number;
  stage: number;
  tags: string[];
  lastReviewed: number;
}

interface HomeViewProps {
  problems: Problem[];
  handleReview: (id: string, action: 'pass' | 'clear') => void;
  handleDelete: (id: string) => void;
  openProblem: (url: string) => void;
}

interface StatsViewProps {
  problems: Problem[];
}

interface SettingsViewProps {
  loadData: () => void;
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

// --- 1. DEFINE CHILD COMPONENTS OUTSIDE THE MAIN APP ---

const HomeView = ({ problems, handleReview, handleDelete, openProblem }: HomeViewProps) => {
  const [subTab, setSubTab] = useState<'due' | 'upcoming'>('due');
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  let filtered = problems.filter((p) => {
      if (subTab === 'due') return p.nextReviewDate <= Date.now();
      if (subTab === 'upcoming') return p.nextReviewDate > Date.now();
      return true;
  });

  if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
          p.title.toLowerCase().includes(lowerQ) || 
          p.platform.toLowerCase().includes(lowerQ) ||
          p.tags?.some((t) => t.toLowerCase().includes(lowerQ))
      );
  }

  const dueCount = problems.filter((p) => p.nextReviewDate <= Date.now()).length;
  const upcomingCount = problems.filter((p) => p.nextReviewDate > Date.now()).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* SUB-TABS */}
      <div className="flex px-5 pt-3 gap-4 border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-20">
        <button onClick={() => setSubTab('due')} className={cn("pb-3 text-sm font-medium transition-colors relative", subTab === 'due' ? "text-white" : "text-slate-500 hover:text-slate-300")}>
          Due Today
          <span className="ml-2 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded-full text-white">{dueCount}</span>
          {subTab === 'due' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-t-full" />}
        </button>
        <button onClick={() => setSubTab('upcoming')} className={cn("pb-3 text-sm font-medium transition-colors relative", subTab === 'upcoming' ? "text-white" : "text-slate-500 hover:text-slate-300")}>
          Upcoming
          <span className="ml-2 bg-surfaceHighlight text-[10px] px-1.5 py-0.5 rounded-full text-slate-300 border border-slate-700">{upcomingCount}</span>
          {subTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-500 rounded-t-full" />}
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 py-3">
          <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                  type="text" 
                  placeholder="Search problems, tags..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  autoFocus
              />
          </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center">
              {searchQuery ? <span>No matches found.</span> : <span>{subTab === 'due' ? "🎉 All caught up!" : "No upcoming reviews."}</span>}
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="group relative bg-surface border border-border/50 rounded-xl p-3 hover:border-primary/50 hover:bg-surfaceHighlight transition-all">
              <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full", 
                  item.platform === 'codeforces' ? 'bg-codeforces' : 
                  item.platform === 'leetcode' ? 'bg-leetcode' : 
                  item.platform === 'atcoder' ? 'bg-atcoder' : 'bg-codechef'
              )} />
              
              <div className="pl-3 flex justify-between items-center">
                <div className="max-w-[170px]">
                  <h3 className="text-sm font-medium text-slate-100 truncate">{item.title}</h3>
                  <div className="flex gap-2 mt-0.5 items-center">
                     {subTab === 'upcoming' ? (
                         <span className="text-[10px] text-slate-500 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {new Date(item.nextReviewDate).toLocaleDateString()}
                         </span>
                     ) : (
                         item.tags?.slice(0,2).map((tag) => (
                           <span key={tag} className="text-[8px] px-1 bg-slate-800 rounded text-slate-400">{tag}</span>
                         ))
                     )}
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-slate-600 hover:text-red-500 p-1 transition-colors" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <button onClick={() => openProblem(item.url)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-surfaceHighlight hover:bg-primary text-slate-400 hover:text-white transition-all">
                      <Play className="w-4 h-4 fill-current" />
                  </button>
                  
                  {subTab === 'due' && (
                      <button onClick={() => handleReview(item.id, 'pass')} className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-900/20 text-green-500 hover:bg-green-600 hover:text-white border border-green-500/20 transition-all">
                          <CheckCircle2 className="w-4 h-4" />
                      </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatsView = ({ problems }: StatsViewProps) => {
  const tagCounts: Record<string, number> = {};
  let untaggedCount = 0;

  problems.forEach((p) => {
    if (p.tags && p.tags.length > 0) {
      p.tags.forEach((t) => {
        const tag = t.toLowerCase();
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    } else {
      untaggedCount++;
    }
  });

  const sortedTags = Object.entries(tagCounts).sort(([, countA], [, countB]) => countB - countA);
  const maxCount = sortedTags[0]?.[1] || 1;

  return (
    <div className="p-6 space-y-6 animate-fade-in overflow-y-auto h-full">
      <div className="space-y-1 text-center mb-6">
         <h2 className="text-xl font-bold text-white">Backlog by Topic</h2>
         <p className="text-xs text-slate-500">Topics with the most pending reviews</p>
      </div>
      <div className="space-y-3">
        {sortedTags.length === 0 && untaggedCount === 0 ? (
           <div className="text-center text-slate-500 text-sm py-10">No data yet. Solve problems to see stats!</div>
        ) : (
           sortedTags.map(([tag, count]) => (
             <div key={tag} className="space-y-1">
                <div className="flex justify-between text-xs">
                   <span className="text-slate-300 capitalize font-medium">{tag}</span>
                   <span className="text-slate-400">{count} problems</span>
                </div>
                <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                   <div style={{ width: `${(count / maxCount) * 100}%` }} className="h-full bg-blue-500 rounded-full opacity-80" />
                </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

const SettingsView = ({ loadData }: SettingsViewProps) => (
  <div className="p-6 space-y-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-slate-300">Data Management</h3>
      <button onClick={() => { if(confirm("Clear all data?")) { chrome.storage.local.clear(); loadData(); }}} className="w-full py-2 text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20">
          Reset Everything
      </button>
  </div>
);

function NavButton({ icon, label, active = false, onClick }: NavButtonProps) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 w-full h-full justify-center transition-colors", active ? "text-primary" : "text-slate-500 hover:text-slate-300")}>
      <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// --- 2. MAIN APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(["problems", "streak"], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Storage error:", chrome.runtime.lastError);
          return;
        }
        const data = result.problems || {};
        const list = Object.values(data) as Problem[];
        list.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
        setProblems(list);
        setStreak((result.streak as number) || 0);
      });
    }
  };

  const openProblem = (url: string) => {
    chrome.tabs.create({ url }).catch(err => console.error("Failed to open tab:", err));
  };
  
  const handleReview = (id: string, action: 'pass' | 'clear') => {
    setProblems(prev => prev.filter(p => p.id !== id));
    chrome.runtime.sendMessage({ type: "UPDATE_SCHEDULE", payload: { id, action } }, () => {
      if (chrome.runtime.lastError) {
        console.error("Message error:", chrome.runtime.lastError);
        return;
      }
      loadData();
    });
  };
  
  const handleDelete = (id: string) => handleReview(id, 'clear');

  return (
    <div className="w-[380px] h-[550px] bg-background text-slate-200 flex flex-col font-sans overflow-hidden">
      <header className="p-5 pb-3 bg-gradient-to-b from-surface to-background border-b border-border/40 z-10">
        <div className="flex justify-between items-start">
          <div><h1 className="text-lg font-bold text-white tracking-tight">AlgoRecall</h1><p className="text-xs text-slate-400">Learn, Code, Repeat</p></div>
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full"><Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /><span className="text-xs font-semibold text-orange-500">{streak} Day Streak</span></div>
        </div>
      </header>

      {activeTab === 'home' && (
        <HomeView 
           problems={problems} 
           handleReview={handleReview} 
           handleDelete={handleDelete} 
           openProblem={openProblem} 
        />
      )}
      
      {activeTab === 'stats' && <StatsView problems={problems} />}
      
      {activeTab === 'settings' && <SettingsView loadData={loadData} />}

      <nav className="h-14 bg-surface border-t border-border flex justify-around items-center px-2 mt-auto shrink-0">
        <NavButton icon={<CheckCircle2 />} label="Dashboard" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<BarChart2 />} label="Insights" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <NavButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
}