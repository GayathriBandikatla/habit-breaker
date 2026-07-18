import React from 'react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Sparkles, RefreshCw, Loader2, Compass } from 'lucide-react';

export default function InsightsPanel() {
  const { insights, refreshInsights, loading } = useHabits();

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-xl font-bold font-display text-teal-300">Personal Insights</h3>
          <p className="text-xs text-slate-400 mt-1">Weekly summary and relapse risk forecast based on your logs.</p>
        </div>
        <button
          onClick={refreshInsights}
          disabled={loading}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-teal-400 text-xs font-bold rounded-xl flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh Analysis
        </button>
      </div>

      {!insights ? (
        <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-3xl text-center shadow-xl">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No insights ready yet. Run your first assessment or check-in to get started!</p>
          <button
            onClick={refreshInsights}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-900 font-bold rounded-xl text-xs transition active:scale-[0.98]"
          >
            Compute Insights Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Risk & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Relapse Risk Gauge Card */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl text-center"
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Relapse Risk Prediction</h4>
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full border ${getRiskColor(insights.risk_prediction)}`}>
                  {insights.risk_prediction || 'Low'} Risk
                </span>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                  Based on check-in consistency and mood correlations analyzed by Gemini.
                </p>
              </div>
            </motion.div>

            {/* Encouragement message */}
            <div className="bg-gradient-to-br from-teal-950/20 to-slate-900 border border-teal-500/25 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h4 className="font-bold text-teal-300 text-sm font-display">HabitBuddy Boost</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{insights.encouragement_message}"
              </p>
            </div>
          </div>

          {/* Right Column: Weekly Breakdown */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Summary</h4>
              <p className="text-sm text-slate-200 leading-relaxed font-semibold">{insights.weekly_summary}</p>
            </div>

            <hr className="border-slate-800/80" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-teal-400" />
                  Pattern Insights
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.pattern_insights}</p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Correlation Factors
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.correlation_insights}</p>
              </div>
            </div>

            <hr className="border-slate-800/80" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl">
                <h5 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1.5">Preemptive Advice</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.preemptive_advice}</p>
              </div>
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl">
                <h5 className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1.5">Next Week Suggestion</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">{insights.next_week_suggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
