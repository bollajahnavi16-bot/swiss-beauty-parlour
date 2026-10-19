import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConfigValidation,
  getUserRole,
  getCustomerProfile,
  upsertCustomerProfile,
  sendPasswordResetEmail,
  updateUserPassword,
  type UserRole,
  type CustomerProfile
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  customerProfile: CustomerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: UserRole }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: Error | null; role: UserRole }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  sendPasswordReset: (email: string, redirectTo?: string) => Promise<{ success: boolean; error: Error | null; isRateLimited?: boolean }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize user profile & role based on active Supabase session
  const syncUserState = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setUser(null);
      setSession(null);
      setRole(null);
      setCustomerProfile(null);
      setLoading(false);
      return;
    }

    try {
      setUser(activeUser);
      // Determine role strictly from database verification
      const userRole = await getUserRole(activeUser);
      setRole(userRole);

      // If customer, fetch their profile
      if (userRole === 'customer') {
        const { data: profile } = await getCustomerProfile(activeUser.id);
        setCustomerProfile(profile);
      } else {
        setCustomerProfile(null);
      }
    } catch (err) {
      console.error('Error synchronizing user state:', err);
      setRole('customer');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session and attach auth state listener
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (!isSupabaseConfigured()) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          await syncUserState(initialSession?.user || null);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      await syncUserState(currentSession?.user || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserState]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; role: UserRole }> => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          getSupabaseConfigValidation().error ||
          'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
        ),
        role: null,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: new Error(error.message), role: null };
      }

      if (data.user) {
        setUser(data.user);
        const resolvedRole = await getUserRole(data.user);
        setRole(resolvedRole);

        if (resolvedRole === 'customer') {
          const { data: profile } = await getCustomerProfile(data.user.id);
          setCustomerProfile(profile);
        }

        return { error: null, role: resolvedRole };
      }

      return { error: new Error('Authentication succeeded but user is missing.'), role: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Sign in failed.'),
        role: null,
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ error: Error | null; role: UserRole }> => {
    if (!isSupabaseConfigured()) {
      return {
        error: new Error(
          getSupabaseConfigValidation().error ||
          'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
        ),
        role: null,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        return { error: new Error(error.message), role: null };
      }

      if (data.user) {
        setUser(data.user);
        // Create profile in customer_profiles
        await upsertCustomerProfile(data.user.id, fullName, phone);
        setRole('customer');
        setCustomerProfile({
          id: data.user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          created_at: new Date().toISOString(),
        });

        return { error: null, role: 'customer' };
      }

      return {
        error: new Error('Registration complete. Please check your email to verify your account.'),
        role: null,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Registration failed.'),
        role: null,
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
      setCustomerProfile(null);
    }
  };

  const refreshAuth = async () => {
    const { data: { session: curSession } } = await supabase.auth.getSession();
    setSession(curSession);
    await syncUserState(curSession?.user || null);
  };

  const sendPasswordReset = async (email: string, redirectTo?: string) => {
    return await sendPasswordResetEmail(email, redirectTo);
  };

  const updatePassword = async (password: string) => {
    return await updateUserPassword(password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        customerProfile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshAuth,
        sendPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
