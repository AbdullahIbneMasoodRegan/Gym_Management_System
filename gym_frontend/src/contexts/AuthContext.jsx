import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // New: Track role (admin, trainer, staff)
  const [userId, setUserId] = useState(null); // New: Track TrainerID or StaffID
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loginWithRole = (newRole, newUserId) => {
    setRole(newRole);
    setUserId(newUserId);
    localStorage.setItem("role", newRole);
    localStorage.setItem("userId", newUserId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUserId(null);
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
  };

  const value = {
    user,
    role,
    userId,
    loading,
    loginWithRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};