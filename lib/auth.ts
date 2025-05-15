"use client"

import { useState, useEffect } from "react"

// Generate a unique tab ID if one doesn't exist
const getTabId = () => {
  if (typeof window === "undefined") return "";
  
  let tabId = sessionStorage.getItem("tab_id");
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("tab_id", tabId);
  }
  return tabId;
}

// Get storage key with tab ID prefix to isolate sessions
const getStorageKey = (key: string) => {
  const tabId = getTabId();
  return `${tabId}_${key}`;
}

// User interface
interface User {
  _id: string;
  [key: string]: any;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<"admin" | "student" | "atc" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = sessionStorage.getItem(getStorageKey("auth_token"))
    const type = sessionStorage.getItem(getStorageKey("user_type"))
    const userId = sessionStorage.getItem(getStorageKey("current_user_id"))

    if (token && type) {
      setIsAuthenticated(true)
      setUserType(type as "admin" | "student" | "atc")
      
      // Set user data if available
      if (userId) {
        setUser({ _id: userId })
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (type: "admin" | "student" | "atc", identifier: string, password: string) => {
    try {
      console.log(`Attempting ${type} login with identifier: ${identifier}`);
      
      // Use API for admin authentication instead of hardcoded values
      if (type === "admin") {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'admin',
              identifier: identifier,
              password: password
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              const token = `admin-${result.user._id}`;
              sessionStorage.setItem(getStorageKey("auth_token"), token)
              sessionStorage.setItem(getStorageKey("user_type"), "admin")
              sessionStorage.setItem(getStorageKey("current_user_id"), result.user._id)
              
              // Set admin_token cookie (this is what middleware.ts checks for)
              document.cookie = `admin_token=${token}; path=/; max-age=43200; SameSite=Lax`
              
              // Also set a general auth token cookie
              document.cookie = `auth_token=${token}; path=/; max-age=43200; SameSite=Lax`
              
              setIsAuthenticated(true)
              setUserType("admin")
              setUser(result.user)
              return true;
            }
          }
          
          console.log(`Admin login failed for identifier: ${identifier}`);
          return false;
        } catch (apiError) {
          console.error("API login error:", apiError);
          return false;
        }
      } else if (type === "student") {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'student',
              identifier: identifier,
              password: password
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              sessionStorage.setItem(getStorageKey("auth_token"), `student-${result.user._id}`)
              sessionStorage.setItem(getStorageKey("user_type"), "student")
              sessionStorage.setItem(getStorageKey("current_user_id"), result.user._id)
              setIsAuthenticated(true)
              setUserType("student")
              setUser(result.user)
              return true;
            }
          }
          
          console.log(`Student login failed for identifier: ${identifier}`);
          return false;
        } catch (apiError) {
          console.error("API login error:", apiError);
          return false;
        }
      } else if (type === "atc") {
        // Use only API for ATC login
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'subcenter',
              identifier: identifier,
              password: password
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              sessionStorage.setItem(getStorageKey("auth_token"), `atc-${result.user._id}`)
              sessionStorage.setItem(getStorageKey("user_type"), "atc")
              sessionStorage.setItem(getStorageKey("current_user_id"), result.user._id)
              setIsAuthenticated(true)
              setUserType("atc")
              setUser(result.user)
              return true;
            }
          }
          
          console.log(`ATC login failed for identifier: ${identifier}`);
          return false;
        } catch (apiError) {
          console.error("API login error:", apiError);
          return false;
        }
      }
      
      console.log(`Login failed for ${type} with identifier: ${identifier}`);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  const logout = () => {
    // Remove token from sessionStorage using tab-specific keys
    sessionStorage.removeItem(getStorageKey("auth_token"))
    sessionStorage.removeItem(getStorageKey("user_type"))
    sessionStorage.removeItem(getStorageKey("current_user_id"))
    
    // Clear admin_token cookie
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setIsAuthenticated(false)
    setUserType(null)
    setUser(null)
  }

  return { isAuthenticated, isLoading, userType, login, logout, user }
}
