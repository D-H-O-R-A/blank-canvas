import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

export const RecruiterProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "ok" | "pending" | "denied">("loading");
  const navigate = useNavigate();

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
          if (data.approved === true) {
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
