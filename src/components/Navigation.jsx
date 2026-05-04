import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiPlusCircle, 
  FiList, 
  FiTarget, 
  FiPieChart, 
  FiMessageSquare,
  FiUser
} from 'react-icons/fi';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Added Profile to the main array for easier mapping on mobile
  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome size={20} /> },
    { name: 'Add', path: '/add', icon: <FiPlusCircle size={20} /> },
    { name: 'Logs', path: '/transactions', icon: <FiList size={20} /> },
    { name: 'Goals', path: '/goals', icon: <FiTarget size={20} /> },
    { name: 'Insights', path: '/insights', icon: <FiPieChart size={20} /> },
    { name: 'Sensei', path: '/chatbot', icon: <FiMessageSquare size={20} /> },
    { name: 'Profile', path: '/profile', icon: <FiUser size={20} /> }, // 🔥 Added for Mobile
  ];

  return (
    <>
      {/* Desktop Top Header */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="font-black text-white text-xs">ES</span>
          </div>
          <span className="font-black tracking-tighter text-xl text-white">ExpenseSensei</span>
        </div>

        <div className="flex items-center gap-8">
          {navLinks.slice(0, 6).map((link) => ( // Show first 6 on desktop
            <Link 
              key={link.path}
              to={link.path}
              className={`text-sm font-bold transition-all hover:text-purple-500 ${
                isActive(link.path) ? 'text-purple-500' : 'text-gray-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/profile" className={`p-2 rounded-full transition-colors ${
            isActive('/profile') ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          }`}>
            <FiUser size={18} />
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Optimized for 7 items */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-[28px] px-2 py-2 shadow-2xl shadow-purple-900/20">
        <div className="flex justify-around items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex flex-col items-center py-1"
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive(link.path) 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 -translate-y-1' 
                  : 'text-zinc-500'
              }`}>
                {/* Scale icons down slightly to fit 7 items comfortably[cite: 7] */}
                {React.cloneElement(link.icon, { size: 18 })} 
              </div>
              <span className={`text-[8px] mt-1 font-bold uppercase tracking-tighter ${
                isActive(link.path) ? 'text-purple-500' : 'text-zinc-600'
              }`}>
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="md:pt-20" />
    </>
  );
};

export default Navigation;