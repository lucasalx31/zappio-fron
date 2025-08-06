import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get('auth-token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token não encontrado' },
        { status: 401 }
      )
    }

    const decoded = verify(token.value, JWT_SECRET) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
} 