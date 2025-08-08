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
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          console.log("🧠 Dados recebidos de /api/auth/me:", data)
          setUser(data) // 👈 data já é o usuário completo
        } else {
          console.warn("Resposta não OK em /api/auth/me")
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
