import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, EyeOff, LogIn, Ban, Send, Loader2 } from "lucide-react";
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
  const [blocked, setBlocked] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBlocked(false);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/recruiter/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        await auth.signOut();
        toast({ title: "Esta conta não é de recrutador", variant: "destructive" });
        return;
      }
      const data = await res.json();
      if (data.blocked) {
        setBlocked(true);
        return;
      }
      navigate("/recrutador");
    } catch (error: any) {
      const messages: Record<string, string> = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Credenciais inválidas.",
        "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
        "auth/user-disabled": "Sua conta foi bloqueada pelo administrador.",
      };
      if (error.code === "auth/user-disabled") {
        setBlocked(true);
        return;
      }
      toast({ title: "Erro no login", description: messages[error.code] || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendContest = async () => {
    if (contactMessage.trim().length < 10) {
      toast({ title: "Mensagem deve ter pelo menos 10 caracteres", variant: "destructive" });
      return;
    }
    setSendingContact(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      const res = await fetch(`${API_BASE_URL}/recruiter/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: email, email, message: contactMessage }),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      toast({ title: "Mensagem enviada!", description: "Analisaremos sua contestação e entraremos em contato." });
      setShowContactForm(false);
      setContactMessage("");
    } catch {
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setSendingContact(false);
    }
  };

  if (blocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center px-4">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-destructive/20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Ban className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Conta Bloqueada</h1>
              <p className="text-muted-foreground mt-2">
                Sua conta de recrutador foi bloqueada pelo administrador. Se acredita que isso é um erro, entre em contato para contestar.
              </p>
            </div>

            {!showContactForm ? (
              <div className="space-y-3">
                <Button variant="hero" className="w-full" onClick={() => setShowContactForm(true)}>
                  <Send className="w-4 h-4 mr-2" /> Contestar bloqueio
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setBlocked(false); auth.signOut(); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label>Descreva o motivo da contestação *</Label>
                  <Textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value.slice(0, 1000))}
                    placeholder="Explique por que acredita que o bloqueio foi um engano..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">{contactMessage.length}/1000</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowContactForm(false)}>
                    Cancelar
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={handleSendContest} disabled={sendingContact || contactMessage.trim().length < 10}>
                    {sendingContact ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4 mr-1" /> Enviar</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

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
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 255))} placeholder="seu.email@exemplo.com" className="h-12" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value.slice(0, 128))} placeholder="Sua senha" className="h-12 pr-12" required maxLength={128} />
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
