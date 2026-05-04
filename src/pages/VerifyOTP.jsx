import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Navigate } from 'react-router-dom';

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60); 
  const [canResend, setCanResend] = useState(false);
  const { completeVerification, isLoggedIn, isVerified } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const preventBack = () => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', preventBack);
    return () => window.removeEventListener('popstate', preventBack);
  }, []);

  if (isLoggedIn === false) return <Navigate to="/login" />;
  if (isVerified === true) return <Navigate to="/" />;

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post('/api/auth/send-otp');
      alert("New code dispatched to your inbox! 📧");
      setTimer(60);
      setCanResend(false);
    } catch (err) { alert("Failed to resend. Try again later."); }
  };

  const handleVerify = async () => {
    try {
      const res = await api.post('/api/auth/verify-otp', { otp: otp.trim() });
      if (res.data.success) {
        alert("Identity verified! Welcome back, Sensei. 🔓");
        completeVerification(); 
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Code");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-12 rounded-[48px] border border-white/5 text-center max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Sensei Access</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-8">Valid for 5 Minutes</p>
        
        <input 
          className="w-full bg-black border border-white/10 p-6 rounded-3xl text-center text-3xl font-black tracking-[0.5em] mb-8 outline-none text-white focus:border-purple-500 transition-all"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)} 
        />
        
        <button onClick={handleVerify} className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all mb-4">
          Verify Identity
        </button>

       
        <div className="mt-4">
          {canResend ? (
            <button onClick={handleResend} className="text-purple-500 font-bold uppercase text-[10px] tracking-widest hover:underline">
              Didn't receive? Resend Code
            </button>
          ) : (
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
              Resend available in {timer}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}