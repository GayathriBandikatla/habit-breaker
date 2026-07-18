import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Heart, Users, Star, BrainCircuit } from 'lucide-react';

export default function StrategiesList() {
  const { strategies, rateStrategy, loading } = useHabits();
  const [filter, setFilter] = useState('all');

  const filteredStrategies = strategies.filter((item) => {
    if (filter === 'all') return true;
    return item.type.toLowerCase() === filter.toLowerCase();
  });

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'physical':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'mental':
        return <BrainCircuit className="w-5 h-5 text-teal-400" />;
      default:
        return <Users className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type.toLowerCase()) {
      case 'physical':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'mental':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-xl font-bold font-display text-teal-300">Coping Strategies</h3>
          <p className="text-xs text-slate-400 mt-1">Recommended coping interventions tailored to break your habit.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist">
          {['all', 'physical', 'mental', 'social'].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={filter === t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition border uppercase tracking-wider ${
                filter === t
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 border-transparent text-slate-900 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStrategies.map((s, idx) => (
          <motion.div
            key={idx}
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                    {getTypeIcon(s.type)}
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm font-display capitalize">{s.name}</h4>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getTypeBadge(s.type)}`}>
                  {s.type}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>

              {/* Steps */}
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl mb-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</h5>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  {s.steps.map((step, stepIdx) => (
                    <li key={stepIdx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Bottom rating & duration */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
              <div className="text-[10px] text-slate-500">
                Duration: <span className="font-bold text-slate-400">{s.time_required}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium mr-1.5">Effectiveness:</span>
                {[1, 2, 3, 4, 5].map((star) => {
                  // Map rating 1-10 to 5 stars (1-2 is 1 star, 3-4 is 2, etc.)
                  const starVal = star * 2;
                  const active = s.rating >= starVal - 1;
                  return (
                    <button
                      key={star}
                      onClick={() => rateStrategy(s.name, starVal)}
                      className="p-0.5 hover:scale-110 active:scale-95 transition"
                      aria-label={`Rate ${s.name} ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          active ? 'fill-teal-400 text-teal-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-[11px] font-bold text-teal-400 ml-1.5">{s.rating}/10</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
