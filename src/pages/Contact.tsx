import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

const SUBJECTS = [
  "Dúvida sobre a plataforma",
  "Quero ser profissional",
  "Problema com pagamento",
  "Parceria comercial",
  "Sugestão ou feedback",
  "Outro",
];

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.trim() && form.email.trim() && form.subject && form.message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      setSent(true);
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível enviar. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Mensagem enviada!</h1>
          <p className="text-muted-foreground">Recebemos sua mensagem e retornaremos o mais breve possível.</p>
          <Button variant="hero" onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao site
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground">Fale conosco</h1>
              <p className="text-muted-foreground mt-1">Preencha o formulário e entraremos em contato.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-soft">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome *</label>
                <Input
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail *</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assunto *</label>
                <Select value={form.subject} onValueChange={(v) => handleChange("subject", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um assunto" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mensagem *</label>
              <Textarea
                placeholder="Escreva sua mensagem..."
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                maxLength={1000}
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{form.message.length}/1000</p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full h-auto py-4"
              disabled={!isValid || loading}
            >
              {loading ? "Enviando..." : "Enviar mensagem"}
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
