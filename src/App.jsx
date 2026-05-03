// App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Navigation from './components/Navigation';
import GoalTrackerScreen from './pages/GoalTrackerScreen';
import TransactionsScreen from './pages/TransactionScreen';
import ChatBotScreen from './pages/ChatBotScreen';
import Profile from './pages/Profile';
import Insights from './pages/InsightScreen';

const ProtectedLayout = ({ children }) => {
  const { isLoggedIn, isLoading, isVerified } = useContext(AuthContext);

  if (isLoading) return <div className="bg-[#050505] h-screen" />; 
  if (!isLoggedIn) return <Navigate to="/login" replace />; 
  if (!isVerified) return <Navigate to="/verify-access" replace />;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#050505]">
      <Navigation />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="bg-[#050505] text-white">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-access" element={<VerifyOTP />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/add" element={<ProtectedLayout><AddTransaction /></ProtectedLayout>} />
        <Route path="/goals" element={<ProtectedLayout><GoalTrackerScreen /></ProtectedLayout>} />
        <Route path="/transactions" element={<ProtectedLayout><TransactionsScreen /></ProtectedLayout>} />
        <Route path="/chatbot" element={<ProtectedLayout><ChatBotScreen /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/insights" element={<ProtectedLayout><Insights /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;