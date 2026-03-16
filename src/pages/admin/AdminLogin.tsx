import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken(true);

      // Check role — only admins allowed here
      const roleRes = await fetch(`${API_BASE}/check-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (roleRes.ok) {
        const roleData = await roleRes.json();
        if (!roleData.isAdmin) {
          await signOut(auth);
          if (roleData.isRecruiter) {
            setError("Esta conta é de recrutador. Use o login de recrutador.");
          } else if (roleData.isProfessional) {
            setError("Esta conta é de prestador de serviço. Use o login de profissional.");
          } else {
            setError("Acesso negado: este usuário não é administrador.");
          }
          return;
        }
        navigate("/admin", { replace: true });
        return;
      }

      await signOut(auth);
      setError("Erro ao verificar permissões. Tente novamente.");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito a administradores</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-xl p-6 shadow-soft">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              maxLength={128}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
