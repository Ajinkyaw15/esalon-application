import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/authApi'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

interface AuthState {
  token: string | null
  email: string | null
  firstName: string | null
  lastName: string | null
  role: string | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const STORAGE_KEYS = {
  token: 'token',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
} as const

function loadAuthFromStorage(): AuthState {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    email: localStorage.getItem(STORAGE_KEYS.email),
    firstName: localStorage.getItem(STORAGE_KEYS.firstName),
    lastName: localStorage.getItem(STORAGE_KEYS.lastName),
    role: localStorage.getItem(STORAGE_KEYS.role),
  }
}

function persistAuth(data: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.token, data.token)
  localStorage.setItem(STORAGE_KEYS.email, data.email)
  localStorage.setItem(STORAGE_KEYS.firstName, data.firstName)
  localStorage.setItem(STORAGE_KEYS.lastName, data.lastName)
  localStorage.setItem(STORAGE_KEYS.role, data.role)
}

function clearAuthStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuthFromStorage)

  const applyAuth = useCallback((data: AuthResponse) => {
    persistAuth(data)
    setAuth({
      token: data.token,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    })
  }, [])

  const login = useCallback(
    async (data: LoginRequest) => {
      const res = await authApi.login(data)
      applyAuth(res.data)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await authApi.register(data)
      applyAuth(res.data)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    clearAuthStorage()
    setAuth({
      token: null,
      email: null,
      firstName: null,
      lastName: null,
      role: null,
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token),
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
