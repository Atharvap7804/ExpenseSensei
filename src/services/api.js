import axios from "axios";

const API_URL = "https://expensesensei-backend.onrender.com/api"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: "Login failed" };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData);
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: "Registration failed" };
    }
  },

  updateLimit: async (limit) => {
    try {
      const response = await api.put("/api/auth/limit", { limit });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false };
    }
  }
};

export const goalService = {
  getGoal: async () => {
    try {
      const response = await api.get("/api/goals");
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },
  saveGoal: async (goalData) => {
    try {
      const response = await api.post("/api/goals", goalData);
      return response.data;
    } catch (error) {
      return { success: false };
    }
  }
};

export const transactionServices = {
  getTransactions: async () => {
    try {
      const response = await api.get("/api/transactions");

      return response.data; 
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
      return { success: false, message: "Failed to load transactions" };
    }
  },

 
  addTransaction: async (amount, category, note, type, receiptImage = null) => {
    try {
      const response = await api.post("/api/transactions/add", { 
        amount: parseFloat(amount),
        category,
        note,
        type,
        receiptImage 
      });

      return response.data;
    } catch (error) {
      console.error("Add Transaction Error:", error);
      return { success: false, message: error.response?.data?.message || "Add failed" };
    }
  }
};

export default api;