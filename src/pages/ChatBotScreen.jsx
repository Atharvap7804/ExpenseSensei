import React, { useState, useRef, useEffect, useContext } from "react";
import { 
  FiSend, FiCpu, FiPlus, FiTrash2, FiMenu, 
  FiX, FiMessageSquare, FiCommand, FiLoader 
} from "react-icons/fi";
import ReactMarkdown from 'react-markdown'; // 🔥 Essential for structured replies
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function ChatBotScreen() {
  const { balance, expense, limit, activeGoal } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const chatEndRef = useRef(null);

  const suggestions = ["50/30/20 Audit", "Emergency Fund?", "Goal Timeline"];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/api/ai/sessions");
        if (res.data.success && res.data.sessions.length > 0) {
          setSessions(res.data.sessions);
          setActiveSessionId(res.data.sessions[0]._id);
        } else {
          handleNewSession(); 
        }
      } catch (error) { console.error("Session Fetch Error:", error); }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      const loadHistory = async () => {
        try {
          setMessages([]); 
          const res = await api.get(`/api/ai/history/${activeSessionId}`);
          if (res.data.success) {
            setMessages(res.data.history.map(item => ({ 
              id: item._id, 
              text: item.text, 
              sender: item.sender 
            })));
          }
        } catch (error) { console.error("History Load Error:", error); }
      };
      loadHistory();
    }
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewSession = async () => {
    try {
      const res = await api.post("/api/ai/session", { title: "New Financial Audit" });
      if (res.data.success) {
        setSessions(prev => [res.data.session, ...prev]);
        setActiveSessionId(res.data.session._id);
        setMessages([]);
      }
    } catch (error) { console.error("New Session Error:", error); }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); 
    if (!window.confirm("Purge this financial audit session?")) return;
    try {
      const res = await api.delete(`/api/ai/session/${sessionId}`);
      if (res.data.success) {
        const updatedSessions = sessions.filter(s => s._id !== sessionId);
        setSessions(updatedSessions);
        if (activeSessionId === sessionId) {
          setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0]._id : null);
          setMessages([]);
        }
      }
    } catch (error) { console.error("Delete Error:", error); }
  };

  const handleSend = async (userText) => {
    const textToSend = typeof userText === "string" ? userText : input;
    if (!textToSend.trim() || isTyping || !activeSessionId) return;

    const userMsg = { id: Date.now().toString(), text: textToSend, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true); 

    try {
      const res = await api.post("/api/ai/chat", {
        message: textToSend,
        sessionId: activeSessionId,
        userData: { name: user?.name, balance, expense, limit, activeGoal }
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, { 
          id: Date.now().toString(), 
          text: res.data.reply, 
          sender: "bot" 
        }]);
      }
    } catch (error) { 
      console.error("Chat Error:", error); 
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden relative font-sans">
      
      {/* SIDEBAR / DRAWER */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 flex flex-col p-6 border-r border-white/5 transition-transform duration-300 lg:static lg:translate-x-0 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <span className="font-black text-[10px] uppercase tracking-widest text-purple-500">History</span>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-zinc-800 rounded-lg"><FiX size={18} /></button>
        </div>
        
        <button 
          onClick={() => { handleNewSession(); setIsDrawerOpen(false); }}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest mb-10 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
        >
          <FiPlus /> New Session
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {sessions.map((session) => (
            <div 
              key={session._id}
              onClick={() => { setActiveSessionId(session._id); setIsDrawerOpen(false); }}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === session._id ? 'bg-purple-600/20 border-purple-500/30' : 'hover:bg-white/5 border-transparent'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FiMessageSquare size={14} className={activeSessionId === session._id ? 'text-purple-400' : 'text-zinc-500'} />
                <span className="text-xs truncate font-bold">{session.title}</span>
              </div>
              
              <button 
                onClick={(e) => handleDeleteSession(e, session._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-black/20">
        <header className="px-6 py-4 md:px-8 md:py-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 bg-zinc-900 rounded-xl" onClick={() => setIsDrawerOpen(true)}>
              <FiMenu size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg"><FiCpu size={20} /></div>
              <div>
                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">Sensei Core</h2>
                <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Structured Analysis Active</span>
              </div>
            </div>
          </div>
          <FiCommand className="hidden md:block text-zinc-600" />
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 no-scrollbar w-full max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] p-4 rounded-2xl text-sm font-bold shadow-lg ${msg.sender === "user" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-300"}`}>
                
                {/* 🔥 STRUCTURED MARKDOWN RENDERING[cite: 3] */}
                {msg.sender === "bot" ? (
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {/* SENSEI THINKING LOADER[cite: 3] */}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-3 border border-white/5">
                <FiLoader className="animate-spin text-purple-500" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sensei is analyzing your data...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* FOOTER & INPUT */}
        <footer className="w-full shrink-0 bg-[#050505]/80 backdrop-blur-md border-t border-white/5 pb-28 lg:pb-8">
          <div className="max-w-4xl mx-auto px-4 py-3 md:px-10 md:py-6">
            
            <div className="flex gap-2 mb-4 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="inline-block px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-1.5 shadow-2xl focus-within:border-purple-600 transition-all w-full">
              <input
                className="flex-1 min-w-0 bg-transparent px-3 py-2 md:py-3 text-sm font-medium outline-none placeholder-zinc-700 text-white"
                placeholder={activeSessionId ? "Consult Sensei..." : "Select history to begin..."}
                value={input}
                disabled={isTyping || !activeSessionId}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={isTyping || !activeSessionId}
                className="flex-shrink-0 bg-purple-600 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center hover:bg-purple-700 transition-all active:scale-95 shadow-lg"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        </footer>
      </main>
      
      {isDrawerOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />}
    </div>
  );
}