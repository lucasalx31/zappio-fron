'use client'

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
}

type UserContextType = {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])
  return {
    user,
    loading,
    children
  }
}

export const useUser = () => useContext(UserContext)
