import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

export const RecruiterProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");
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
          setStatus("ok");
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

  return status === "ok" ? <>{children}</> : null;
};
