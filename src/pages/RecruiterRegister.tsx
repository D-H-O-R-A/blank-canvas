import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, EyeOff, UserPlus, Camera, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

const RecruiterRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", password: "", whatsapp: "", profession: "",
    birthDate: "", cpf: "", address: "", pixKey: "",
  });

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.whatsapp || !form.cpf || !form.pixKey) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let photoBase64 = "";
      let photoContentType = "";
      if (photoFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
          reader.readAsDataURL(photoFile);
        });
        photoBase64 = base64;
        photoContentType = photoFile.type;
      }

      const res = await fetch(`${API_BASE_URL}/recruiter/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: photoBase64 || undefined, photoContentType: photoContentType || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          toast({ title: "E-mail já cadastrado", description: "Faça login." });
          navigate("/recrutador/login");
          return;
        }
        throw new Error(data.error);
      }

      toast({ title: "Cadastro realizado!", description: "Aguarde a aprovação do administrador para acessar o painel." });
      navigate("/recrutador/login");
    } catch (error: any) {
      toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4 py-8">
      <motion.div className="w-full max-w-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/lovable-uploads/logo.png" alt="Click Serviços" className="w-10 h-10 rounded-xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Cadastro de Recrutador</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div>
                <input type="file" accept="image/*" className="hidden" id="recruiter-photo" onChange={(e) => { if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]); }} />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("recruiter-photo")?.click()}>
                  <Camera className="w-4 h-4 mr-1" /> Foto de perfil
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome completo *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp *</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>Profissão</Label>
                <Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Ex: Vendedor" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>Data de nascimento</Label>
                <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>CPF *</Label>
                <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" className="h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro, cidade" className="h-11" />
            </div>

            <div className="space-y-1.5">
              <Label>Chave PIX *</Label>
              <Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} placeholder="CPF, e-mail, telefone ou chave aleatória" className="h-11" required />
            </div>

            <div className="space-y-1.5">
              <Label>Senha *</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className="h-11 pr-12" required minLength={6} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cadastrando...</> : <><UserPlus className="w-5 h-5 mr-2" /> Criar conta</>}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Já tem conta?{" "}
              <Link to="/recrutador/login" className="text-primary hover:underline font-medium">Fazer login</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterRegister;
