"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, MessageCircle, Settings, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/userContext";

const menuItems = [
  { title: "Dashboard", icon: MessageCircle, href: "/dashboard" },
];

export function WhatsAppSidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

  
      // 2. Encerrar a sessão no backend do WhatsApp (seu código original)
      // Você pode manter esta chamada se ela for necessária para o seu fluxo.
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/encerrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numsession: user?.id,
        }),
      });
  
      // 3. Redirecionar para a página de login
      // Faça isso somente DEPOIS que as chamadas de API forem concluídas.
      router.push("/login");
  
    } catch (error) {
      console.error("Erro ao sair:", error);
      // Adicione um feedback visual de erro para o usuário se desejar
    } finally {
      setIsLoggingOut(false);
    }
  };
  

  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-4 py-2">
          {mounted && (
            <Image
              src={
                theme === "dark"
                  ? "/images/zappio-logo-dark.svg"
                  : "/images/zappio-logo-light.svg"
              }
              width={100}
              height={34}
              alt="ZappiO Logo"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 mt-10">
        <SidebarMenu className="flex flex-col gap-1">
          {menuItems.map(({ title, icon: Icon, href }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={title}
                size="lg"
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  <span>{title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 pt-1">
        <div className="px-2 py-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-1 px-2 h-8 text-xs cursor-pointer"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src="/placeholder.svg?height=34&width=34"
                    alt="User"
                  />
                  <AvatarFallback className="bg-green-600 text-white">
                    {user?.name || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs ml-2 font-medium">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-3 w-3" />
                <span className="text-xs">Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2"
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-3 w-3" />
                ) : (
                  <Moon className="mr-2 h-3 w-3" />
                )}
                <span className="text-xs">
                  {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="mr-2 h-3 w-3" />
                <span className="text-xs">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
