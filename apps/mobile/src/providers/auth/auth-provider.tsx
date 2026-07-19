import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchClient, updateWireConfig, useMutationFn } from 'fetchwire';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { login, logout, register } from '@/apis/auth/auth-apis';
import { STORAGE_KEYS } from '@/constants/app-constants';
import { useOrganizationUtilitiesStore } from '@/hooks/use-organization-utility-store';
import { usePersonalUtilitiesStore } from '@/hooks/use-personal-utility-store';
import { CreateUserRequest, LocalSignInRequest } from '@/interfaces/auth-interfaces';
import { UserResponse } from '@/interfaces/user-interfaces';
import { tokenManager } from '@/utils/class/token-manager';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface AuthContextType {
  isLoading: boolean;
  currentUser: UserResponse | null;
  performLogin: ({ email, password }: { email: string; password: string }) => Promise<boolean>;
  performRegister: (payload: CreateUserRequest) => Promise<boolean>;
  performLogout: () => Promise<void>;
  performSync: (user: UserResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  currentUser: null,
  performLogin: async () => false,
  performRegister: async () => false,
  performLogout: async () => {},
  performSync: async () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { executeMutationFn: signIn } = useMutationFn((data: LocalSignInRequest) => login(data));
  const { executeMutationFn: signUp } = useMutationFn((data: CreateUserRequest) => register(data));
  const performLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await signIn(
        { email, password },
        {
          onError: (error) => {
            Alert.alert('Đăng nhập thất bại', generateErrorMessage(error, 'Lỗi không xác định'));
          },
        },
      );

      if (response && response.status === 200 && response.data?.user) {
        const { user, accessToken, refreshToken } = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        await tokenManager.storeAuthTokens({ accessToken, refreshToken });
        // wait for storage to complete before updating state to avoid race conditions
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const performRegister = async (payload: CreateUserRequest): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await signUp(payload, {
        onError: (error) => {
          Alert.alert('Đăng ký thất bại', generateErrorMessage(error, 'Lỗi không xác định'));
        },
      });
      return !!response;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = async () => {
    setIsLoading(true);
    try {
      // ─── Revoke the session server-side first ───────────────────────────────
      const refreshToken = await tokenManager.getStoredRefreshToken();
      if (refreshToken) {
        await logout(refreshToken);
      }

      setCurrentUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      await tokenManager.clearAuthTokens();
      usePersonalUtilitiesStore.persist.clearStorage();
      useOrganizationUtilitiesStore.persist.clearStorage();
      fetchClient.clear();
    } catch (error) {
      console.error('Error performing logout', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateWireConfig({
      interceptors: {
        onError: async (error) => {
          if (error.errorCode === 'TOKEN_INVALID') {
            await performLogout();
          }
        },
      },
    });
  }, []);

  const performSync = async (user: UserResponse) => {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, jsonValue);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error performing sync', error);
    }
  };

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            await tokenManager.clearAuthTokens();
          }
        }
      } catch (error) {
        console.error('Error loading storage data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  return (
    // from React 19, AuthContext is enough, no need to AuthContext.Provider
    <AuthContext
      value={{ isLoading, currentUser, performLogin, performRegister, performLogout, performSync }}
    >
      {children}
    </AuthContext>
  );
}
