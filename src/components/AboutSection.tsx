import { Shield, Zap, Users, CheckCircle, ArrowRight, Star } from "lucide-react";

export const AboutSection = () => {
  const principles = [
    {
      icon: Shield,
      title: "Segurança",
      description: "Profissionais verificados com background check completo e garantia total",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Rapidez",
      description: "Encontre e contrate o profissional ideal em menos de 60 segundos",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Confiança",
      description: "Avaliações reais, transparência total e suporte especializado 24/7",
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section id="sobre" className="section-padding bg-background relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-3 glass-effect text-primary px-6 py-3 rounded-2xl text-sm font-semibold mb-8">
            <Star className="w-5 h-5 fill-current" />
            <span>Sobre a Plataforma</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-8 leading-tight">
            Conectamos{" "}
            <span className="text-gradient-primary relative">
              necessidades
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-emerald opacity-20 rounded-full transform -rotate-1"></div>
            </span>{" "}
            com{" "}
            <span className="text-gradient-primary relative">
              soluções
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
            A Click Serviços revoluciona a forma como você encontra profissionais qualificados.
            <br className="hidden md:block" />
            Tecnologia de ponta, experiência humana excepcional.
          </p>
        </div>

        {/* Three Principles */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="group hover-lift"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-soft border border-primary/5 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${principle.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${principle.color} rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large group-hover:scale-110 transition-all duration-500`}>
                    <principle.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                15K+
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">Profissionais</div>
              <div className="text-sm text-muted-foreground">Verificados ativamente</div>
            </div>
            
            <div className="group">
              <div className="text-4xl lg:text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                150K+
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">Serviços</div>
              <div className="text-sm text-muted-foreground">Realizados com sucesso</div>
            </div>
            
            <div className="group">
              <div className="text-4xl lg:text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                4.9★
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">Avaliação</div>
              <div className="text-sm text-muted-foreground">Média da plataforma</div>
            </div>
            
            <div className="group">
              <div className="text-4xl lg:text-5xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                99%
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">Satisfação</div>
              <div className="text-sm text-muted-foreground">Clientes recomendam</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-foreground">
              Por que somos diferentes?
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Verificação em 3 níveis</h4>
                  <p className="text-muted-foreground">Background check, validação de habilidades e teste prático para cada profissional.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Matching inteligente</h4>
                  <p className="text-muted-foreground">IA que conecta você com o profissional ideal baseado em localização, especialidade e disponibilidade.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Garantia total</h4>
                  <p className="text-muted-foreground">Se não ficar satisfeito, devolvemos seu dinheiro ou refazemos o serviço sem custo adicional.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-emerald rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Match perfeito encontrado!</div>
                    <div className="text-sm text-muted-foreground">3 profissionais disponíveis agora</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
                    <div className="w-10 h-10 bg-primary rounded-xl"></div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">João Silva</div>
                      <div className="text-sm text-muted-foreground">Eletricista • 4.9★ • 2.1km</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">R$ 120</div>
                      <div className="text-xs text-muted-foreground">Visita</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-primary/10">
                    <div className="w-10 h-10 bg-muted rounded-xl"></div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Maria Santos</div>
                      <div className="text-sm text-muted-foreground">Eletricista • 4.8★ • 3.5km</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">R$ 150</div>
                      <div className="text-xs text-muted-foreground">Visita</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-emerald text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 group">
                  Contratar João Silva
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-large">
              Disponível agora
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-large">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">100% Garantido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};