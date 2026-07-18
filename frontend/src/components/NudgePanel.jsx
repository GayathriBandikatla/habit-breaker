import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, Loader2, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export default function NudgePanel() {
  const { requestNudge, activeNudge, dismissNudge, loading } = useHabits();
  const [mood, setMood] = useState('');
  const [prevActivity, setPrevActivity] = useState('');
  const [formError, setFormError] = useState('');

  const handleRequestNudge = async (e) => {
    e.preventDefault();
    if (!mood.trim() || !prevActivity.trim()) {
      setFormError('Please fill out both fields.');
      return;
    }
    setFormError('');
    try {
      await requestNudge(mood, prevActivity);
    } catch (err) {
      console.error(err);
    }
  };

  const getUrgencyStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse';
      case 'medium':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Nudge Trigger Input */}
      <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-teal-300">Request Smart Nudge</h3>
            <p className="text-xs text-slate-400">Feeling tempted? Provide details so HabitBuddy can steer you back.</p>
          </div>
        </div>

        {formError && (
          <div role="alert" className="mb-4 text-xs text-red-400 bg-red-950/40 p-3 border border-red-800/80 rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleRequestNudge} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nudge_mood" className="block text-xs font-semibold text-slate-400 mb-2">
                What triggers or mood are you feeling?
              </label>
              <input
                id="nudge_mood"
                type="text"
                placeholder="e.g. Bored, stressed, tired"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-600 transition"
              />
            </div>
            <div>
              <label htmlFor="nudge_activity" className="block text-xs font-semibold text-slate-400 mb-2">
                What were you doing just before?
              </label>
              <input
                id="nudge_activity"
                type="text"
                placeholder="e.g. Working on lap, laying down"
                value={prevActivity}
                onChange={(e) => setPrevActivity(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-2xl text-slate-900 font-bold transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Formatting Nudge...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get Real-time Nudge
              </>
            )}
          </button>
        </form>
      </div>

      {/* Active Nudge Display */}
      <AnimatePresence>
        {activeNudge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            role="alert"
            aria-live="assertive"
          >
            {/* Background glowing sphere */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full filter blur-xl"></div>

            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getUrgencyStyles(activeNudge.urgency_level)}`}>
                {activeNudge.urgency_level || 'Low'} Urgency
              </span>
              <button
                onClick={dismissNudge}
                className="text-xs text-slate-500 hover:text-slate-300 font-medium bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800 transition"
              >
                Dismiss
              </button>
            </div>

            <h4 className="text-lg font-bold text-slate-100 font-display mb-2">
              "{activeNudge.nudge_message}"
            </h4>

            <hr className="border-slate-800/80 my-4" />

            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Suggested Alternative
                </h5>
                <p className="text-sm text-slate-300 font-semibold">{activeNudge.suggested_alternative}</p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Quick Recovery Tip
                </h5>
                <p className="text-sm text-slate-300">{activeNudge.recovery_tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
