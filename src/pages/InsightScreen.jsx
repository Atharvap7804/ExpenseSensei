// pages/InsightScreen.jsx
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import api from "../services/api"; // 🔥 Ensure api is imported
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiZap, FiLoader } from "react-icons/fi";

export default function InsightScreen() {
  const { transactions, getWeeklyStats, limit, balance } = useContext(AppContext);
  const [forecast, setForecast] = useState(null); // 🔥 AI Forecast State
  const [isAiLoading, setIsAiLoading] = useState(false);

 
  useEffect(() => {
    const fetchAIPrediction = async () => {
      setIsAiLoading(true);
      try {
        const res = await api.get('/api/ai/budget-forecast'); 
        if (res.data.success) {
          setForecast(res.data.forecast);
        }
      } catch (err) {
        console.error("Sensei Forecast Error:", err);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchAIPrediction();
  }, []);

  const weeklyDataArray = getWeeklyStats(); 
  const dailyLimit = limit ? limit / 30 : 0;

  const chartData = weeklyDataArray.map((item) => ({
    name: item.day,                  
    Actual: item.expense,            
    Target: Math.round(dailyLimit)   
  }));

  const categoryData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      const amount = parseFloat(curr.amount) || 0;
      if (existing) { 
        existing.value += amount; 
      } else { 
        acc.push({ name: curr.category || "Other", value: amount }); 
      }
      return acc;
    }, []);

  const COLORS = ["#7C3AED", "#22C55E", "#F43F5E", "#FACC15", "#06B6D4"];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-5xl font-black tracking-tighter mb-12">Intelligence</h1>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-8 bg-zinc-900 p-10 rounded-[48px] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-purple-600/20 flex items-center justify-center rounded-xl">
                <FiTrendingUp className="text-purple-500" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-[11px] text-zinc-500">
                7-Day Spending Velocity
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#444" fontSize={12} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '16px' }} 
                  />
                  <Line type="step" dataKey="Actual" stroke="#7C3AED" strokeWidth={4} dot={{ r: 6, fill: '#7C3AED' }} />
                  <Line type="monotone" dataKey="Target" stroke="#F43F5E" strokeDasharray="8 8" opacity={0.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
          
            <div className="bg-zinc-900 p-8 rounded-[48px] border border-white/5">
               <h3 className="text-xl font-bold uppercase tracking-widest text-[11px] text-zinc-500 mb-8 flex items-center gap-3">
                 <FiPieChart className="text-green-500" /> Allocation
               </h3>
               <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
               </div>
            </div>

           
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-[48px] shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-yellow-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Sensei Forecast</h4>
                  </div>
                  {isAiLoading && <FiLoader className="animate-spin text-white" />}
                </div>

                {forecast ? (
                  <>
                    <div className="mb-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-black uppercase ${
                        forecast.riskLevel === 'High' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {forecast.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-2xl font-black mb-1">₹{Math.round(forecast.predictedTotal).toLocaleString()}</p>
                    <p className="text-[10px] text-indigo-200 uppercase font-bold mb-6">Predicted month-end total</p>
                    
                    <div className="space-y-3">
                      {forecast.tips.slice(0, 2).map((tip, i) => (
                        <div key={i} className="bg-black/20 p-3 rounded-2xl text-[11px] border border-white/5">
                          ✨ {tip}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-indigo-200 italic">Analyzing spending velocity...</p>
                )}
              </div>
              {/* Background Glow */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 filter blur-[80px] opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}