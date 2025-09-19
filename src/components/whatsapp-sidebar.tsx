"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, MessageCircle, Settings, LogOut, Info, Menu, BarChart3 } from "lucide-react";
import { Sidebar,SidebarHeader,SidebarContent,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/userContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
  { title: "Dashboard", icon: MessageCircle, href: "/dashboard" },
  // { title: "Relatórios", icon: BarChart3, href: "/report" },
  { title: "Ajuda", icon: Info, href: "/help" }
];

export function WhatsAppSidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/encerrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numsession: user?.id,
        }),
      });

      router.push("/login");
  
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  

  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const MobileMenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
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

      <div className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map(({ title, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                pathname === href
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t p-4 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-green-600 text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            router.push("/settings")
            setIsMobileMenuOpen(false)
          }}
          className="w-full justify-start gap-3"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
        </Button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
    <div className="hidden md:block">
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
                    {user?.name?.charAt(0) || "U"}
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
    </div>

    <div className="md:hidden fixed top-2.5 right-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="cursor-pointer bg-background/80 backdrop-blur-sm mr-1.5">
              <Menu className="h-10 w-10" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <MobileMenuContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
