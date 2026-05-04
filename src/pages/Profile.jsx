import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { FiUser, FiLogOut, FiTrash2, FiMail, FiSmartphone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext); 
  const { deleteUserAccount } = useContext(AppContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Are you sure you want to log out? Your session will be securely terminated.");
    logout();
    alert("Session ended. See you next time, Sensei! 👋");
    navigate('/login');
  };

  const handleDelete = async () => {
    const confirm = window.confirm("SECURITY ALERT: This will permanently purge your financial data. Proceed?");
    if (confirm) {
      const success = await deleteUserAccount();
      if (success) {
        logout();
        navigate('/register');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black tracking-tighter mb-12">User Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Identity Card */}
          <div className="md:col-span-8 bg-zinc-900 p-10 rounded-[48px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <FiUser size={120} />
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-2 block">Operative Name</label>
                <p className="text-3xl font-bold">{user?.name || "Atharva Pawar"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-2 block">Email Address</label>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <FiMail className="text-purple-500" />
                    <span>{user?.email || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-2 block">Mobile Access</label>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <FiSmartphone className="text-green-500" />
                    <span>{user?.mobile || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <button 
              onClick={handleLogout}
              className="w-full bg-zinc-800 hover:bg-zinc-700 p-6 rounded-[32px] flex items-center justify-center gap-4 font-black transition-all"
            >
              <FiLogOut className="text-purple-500" />
              LOGOUT
            </button>

            <button 
              onClick={handleDelete}
              className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white p-6 rounded-[32px] flex items-center justify-center gap-4 font-black text-red-500 transition-all border border-red-500/20"
            >
              <FiTrash2 />
              DELETE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;