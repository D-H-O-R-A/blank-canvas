import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Copy, CheckCircle, Clock, XCircle } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Client {
  uid: string;
  name: string;
  email: string;
  whatsapp: string;
  profession: string;
  plan: string;
  paymentStatus: string;
  paymentUrl?: string;
  commissionAmount?: number;
  paidAt?: string;
}

const RecruiterClients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", birthDate: "",
  });

  const getToken = async () => auth.currentUser?.getIdToken();

  const loadClients = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/clients`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setClients(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadClients(); }, []);

  const handleCreate = async () => {
    if (!newClient.name || !newClient.email || !newClient.password || !newClient.whatsapp || !newClient.plan) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (newClient.password.length < 6) {
      toast({ title: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newClient),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: "Cliente cadastrado!", description: "Link de pagamento gerado." });
      setCreateOpen(false);
      setNewClient({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", birthDate: "" });
      loadClients();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/clients/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Cliente removido" });
      loadClients();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pago</span>;
    if (status === "pending") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> {status}</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Meus Clientes</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome completo *" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              <Input placeholder="E-mail *" type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              <Input placeholder="Senha (min 6) *" type="password" value={newClient.password} onChange={(e) => setNewClient({ ...newClient, password: e.target.value })} />
              <Input placeholder="WhatsApp *" value={newClient.whatsapp} onChange={(e) => setNewClient({ ...newClient, whatsapp: e.target.value })} />
              <Input placeholder="Profissão" value={newClient.profession} onChange={(e) => setNewClient({ ...newClient, profession: e.target.value })} />
              <div className="space-y-1">
                <Label>Data de nascimento</Label>
                <Input type="date" value={newClient.birthDate} onChange={(e) => setNewClient({ ...newClient, birthDate: e.target.value })} />
              </div>
              <Select value={newClient.plan} onValueChange={(v) => setNewClient({ ...newClient, plan: v })}>
                <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mês">1 mês - R$25</SelectItem>
                  <SelectItem value="6 meses">6 meses - R$23</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Cadastrando..." : "Cadastrar e gerar link"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <div key={c.uid} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
                {getStatusBadge(c.paymentStatus)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-muted-foreground">WhatsApp:</span><p className="text-foreground">{c.whatsapp}</p></div>
                <div><span className="text-muted-foreground">Plano:</span><p className="text-foreground">{c.plan}</p></div>
                <div><span className="text-muted-foreground">Profissão:</span><p className="text-foreground">{c.profession || "—"}</p></div>
                {c.commissionAmount ? (
                  <div><span className="text-muted-foreground">Comissão:</span><p className="text-primary font-bold">R$ {c.commissionAmount.toFixed(2)}</p></div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                {c.paymentUrl && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => copyLink(c.paymentUrl!)}><Copy className="w-3.5 h-3.5 mr-1" /> Copiar link</Button>
                    <Button variant="ghost" size="sm" asChild><a href={c.paymentUrl} target="_blank" rel="noopener"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Abrir</a></Button>
                  </>
                )}
                {c.paymentStatus !== "paid" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                        <AlertDialogDescription>O cliente <strong>{c.name}</strong> será removido.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(c.uid)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterClients;
