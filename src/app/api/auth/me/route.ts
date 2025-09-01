import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(_: NextRequest) {
  try {
    const token = cookies().get("auth-token");
    if (!token) return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });

    const decoded = verify(token.value, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });

    return NextResponse.json(user);
  } catch (e) {
    console.error("Auth check error:", e);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

// Atualiza APENAS nome/email
export async function PATCH(request: NextRequest) {
  try {
    const token = cookies().get("auth-token");
    if (!token) return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });

    const { userId } = verify(token.value, JWT_SECRET) as { userId: string };
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const emailRaw = typeof body?.email === "string" ? body.email.trim() : undefined;
    const email = emailRaw ? emailRaw.toLowerCase() : undefined;

    if (!name && !email) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    if (email) {
      const exists = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
        select: { id: true },
      });
      if (exists) return NextResponse.json({ error: "Email já está em uso" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /auth/me error:", e);
    return NextResponse.json({ error: "Falha ao atualizar perfil" }, { status: 500 });
  }
}
