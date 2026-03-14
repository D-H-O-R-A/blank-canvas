import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, CreditCard, Zap, TrendingUp, Users, Award, CheckCircle, ArrowRight, Target, Eye, EyeOff, Loader2 } from "lucide-react";
import { PartnersSection } from "./PartnersSection";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://us-central1-click-servico.cloudfunctions.net/api";

export const ProfessionalSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    profession: "",
    password: "",
    plan: "",
  });

  const benefits = [
    {
      icon: TrendingUp,
      title: "Destaque Premium",
      description: "Apareça primeiro nas buscas e aumente suas chances de ser contratado"
    },
    {
      icon: Users,
      title: "Avaliações Verificadas",
      description: "Sistema transparente que constrói sua reputação na plataforma"
    },
    {
      icon: Star,
      title: "Perfil Profissional",
      description: "Sua vitrine digital para mostrar seu trabalho e atrair clientes"
    },
    {
      icon: CreditCard,
      title: "Planos Acessíveis",
      description: "Invista pouco para ter acesso a uma base crescente de clientes"
    }
  ];

  const plans = [
    {
      duration: "1 mês",
      price: "R$ 25",
      period: "/mês",
      badge: null as string | null,
      savings: null as string | null,
      features: ["Perfil básico", "5 propostas/mês", "Suporte por email", "Badge verificado"],
      featureCount: "4 recursos",
    },
    {
      duration: "6 meses",
      price: "R$ 23",
      period: "/mês",
      badge: "Mais Popular",
      savings: "10% OFF",
      features: ["Perfil premium", "Propostas ilimitadas", "Suporte prioritário", "Destaque nas buscas"],
      featureCount: "5 recursos",
    },
  ];

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      toast({ title: "Informe seu nome completo (mínimo 3 caracteres)", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Informe um e-mail válido", variant: "destructive" });
      return false;
    }
    const digits = formData.whatsapp.replace(/\D/g, "");
    if (!digits || digits.length < 10 || digits.length > 11) {
      toast({ title: "Informe um WhatsApp válido (10-11 dígitos)", variant: "destructive" });
      return false;
    }
    if (!formData.profession.trim() || formData.profession.trim().length < 2) {
      toast({ title: "Informe sua profissão", variant: "destructive" });
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return false;
    }
    if (!formData.plan) {
      toast({ title: "Escolha um plano", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Send to API - backend creates user + returns payment link
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          profession: formData.profession,
          password: formData.password,
          plan: formData.plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EMAIL_EXISTS") {
          toast({
            title: "Você já possui cadastro",
            description: "Faça login para continuar.",
          });
          setIsModalOpen(false);
          navigate("/login");
          return;
        }
        throw new Error(data.error || "Erro ao realizar cadastro");
      }

      // Redirect to payment URL
      if (data.paymentUrl) {
        setIsModalOpen(false);
        toast({
          title: "Cadastro realizado!",
          description: "Redirecionando para o pagamento...",
        });
        // Small delay for user to see the toast
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="seja-profissional" className="section-padding bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-emerald opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-primary opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          {/* Header */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-12 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 glass-effect text-primary px-6 py-3 rounded-2xl text-sm font-semibold mb-6 lg:mb-8">
              <Award className="w-5 h-5" />
              <span>Seja um Profissional Elite</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 lg:mb-8 leading-tight">
              Transforme seu talento em{" "}
              <span className="text-gradient-primary relative">
                oportunidades
                <div className="absolute -bottom-3 left-0 right-0 h-6 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
              </span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light mb-6 lg:mb-8">
              Cadastre-se e esteja entre os primeiros profissionais da plataforma.
              <br className="hidden md:block" />
              Quando lançarmos, você já estará na frente.
            </p>

            {/* Persuasive sub-text */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 max-w-3xl mx-auto mb-8 lg:mb-12 border border-primary/10">
              <div className="flex items-start gap-3 lg:gap-4">
                <Target className="w-6 h-6 lg:w-8 lg:h-8 text-primary flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-foreground mb-2 text-sm lg:text-base">Por que se cadastrar na Click Serviços?</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                    A Click Serviços conecta clientes que precisam de serviços diretamente a você. 
                    Ao se cadastrar agora, você garante seu lugar como um dos primeiros profissionais da plataforma, 
                    ganhando <strong className="text-primary">visibilidade desde o primeiro dia</strong> do lançamento.
                  </p>
                </div>
              </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="hero"
                    size="xl"
                    className="text-base lg:text-xl px-10 lg:px-16 py-6 lg:py-8 h-auto btn-liquid glow-primary font-bold"
                  >
                    Me tornar um Pro
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 ml-2" />
                  </Button>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl lg:text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-emerald rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      Cadastro Profissional
                    </DialogTitle>
                  </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome completo" className="h-12" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu.email@exemplo.com" className="h-12" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(11) 99999-9999" className="h-12" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profissão *</Label>
                      <Input id="profession" value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="Ex: Eletricista, Encanador, Designer..." className="h-12" required />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        className="h-12 pr-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Plans */}
                  <div className="space-y-4">
                    <Label>Escolha seu plano *</Label>
                    <div className="grid gap-4">
                      {plans.map((plan) => (
                        <div
                          key={plan.duration}
                          className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                            formData.plan === plan.duration ? "border-primary bg-primary/5 shadow-medium" : "border-border hover:border-primary/50"
                          } ${plan.badge ? "ring-2 ring-primary/20" : ""}`}
                          onClick={() => setFormData({ ...formData, plan: plan.duration })}
                        >
                          {plan.badge && (
                            <Badge className="absolute -top-3 left-4 bg-gradient-emerald text-white border-0">{plan.badge}</Badge>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.plan === plan.duration ? "border-primary bg-primary" : "border-border"}`}>
                                {formData.plan === plan.duration && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-foreground">{plan.duration}</h4>
                                  {plan.savings && <Badge variant="secondary" className="text-xs">{plan.savings}</Badge>}
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-black text-primary">{plan.price}</span>
                                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{plan.featureCount}</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-14 text-lg font-bold"
                    disabled={loading || !formData.name || !formData.email || !formData.password || !formData.plan}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        Finalizar Cadastro
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => { setIsModalOpen(false); navigate("/login"); }}
                  >
                    Já tenho conta — Fazer Login
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao continuar, você concorda com nossos{" "}
                    <a href="/termos-de-uso" className="text-primary hover:underline font-medium">Termos de Uso</a> e{" "}
                    <a href="/politica-de-privacidade" className="text-primary hover:underline font-medium">Política de Privacidade</a>.
                  </p>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12 lg:mb-20">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                className="bg-white rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-soft hover:shadow-xl border border-primary/5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-emerald rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 shadow-medium">
                  <benefit.icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2 lg:mb-3 text-sm lg:text-lg">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-xs lg:text-base">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Retorno para prestadores */}
          <motion.div
            className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-14 shadow-soft mb-12 lg:mb-20 border border-primary/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 lg:mb-6">
                  <TrendingUp className="w-4 h-4" />
                  <span>Seu Crescimento</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 lg:mb-6">
                  Como a Click Serviços conecta você a clientes
                </h3>
                <div className="space-y-3 lg:space-y-4">
                  {[
                    { title: "Algoritmo de Matching", desc: "Nossa IA conecta os clientes certos com o profissional certo, aumentando sua taxa de conversão." },
                    { title: "Perfil Otimizado", desc: "Criamos uma vitrine digital profissional que transmite confiança e credibilidade." },
                    { title: "Avaliações que Vendem", desc: "Cada serviço bem feito gera avaliações positivas que atraem novos clientes automaticamente." },
                    { title: "Visibilidade na Região", desc: "Clientes próximos encontram você facilmente pela localização e especialidade." },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div className="text-sm lg:text-base">
                        <span className="font-semibold text-foreground">{item.title}:</span>{" "}
                        <span className="text-muted-foreground">{item.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {[
                  { icon: TrendingUp, stat: "+1k", label: "Pré-cadastrados" },
                  { icon: Users, stat: "+150", label: "Tipos de serviço" },
                  { icon: Star, stat: "4.9★", label: "Avaliação testadores" },
                  { icon: Zap, stat: "Em breve", label: "Lançamento" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 lg:p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <item.icon className="w-6 h-6 lg:w-8 lg:h-8 text-primary mx-auto mb-2" />
                    <div className="text-xl lg:text-2xl font-black text-primary">{item.stat}</div>
                    <div className="text-[10px] lg:text-xs text-muted-foreground">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Partners */}
          <PartnersSection />

          {/* Success Stories */}
          <motion.div
            className="text-center bg-white rounded-2xl lg:rounded-3xl p-8 lg:p-12 shadow-soft mt-12 lg:mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6 lg:mb-8">
              Nosso Potencial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {[
                { stat: "+1k", label: "Profissionais pré-cadastrados e prontos para o lançamento" },
                { stat: "Em breve", label: "Plataforma será lançada com base sólida de profissionais" },
                { stat: "4.9★", label: "Avaliação média dos nossos testadores beta" },
              ].map((item, i) => (
                <motion.div key={i} className="text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl lg:text-4xl font-black text-primary mb-2">{item.stat}</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">{item.label}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">*Dados baseados em pré-cadastros e testes internos. Resultados futuros podem variar.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};
