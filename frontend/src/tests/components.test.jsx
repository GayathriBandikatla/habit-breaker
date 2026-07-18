import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssessmentForm from '../components/AssessmentForm';
import CoachingChat from '../components/CoachingChat';
import DashboardView from '../components/DashboardView';
import NudgePanel from '../components/NudgePanel';
import StrategiesList from '../components/StrategiesList';
import GamificationRewards from '../components/GamificationRewards';

// Mock context hook
const mockOnboardUser = jest.fn();
const mockSendCoachingMessage = jest.fn();
const mockRateStrategy = jest.fn();
const mockRequestNudge = jest.fn();

jest.mock('../context/HabitContext', () => ({
  useHabits: () => ({
    onboardUser: mockOnboardUser,
    sendCoachingMessage: mockSendCoachingMessage,
    rateStrategy: mockRateStrategy,
    requestNudge: mockRequestNudge,
    dismissNudge: jest.fn(),
    refreshInsights: jest.fn(),
    loading: false,
    error: null,
    habitName: "social media scrolling",
    assessment: {
      severity_level: "High",
      recommended_goals: {
        weekly_target: "30 mins limit",
        monthly_target: "Zero scrolling"
      }
    },
    dashboard: {
      streak: 3,
      max_streak: 5,
      points: 250,
      check_ins_count: 5,
      success_rate: 80.0,
      milestones: ["Fresh Start", "Consistent"],
      badges: [],
      habit_name: "social media scrolling"
    },
    gamification: {
      points: 250,
      next_level_points: 500,
      progress_percentage: 50,
      badges: [
        { id: "onboarding_complete", name: "Fresh Start", description: "Complete assessment", earned: true, earned_at: "2026-07-18" }
      ]
    },
    strategies: [
      { name: "5-Minute Breathwork", type: "physical", description: "Slow breathing pattern", steps: ["Inhale 4s", "Hold 4s"], time_required: "5 mins", rating: 8 }
    ],
    chatHistory: [
      { role: "user", content: "I am feeling tempted" },
      { role: "assistant", content: "Take a deep breath." }
    ],
    activeNudge: null,
    relapsePlan: null
  })
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Frontend Component Tests', () => {
  test('AssessmentForm renders fields and handles input', () => {
    render(<AssessmentForm />);
    const habitInput = screen.getByLabelText(/What habit are you looking to break/i);
    expect(habitInput).toBeInTheDocument();

    fireEvent.change(habitInput, { target: { value: 'Phone Addiction' } });
    expect(habitInput.value).toBe('Phone Addiction');
  });

  test('CoachingChat renders chat history and input', () => {
    render(<CoachingChat />);
    expect(screen.getByText('Take a deep breath.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask coaching advice/i)).toBeInTheDocument();
  });

  test('DashboardView renders metrics correctly', () => {
    render(<DashboardView />);
    expect(screen.getByText('3 days')).toBeInTheDocument();
    expect(screen.getByText('250 pts')).toBeInTheDocument();
    expect(screen.getByText('social media scrolling')).toBeInTheDocument();
  });

  test('NudgePanel renders prompts and triggers action', () => {
    render(<NudgePanel />);
    const moodInput = screen.getByLabelText(/What triggers or mood are you feeling/i);
    expect(moodInput).toBeInTheDocument();

    fireEvent.change(moodInput, { target: { value: 'Boredom' } });
    const activityInput = screen.getByLabelText(/What were you doing just before/i);
    fireEvent.change(activityInput, { target: { value: 'Lying in bed' } });

    const btn = screen.getByRole('button', { name: /Get Real-time Nudge/i });
    fireEvent.click(btn);
    expect(mockRequestNudge).toHaveBeenCalledWith('Boredom', 'Lying in bed');
  });

  test('StrategiesList filters and displays rating details', () => {
    render(<StrategiesList />);
    expect(screen.getByText('5-Minute Breathwork')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  test('GamificationRewards shows earned badges', () => {
    render(<GamificationRewards />);
    expect(screen.getByText('Fresh Start')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
