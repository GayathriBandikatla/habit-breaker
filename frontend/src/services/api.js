const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiService = {
  // Assessment
  async getAssessment() {
    const res = await fetch(`${API_BASE}/assessment`);
    return handleResponse(res);
  },
  async createAssessment(data) {
    const res = await fetch(`${API_BASE}/assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Coaching
  async getChatHistory() {
    const res = await fetch(`${API_BASE}/coaching/history`);
    return handleResponse(res);
  },
  async sendChatMessage(message) {
    const res = await fetch(`${API_BASE}/coaching/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  // Nudges
  async generateNudge(triggersOrMood, previousActivity) {
    const res = await fetch(`${API_BASE}/nudges/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggers_or_mood: triggersOrMood,
        previous_activity: previousActivity,
      }),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse(res);
  },

  // Strategies
  async getStrategies() {
    const res = await fetch(`${API_BASE}/strategies`);
    return handleResponse(res);
  },
  async rateStrategy(name, rating) {
    const res = await fetch(`${API_BASE}/strategies/${encodeURIComponent(name)}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return handleResponse(res);
  },

  // Accountability Check-ins
  async getCheckInHistory() {
    const res = await fetch(`${API_BASE}/accountability/history`);
    return handleResponse(res);
  },
  async addCheckIn(status, notes) {
    const res = await fetch(`${API_BASE}/accountability/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
  },

  // Insights
  async getInsights() {
    const res = await fetch(`${API_BASE}/insights`);
    return handleResponse(res);
  },

  // Gamification
  async getGamification() {
    const res = await fetch(`${API_BASE}/gamification`);
    return handleResponse(res);
  },
};
