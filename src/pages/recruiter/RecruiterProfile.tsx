import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Edit, Camera } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

const RecruiterProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const getToken = async () => auth.currentUser?.getIdToken();

  const load = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditData(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/recruiter/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setProfile(editData);
        setEditing(false);
        toast({ title: "Perfil atualizado!" });
      }
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const token = await getToken();
        const res = await fetch(`${API_BASE}/recruiter/photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photo: base64, contentType: file.type }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile((p: any) => ({ ...p, photoURL: data.photoURL }));
          toast({ title: "Foto atualizada!" });
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
      setUploadingPhoto(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Meu Perfil</h1>
        <Button variant={editing ? "hero" : "outline"} size="sm" onClick={editing ? handleSave : () => setEditing(true)} disabled={saving}>
          {editing ? <><Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}</> : <><Edit className="w-4 h-4 mr-1" /> Editar</>}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
        {/* Photo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
            {profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-muted-foreground" />}
          </div>
          <div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
            <Button variant="outline" size="sm" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}>
              <Camera className="w-4 h-4 mr-1" /> {uploadingPhoto ? "Enviando..." : "Alterar foto"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} disabled={!editing} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={profile?.email || ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input value={editData.whatsapp || ""} onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })} disabled={!editing} />
          </div>
          <div className="space-y-1.5">
            <Label>Profissão</Label>
            <Input value={editData.profession || ""} onChange={(e) => setEditData({ ...editData, profession: e.target.value })} disabled={!editing} />
          </div>
          <div className="space-y-1.5">
            <Label>CPF</Label>
            <Input value={profile?.cpf || ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Data de nascimento</Label>
            <Input value={profile?.birthDate || ""} disabled />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Endereço</Label>
          <Input value={editData.address || ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} disabled={!editing} />
        </div>

        <div className="space-y-1.5">
          <Label>Chave PIX</Label>
          <Input value={editData.pixKey || ""} onChange={(e) => setEditData({ ...editData, pixKey: e.target.value })} disabled={!editing} />
        </div>

        <div className="bg-primary/5 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Comissão: <strong className="text-foreground">{profile?.commissionPercent || 25}%</strong></p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
