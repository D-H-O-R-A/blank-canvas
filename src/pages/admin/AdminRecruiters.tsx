import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Ban, CheckCircle, Users, Camera, Percent } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Recruiter {
  uid: string;
  name: string;
  email: string;
  whatsapp: string;
  profession: string;
  cpf: string;
  address: string;
  pixKey: string;
  photoURL: string;
  birthDate?: string;
  commissionPercent: number;
  totalCommission: number;
  availableBalance: number;
  blocked: boolean;
}

const AdminRecruiters = () => {
  const { toast } = useToast();
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRecruiter, setEditRecruiter] = useState<Recruiter | null>(null);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [viewingClientsUid, setViewingClientsUid] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const getToken = async () => auth.currentUser?.getIdToken();

  const load = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/recruiters`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRecruiters(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async () => {
    if (!editRecruiter) return;
    setSaving(true);
    try {
      // Upload photo if selected
      if (editPhotoFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
          reader.readAsDataURL(editPhotoFile);
        });
        const token = await getToken();
        const photoRes = await fetch(`${API_BASE}/admin/recruiters/${editRecruiter.uid}/photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photo: base64, contentType: editPhotoFile.type }),
        });
        if (photoRes.ok) {
          const d = await photoRes.json();
          editRecruiter.photoURL = d.photoURL;
        }
      }

      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/recruiters/${editRecruiter.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editRecruiter),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Recrutador atualizado!" });
      setEditRecruiter(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
      load();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleBlock = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/recruiters/${uid}/block`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      toast({ title: data.blocked ? "Recrutador bloqueado" : "Recrutador desbloqueado" });
      load();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/recruiters/${uid}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Recrutador excluído" });
      load();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const viewClients = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/recruiters/${uid}/clients`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setClients(await res.json());
      setViewingClientsUid(uid);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Recrutadores</h1>

      {recruiters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum recrutador cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {recruiters.map((r) => (
            <div key={r.uid} className={`bg-card border border-border rounded-xl p-4 space-y-3 ${r.blocked ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {r.photoURL ? <img src={r.photoURL} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                  </div>
                </div>
                {r.blocked && <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">Bloqueado</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div><span className="text-muted-foreground">Comissão:</span><p className="text-foreground font-bold">{r.commissionPercent}%</p></div>
                <div><span className="text-muted-foreground">Total comissão:</span><p className="text-foreground">R$ {r.totalCommission?.toFixed(2) || "0.00"}</p></div>
                <div><span className="text-muted-foreground">Saldo:</span><p className="text-foreground">R$ {r.availableBalance?.toFixed(2) || "0.00"}</p></div>
                <div><span className="text-muted-foreground">PIX:</span><p className="text-foreground truncate">{r.pixKey}</p></div>
              </div>

              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border/50">
                <Button variant="ghost" size="sm" onClick={() => { setEditRecruiter({ ...r }); setEditPhotoPreview(r.photoURL || null); setEditPhotoFile(null); }}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => viewClients(r.uid)}>
                  <Users className="w-3.5 h-3.5 mr-1" /> Clientes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleBlock(r.uid)}>
                  {r.blocked ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Ban className="w-3.5 h-3.5 text-destructive" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm"><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir recrutador?</AlertDialogTitle>
                      <AlertDialogDescription>O recrutador <strong>{r.name}</strong> e todos os dados serão removidos.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.uid)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editRecruiter} onOpenChange={(open) => { if (!open) { setEditRecruiter(null); setEditPhotoFile(null); setEditPhotoPreview(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Recrutador</DialogTitle></DialogHeader>
          {editRecruiter && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  {editPhotoPreview ? <img src={editPhotoPreview} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setEditPhotoFile(e.target.files[0]);
                      const reader = new FileReader();
                      reader.onload = (ev) => setEditPhotoPreview(ev.target?.result as string);
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                  <Button variant="outline" size="sm" onClick={() => photoRef.current?.click()}><Camera className="w-4 h-4 mr-1" /> Alterar foto</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Nome</Label><Input value={editRecruiter.name} onChange={(e) => setEditRecruiter({ ...editRecruiter, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>WhatsApp</Label><Input value={editRecruiter.whatsapp} onChange={(e) => setEditRecruiter({ ...editRecruiter, whatsapp: e.target.value })} /></div>
                <div className="space-y-1"><Label>Profissão</Label><Input value={editRecruiter.profession} onChange={(e) => setEditRecruiter({ ...editRecruiter, profession: e.target.value })} /></div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1"><Percent className="w-3 h-3" /> Comissão (%)</Label>
                  <Input type="number" min="0" max="100" value={editRecruiter.commissionPercent} onChange={(e) => setEditRecruiter({ ...editRecruiter, commissionPercent: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="space-y-1"><Label>Endereço</Label><Input value={editRecruiter.address} onChange={(e) => setEditRecruiter({ ...editRecruiter, address: e.target.value })} /></div>
              <div className="space-y-1"><Label>Chave PIX</Label><Input value={editRecruiter.pixKey} onChange={(e) => setEditRecruiter({ ...editRecruiter, pixKey: e.target.value })} /></div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">CPF:</span><p className="text-foreground">{editRecruiter.cpf}</p></div>
                <div><span className="text-muted-foreground">Nascimento:</span><p className="text-foreground">{editRecruiter.birthDate || "—"}</p></div>
              </div>

              <Button onClick={handleUpdate} disabled={saving} className="w-full">{saving ? "Salvando..." : "Salvar alterações"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clients Dialog */}
      <Dialog open={!!viewingClientsUid} onOpenChange={(open) => !open && setViewingClientsUid(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Clientes do Recrutador</DialogTitle></DialogHeader>
          {clients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum cliente.</p>
          ) : (
            <div className="space-y-2">
              {clients.map((c: any) => (
                <div key={c.uid} className="bg-muted/30 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.paymentStatus === "paid" ? "bg-primary/20 text-primary" : "bg-yellow-500/20 text-yellow-600"}`}>
                      {c.paymentStatus === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.email} • {c.plan}</p>
                  {c.commissionAmount > 0 && <p className="text-xs text-primary font-bold mt-1">Comissão: R$ {c.commissionAmount.toFixed(2)}</p>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRecruiters;
