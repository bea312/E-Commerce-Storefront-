import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../lib/api';
import { storage } from '../lib/storage';
import type { AuthSession, LoginPayload, RegisterPayload, Role } from '../types/api';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  userRole: Role | null;
  isAdmin: boolean;
  isUser: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(() => storage.getAuth());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.token || !session.isApiBacked) {
      return;
    }

    let isMounted = true;
    apiService
      .getCurrentUser()
      .then((user) => {
        if (!isMounted) {
          return;
        }
        const nextSession: AuthSession = {
          ...session,
          user: {
            ...user,
            role: session.user.role,
          },
        };
        setSession(nextSession);
        storage.setAuth(nextSession);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setSession(null);
        storage.clearAuth();
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      userRole: session?.user.role ?? null,
      isAdmin: session?.user.role === 'ADMIN',
      isUser: session?.user.role === 'USER',
      isLoading,
      async login(payload) {
        setIsLoading(true);
        try {
          const nextSession = await apiService.login(payload);
          setSession(nextSession);
          storage.setAuth(nextSession);
          toast.success(`Welcome back, ${nextSession.user.name}.`);
          return nextSession;
        } catch (error) {
          toast.error(apiService.extractErrorMessage(error));
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      async register(payload) {
        setIsLoading(true);
        try {
          await apiService.register(payload);
          toast.success('Account created. You can log in now.');
        } catch (error) {
          toast.error(apiService.extractErrorMessage(error));
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      logout() {
        setSession(null);
        storage.clearAuth();
        storage.clearCart();
        toast.success('Session cleared.');
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
