import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get("auth-token");
    if (!token) return NextResponse.json({ error: "Token não encontrado" }, { status: 401 });

    const { userId } = verify(token.value, JWT_SECRET) as { userId: string };
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Senha muito curta" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }, 
    });
    if (!user?.password) return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /auth/me/password error:", e);
    return NextResponse.json({ error: "Falha ao alterar senha" }, { status: 500 });
  }
}
