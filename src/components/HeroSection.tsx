import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

export const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen bg-gradient-hero overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-8 pt-20 lg:pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
          {/* Left Column - Text Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              <span>Plataforma #1 em Serviços</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Com um{" "}
                <span className="text-primary relative">
                  click
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 rounded-full -z-10"></div>
                </span>
                , o profissional certo na sua mão.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Click Serviços conecta você aos melhores profissionais onde você estiver, quando precisar.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground">
                  Profissionais verificados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground">
                  Pagamento seguro
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground">
                  Avaliação garantida
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="hero"
                size="xl"
                className="group"
                onClick={() => {
                  const element = document.getElementById("sobre");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Conheça a Plataforma
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button
                variant="outline-white"
                size="xl"
                onClick={() => {
                  const element = document.getElementById("seja-profissional");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Seja um Profissional
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/20">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Profissionais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Serviços realizados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Avaliação média</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary rounded-full opacity-10"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary rounded-full opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full animate-pulse"></div>
            
            {/* Main hero image */}
            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-large">
              <img
                src="/lovable-uploads/6d881a35-42ad-4d24-ac95-6a90a7cf758f.png"
                alt="Profissional Click Serviços"
                className="w-full h-auto rounded-2xl"
              />
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-medium">
                3C116
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute top-16 -left-8 bg-white rounded-2xl p-4 shadow-medium max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">Serviço confirmado!</div>
                  <div className="text-xs text-muted-foreground">João chegará em 15min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};