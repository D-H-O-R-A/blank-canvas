import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, CreditCard, Zap, TrendingUp, Users, Award, CheckCircle, ArrowRight } from "lucide-react";

export const ProfessionalSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    profession: "",
    plan: "",
    paymentMethod: ""
  });

  const benefits = [
    {
      icon: TrendingUp,
      title: "Destaque Premium",
      description: "Apareça primeiro nas buscas e ganhe 3x mais clientes"
    },
    {
      icon: Users,
      title: "Avaliações Verificadas",
      description: "Sistema transparente que constrói sua reputação sólida"
    },
    {
      icon: Shield,
      title: "Contratos Seguros",
      description: "Proteção legal completa em todas as negociações"
    },
    {
      icon: CreditCard,
      title: "Pagamento Garantido",
      description: "Receba em até 24h após conclusão do serviço"
    }
  ];

  const plans = [
    {
      duration: "1 mês",
      price: "R$ 20",
      period: "/mês",
      badge: null as string | null,
      savings: null as string | null,
      features: ["Perfil básico", "5 propostas/mês", "Suporte por email", "Badge verificado"]
    },
    {
      duration: "6 meses",
      price: "R$ 18",
      period: "/mês",
      badge: "Mais Popular",
      savings: "10% OFF",
      features: ["Perfil premium", "Propostas ilimitadas", "Suporte prioritário", "Destaque nas buscas", "Analytics básicos"]
    },
    {
      duration: "12 meses",
      price: "R$ 16",
      period: "/mês",
      badge: "Melhor Valor",
      savings: "20% OFF",
      features: ["Tudo do plano anterior", "Selo profissional elite", "Suporte 24/7", "Analytics avançados", "Garantia de destaque"]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado:", formData);
    setIsModalOpen(false);
    alert("Redirecionando para pagamento...");
  };

  return (
    <section id="seja-profissional" className="section-padding bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-emerald opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-primary opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-3 glass-effect text-primary px-6 py-3 rounded-2xl text-sm font-semibold mb-8">
            <Award className="w-5 h-5" />
            <span>Seja um Profissional Elite</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-8 leading-tight">
            Transforme seu talento em{" "}
            <span className="text-gradient-primary relative">
              renda premium
              <div className="absolute -bottom-3 left-0 right-0 h-6 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light mb-12">
            Junte-se à elite dos prestadores de serviço. Clientes premium,
            <br className="hidden md:block" />
            pagamentos garantidos e crescimento acelerado.
          </p>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="hero"
                size="xl"
                className="text-lg px-16 py-8 h-auto btn-liquid glow-primary text-xl font-bold"
              >
                Cadastrar-me Agora
                <Star className="w-6 h-6 ml-2" />
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-emerald rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Torne-se um Profissional Elite
                  </DialogTitle>
                </div>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome completo"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu.email@exemplo.com"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profissão</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, profession: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione sua área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encanador">Encanador</SelectItem>
                        <SelectItem value="eletricista">Eletricista</SelectItem>
                        <SelectItem value="manicure">Manicure/Pedicure</SelectItem>
                        <SelectItem value="professor">Professor Particular</SelectItem>
                        <SelectItem value="psicologo">Psicólogo</SelectItem>
                        <SelectItem value="cuidador">Cuidador</SelectItem>
                        <SelectItem value="tecnico-ti">Técnico em TI</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Plans Selection */}
                <div className="space-y-4">
                  <Label>Escolha seu plano</Label>
                  <div className="grid gap-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.duration}
                        className={`relative border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                          formData.plan === plan.duration
                            ? "border-primary bg-primary/5 shadow-medium"
                            : "border-border hover:border-primary/50"
                        } ${plan.badge ? "ring-2 ring-primary/20" : ""}`}
                        onClick={() => setFormData({ ...formData, plan: plan.duration })}
                      >
                        {plan.badge && (
                          <Badge className="absolute -top-3 left-4 bg-gradient-emerald text-white border-0">
                            {plan.badge}
                          </Badge>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === plan.duration ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {formData.plan === plan.duration && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-foreground">{plan.duration}</h4>
                                {plan.savings && (
                                  <Badge variant="secondary" className="text-xs">
                                    {plan.savings}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-primary">{plan.price}</span>
                                <span className="text-muted-foreground text-sm">{plan.period}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">
                              {plan.features.length} recursos
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-primary" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Forma de pagamento</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.paymentMethod === "pix"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "pix" })}
                    >
                      <div className="text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <span className="font-semibold">PIX</span>
                        <div className="text-xs text-muted-foreground">Aprovação instantânea</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.paymentMethod === "cartao"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "cartao" })}
                    >
                      <div className="text-center">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <span className="font-semibold">Cartão</span>
                        <div className="text-xs text-muted-foreground">Parcelamento disponível</div>
                      </div>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-14 text-lg font-bold"
                  disabled={!formData.name || !formData.email || !formData.plan}
                >
                  Finalizar Cadastro Premium
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao continuar, você concorda com nossos{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Termos de Uso</a> e{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Política de Privacidade</a>.
                </p>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-xl hover-lift border border-primary/5"
            >
              <div className="w-14 h-14 bg-gradient-emerald rounded-2xl flex items-center justify-center mb-6 shadow-medium">
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-3 text-lg">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="text-center bg-white rounded-3xl p-12 shadow-soft">
          <h3 className="text-3xl font-bold text-foreground mb-8">
            Histórias de Sucesso
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">+300%</div>
              <div className="text-sm text-muted-foreground">Aumento médio na renda dos profissionais</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">24h</div>
              <div className="text-sm text-muted-foreground">Tempo médio para primeiro cliente</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-2">4.9★</div>
              <div className="text-sm text-muted-foreground">Avaliação média dos nossos pros</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
