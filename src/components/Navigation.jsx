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

  // Helper function to highlight active tab
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome size={20} /> },
    { name: 'Add', path: '/add', icon: <FiPlusCircle size={20} /> },
    { name: 'Logs', path: '/transactions', icon: <FiList size={20} /> },
    { name: 'Goals', path: '/goals', icon: <FiTarget size={20} /> },
    { name: 'Insights', path: '/insights', icon: <FiPieChart size={20} /> },
    { name: 'Sensei', path: '/chatbot', icon: <FiMessageSquare size={20} /> },
  ];

  return (
    <>
      {/* Desktop Top Header (Hidden on Mobile)[cite: 33] */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="font-black text-white text-xs">ES</span>
          </div>
          <span className="font-black tracking-tighter text-xl">ExpenseSensei</span>
        </div>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
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
          <Link to="/profile" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
            <FiUser size={18} />
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] px-4 py-3 shadow-2xl shadow-purple-500/10">
        <div className="flex justify-between items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex flex-col items-center flex-1 py-1"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive(link.path) 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 -translate-y-1' 
                  : 'text-gray-500'
              }`}>
                {link.icon}
              </div>
              <span className={`text-[10px] mt-1 font-black uppercase tracking-tighter ${
                isActive(link.path) ? 'text-purple-500' : 'text-gray-500'
              }`}>
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Padding for content so it doesn't get hidden under fixed navs[cite: 33] */}
      <div className="md:pt-20" />
    </>
  );
};

export default Navigation;