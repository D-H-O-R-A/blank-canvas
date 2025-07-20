import { UserPlus, Search, Calendar, CheckCircle } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Faça seu cadastro",
      description: "Crie sua conta gratuitamente em menos de 2 minutos",
      details: "Cadastro simples e rápido com validação por SMS"
    },
    {
      icon: Search,
      title: "Escolha o serviço",
      description: "Navegue por centenas de categorias de serviços",
      details: "Filtros avançados por localização, preço e avaliação"
    },
    {
      icon: Calendar,
      title: "Agende quando quiser",
      description: "Escolha data, horário e confirme o agendamento",
      details: "Flexibilidade total para reagendamentos"
    },
    {
      icon: CheckCircle,
      title: "Receba o profissional",
      description: "Profissional chega no local e horário combinado",
      details: "Acompanhamento em tempo real via app"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>Como Funciona</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Serviços de qualidade em{" "}
            <span className="text-primary">4 passos simples</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Nossa plataforma foi projetada para ser intuitiva e eficiente. 
            Veja como é fácil encontrar o profissional ideal.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[calc(100%-2rem)] w-8 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-10"></div>
              )}
              
              <div className="bg-white rounded-2xl p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 relative z-20">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <step.icon className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <h3 className="font-semibold text-foreground mb-2 text-lg">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-3">
                  {step.description}
                </p>
                <p className="text-sm text-primary font-medium">
                  {step.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-soft max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Pronto para começar?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Junte-se a milhares de usuários que já descobriram a facilidade 
                  de encontrar profissionais qualificados.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors duration-300">
                    Começar agora
                  </button>
                  <button className="border border-border px-6 py-3 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors duration-300">
                    Ver exemplo
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                  <div className="text-6xl">📱</div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-success text-white px-3 py-1 rounded-full text-xs font-medium">
                  Online
                </div>
                <div className="absolute bottom-4 left-4 bg-white shadow-medium rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>João a caminho</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};