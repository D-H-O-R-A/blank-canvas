import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wallet, CheckCircle, Clock, XCircle, Download } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  pixKey: string;
  receiptURL?: string;
  requestedAt: string;
  processedAt?: string;
}

const RecruiterWithdrawals = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const getToken = async () => auth.currentUser?.getIdToken();

  const load = async () => {
    try {
      const token = await getToken();
      const [pRes, wRes] = await Promise.all([
        fetch(`${API_BASE}/recruiter/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/recruiter/withdrawals`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (pRes.ok) setProfile(await pRes.json());
      if (wRes.ok) setWithdrawals(await wRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (val > (profile?.availableBalance || 0)) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/withdrawals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: val }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Saque solicitado!" });
      setWithdrawOpen(false);
      setAmount("");
      load();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
    if (status === "pending") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Saques</h1>
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm" disabled={!profile?.availableBalance}>
              <Wallet className="w-4 h-4 mr-1" /> Solicitar saque
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Solicitar Saque</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saldo disponível: <strong className="text-foreground">R$ {(profile?.availableBalance || 0).toFixed(2)}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Chave PIX: <strong className="text-foreground">{profile?.pixKey}</strong>
              </p>
              <Input type="number" step="0.01" min="0.01" placeholder="Valor (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button onClick={handleWithdraw} disabled={saving} className="w-full">{saving ? "Solicitando..." : "Solicitar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
            <p className="text-2xl font-black text-foreground">R$ {(profile?.availableBalance || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total recebido</p>
            <p className="text-2xl font-black text-foreground">R$ {(profile?.totalCommission || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum saque solicitado.</div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div key={w.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">R$ {w.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString("pt-BR")} — PIX: {w.pixKey}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(w.status)}
                {w.receiptURL && (
                  <a href={w.receiptURL} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Comprovante</Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterWithdrawals;
