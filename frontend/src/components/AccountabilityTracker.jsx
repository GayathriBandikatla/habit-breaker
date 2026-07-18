import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertOctagon, HeartHandshake, Loader2, Sparkles, X, History } from 'lucide-react';

export default function AccountabilityTracker() {
  const { checkIn, relapsePlan, clearRelapsePlan, dashboard, loading, error } = useHabits();
  const [status, setStatus] = useState('success');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      const res = await checkIn(status, notes);
      if (status === 'success') {
        setSuccessMsg(res.message || 'Check-in logged successfully!');
      }
      setNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
      {/* Checkin Log Form */}
      <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-teal-300">Accountability Check-In</h3>
              <p className="text-xs text-slate-400">Log your progress or log a setback to adjust your strategies.</p>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-4 text-xs text-red-400 bg-red-950/40 p-3 border border-red-800/80 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div role="alert" className="mb-4 text-xs text-teal-300 bg-teal-950/40 p-3 border border-teal-800/80 rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="block text-xs font-semibold text-slate-400 mb-3">What is your check-in status?</span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setStatus('success'); setSuccessMsg(''); }}
                  className={`py-4 px-4 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                    status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Successful Day
                </button>
                <button
                  type="button"
                  onClick={() => { setStatus('slip_up'); setSuccessMsg(''); }}
                  className={`py-4 px-4 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                    status === 'slip_up'
                      ? 'bg-red-500/10 border-red-500 text-red-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  Logged Slip-Up
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="checkin_notes" className="block text-xs font-semibold text-slate-400 mb-2">
                {status === 'success'
                  ? 'How did you resist urges today? Any notes?'
                  : 'What triggered the slip-up? What feelings or circumstances?'}
              </label>
              <textarea
                id="checkin_notes"
                rows={3}
                placeholder={status === 'success' ? 'e.g. Kept phone in bag, read book, slept early' : 'e.g. Felt stressed from work, opened app without thinking'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none text-slate-100 placeholder-slate-600 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-2xl text-slate-900 font-bold transition active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Daily Check-In'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Slip-up Recovery Cards */}
      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence>
          {relapsePlan && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-slate-900 to-red-950/20 border border-red-500/20 p-6 rounded-3xl shadow-xl relative"
            >
              <button
                onClick={clearRelapsePlan}
                className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition"
                aria-label="Dismiss recovery plan"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <HeartHandshake className="w-5 h-5 text-red-400" />
                <h4 className="font-bold text-red-300 text-sm font-display">Slip-Up Recovery Assistance</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
                "{relapsePlan.message}"
              </p>

              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  Your 3 Recovery Actions
                </h5>
                <ul className="space-y-2">
                  {relapsePlan.next_steps?.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkin History list card */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4.5 h-4.5 text-teal-400" />
            <h4 className="font-bold text-slate-300 text-sm font-display">Recent Activity Logs</h4>
          </div>
          {!dashboard || dashboard.check_ins_count === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">No entries recorded yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto pr-1 space-y-2.5">
              {[...dashboard.badges].reverse().slice(0, 10).map((badge, index) => (
                <div key={index} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{badge.name}</h5>
                    <p className="text-[10px] text-slate-500">{badge.description}</p>
                  </div>
                  <span className="text-[9px] font-semibold text-teal-400 px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full">
                    Badge Earned
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
