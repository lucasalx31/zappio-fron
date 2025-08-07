"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        return
      }

      // Redirecionar para login após registro bem-sucedido
      router.push("/login?message=Conta criada com sucesso!")
    } catch (error) {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    // Implementar registro com Google aqui
    setTimeout(() => {
      setGoogleLoading(false)
    }, 2000)
  }

  const logoSrc = theme === "dark"
    ? "/images/zappio-logo-dark.png"
    : "/images/zappio-logo-light.png"

  return (
    <div className="min-h-screen flex flex-col px-10">
      <div className="flex px-2">
        <Link href="/">
          {mounted && (
            <Image
              src={logoSrc || "/placeholder.svg"}
              width={120}
              height={40}
              alt="Zappio Logo"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 justify-center items-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--foreground)]">Crie sua conta</h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="name">Nome</Label>
              </div>
              <div className="mt-2">
                <Input
                  type="text"
                  id="name"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && error.includes("email") && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="mt-2">
                <Input
                  type="email"
                  id="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && error.includes("email") && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="mt-2">
                <Input
                  type="password"
                  id="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && error.includes("senha") && error.includes("6 caracteres") && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              </div>
              <div className="mt-2">
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && error.includes("coincidem") && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-xs transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer h-9 items-center ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-500">Ou continue com</span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 cursor-pointer bg-transparent"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>{googleLoading ? "Conectando..." : "Google"}</span>
              </Button>
            </div>
          </div>
          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-600 transition duration-300 hover:text-green-700"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
