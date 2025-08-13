"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { User, Lock, Save, ArrowLeft } from "lucide-react";
import { WhatsAppSidebar } from "./whatsapp-sidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/userContext";

type ProfileForm = { name: string; email: string };
type PasswordForm = { currentPassword: string; newPassword: string; confirmPassword: string };

export default function SettingsPage() {
  const { user, fetchUser } = useUser(); 
  const router = useRouter();

  // PERFIL
  const [profile, setProfile] = useState<ProfileForm>({ name: "", email: "" });
  const baseline = useRef<ProfileForm>({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // SENHA
  const [passwords, setPasswords] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const next = { name: user?.name ?? "", email: user?.email ?? "" };
    setProfile(next);
    baseline.current = next;
  }, [user?.name, user?.email]);

  const isProfileDirty = useMemo(
    () => profile.name !== baseline.current.name || profile.email !== baseline.current.email,
    [profile]
  );

  // HANDLERS
  const onChangeProfile = (field: keyof ProfileForm, value: string) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const onChangePassword = (field: keyof PasswordForm, value: string) =>
    setPasswords(prev => ({ ...prev, [field]: value }));

  // SAVE PROFILE: envia só name/email
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return toast.error("Nome é obrigatório");
    if (!profile.email.trim()) return toast.error("Email é obrigatório");
    if (!isProfileDirty) return toast.message("Nada para salvar");

    try {
      setSavingProfile(true);
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      if (!res.ok) throw new Error("Falha ao salvar perfil");
      await fetchUser();
      baseline.current = { ...profile };
      toast.success("Perfil atualizado com sucesso");
    } catch (e) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword) return toast.error("Senha atual é obrigatória");
    if (!newPassword) return toast.error("Nova senha é obrigatória");
    if (newPassword.length < 6) return toast.error("Nova senha deve ter pelo menos 6 caracteres");
    if (newPassword !== confirmPassword) return toast.error("Confirmação de senha não confere");

    try {
      setSavingPassword(true);
      const res = await fetch("/api/auth/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error("Falha ao alterar senha");

      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Senha alterada com sucesso");
    } catch (e) {
      toast.error("Erro ao alterar senha");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 overflow-auto bg-background w-screen">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold">Configurações</h1>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => onChangeProfile("name", e.target.value)}
                        placeholder="Digite seu nome"
                        disabled={savingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => onChangeProfile("email", e.target.value)}
                        placeholder="Digite seu email"
                        disabled={savingProfile}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={savingProfile || !isProfileDirty} className="bg-green-600 hover:bg-green-700">
                      {savingProfile ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alterar Senha */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-red-600" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>Mantenha sua conta segura alterando sua senha regularmente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => onChangePassword("currentPassword", e.target.value)}
                      placeholder="Digite sua senha atual"
                      disabled={savingPassword}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                    <div className="space-y-4">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => onChangePassword("newPassword", e.target.value)}
                        placeholder="Digite a nova senha"
                        disabled={savingPassword}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => onChangePassword("confirmPassword", e.target.value)}
                        placeholder="Confirme a nova senha"
                        disabled={savingPassword}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-5">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <strong>Dica:</strong> Use uma senha com pelo menos 6 caracteres, incluindo letras e números.
                    </p>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleChangePassword} disabled={savingPassword} variant="destructive">
                      {savingPassword ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
