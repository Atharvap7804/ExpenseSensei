import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api, { transactionServices, goalService } from "../services/api";
import { AuthContext } from "./AuthContext";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [expense, setExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [limit, setLimit] = useState(0);
  const [savings, setSavings] = useState(0);
  const [activeGoal, setActiveGoal] = useState(null);
  const [goals, setGoals] = useState([]);

const fetchData = useCallback(async () => {
  if (!isLoggedIn) return;
  try {
    const res = await transactionServices.getTransactions();
    if (res.success) {
      const txns = res.transactions || [];
      const userLimit = res.user?.limit || 0;
      setTransactions(txns);
      setLimit(userLimit);
      const totalIncome = txns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const totalExpense = txns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      setIncome(totalIncome);
      setExpense(totalExpense);
      setBalance(totalIncome - totalExpense);
      setSavings(Math.max(0, totalIncome - totalExpense));
    }
  } catch (error) {
    console.error(error);
  }
  const goalRes = await goalService.getGoal();
  if (goalRes.success) {
    const goalData = goalRes.goal || goalRes.data;
    const goalsArray = Array.isArray(goalData) ? goalData : goalData ? [goalData] : [];
    setGoals(goalsArray);
    setActiveGoal(goalsArray[0] || null);
  }
}, [isLoggedIn]);

  useEffect(() => { fetchData(); }, [fetchData]);


const contributeToGoal = async (goalId, amount) => {
  try {
    
    const res = await api.patch(`/api/goals/${goalId}/contribute`, { amount });
    
    if (res.data.success) {
    
      const updatedGoal = res.data.goal;

      setGoals(prev => prev.map(g => 
        g._id === goalId ? updatedGoal : g
      ));

      
      setActiveGoal(prev => prev?._id === goalId ? updatedGoal : prev);

      
      await fetchData(); 
      return true;
    }
    return false;
  } catch (error) {
    console.error("Contribution Error:", error);
    return false;
  }
};

  const deleteGoal = async (id) => {
    try {
      const res = await api.delete(`/api/goals/${id}`);
      if (res.data.success) { await fetchData(); return true; }
      return false;
    } catch (error) { return false; }
  };

  const setMonthlyGoal = async (goalData) => {
    const res = await goalService.saveGoal(goalData);
    if (res.success) { await fetchData(); return true; }
    return false;
  };
  
const addTransaction = async (amount, category, note, type, receiptImage = null) => {
  try {
    // 🔥 Ensure the payload includes receiptImage
    const res = await api.post("/api/transactions/", {
      amount,
      category,
      note,
      type,
      receiptImage 
    });

    if (res.data.success) {
      await fetchData(); 
      return true;
    }
    return false;
  } catch (error) {
    console.error("Context Error:", error);
    return false;
  }
};
  const deleteUserAccount = async () => {
  try {
    const res = await api.delete('/api/auth/delete-account')
    return res.data.success;
  } catch (error) {
    console.error("Account Purge Error:", error);
    return false;
  }
};
const updateBudgetLimit = async (newLimit) => {
    const numericLimit = typeof newLimit === 'string' ? parseFloat(newLimit) : newLimit;
    if (isNaN(numericLimit)) return false;
    const { authService } = await import('../services/api');
    const res = await authService.updateLimit(numericLimit);
    if (res.success) {
      setLimit(numericLimit); 
      return true;
    }
    return false;
  };

  const getWeeklyStats = () => {
  const last7Days = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({
      day: days[d.getDay()],
      date: d.toISOString().split('T')[0], 
      expense: 0
    });
  }

 
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const tDate = new Date(t.date || t.createdAt).toISOString().split('T')[0];
      const dayMatch = last7Days.find(d => d.date === tDate);
      if (dayMatch) {
        dayMatch.expense += parseFloat(t.amount) || 0;
      }
    }
  });

  return last7Days;
};
  return (
    <AppContext.Provider value={{ 
      transactions, balance, expense, income, limit,addTransaction, savings, activeGoal, goals,
      fetchData, setMonthlyGoal, deleteGoal, contributeToGoal ,deleteUserAccount, updateBudgetLimit, getWeeklyStats
    }}>
      {children}
    </AppContext.Provider>
  );
};