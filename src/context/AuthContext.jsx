import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (code) => {
    const { user, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.href, 
      },
    });

    if (error) {
      console.error('Error logging in:', error.message);
      return false;
    }
    setUser(user);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
