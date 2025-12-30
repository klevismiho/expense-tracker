"use client";

import { useEffect, useState } from "react";
import { Brain, AlertCircle, CheckCircle, Lightbulb, Target, Calendar } from "lucide-react";

type Expense = {
  id: string;
  comment: string;
  amount: number;
  category: {
    id: string;
    name: string;
  };
  date: string;
};

type AITip = {
  id: string;
  type: 'insight' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  category?: string;
  savings?: number;
};

interface ExpenseAITipsProps {
  expenses: Expense[];
}

const ExpenseAITips: React.FC<ExpenseAITipsProps> = ({ expenses }) => {
  const [tips, setTips] = useState<AITip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const generateTips = async () => {
    if (!expenses.length) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-expense-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI tips');
      }

      const data = await response.json();
      setTips(data.tips);
      setCached(data.cached || false);
      setLastGenerated(data.timestamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateTips();
  }, [expenses.length]); // Only regenerate when expense count changes significantly

  const getTipIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Brain className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'opportunity':
        return <Target className="w-5 h-5" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getTipColors = (type: string) => {
    switch (type) {
      case 'insight':
        return 'from-blue-500 to-cyan-400';
      case 'warning':
        return 'from-orange-500 to-red-400';
      case 'opportunity':
        return 'from-green-500 to-emerald-400';
      case 'achievement':
        return 'from-purple-500 to-pink-400';
      default:
        return 'from-gray-500 to-slate-400';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[impact as keyof typeof colors]}`}>
        {impact.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !tips.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200/50 shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
          </div>
          <div className="text-lg font-medium text-slate-700">
            Generating your daily insights...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/50">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Failed to generate daily tips</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!cached && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Daily AI Insights</h2>
            <p className="text-sm text-slate-600">
              3 personalized tips • Generated {lastGenerated ? formatDate(lastGenerated) : 'recently'}
              {cached && <span className="ml-2 text-xs text-blue-600">(cached)</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>Updates daily</span>
        </div>
      </div>

      {/* Tips Grid - Always 3 tips */}
      <div className="grid gap-4 md:grid-cols-3">
        {tips.map((tip, index) => (
          <div
            key={tip.id}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            style={{
              animationDelay: `${index * 150}ms`,
              animation: 'slideInUp 0.6s ease-out forwards'
            }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getTipColors(tip.type)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTipColors(tip.type)} flex items-center justify-center text-white shadow-lg`}>
                  {getTipIcon(tip.type)}
                </div>
                {getImpactBadge(tip.impact)}
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors leading-tight">
                {tip.title}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {tip.message}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {tip.category && (
                  <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                    {tip.category}
                  </span>
                )}
                
                {tip.savings && (
                  <div className="flex items-center space-x-1 text-green-600 font-medium text-sm">
                    <span>Save</span>
                    <span className="font-bold">${tip.savings}</span>
                  </div>
                )}
              </div>

              {tip.actionable && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Take action today</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cost-efficient notice */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          💡 Tips refresh automatically each day to keep API costs minimal
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ExpenseAITips;