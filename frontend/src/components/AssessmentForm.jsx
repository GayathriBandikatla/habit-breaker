import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { ClipboardList, Sparkles, Loader2 } from 'lucide-react';

export default function AssessmentForm() {
  const { onboardUser, loading, error } = useHabits();
  const [formData, setFormData] = useState({
    habit_name: '',
    frequency: '',
    triggers: '',
    impact: '',
    motivation: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.habit_name.trim()) errors.habit_name = 'Habit name is required';
    if (!formData.frequency.trim()) errors.frequency = 'Frequency is required';
    if (!formData.triggers.trim()) errors.triggers = 'Triggers description is required';
    if (!formData.impact.trim()) errors.impact = 'Daily impact is required';
    if (!formData.motivation.trim()) errors.motivation = 'Motivation rating or level is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await onboardUser(formData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-teal-300">Habit Assessment</h2>
          <p className="text-sm text-slate-400">Let's analyze your habit patterns to create your recovery path.</p>
        </div>
      </div>

      {error && (
        <div role="alert" aria-live="polite" className="mb-6 p-4 bg-red-950/40 border border-red-800/80 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="habit_name" className="block text-sm font-semibold text-slate-300 mb-2">
            What habit are you looking to break?
          </label>
          <input
            id="habit_name"
            name="habit_name"
            type="text"
            placeholder="e.g. Late-night phone scrolling, social media addiction"
            value={formData.habit_name}
            onChange={handleChange}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl px-4 py-3 outline-none text-slate-100 placeholder-slate-600 transition"
            aria-invalid={!!formErrors.habit_name}
            aria-describedby={formErrors.habit_name ? "habit_name_error" : undefined}
          />
          {formErrors.habit_name && (
            <span id="habit_name_error" className="text-xs text-red-400 mt-1 block">
              {formErrors.habit_name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="frequency" className="block text-sm font-semibold text-slate-300 mb-2">
              How often does it occur?
            </label>
            <input
              id="frequency"
              name="frequency"
              type="text"
              placeholder="e.g. 5 hours daily, 20 times a day"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl px-4 py-3 outline-none text-slate-100 placeholder-slate-600 transition"
              aria-invalid={!!formErrors.frequency}
              aria-describedby={formErrors.frequency ? "frequency_error" : undefined}
            />
            {formErrors.frequency && (
              <span id="frequency_error" className="text-xs text-red-400 mt-1 block">
                {formErrors.frequency}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="motivation" className="block text-sm font-semibold text-slate-300 mb-2">
              Current motivation to break it?
            </label>
            <input
              id="motivation"
              name="motivation"
              type="text"
              placeholder="e.g. High, 8/10, urgent"
              value={formData.motivation}
              onChange={handleChange}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl px-4 py-3 outline-none text-slate-100 placeholder-slate-600 transition"
              aria-invalid={!!formErrors.motivation}
              aria-describedby={formErrors.motivation ? "motivation_error" : undefined}
            />
            {formErrors.motivation && (
              <span id="motivation_error" className="text-xs text-red-400 mt-1 block">
                {formErrors.motivation}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="triggers" className="block text-sm font-semibold text-slate-300 mb-2">
            What triggers this habit? (emotions, locations, situations)
          </label>
          <textarea
            id="triggers"
            name="triggers"
            rows={3}
            placeholder="e.g. Feeling bored, stress, when laying in bed at night"
            value={formData.triggers}
            onChange={handleChange}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl px-4 py-3 outline-none text-slate-100 placeholder-slate-600 transition resize-none"
            aria-invalid={!!formErrors.triggers}
            aria-describedby={formErrors.triggers ? "triggers_error" : undefined}
          />
          {formErrors.triggers && (
            <span id="triggers_error" className="text-xs text-red-400 mt-1 block">
              {formErrors.triggers}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="impact" className="block text-sm font-semibold text-slate-300 mb-2">
            What is its negative impact on your life?
          </label>
          <textarea
            id="impact"
            name="impact"
            rows={3}
            placeholder="e.g. Sleep deprivation, loss of focus, neck pain"
            value={formData.impact}
            onChange={handleChange}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-2xl px-4 py-3 outline-none text-slate-100 placeholder-slate-600 transition resize-none"
            aria-invalid={!!formErrors.impact}
            aria-describedby={formErrors.impact ? "impact_error" : undefined}
          />
          {formErrors.impact && (
            <span id="impact_error" className="text-xs text-red-400 mt-1 block">
              {formErrors.impact}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 active:scale-[0.99] transition rounded-2xl text-slate-900 font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running AI Diagnostic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Recovery Plan
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
