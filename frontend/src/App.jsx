import React, { useState } from 'react';
import { useHabits } from './context/HabitContext';
import { useTheme } from './context/ThemeContext';
import AssessmentForm from './components/AssessmentForm';
import DashboardView from './components/DashboardView';
import CoachingChat from './components/CoachingChat';
import StrategiesList from './components/StrategiesList';
import AccountabilityTracker from './components/AccountabilityTracker';
import InsightsPanel from './components/InsightsPanel';
import GamificationRewards from './components/GamificationRewards';
import NudgePanel from './components/NudgePanel';
import { LayoutDashboard, MessageSquare, Compass, ShieldAlert, TrendingUp, Trophy, Sun, Moon, LogOut, Flame, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { assessment, dashboard, refreshState, loading } = useHabits();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coaching', label: 'AI Coach', icon: MessageSquare },
    { id: 'strategies', label: 'Coping Strategies', icon: Compass },
    { id: 'accountability', label: 'Check-In', icon: ShieldAlert },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'rewards', label: 'Badges & Rewards', icon: Trophy },
    { id: 'nudges', label: 'Nudges', icon: Flame },
  ];

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset your habit plan? This will clear all check-ins, points, and badges.")) {
      try {
        await fetch('/api/assessment/reset', { method: 'POST' });
      } catch (err) {
        console.error("Failed to reset backend state:", err);
      }
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'coaching':
        return <CoachingChat />;
      case 'strategies':
        return <StrategiesList />;
      case 'accountability':
        return <AccountabilityTracker />;
      case 'insights':
        return <InsightsPanel />;
      case 'rewards':
        return <GamificationRewards />;
      case 'nudges':
        return <NudgePanel />;
      default:
        return <DashboardView />;
    }
  };

  // If loading and no assessment loaded yet, show full screen splash
  if (loading && !assessment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400">
        <Heart className="w-12 h-12 animate-pulse mb-3" />
        <p className="text-sm font-semibold tracking-wide uppercase">Initializing HabitBuddy...</p>
      </div>
    );
  }

  // If no onboarding has been completed, force AssessmentForm
  if (!assessment) {
    return (
      <div className="min-h-screen bg-calm-gradient py-12 px-4 flex items-center justify-center">
        <div className="w-full">
          <div className="text-center mb-8 max-w-md mx-auto">
            <h1 className="text-4xl font-black font-display tracking-tight bg-gradient-to-r from-teal-300 via-teal-100 to-indigo-200 bg-clip-text text-transparent flex items-center justify-center gap-2">
              🌱 HabitBuddy
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Break addictions, manage screen time, and establish mindfulness routines with the power of Gemini AI.
            </p>
          </div>
          <AssessmentForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-gradient flex flex-col justify-between">
      {/* Navigation Top bar */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-xl font-black font-display tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-1.5">
              🌱 HabitBuddy
            </span>
          </div>

          <div className="flex items-center gap-4">
            {dashboard && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-slate-300">{dashboard.points} pts</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-2xl transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-orange-400" /> : <Moon className="w-4.5 h-4.5 text-teal-400" />}
            </button>

            <button
              onClick={handleReset}
              className="p-2 bg-slate-950 border border-red-950 hover:bg-red-950/20 text-red-400 rounded-2xl transition flex items-center gap-1.5 text-xs font-bold px-3"
              aria-label="Reset plan"
            >
              <LogOut className="w-4 h-4" />
              Reset Plan
            </button>
          </div>
        </div>
      </header>

      {/* Main Feature Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation Bar for Mobile, and Standard Sidebar-styled bottom row for desktop */}
      <footer className="bg-slate-900/60 backdrop-blur-xl border-t border-slate-800/80 py-4 px-6 sticky bottom-0">
        <nav className="max-w-6xl mx-auto flex justify-around overflow-x-auto gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition active:scale-[0.98] ${
                  active
                    ? 'text-teal-400 bg-teal-500/10 font-bold scale-[1.03]'
                    : 'text-slate-500 hover:text-slate-300 font-medium'
                }`}
                aria-label={`Open ${item.label}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
