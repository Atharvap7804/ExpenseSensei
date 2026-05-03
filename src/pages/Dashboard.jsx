import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FiShield, FiChevronRight, FiActivity, FiTrendingUp, 
  FiTrendingDown, FiTarget, FiZap, FiPlus 
} from "react-icons/fi";

export default function Dashboard() {
  const { balance, expense, income, limit, savings, activeGoal } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const percent = limit ? Math.min((expense / limit) * 100, 100) : 0;
  const goalPercent = activeGoal && activeGoal.target > 0
    ? Math.min(((activeGoal.current || 0) / activeGoal.target) * 100, 100)
    : 0;

  return (
    
    <div className="h-auto lg:h-full w-full bg-[#050505] text-white p-4 md:p-8 flex items-start lg:items-center justify-center font-sans overflow-y-auto lg:overflow-hidden">
      <div className="max-w-[1200px] w-full mx-auto py-4 lg:py-0">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-1 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Workspace
            </h1>
            <p className="text-zinc-500 text-[10px] md:text-xs font-medium italic">
              Logged in as {user?.name || "Operative"}
            </p>
          </div>
          <button 
            onClick={() => navigate("/add")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-[12px] transition-all hover:bg-purple-600 hover:text-white active:scale-95 shadow-xl"
          >
            <FiPlus /> ADD TRANSACTION
          </button>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            {/* Liquidity Card */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/10 shadow-2xl transition-all hover:border-purple-500/30">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8 md:mb-12 relative z-10">
                <div>
                  <span className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 block opacity-60">Liquidity Available</span>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                    ₹{balance?.toLocaleString()}
                  </h2>
                </div>
                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
                  <FiShield className="text-purple-500" size={24} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-tr from-purple-600 to-indigo-600" />
                  <p className="text-sm md:text-base font-bold tracking-tight">{user?.name || "Atharva Pawar"}</p>
                </div>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">AI Secured</span>
              </div>
            </div>

           
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Income", val: income, icon: FiTrendingUp, color: "text-green-500" },
                { label: "Expenses", val: expense, icon: FiTrendingDown, color: "text-red-500" },
                { label: "Savings", val: savings, icon: FiZap, color: "text-purple-500" }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/30 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-white/5 transition-colors hover:bg-zinc-900/50">
                  <stat.icon className={`${stat.color} mb-4`} size={20} />
                  <p className="text-zinc-500 text-[10px] md:text-[12px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-lg md:text-xl font-black tracking-tight">₹{stat.val?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area: Flow below on Mobile */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/40 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5">
              <h3 className="font-black text-[10px] md:text-[12px] uppercase tracking-[0.2em] text-zinc-500 mb-6">Budget Load</h3>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden mb-3 border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ${percent > 85 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-600 to-indigo-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[12px] font-black text-purple-500 uppercase tracking-widest text-right">{Math.round(percent)}% Load</p>
            </div>

            {activeGoal && (
              <div className="bg-zinc-900/40 p-6 md:p-8 rounded-[32px] border border-green-500/10 group cursor-pointer hover:border-green-500/30 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <FiTarget className="text-green-500" size={20} />
                  <FiChevronRight className="text-zinc-700 group-hover:text-white transition-colors" size={18} />
                </div>
                <h4 className="text-lg md:text-xl font-black mb-1">{activeGoal.title}</h4>
                <div className="w-full bg-black h-1.5 rounded-full overflow-hidden mb-3 mt-4">
                  <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${goalPercent}%` }} />
                </div>
                <p className="text-[12px] font-black text-green-500 uppercase tracking-widest">{Math.round(goalPercent)}% Complete</p>
              </div>
            )}

            <button 
              onClick={() => navigate("/insights")}
              className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 p-6 md:p-8 rounded-[32px] flex items-center justify-between group hover:scale-[1.02] transition-all shadow-xl shadow-purple-500/10"
            >
              <div className="text-left">
                <h4 className="text-lg font-black uppercase tracking-tighter italic">Intelligence</h4>
                <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-1">Velocity Check</p>
              </div>
              <FiActivity size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}