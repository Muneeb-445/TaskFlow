import { useState } from 'react'

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const completeLogin = () => {
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setIsLoggedIn(false)
  }

  return {
    isLoggedIn,
    authLoading,
    setAuthLoading,
    completeLogin,
    logout,
  }
}