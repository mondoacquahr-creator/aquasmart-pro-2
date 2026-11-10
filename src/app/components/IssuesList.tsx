import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Clock, Wrench, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { WaterAnalysis, Pool } from '../types';

interface Issue {
  id: string;
  poolId: string;
  poolName: string;
  analysisId: string;
  analysisDate: string;
  issueText: string;
  timestamp: string;
}

export function IssuesList() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadIssues();
    
    // Check for dismissed issues in localStorage
    const dismissed = localStorage.getItem('dismissedIssues');
    if (dismissed) {
      setDismissedIssues(new Set(JSON.parse(dismissed)));
    }
  }, []);

  const loadIssues = () => {
    const allPools = storage.getPools();
    const allIssues: Issue[] = [];

    allPools.forEach(pool => {
      const analyses = storage.getAnalyses(pool.id);
      
      analyses.forEach(analysis => {
        // Check for equipment issues
        if (analysis.notes?.equipmentIssues) {
          allIssues.push({
            id: `${analysis.id}-equipment`,
            poolId: pool.id,
            poolName: pool.name,
            analysisId: analysis.id,
            analysisDate: analysis.date,
            issueText: analysis.notes.equipmentIssues,
            timestamp: analysis.date,
          });
        }
      });
    });

    // Sort by date, newest first
    allIssues.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setIssues(allIssues);
  };

  const handleDismissIssue = (issueId: string) => {
    const newDismissed = new Set(dismissedIssues);
    newDismissed.add(issueId);
    setDismissedIssues(newDismissed);
    localStorage.setItem('dismissedIssues', JSON.stringify(Array.from(newDismissed)));
  };

  const visibleIssues = issues.filter(issue => !dismissedIssues.has(issue.id));
  const hasNewIssues = visibleIssues.length > 0;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-2 border-amber-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          hasNewIssues 
            ? 'bg-red-500/20 animate-pulse border-2 border-red-500' 
            : 'bg-slate-700/50 border-2 border-slate-600'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            hasNewIssues ? 'text-red-400' : 'text-slate-400'
          }`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">
            {hasNewIssues ? '⚠️ Kvarovi i problemi' : 'Nema novih kvarova'}
          </h2>
          <p className="text-sm text-slate-300">
            {hasNewIssues 
              ? `${visibleIssues.length} ${visibleIssues.length === 1 ? 'uočen kvar' : 'uočenih kvarova'} na terenu`
              : 'Sve oprema funkcionira ispravno'
            }
          </p>
        </div>
      </div>

      {hasNewIssues ? (
        <div className="space-y-3">
          {visibleIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-gradient-to-br from-red-900/30 via-orange-900/20 to-red-900/30 border-2 border-red-500/30 rounded-xl p-4 hover:shadow-xl hover:border-red-500/50 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white">{issue.poolName}</h3>
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg">
                      NOVO
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-200 mb-2 whitespace-pre-wrap">{issue.issueText}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(issue.analysisDate).toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/app/pools/${issue.poolId}/analysis/${issue.analysisId}`)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
                    >
                      Pogledaj radni nalog
                    </button>
                    <button
                      onClick={() => handleDismissIssue(issue.id)}
                      className="bg-slate-700 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600 transition-all flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Označi kao viđeno
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-slate-200 font-medium">Trenutno nema prijavljenih kvarova</p>
          <p className="text-sm text-slate-400 mt-1">Svi uređaji rade ispravno</p>
        </div>
      )}
    </div>
  );
}