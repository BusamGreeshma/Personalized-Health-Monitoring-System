import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import GlassCard from '../components/Common/GlassCard';
import { MessageSquare, Send, Mic, MicOff, Volume2, Sparkles, AlertTriangle } from 'lucide-react';

const AiAssistant = () => {
  const { showToast } = useNotification();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);

  const loadSessions = async () => {
    try {
      const res = await api.get('/ai/chat/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSessionMessages = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/chat/sessions/${id}`);
      if (res.data.success) {
        setMessages(res.data.data);
        setCurrentSessionId(id);
      }
    } catch (err) {
      showToast('Error', 'Failed to retrieve conversation logs.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        text: userText,
        sessionId: currentSessionId
      });

      if (res.data.success) {
        const { sessionId, message } = res.data.data;
        if (!currentSessionId) {
          setCurrentSessionId(sessionId);
          loadSessions();
        }
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      showToast('Error', 'Failed to fetch AI assistant response.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Voice Dictation Setup
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Browser Unsupported', 'Voice input is not supported in your browser. Try Google Chrome.', 'alert');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      showToast('Listening...', 'Speak clearly into your microphone.', 'info');
    };

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };

    rec.onerror = (event) => {
      console.error(event);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Text-To-Speech Read-Aloud Setup
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel ongoing speeches
      window.speechSynthesis.cancel();
      
      // Strip disclaimer warnings from voice read-back to keep it brief and conversational
      const voiceText = text.replace(/This is not medical advice.*/g, '').trim();

      const utterance = new SpeechUtterance(voiceText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Browser Unsupported', 'Text-to-speech is not supported in your browser.', 'alert');
    }
  };

  const handleStartNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
      {/* Session Drawer left side */}
      <GlassCard hover={false} className="hidden md:flex flex-col p-4 h-full border-slate-800/80">
        <button
          onClick={handleStartNewSession}
          className="w-full glass-btn-primary py-2 px-3 text-xs mb-4 flex items-center justify-center gap-1.5"
        >
          <PlusIcon />
          <span>New Conversation</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2">History Sessions</span>
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-8">No previous logs found.</p>
          ) : (
            sessions.map(s => (
              <button
                key={s._id}
                onClick={() => loadSessionMessages(s._id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 truncate cursor-pointer ${
                  currentSessionId === s._id
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25'
                    : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <MessageSquare size={13} className="flex-shrink-0" />
                <span className="truncate">{s.sessionName}</span>
              </button>
            ))
          )}
        </div>
      </GlassCard>

      {/* Primary Chat Box Console right side */}
      <div className="md:col-span-3 flex flex-col h-full space-y-4">
        
        {/* Urgent medical advice notice */}
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-400 flex items-start gap-3">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">Medical Disclaimer: </span>
            Aura is a digital wellness simulator meant for information tracking. It is NOT qualified to diagnose symptoms, recommend pharmaceuticals, or serve as clinical advice. Always consult a medical physician.
          </div>
        </div>

        {/* Messaging Box Area */}
        <GlassCard hover={false} className="flex-1 flex flex-col p-4 overflow-hidden relative border-slate-800/80">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <h3 className="font-semibold text-sm">Hello, I am Aura</h3>
                <p className="text-xs text-slate-400">Ask me questions about sleep optimization, cardio routines, dietary ingredients, or blood test terms.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl border text-xs leading-relaxed flex flex-col relative group ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-slate-200 rounded-tr-none'
                        : 'bg-slate-950/50 border-slate-900 text-slate-300 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Read-Aloud floating icon button on AI responses */}
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Read Response Out Loud"
                      >
                        <Volume2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900 text-slate-400 rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Box Area */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-white'
              }`}
              title="Voice Input Dictation"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder="Ask a health or dietary question..."
              className="flex-1 glass-input text-xs"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button type="submit" className="glass-btn-primary p-3 flex items-center justify-center">
              <Send size={16} />
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

// Simple plus icon helper
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default AiAssistant;
