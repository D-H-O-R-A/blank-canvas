import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  User, LogOut, CreditCard, Edit, Save, Clock,
  Instagram, Facebook, Linkedin, Globe, Camera
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Profile {
  name: string;
  email: string;
  whatsapp: string;
  profession: string;
  about: string;
  photoURL: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    website: string;
  };
  plan: string;
  subscriptionStatus: string;
  paidUntil: string | null;
  birthDate?: string;
}

const PLANS = [
  { value: "1 mês", label: "1 mês", price: "R$25/mês" },
  { value: "6 meses", label: "6 meses", price: "R$23/mês" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditData(data);
      }
    } catch {
      toast({ title: "Erro ao carregar perfil", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setProfile(editData as Profile);
        setEditing(false);
        toast({ title: "Perfil atualizado!" });
      }
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/profile/photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ photo: base64, contentType: file.type }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => prev ? { ...prev, photoURL: data.photoURL } : prev);
          setEditData((prev) => ({ ...prev, photoURL: data.photoURL }));
          toast({ title: "Foto atualizada!" });
        } else {
          toast({ title: "Erro ao enviar foto", variant: "destructive" });
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
      setUploadingPhoto(false);
    }
  };

  const handleNewPayment = async () => {
    if (!user || !selectedPlan) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch {
      toast({ title: "Erro ao gerar pagamento", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-card border-b border-primary/10 sticky top-0 z-40">
        <div className="container-custom flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/logo.png" alt="Click Serviços" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            <span className="font-bold text-foreground hidden sm:block">Click Serviços</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:container-custom py-6 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <motion.div
            className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Meu Perfil
              </h2>
              <Button
                variant={editing ? "hero" : "outline"}
                size="sm"
                onClick={editing ? handleSave : () => setEditing(true)}
                disabled={saving}
              >
                {editing ? (
                  <><Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}</>
                ) : (
                  <><Edit className="w-4 h-4 mr-1" /> Editar</>
                )}
              </Button>
            </div>

            {/* Photo */}
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                  <Camera className="w-4 h-4 mr-1" /> {uploadingPhoto ? "Enviando..." : "Alterar foto"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={!editing}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input value={profile?.email || user?.email || ""} disabled className="h-10 sm:h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input
                  value={editData.whatsapp || ""}
                  onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                  disabled={!editing}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Profissão</Label>
                <Input
                  value={editData.profession || ""}
                  onChange={(e) => setEditData({ ...editData, profession: e.target.value })}
                  disabled={!editing}
                  className="h-10 sm:h-11"
                />
              </div>
              {profile?.birthDate && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Data de nascimento</Label>
                  <Input value={profile.birthDate} disabled className="h-10 sm:h-11 bg-muted/50" />
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 space-y-1.5">
              <Label>Sobre mim</Label>
              <Textarea
                value={editData.about || ""}
                onChange={(e) => setEditData({ ...editData, about: e.target.value })}
                disabled={!editing}
                placeholder="Conte um pouco sobre você e seus serviços..."
                rows={3}
              />
            </div>

            {/* Social Links */}
            <div className="mt-4 sm:mt-6">
              <Label className="mb-2 sm:mb-3 block">Redes Sociais</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { key: "instagram", icon: Instagram, placeholder: "@seuusuario" },
                  { key: "facebook", icon: Facebook, placeholder: "facebook.com/seuusuario" },
                  { key: "linkedin", icon: Linkedin, placeholder: "linkedin.com/in/seuusuario" },
                  { key: "website", icon: Globe, placeholder: "seusite.com.br" },
                ].map(({ key, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={(editData.socialLinks as any)?.[key] || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          socialLinks: { ...editData.socialLinks as any, [key]: e.target.value },
                        })
                      }
                      disabled={!editing}
                      placeholder={placeholder}
                      className="h-9 sm:h-10"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            className="bg-card rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 mb-4 sm:mb-6">
              <CreditCard className="w-5 h-5 text-primary" /> Assinatura
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-primary/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs text-muted-foreground mb-1">Plano</div>
                <div className="font-bold text-foreground">{profile?.plan || "—"}</div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${profile?.subscriptionStatus === "active" ? "bg-primary" : "bg-yellow-500"}`} />
                  <span className="font-bold text-foreground">
                    {profile?.subscriptionStatus === "active" ? "Ativo" : "Pendente"}
                  </span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs text-muted-foreground mb-1">Pago até</div>
                <div className="font-bold text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {profile?.paidUntil ? new Date(profile.paidUntil).toLocaleDateString("pt-BR") : "—"}
                </div>
              </div>
            </div>

            <Button variant="hero" onClick={() => { setSelectedPlan(profile?.plan || "1 mês"); setPlanDialogOpen(true); }} className="w-full sm:w-auto">
              <CreditCard className="w-4 h-4 mr-2" />
              Renovar / Trocar plano
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Plan Selection Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Escolha seu plano</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Plano atual: <strong className="text-foreground">{profile?.plan || "—"}</strong>
            </p>
            <div className="space-y-2">
              {PLANS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPlan(p.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedPlan === p.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{p.label}</span>
                    <span className="text-sm font-bold text-primary">{p.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full" onClick={handleNewPayment} disabled={!selectedPlan}>
              <CreditCard className="w-4 h-4 mr-2" />
              {selectedPlan === profile?.plan ? "Renovar plano" : "Trocar plano"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
