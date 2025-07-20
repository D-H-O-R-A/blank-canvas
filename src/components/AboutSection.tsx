import { Wrench, Heart, Shield, Zap, Clock, Users } from "lucide-react";

export const AboutSection = () => {
  const services = [
    { icon: Wrench, name: "Técnicos", description: "Encanador, eletricista, técnico em TI" },
    { icon: Heart, name: "Cuidadores", description: "Babá, cuidador de idosos, enfermagem" },
    { icon: Shield, name: "Segurança", description: "Segurança, porteiro, vigilante" },
    { icon: Zap, name: "Serviços", description: "Limpeza, jardinagem, manutenção" },
    { icon: Clock, name: "Educação", description: "Professor, tutor, instrutor" },
    { icon: Users, name: "Beleza", description: "Manicure, cabeleireiro, esteticista" },
  ];

  const features = [
    {
      title: "Profissionais Verificados",
      description: "Todos os prestadores passam por rigoroso processo de verificação",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Pagamento Seguro",
      description: "Transações protegidas e garantia de satisfação",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Avaliações Reais",
      description: "Sistema transparente de avaliações de clientes reais",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Suporte 24/7",
      description: "Atendimento especializado sempre que precisar",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="sobre" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Sobre a Plataforma</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Somos a ponte entre{" "}
            <span className="text-primary">quem precisa</span> e{" "}
            <span className="text-primary">quem faz acontecer</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Conectamos pessoas que precisam de serviços com profissionais qualificados, 
            criando uma rede de confiança e qualidade em todo o Brasil.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="group bg-card rounded-2xl p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-300`}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className={`w-4 h-4 rounded bg-gradient-to-r ${feature.gradient}`}></div>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};