import React, { useState, useContext, useEffect } from "react";
import { FiArrowLeft, FiGift, FiZap, FiTarget, FiTrash2, FiCheckCircle, FiLoader } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // 🔥 Ensure API is imported

export default function GoalTrackerScreen() {
  const { setMonthlyGoal, goals, deleteGoal } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [goalName, setGoalName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [reverseEMI, setReverseEMI] = useState(0);
  const [emiComparison, setEmiComparison] = useState({ emi: 0, totalInterest: 0 });
  
 
  const [strategies, setStrategies] = useState({});
  const [loadingAi, setLoadingAi] = useState({});

  
  const fetchGoalStrategy = async (goalId) => {
    setLoadingAi(prev => ({ ...prev, [goalId]: true }));
    try {
      const res = await api.get(`/api/ai/goal-optimization/${goalId}`);
      if (res.data.success) {
        setStrategies(prev => ({ ...prev, [goalId]: res.data.optimization }));
      }
    } catch (err) {
      console.error("Goal AI Error:", err);
    } finally {
      setLoadingAi(prev => ({ ...prev, [goalId]: false }));
    }
  };

  
  useEffect(() => {
    goals.forEach(g => {
      if (!strategies[g._id] && g.current < g.target) {
        fetchGoalStrategy(g._id);
      }
    });
  }, [goals]);

  const calculateFinance = () => {
    const p = parseFloat(amount);
    const n = parseInt(duration);
    if (isNaN(p) || isNaN(n) || n <= 0) return alert("Enter valid parameters");
    
    setReverseEMI(Math.ceil(p / n));
    const r = 0.15 / 12;
    const tradEMI = Math.ceil((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    setEmiComparison({ emi: tradEMI, totalInterest: (tradEMI * n) - p });
  };

  const handleSave = async () => {
    const res = await setMonthlyGoal({ 
      title: goalName, 
      target: parseFloat(amount), 
      months: parseInt(duration) 
    });
    
    if (res) { 
      alert("Objective Locked! 🚀"); 
      setGoalName(""); setAmount(""); setDuration(""); setReverseEMI(0); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-[1200px] mx-auto">
        <button onClick={() => navigate("/")} className="mb-8 font-black text-xs uppercase tracking-widest flex items-center gap-2 text-zinc-500 hover:text-white transition-all">
          <FiArrowLeft /> Back to Dashboard
        </button>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 space-y-8">
            <h1 className="text-5xl font-black tracking-tighter">Mission Objective</h1>
            <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl">
              <input className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="Target Name" value={goalName} onChange={(e) => setGoalName(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <input className="w-full bg-black border border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" type="number" placeholder="Months" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <button onClick={calculateFinance} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black border border-white/10 hover:bg-zinc-700">CALCULATE AUDIT</button>
              <button disabled={reverseEMI === 0} onClick={handleSave} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-zinc-200 disabled:opacity-50">START SENSEI PLAN 🚀</button>
            </div>
          </div>

          {/* Audit Results */}
          <div className="lg:col-span-7">
            {reverseEMI > 0 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 p-8 rounded-[40px] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Loan Comparison</p>
                    <p className="text-4xl font-black text-red-500">₹{emiComparison.emi.toLocaleString()}</p>
                    <p className="text-xs text-red-500 font-bold mt-2">+ ₹{Math.round(emiComparison.totalInterest).toLocaleString()} Interest Loss</p>
                  </div>
                  <div className="bg-zinc-900 p-8 rounded-[40px] border border-green-500/30">
                     <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4">Sensei Reverse EMI</p>
                     <p className="text-4xl font-black text-green-500">₹{reverseEMI.toLocaleString()}</p>
                     <p className="text-xs text-green-400 font-bold mt-2 flex items-center gap-2">₹0 Interest <FiZap /></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 border-2 border-dashed border-white/5 rounded-[48px]">
                <FiTarget size={80} className="mb-6" />
                <p className="font-bold uppercase tracking-widest text-xs">Initialize calculation</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Objectives Section */}
        <div className="border-t-4 border-zinc-900/50 my-16 pt-12">
          <h2 className="text-3xl font-black tracking-tighter mb-8">Active Objectives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((g) => {
              const isAchieved = g.current >= g.target;
              const strategy = strategies[g._id];
              
              return (
                <div key={g._id} className="bg-zinc-900 p-8 rounded-[48px] border border-white/5 space-y-6 flex flex-col justify-between hover:border-purple-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-2xl font-bold group-hover:text-purple-400 transition-colors">{g.title}</h4>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Progress: {Math.round((g.current/g.target)*100)}%</p>
                    </div>
                    <button onClick={() => deleteGoal(g._id)} className="text-zinc-600 p-2 hover:bg-red-500 hover:text-white rounded-xl transition-all"><FiTrash2 /></button>
                  </div>

                  <div className={`p-8 rounded-[32px] border transition-all ${isAchieved ? 'bg-green-500/10 border-green-500/30' : 'bg-black/40 border-white/5'}`}>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-4xl font-black ${isAchieved ? 'text-green-500' : 'text-white'}`}>₹{g.current.toLocaleString()}</span>
                      <span className="text-zinc-600 font-bold text-lg">/ ₹{g.target.toLocaleString()}</span>
                    </div>
                  </div>

                  
                  {!isAchieved && (
                    <div className="bg-purple-600/5 border border-purple-500/10 p-6 rounded-[32px] relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <FiZap className="text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Sensei Strategy</span>
                      </div>
                      
                      {loadingAi[g._id] ? (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs italic"><FiLoader className="animate-spin" /> Optimizing timeline...</div>
                      ) : strategy ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-xs text-zinc-300 leading-relaxed mb-4 font-medium italic">"{strategy.recommendation}"</p>
                          <div className="flex gap-4">
                            <div className="bg-black/40 px-4 py-2 rounded-xl">
                              <p className="text-[8px] uppercase text-zinc-500 font-black">Boost</p>
                              <p className="text-sm font-black text-green-500">+₹{strategy.suggestedExtraAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-black/40 px-4 py-2 rounded-xl">
                              <p className="text-[8px] uppercase text-zinc-500 font-black">Saved</p>
                              <p className="text-sm font-black text-purple-500">{strategy.daysSaved} Days</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600">Calculations pending...</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    {isAchieved ? (
                      <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                        <FiCheckCircle /> Mission Complete
                      </div>
                    ) : (
                      <span className="text-zinc-400 font-bold text-xs">₹{(g.target - g.current).toLocaleString()} to go</span>
                    )}
                    <span className="text-purple-500 font-black text-[10px] uppercase tracking-widest bg-purple-500/10 px-4 py-2 rounded-full">₹{g.installment.toLocaleString()}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}