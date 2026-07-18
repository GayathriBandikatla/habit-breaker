import React from 'react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { Award, Lock, Sparkles, Trophy, Zap } from 'lucide-react';

export default function GamificationRewards() {
  const { gamification } = useHabits();

  if (!gamification) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-lg mx-auto">
        <Trophy className="w-12 h-12 text-teal-500 animate-pulse mb-3" />
        <p className="text-sm">Fetching rewards profile...</p>
      </div>
    );
  }

  const { points, next_level_points, progress_percentage, badges } = gamification;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Points Progress Header */}
      <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-100 font-display">Resilience Level</h3>
              <p className="text-xs text-slate-400">Earn points for daily check-ins and completing assessments.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-teal-400 font-display">{points} <span className="text-xs text-slate-400">pts</span></div>
            <p className="text-xs text-slate-500 mt-1">Target to next milestone: {next_level_points} pts</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Progress</span>
            <span>{progress_percentage}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress_percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div>
        <h3 className="text-lg font-bold font-display text-teal-300 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges & Achievements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((b) => (
            <motion.div
              key={b.id}
              whileHover={{ y: -2 }}
              className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between h-[180px] transition relative overflow-hidden ${
                b.earned
                  ? 'bg-gradient-to-br from-slate-900 to-indigo-950/20 border-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800/80 grayscale opacity-60'
              }`}
            >
              {/* Star details glow */}
              {b.earned && (
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-500/10 rounded-full filter blur-xl"></div>
              )}

              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${b.earned ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-950 text-slate-600'}`}>
                  {b.earned ? <Sparkles className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
                </div>
                {b.earned && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    Earned
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-200 text-sm font-display mb-1">{b.name}</h4>
                <p className="text-xs text-slate-400 leading-normal">{b.description}</p>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 mt-1">
                {b.earned && b.earned_at
                  ? `Unlocked: ${new Date(b.earned_at).toLocaleDateString()}`
                  : 'Locked: Requirement not met'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
