import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Clock, ArrowLeft, Ban, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

export const RecruiterProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "ok" | "pending" | "blocked" | "denied">("loading");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/recrutador/login");
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/recruiter/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.blocked) {
            setStatus("blocked");
          } else if (data.approved === true) {
            setStatus("ok");
          } else {
            setStatus("pending");
          }
        } else {
          setStatus("denied");
          navigate("/recrutador/login");
        }
      } catch {
        setStatus("denied");
        navigate("/recrutador/login");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSendContest = async () => {
    if (contactMessage.trim().length < 10) {
      toast({ title: "Mensagem deve ter pelo menos 10 caracteres", variant: "destructive" });
      return;
    }
    setSendingContact(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE_URL}/recruiter/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: auth.currentUser?.email, email: auth.currentUser?.email, message: contactMessage }),
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/10 px-4">
        <div className="bg-card rounded-2xl p-8 sm:p-12 shadow-xl border border-destructive/20 max-w-md w-full text-center space-y-6">
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
              <Button variant="outline" asChild>
                <Link to="/recrutador/login" onClick={() => auth.signOut()}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
                </Link>
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
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4">
        <div className="bg-card rounded-2xl p-8 sm:p-12 shadow-xl border border-primary/10 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Aguardando Aprovação</h1>
            <p className="text-muted-foreground mt-2">
              Seu cadastro como recrutador foi recebido e está sendo analisado pelo administrador. Você receberá acesso assim que for aprovado.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/recrutador/login">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return status === "ok" ? <>{children}</> : null;
};
