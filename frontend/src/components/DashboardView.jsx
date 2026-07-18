import React from 'react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import {
  Flame,
  Award,
  TrendingUp,
  Milestone,
  CheckCircle,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardView() {
  const { dashboard } = useHabits();

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-3xl max-w-lg mx-auto">
        <Activity className="w-12 h-12 text-teal-500 animate-pulse mb-3" />
        <p className="text-sm">Retrieving your dashboard metrics...</p>
      </div>
    );
  }

  const {
    streak,
    max_streak,
    points,
    check_ins_count,
    success_rate,
    milestones,
    habit_name
  } = dashboard;

  // Formulate data for the progress chart based on success rate
  const chartData = [
    { name: 'Success Rate', value: success_rate, fill: '#14b8a6' },
    { name: 'Miss Rate', value: 100 - success_rate, fill: '#1e293b' }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-indigo-950/20 to-slate-950 border border-teal-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">
            Breaking Habit: <span className="text-teal-400 capitalize">{habit_name || 'Active Habit'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Keep logging daily check-ins to build resilience and earn points.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-2xl w-fit">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-teal-300">Success Rate: {success_rate}%</span>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Streak */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4"
        >
          <div className="p-4 bg-orange-500/10 text-orange-400 rounded-2xl">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Current Streak</h4>
            <div className="text-2xl font-black text-slate-100 mt-1">{streak} days</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Best streak: {max_streak} days</p>
          </div>
        </motion.div>

        {/* Points */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4"
        >
          <div className="p-4 bg-teal-500/10 text-teal-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Total Points</h4>
            <div className="text-2xl font-black text-slate-100 mt-1">{points} pts</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Spendable in rewards tab</p>
          </div>
        </motion.div>

        {/* Check-ins */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4"
        >
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Logged Check-ins</h4>
            <div className="text-2xl font-black text-slate-100 mt-1">{check_ins_count} total</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Including success & slip-ups</p>
          </div>
        </motion.div>

        {/* Milestones Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-4"
        >
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Milestone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-medium">Milestones</h4>
            <div className="text-2xl font-black text-slate-100 mt-1">{milestones.length} unlocked</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Tracking your milestones</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Success Rate Chart */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-300 mb-4 text-left w-full">Activity Success Rate</h3>
          {check_ins_count === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No check-ins logged yet to compute success metrics.
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(val) => [`${val}%`, 'Value']} />
                  <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={16}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Milestones list */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-300 mb-4">Milestones Achieved</h3>
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Milestones will appear here as you log successful check-ins and reach streaks.
            </div>
          ) : (
            <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {milestones.map((m, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  <span className="flex items-center justify-center w-6 h-6 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-lg border border-teal-500/20">
                    ✓
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{m}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
