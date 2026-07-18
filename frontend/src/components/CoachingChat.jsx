import React, { useState, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageCircle, Bot, User, Loader2 } from 'lucide-react';

export default function CoachingChat() {
  const { chatHistory, sendCoachingMessage, habitName } = useHabits();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const messageToSend = input;
    setInput('');
    setSending(true);

    try {
      await sendCoachingMessage(messageToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto h-[600px]">
      {/* Sidebar Info Card */}
      <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-6 h-6 text-teal-400" />
            <h3 className="font-bold text-teal-300">HabitBuddy</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            I am here to coach you through urges and keep you accountable. Type whenever you're feeling tempted or need motivation!
          </p>
          <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl">
            <h4 className="text-xs font-semibold text-slate-400 mb-1">Target Habit</h4>
            <p className="text-sm font-bold text-slate-200 capitalize">{habitName || 'Active Habit'}</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Powered by Gemini 1.5 Flash. Actionable advice only.
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Interactive Session</h3>
            <p className="text-[10px] text-slate-500">Endless history context</p>
          </div>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" aria-live="polite">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Bot className="w-12 h-12 text-slate-600 mb-2 animate-bounce" />
              <p className="text-sm text-slate-400">No messages yet. Say hello to HabitBuddy!</p>
              <button
                onClick={() => sendCoachingMessage("Hello! Let's get started on breaking my habit.")}
                className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold px-4 py-2 rounded-xl transition"
              >
                Send Quick Hello
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chatHistory.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-900 font-medium rounded-tr-none'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isUser && (
                      <div className="p-2 bg-slate-800 text-slate-300 rounded-xl">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {sending && (
            <div className="flex items-start gap-3 justify-start">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                HabitBuddy is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex gap-3">
          <input
            type="text"
            placeholder="Ask coaching advice, share a temptation, or log progress..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-2xl px-4 py-3 text-sm outline-none text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-teal-500 transition"
            disabled={sending}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 rounded-2xl text-slate-900 flex items-center justify-center transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
