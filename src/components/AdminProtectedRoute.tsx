import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("denied");
        return;
      }
      try {
        const token = await user.getIdToken(true);
        const res = await fetch(`${API_BASE}/admin/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStatus(data.isAdmin === true ? "admin" : "denied");
        } else {
          setStatus("denied");
        }
      } catch {
        setStatus("denied");
      }
    });
    return () => unsub();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
};
