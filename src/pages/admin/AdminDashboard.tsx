import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Users, CreditCard, Mail, ScrollText, UserCheck, Wallet } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalPayments: number;
  successPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalContacts: number;
  unreadContacts: number;
  totalLogs: number;
  totalRecruiters?: number;
  pendingWithdrawals?: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const cards = [
    { label: "Total Usuários", value: stats?.totalUsers ?? 0, sub: `${stats?.activeUsers ?? 0} ativos / ${stats?.pendingUsers ?? 0} pendentes`, icon: Users, color: "text-primary" },
    { label: "Recrutadores", value: stats?.totalRecruiters ?? 0, sub: `${stats?.pendingWithdrawals ?? 0} saques pendentes`, icon: UserCheck, color: "text-violet-500" },
    { label: "Pagamentos", value: stats?.totalPayments ?? 0, sub: `✓${stats?.successPayments ?? 0}  ✗${stats?.failedPayments ?? 0}  ⏳${stats?.pendingPayments ?? 0}`, icon: CreditCard, color: "text-emerald-500" },
    { label: "Contatos", value: stats?.totalContacts ?? 0, sub: `${stats?.unreadContacts ?? 0} não lidos`, icon: Mail, color: "text-blue-500" },
    { label: "Logs", value: stats?.totalLogs ?? 0, sub: "interações registradas", icon: ScrollText, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">{c.label}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="text-3xl font-black text-foreground">{c.value}</div>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
