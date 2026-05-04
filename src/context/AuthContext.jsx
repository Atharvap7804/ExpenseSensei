
import React, { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");
   
    const verifiedStatus = localStorage.getItem("isVerified") === "true";
    
    if (token && savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        setIsVerified(verifiedStatus);
      } catch (e) {
        logout(); 
      }
    } else {
      setIsLoggedIn(false);
      setIsVerified(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { checkAuthStatus(); }, [checkAuthStatus]);

  const login = (userData, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isVerified", "false"); 
    setUser(userData);
    setIsLoggedIn(true);
    setIsVerified(false);
  };

  const completeVerification = () => {
    localStorage.setItem("isVerified", "true");
    setIsVerified(true);
  };

  const logout = () => {
    alert("Are you sure you want to log out? Your session will be securely terminated.");
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    setIsVerified(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, isVerified, login, logout, user, completeVerification }}>
      {children}
    </AuthContext.Provider>
  );
}