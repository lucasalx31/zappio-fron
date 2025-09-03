'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type User = {
  id: string
  name: string
  email: string
}

type UserContextType = {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  fetchUser: () => Promise.resolve(),
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setLoading(true) 
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        //console.log('🧠 Dados recebidos de /api/auth/me:', data)
        setUser(data)
      } else {
        //console.warn('Resposta não OK em /api/auth/me, limpando usuário.')
        setUser(null) 
      }
    } catch{
      //console.error('Erro ao carregar usuário:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider value={{ user, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext);