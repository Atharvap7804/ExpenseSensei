// pages/VerifyOTP.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Navigate } from 'react-router-dom';

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const { completeVerification, isLoggedIn, isVerified } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isLoggedIn === false) return <Navigate to="/login" />;
  if (isVerified === true) return <Navigate to="/" />;

  const handleVerify = async () => {
    try {
      
      const res = await api.post('/api/auth/verify-otp', { otp: otp.trim() });
      
      if (res.data.success) {
        alert("Identity Verified! Welcome to the Workspace. 🔓");
        completeVerification(); 
        navigate('/')
      }
    } catch (err) {
    
      const msg = err.response?.data?.message || "Invalid Code";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-12 rounded-[48px] border border-white/5 text-center max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter text-white">Sensei Access</h2>
        <input 
          className="w-full bg-black border border-white/10 p-6 rounded-3xl text-center text-3xl font-black tracking-[0.5em] mb-8 outline-none text-white focus:border-purple-500 transition-all"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)} 
        />
        <button onClick={handleVerify} className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
          Verify Identity
        </button>
      </div>
    </div>
  );
}