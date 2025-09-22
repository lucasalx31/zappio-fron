import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { success: false, error: 'Credenciais inválidas' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { success: false, error: 'Credenciais inválidas' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Sua conta está inativa. Entre em contato com o suporte.' }
    }

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    }
  } catch {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function createUser(name: string, email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return { 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'Email já está em uso' }
    }
    return { success: false, error: 'Erro interno do servidor' }
  }
} 