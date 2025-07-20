import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, CreditCard, Clock, TrendingUp, Users, Award, Zap } from "lucide-react";

export const ProfessionalSection = () => {
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
      title: "Destaque em nosso catálogo",
      description: "Apareça primeiro nas buscas e ganhe mais visibilidade"
    },
    {
      icon: Users,
      title: "Avaliações públicas",
      description: "Construa sua reputação com avaliações reais dos clientes"
    },
    {
      icon: Shield,
      title: "Contratos diretos via app",
      description: "Negociação transparente e segura através da plataforma"
    },
    {
      icon: CreditCard,
      title: "Pagamento garantido",
      description: "Receba seus pagamentos de forma segura e pontual"
    }
  ];

  const plans = [
    {
      duration: "1 mês",
      price: "R$ 20",
      period: "/mês",
      badge: null,
      features: ["Perfil básico", "5 serviços/mês", "Suporte por email"]
    },
    {
      duration: "6 meses",
      price: "R$ 18",
      period: "/mês",
      badge: "Mais Popular",
      features: ["Perfil premium", "Serviços ilimitados", "Suporte prioritário", "Badge de destaque"]
    },
    {
      duration: "12 meses",
      price: "R$ 16",
      period: "/mês",
      badge: "Melhor Valor",
      features: ["Tudo do plano anterior", "Análises detalhadas", "Suporte 24/7", "Selo de profissional verificado"]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Aqui seria implementada a integração com Firebase/Mercado Pago
  };

  return (
    <section id="seja-profissional" className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span>Seja um Profissional</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Seja um profissional{" "}
            <span className="text-primary">Click Serviços</span>{" "}
            hoje mesmo!
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Transforme seu talento em renda. Junte-se à nossa rede de profissionais 
            qualificados e tenha acesso a milhares de oportunidades.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Plans Section */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Escolha seu plano</h3>
            <div className="space-y-4">
              {plans.map((plan, index) => (
                <div
                  key={plan.duration}
                  className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-medium ${
                    plan.badge ? "border-primary shadow-soft" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setFormData({ ...formData, plan: plan.duration })}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-6 bg-primary text-white">
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground">{plan.duration}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.plan === plan.duration ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {formData.plan === plan.duration && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl p-8 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Cadastro de Profissional</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, profession: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encanador">Encanador</SelectItem>
                    <SelectItem value="eletricista">Eletricista</SelectItem>
                    <SelectItem value="manicure">Manicure</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="psicologo">Psicólogo</SelectItem>
                    <SelectItem value="cuidador">Cuidador</SelectItem>
                    <SelectItem value="tecnico-ti">Técnico em TI</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.paymentMethod === "pix" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "pix" })}
                  >
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <span className="text-sm font-medium">PIX</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.paymentMethod === "cartao" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, paymentMethod: "cartao" })}
                  >
                    <div className="text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <span className="text-sm font-medium">Cartão</span>
                    </div>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!formData.name || !formData.email || !formData.plan}
              >
                Quero me tornar profissional
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="text-primary hover:underline">Termos de Uso</a> e{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};