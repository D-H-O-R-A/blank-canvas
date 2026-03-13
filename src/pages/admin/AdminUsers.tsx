import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";

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
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<Professional | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês" });
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

  const handleCreate = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Usuário criado!" });
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês" });
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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> Novo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Criar Usuário</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <Input placeholder="E-mail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <Input placeholder="Senha (min 6)" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <Input placeholder="WhatsApp" value={newUser.whatsapp} onChange={(e) => setNewUser({ ...newUser, whatsapp: e.target.value })} />
              <Input placeholder="Profissão" value={newUser.profession} onChange={(e) => setNewUser({ ...newUser, profession: e.target.value })} />
              <Select value={newUser.plan} onValueChange={(v) => setNewUser({ ...newUser, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mês">1 mês - R$25</SelectItem>
                  <SelectItem value="6 meses">6 meses - R$23</SelectItem>
                </SelectContent>
              </Select>
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
              <th className="p-3">Plano</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pago até</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3 font-medium text-foreground">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.whatsapp}</td>
                <td className="p-3">{u.plan}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.subscriptionStatus === "active" ? "bg-primary/20 text-primary" : "bg-yellow-500/20 text-yellow-600"}`}>
                    {u.subscriptionStatus}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{u.paidUntil ? new Date(u.paidUntil).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditUser(u)}><Pencil className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <Select value={editUser.subscriptionStatus} onValueChange={(v) => setEditUser({ ...editUser, subscriptionStatus: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
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
