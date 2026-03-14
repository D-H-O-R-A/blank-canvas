import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Users, DollarSign, Wallet, TrendingUp } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

const RecruiterDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const [profileRes, clientsRes] = await Promise.all([
          fetch(`${API_BASE}/recruiter/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/recruiter/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (clientsRes.ok) setClients(await clientsRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const paidClients = clients.filter((c) => c.paymentStatus === "paid").length;
  const totalCommission = profile?.totalCommission || 0;
  const availableBalance = profile?.availableBalance || 0;

  const cards = [
    { label: "Total Clientes", value: clients.length, icon: Users, color: "text-primary" },
    { label: "Clientes Pagos", value: paidClients, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Comissão Total", value: `R$ ${totalCommission.toFixed(2)}`, icon: DollarSign, color: "text-blue-500" },
    { label: "Saldo Disponível", value: `R$ ${availableBalance.toFixed(2)}`, icon: Wallet, color: "text-orange-500" },
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
            <div className="text-2xl sm:text-3xl font-black text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm text-muted-foreground">
          Sua comissão atual é de <strong className="text-foreground">{profile?.commissionPercent || 25}%</strong> sobre cada pagamento dos seus clientes.
        </p>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
