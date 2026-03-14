import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, RefreshCw, Ban, Trash2, CheckCircle, XCircle } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Professional {
  uid: string;
  name: string;
  email: string;
  whatsapp: string;
  profession: string;
  plan: string;
  subscriptionStatus: string;
  paidUntil?: string;
  about?: string;
  paymentMethod?: string;
  totalPayments?: number;
  nextBillingMonths?: number;
  blocked?: boolean;
}

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "mercado_pago", label: "Mercado Pago" },
];

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<Professional | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renewUid, setRenewUid] = useState<string | null>(null);
  const [renewMonths, setRenewMonths] = useState("1");
  const [renewMethod, setRenewMethod] = useState("pix");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", paymentMethod: "pix", nextBillingMonths: "1" });
  const [saving, setSaving] = useState(false);

  const getToken = async () => auth.currentUser?.getIdToken();

  const loadUsers = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const validateNewUser = (): string | null => {
    if (!newUser.name.trim()) return "Informe o nome.";
    if (!newUser.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) return "E-mail inválido.";
    if (!newUser.password || newUser.password.length < 6) return "Senha deve ter pelo menos 6 caracteres.";
    const digits = newUser.whatsapp.replace(/\D/g, "");
    if (!digits || digits.length < 10 || digits.length > 11) return "WhatsApp inválido (10-11 dígitos).";
    if (!newUser.profession.trim()) return "Informe a profissão.";
    return null;
  };

  const handleCreate = async () => {
    const error = validateNewUser();
    if (error) { toast({ title: error, variant: "destructive" }); return; }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newUser, nextBillingMonths: parseInt(newUser.nextBillingMonths) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Usuário criado!" });
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", paymentMethod: "pix", nextBillingMonths: "1" });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${editUser.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editUser),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Atualizado!" });
      setEditUser(null);
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleRenew = async () => {
    if (!renewUid) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${renewUid}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ months: parseInt(renewMonths), paymentMethod: renewMethod }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Assinatura renovada!" });
      setRenewUid(null);
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleBlock = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${uid}/block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      toast({ title: data.blocked ? "Usuário bloqueado" : "Usuário desbloqueado" });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Usuário excluído" });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (u: Professional) => {
    if (u.blocked) return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">Bloqueado</span>;
    if (u.subscriptionStatus === "active") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">Ativo</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600">{u.subscriptionStatus}</span>;
  };

  const getMethodLabel = (method?: string) => PAYMENT_METHODS.find((m) => m.value === method)?.label || method || "—";

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> Novo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Criar Usuário</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <Input placeholder="E-mail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <Input placeholder="Senha (min 6)" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <Input placeholder="WhatsApp" value={newUser.whatsapp} onChange={(e) => setNewUser({ ...newUser, whatsapp: e.target.value })} />
              <Input placeholder="Profissão" value={newUser.profession} onChange={(e) => setNewUser({ ...newUser, profession: e.target.value })} />
              <Select value={newUser.plan} onValueChange={(v) => setNewUser({ ...newUser, plan: v })}>
                <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mês">1 mês - R$25</SelectItem>
                  <SelectItem value="6 meses">6 meses - R$23</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newUser.paymentMethod} onValueChange={(v) => setNewUser({ ...newUser, paymentMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Duração da mensalidade (meses)</label>
                <Input type="number" min="1" max="12" value={newUser.nextBillingMonths} onChange={(e) => setNewUser({ ...newUser, nextBillingMonths: e.target.value })} />
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Criando..." : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Pagamento</th>
              <th className="p-3">Status</th>
              <th className="p-3">Vencimento</th>
              <th className="p-3">Mensalidades</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className={`border-b border-border/50 hover:bg-muted/30 ${u.blocked ? "opacity-60" : ""}`}>
                <td className="p-3 font-medium text-foreground">{u.name}</td>
                <td className="p-3 text-muted-foreground text-xs">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.whatsapp}</td>
                <td className="p-3 text-muted-foreground">{getMethodLabel(u.paymentMethod)}</td>
                <td className="p-3">{getStatusBadge(u)}</td>
                <td className="p-3 text-muted-foreground">{u.paidUntil ? new Date(u.paidUntil).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="p-3 text-center text-muted-foreground">{u.totalPayments ?? 0}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditUser(u)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" title="Renovar" onClick={() => { setRenewUid(u.uid); setRenewMethod(u.paymentMethod || "pix"); }}><RefreshCw className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" title={u.blocked ? "Desbloquear" : "Bloquear"} onClick={() => handleBlock(u.uid)}>
                      {u.blocked ? <CheckCircle className="w-4 h-4 text-primary" /> : <Ban className="w-4 h-4 text-destructive" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Excluir"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é irreversível. O usuário <strong>{u.name}</strong> ({u.email}) será removido permanentemente do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u.uid)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Renew Dialog */}
      <Dialog open={!!renewUid} onOpenChange={(open) => !open && setRenewUid(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Renovar Assinatura</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Meses de renovação</label>
              <Input type="number" min="1" max="12" value={renewMonths} onChange={(e) => setRenewMonths(e.target.value)} />
            </div>
            <Select value={renewMethod} onValueChange={setRenewMethod}>
              <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleRenew} disabled={saving} className="w-full">{saving ? "Renovando..." : "Renovar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <Input placeholder="Nome" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              <Input placeholder="WhatsApp" value={editUser.whatsapp} onChange={(e) => setEditUser({ ...editUser, whatsapp: e.target.value })} />
              <Input placeholder="Profissão" value={editUser.profession} onChange={(e) => setEditUser({ ...editUser, profession: e.target.value })} />
              <Textarea placeholder="Sobre" value={editUser.about || ""} onChange={(e) => setEditUser({ ...editUser, about: e.target.value })} />
              <Select value={editUser.plan} onValueChange={(v) => setEditUser({ ...editUser, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mês">1 mês</SelectItem>
                  <SelectItem value="6 meses">6 meses</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editUser.paymentMethod || "pix"} onValueChange={(v) => setEditUser({ ...editUser, paymentMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Forma de pagamento" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={editUser.subscriptionStatus} onValueChange={(v) => setEditUser({ ...editUser, subscriptionStatus: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Mensalidades pagas</label>
                  <Input type="number" min="0" value={editUser.totalPayments ?? 0} onChange={(e) => setEditUser({ ...editUser, totalPayments: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Próx. renovação (meses)</label>
                  <Input type="number" min="1" max="12" value={editUser.nextBillingMonths ?? 1} onChange={(e) => setEditUser({ ...editUser, nextBillingMonths: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Pago até</label>
                <Input type="date" value={editUser.paidUntil ? editUser.paidUntil.split("T")[0] : ""} onChange={(e) => setEditUser({ ...editUser, paidUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
              </div>
              <Button onClick={handleUpdate} disabled={saving} className="w-full">{saving ? "Salvando..." : "Salvar alterações"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
