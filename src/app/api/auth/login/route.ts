import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

const JWT_NAME = "auth-token";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const result = await authenticateUser(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || "Usuário não encontrado" }, { status: 401 });
    }

    // Gerar o token JWT
    const token = sign(
      { userId: result.user.id, email: result.user.email },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "7d" }
    );

    // Seta o cookie com o token
    const cookieStore = await cookies();
    cookieStore.set(JWT_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });

    return NextResponse.json({ success: true, user: result.user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
