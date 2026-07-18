import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const HabitContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // App States
  const [habitName, setHabitName] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [insights, setInsights] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeNudge, setActiveNudge] = useState(null);
  const [relapsePlan, setRelapsePlan] = useState(null);

  // Helper to load dashboard, gamification, and assessment info
  const refreshState = async () => {
    try {
      const dbData = await apiService.getDashboard();
      setDashboard(dbData);
      setHabitName(dbData.habit_name);

      if (dbData.has_assessment) {
        const assessData = await apiService.getAssessment();
        setAssessment(assessData);
        
        const gamData = await apiService.getGamification();
        setGamification(gamData);

        const stratData = await apiService.getStrategies();
        setStrategies(stratData);
        
        const chatData = await apiService.getChatHistory();
        setChatHistory(chatData);

        // Fetch insights in background
        apiService.getInsights()
          .then(data => setInsights(data))
          .catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load habit status:", err.message);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const onboardUser = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.createAssessment(formData);
      setAssessment(res);
      setHabitName(formData.habit_name);
      await refreshState();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkIn = async (status, notes) => {
    setLoading(true);
    setError(null);
    setRelapsePlan(null);
    try {
      const res = await apiService.addCheckIn(status, notes);
      await refreshState();
      if (status === 'slip_up' && res.recovery) {
        setRelapsePlan(res.recovery);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendCoachingMessage = async (msg) => {
    setError(null);
    // Append user message locally for immediate UI update
    setChatHistory((prev) => [...prev, { role: 'user', content: msg }]);
    try {
      const res = await apiService.sendChatMessage(msg);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: res.response }]);
      await refreshState(); // update points/badges if any earned
      return res.response;
    } catch (err) {
      setError(err.message);
      // reload chat history from backend to resolve state mismatch
      apiService.getChatHistory().then(setChatHistory);
      throw err;
    }
  };

  const rateStrategy = async (name, rating) => {
    try {
      await apiService.rateStrategy(name, rating);
      setStrategies((prev) =>
        prev.map((s) => (s.name === name ? { ...s, rating } : s))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const requestNudge = async (mood, prevActivity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.generateNudge(mood, prevActivity);
      setActiveNudge(res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dismissNudge = () => {
    setActiveNudge(null);
  };

  const refreshInsights = async () => {
    setLoading(true);
    try {
      const data = await apiService.getInsights();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        loading,
        error,
        habitName,
        assessment,
        dashboard,
        gamification,
        insights,
        strategies,
        chatHistory,
        activeNudge,
        relapsePlan,
        onboardUser,
        checkIn,
        sendCoachingMessage,
        rateStrategy,
        requestNudge,
        dismissNudge,
        refreshInsights,
        clearRelapsePlan: () => setRelapsePlan(null),
        refreshState
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
export default HabitContext;
