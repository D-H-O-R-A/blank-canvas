import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, RefreshCw, Ban, Trash2, CheckCircle, XCircle, CalendarIcon, Camera, Instagram, Facebook, Linkedin, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface SocialLinks {
  instagram: string;
  facebook: string;
  linkedin: string;
  website: string;
}

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
  photoURL?: string;
  socialLinks?: SocialLinks;
  paymentMethod?: string;
  totalPayments?: number;
  nextBillingMonths?: number;
  blocked?: boolean;
  birthDate?: string;
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
  const [renewDate, setRenewDate] = useState<Date | undefined>(undefined);
  const [renewMethod, setRenewMethod] = useState("pix");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", paymentMethod: "pix", paidUntilDate: undefined as Date | undefined, birthDate: "" });
  const [saving, setSaving] = useState(false);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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
    if (!newUser.paidUntilDate) return "Selecione a data de vencimento.";
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
        body: JSON.stringify({ ...newUser, paidUntil: newUser.paidUntilDate?.toISOString(), birthDate: newUser.birthDate || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Usuário criado!" });
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", whatsapp: "", profession: "", plan: "1 mês", paymentMethod: "pix", paidUntilDate: undefined, birthDate: "" });
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handlePhotoSelect = (file: File) => {
    setEditPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setEditPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (uid: string): Promise<string | null> => {
    if (!editPhotoFile) return null;
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = async (e) => {
        try {
          const token = await getToken();
          const base64 = (e.target?.result as string).split(",")[1];
          const res = await fetch(`${API_BASE}/admin/users/${uid}/photo`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ photo: base64, contentType: editPhotoFile.type }),
          });
          if (res.ok) {
            const data = await res.json();
            resolve(data.photoURL);
          } else resolve(null);
        } catch { resolve(null); }
      };
      reader.readAsDataURL(editPhotoFile);
    });
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      // Upload photo first if selected
      if (editPhotoFile) {
        const photoURL = await uploadPhoto(editUser.uid);
        if (photoURL) editUser.photoURL = photoURL;
      }

      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${editUser.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editUser),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Atualizado!" });
      setEditUser(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
      loadUsers();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleRenew = async () => {
    if (!renewUid || !renewDate) {
      toast({ title: "Selecione a data de vencimento", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/users/${renewUid}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paidUntil: renewDate.toISOString(), paymentMethod: renewMethod }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Assinatura renovada!" });
      setRenewUid(null);
      setRenewDate(undefined);
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

  const DatePickerField = ({ date, onSelect, label }: { date: Date | undefined; onSelect: (d: Date | undefined) => void; label: string }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={(d) => d < new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Usuários</h1>
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
              <div className="space-y-1">
                <Label>Data de nascimento</Label>
                <Input type="date" value={newUser.birthDate} onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })} />
              </div>
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
              <DatePickerField label="Pago até" date={newUser.paidUntilDate} onSelect={(d) => setNewUser({ ...newUser, paidUntilDate: d })} />
              <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Criando..." : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => { setEditUser(u); setEditPhotoPreview(u.photoURL || null); setEditPhotoFile(null); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" title="Renovar" onClick={() => { setRenewUid(u.uid); setRenewMethod(u.paymentMethod || "pix"); setRenewDate(u.paidUntil ? new Date(u.paidUntil) : undefined); }}><RefreshCw className="w-4 h-4" /></Button>
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
                          <AlertDialogDescription>Esta ação é irreversível. O usuário <strong>{u.name}</strong> ({u.email}) será removido.</AlertDialogDescription>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.uid} className={`bg-card border border-border rounded-xl p-4 space-y-3 ${u.blocked ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              {getStatusBadge(u)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">WhatsApp:</span>
                <p className="text-foreground">{u.whatsapp || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pagamento:</span>
                <p className="text-foreground">{getMethodLabel(u.paymentMethod)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
                <p className="text-foreground">{u.paidUntil ? new Date(u.paidUntil).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Mensalidades:</span>
                <p className="text-foreground">{u.totalPayments ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-border/50">
              <Button variant="ghost" size="sm" onClick={() => { setEditUser(u); setEditPhotoPreview(u.photoURL || null); setEditPhotoFile(null); }}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
              <Button variant="ghost" size="sm" onClick={() => { setRenewUid(u.uid); setRenewMethod(u.paymentMethod || "pix"); setRenewDate(u.paidUntil ? new Date(u.paidUntil) : undefined); }}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Renovar</Button>
              <Button variant="ghost" size="sm" onClick={() => handleBlock(u.uid)}>
                {u.blocked ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Ban className="w-3.5 h-3.5 text-destructive" />}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm"><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação é irreversível. O usuário <strong>{u.name}</strong> será removido.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(u.uid)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Renew Dialog */}
      <Dialog open={!!renewUid} onOpenChange={(open) => !open && setRenewUid(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Renovar Assinatura</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <DatePickerField label="Pago até" date={renewDate} onSelect={setRenewDate} />
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
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) { setEditUser(null); setEditPhotoFile(null); setEditPhotoPreview(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Usuário</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                    {editPhotoPreview ? (
                      <img src={editPhotoPreview} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]); }} />
                  <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-1" /> Alterar foto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>WhatsApp</Label>
                  <Input value={editUser.whatsapp} onChange={(e) => setEditUser({ ...editUser, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Profissão</Label>
                  <Input value={editUser.profession} onChange={(e) => setEditUser({ ...editUser, profession: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Plano</Label>
                  <Select value={editUser.plan} onValueChange={(v) => setEditUser({ ...editUser, plan: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 mês">1 mês</SelectItem>
                      <SelectItem value="6 meses">6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Sobre</Label>
                <Textarea value={editUser.about || ""} onChange={(e) => setEditUser({ ...editUser, about: e.target.value })} rows={3} />
              </div>

              {editUser.birthDate && (
                <div className="space-y-1">
                  <Label>Data de nascimento</Label>
                  <Input value={editUser.birthDate} disabled className="bg-muted/50" />
                </div>
              )}

              {/* Social Links */}
              <div className="space-y-2">
                <Label>Redes Sociais</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "instagram" as const, icon: Instagram, placeholder: "@usuario" },
                    { key: "facebook" as const, icon: Facebook, placeholder: "facebook.com/usuario" },
                    { key: "linkedin" as const, icon: Linkedin, placeholder: "linkedin.com/in/usuario" },
                    { key: "website" as const, icon: Globe, placeholder: "seusite.com.br" },
                  ].map(({ key, icon: Icon, placeholder }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input
                        value={editUser.socialLinks?.[key] || ""}
                        onChange={(e) => setEditUser({ ...editUser, socialLinks: { ...editUser.socialLinks || { instagram: "", facebook: "", linkedin: "", website: "" }, [key]: e.target.value } })}
                        placeholder={placeholder}
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Forma de pagamento</Label>
                  <Select value={editUser.paymentMethod || "pix"} onValueChange={(v) => setEditUser({ ...editUser, paymentMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={editUser.subscriptionStatus} onValueChange={(v) => setEditUser({ ...editUser, subscriptionStatus: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Mensalidades pagas</Label>
                  <Input type="number" min="0" value={editUser.totalPayments ?? 0} onChange={(e) => setEditUser({ ...editUser, totalPayments: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label>Próx. renovação (meses)</Label>
                  <Input type="number" min="1" max="12" value={editUser.nextBillingMonths ?? 1} onChange={(e) => setEditUser({ ...editUser, nextBillingMonths: parseInt(e.target.value) || 1 })} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Pago até</Label>
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
