import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { authService } from '../services/api'; 
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; 
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        login(res.user, res.token); 
        const otpRes = await api.post('/api/auth/send-otp');
        if (otpRes.data.success) {
          alert("Security Code Dispatched! 🔐");
          navigate('/verify-access'); 
        }
      } else { alert(res.msg || "Invalid Credentials"); }
    } catch (err) { alert("Server error."); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505]">
      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-r border-white/5">
        <h1 className="text-6xl font-black tracking-tighter">ExpenseSensei</h1>
      </div>

      <div className="flex flex-col justify-center p-8 md:p-24 text-white">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold mb-10">Access Workspace</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Email Address</label>
              <div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 rounded-2xl outline-none" placeholder="name@company.com" /></div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Security Key</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Authenticating..." : "SEND ACCESS CODE"} <FiArrowRight />
            </button>
          </form>
          <p className="mt-8 text-center text-zinc-500 text-sm font-medium">New operative? <Link to="/register" className="text-purple-500 font-bold hover:underline">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;