import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

const RecruiterLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Verify this user is a recruiter
      const token = await cred.user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/recruiter/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        await auth.signOut();
        toast({ title: "Esta conta não é de recrutador", variant: "destructive" });
        return;
      }
      navigate("/recrutador");
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Credenciais inválidas.",
        "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
      };
      toast({ title: "Erro no login", description: messages[error.code] || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-primary/10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/lovable-uploads/logo.png" alt="Click Serviços" className="w-10 h-10 rounded-xl" />
            <h1 className="text-2xl font-bold text-foreground">Login Recrutador</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="h-12" required />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className="h-12 pr-12" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"} {!loading && <LogIn className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Não tem conta?{" "}
            <Link to="/recrutador/cadastro" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterLogin;
