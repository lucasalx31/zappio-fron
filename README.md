# 📢 Zappio

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![WppConnect](https://img.shields.io/badge/WppConnect-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)


## 🧭 Visão Geral

O **Zappio** é um SaaS que  facilita o disparo de mensagens no WhatsApp a partir de listas (upload `.xlsx`), com **gerenciamento de sessões** (QR Code), **envio em massa**, **acompanhamento em tempo real** (Socket.IO) e **autenticação** (NextAuth).

Backend em **Node/Express + WppConnect** e **Postgres (Supabase) + Prisma**.

---

## ✨ Funcionalidades

- 📲 **Múltiplas sessões** de WhatsApp por usuário (QR Code no painel).
- 📂 **Upload de planilhas (.xlsx)** e leitura de contatos.
- 💬 **Envio em massa** com feedback em tempo real.
- 🔔 **Status da sessão** (conectado, bateria, dispositivo).
- 👤 **Autenticação** (NextAuth – email/senha).
- 🌓 **Dark/Light mode** e **UI Shadcn**.
- 🧩 **API REST + WebSocket** para integrações externas.

---

## 🧰 Stack

**Frontend**
- Next.js + TypeScript, Tailwind CSS, Shadcn/UI
- Socket.IO Client
- NextAuth (credenciais)

**Backend**
- Node.js + Express
- WppConnect
- Socket.IO
- `xlsx` (parse de planilhas)

**Banco**
- Supabase (PostgreSQL)
- Prisma ORM

---
## 🧪 Pré-requisitos

- Node.js 18+ e PNPM
- Conta no **Supabase**
- Git
- (Opcional) Vercel (frontend) e Render/Railway/VPS (backend)

---

## 🔑 Variáveis de Ambiente (.env)

Create a  `.env.local` file and add your Supabase credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=coloque_uma_chave_aleatoria_longa
AUTH_CREDENTIALS_ENABLE=true
```