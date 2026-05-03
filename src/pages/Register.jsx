import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { FiUser, FiMail, FiLock, FiPhone, FiGlobe, FiChevronDown, FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', gender: 'Male', limit: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [rawMobile, setRawMobile] = useState("");
  const [loading, setLoading] = useState(false);
  
  
  const [passFeedback, setPassFeedback] = useState({ isStrong: false, message: '', color: '' });
  const navigate = useNavigate();

 
  useEffect(() => {
    const p = formData.password;
    if (!p) {
      setPassFeedback({ isStrong: false, message: '', color: '' });
      return;
    }

    const hasCapital = /[A-Z]/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    const hasThreeNumbers = (p.match(/\d/g) || []).length >= 3;
    const isLongEnough = p.length >= 8;

    if (hasCapital && hasSpecial && hasThreeNumbers && isLongEnough) {
      setPassFeedback({ isStrong: true, message: 'Strong password', color: 'text-green-500' });
    } else {
      setPassFeedback({ isStrong: false, message: 'Password does not match conditions', color: 'text-red-500' });
    }
  }, [formData.password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!passFeedback.isStrong) {
      return alert("Please fulfill all security requirements before initializing profile.");
    }
    setLoading(true);
    try {
      const submissionData = { 
        ...formData, 
        mobile: `${countryCode}${rawMobile}`, 
        limit: formData.limit ? parseFloat(formData.limit) : 0 
      };
      const res = await authService.register(submissionData);
      if (res.success) {
        alert("Operative Registered. 🔐");
        navigate('/login');
      } else { alert(res.message || "Registration error"); }
    } catch (err) { alert("Registration error."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505] text-white">
     
      <div className="hidden lg:flex flex-col justify-center p-12 bg-[#0a0a0a] order-2">
        <div className="p-10 border border-white/5 rounded-[40px] bg-zinc-900/30 backdrop-blur-xl">
           <h3 className="text-3xl font-bold mb-4 tracking-tight">Sensei Security</h3>
           <ul className="text-zinc-400 text-sm space-y-3 mb-8 italic">
             <li className={formData.password.length >= 8 ? 'text-green-500' : ''}>• Minimum 8 Characters</li>
             <li className={/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}>• At least 1 Capital Letter</li>
             <li className={/[!@#$%^&*()]/.test(formData.password) ? 'text-green-500' : ''}>• At least 1 Special Character</li>
             <li className={(formData.password.match(/\d/g) || []).length >= 3 ? 'text-green-500' : ''}>• At least 3 Numbers</li>
           </ul>
        </div>
      </div>

    
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 order-1 overflow-y-auto no-scrollbar">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-black mb-10 tracking-tighter uppercase">New Operative</h2>
          
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="Atharva Pawar" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500" placeholder="sensei@example.com" />
              </div>
            </div>

           
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Mobile Access</label>
              <div className="flex gap-2">
                <div className="relative w-32">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10 text-xs" />
                  <select 
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 p-4 pl-9 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer font-bold text-sm"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
                <div className="relative flex-1 group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="tel" required 
                    value={rawMobile} 
                    onChange={(e) => setRawMobile(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

     
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl outline-none font-bold">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Audit Limit</label>
                <input type="number" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl outline-none font-bold" placeholder="50000" />
              </div>
            </div>

           
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Security Key</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type={showPassword ? "text" : "password"} required 
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-zinc-900 border p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 transition-all ${passFeedback.message ? (passFeedback.isStrong ? 'border-green-500/50 focus:ring-green-500/20' : 'border-red-500/50 focus:ring-red-500/20') : 'border-white/5 focus:ring-purple-500'}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {/* Feedback Message */}
              {passFeedback.message && (
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-2 px-2 animate-in fade-in slide-in-from-top-1 ${passFeedback.color}`}>
                  {passFeedback.isStrong ? <FiCheckCircle /> : <FiXCircle />}
                  {passFeedback.message}
                </div>
              )}
            </div>

            <button disabled={loading || (formData.password && !passFeedback.isStrong)} className="w-full bg-white text-black py-5 rounded-[24px] font-black mt-4 uppercase text-xs tracking-widest disabled:opacity-30 hover:bg-zinc-200 transition-all">
              {loading ? "Initializing..." : "Register Operative"}
            </button>
          </form>
          <p className="mt-8 text-center text-zinc-500 text-sm">
            Authorized entry? <Link to="/login" className="text-white font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;