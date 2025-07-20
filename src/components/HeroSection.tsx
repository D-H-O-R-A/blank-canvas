import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Shield, Zap, Play } from "lucide-react";

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen bg-gradient-hero overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 195, 137, 0.1) 0%, transparent 50%)`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: "0s",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute bottom-20 left-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: "1s",
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse"
          style={{
            animationDelay: "2s",
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
          }}
        />
      </div>

      <div className="container-custom section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[90vh]">
          {/* Left Column - Hero Content */}
          <div className="space-y-8 lg:space-y-12">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 glass-effect text-primary px-6 py-3 rounded-2xl text-sm font-semibold">
              <div className="relative">
                <Star className="w-5 h-5 fill-current" />
                <div className="absolute inset-0 animate-ping">
                  <Star className="w-5 h-5 fill-current opacity-30" />
                </div>
              </div>
              <span>Plataforma #1 em Serviços Premium</span>
            </div>

            {/* Main Headlines */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[0.9] tracking-tight">
                O profissional certo,{" "}
                <span className="text-gradient-primary relative">
                  na palma
                  <div className="absolute -bottom-3 left-0 right-0 h-6 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
                </span>{" "}
                da sua mão.
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light max-w-2xl">
                Encontre e contrate em segundos com a{" "}
                <span className="font-semibold text-primary">Click Serviços</span>.
                A revolução que você estava esperando.
              </p>
            </div>

            {/* Trust Indicators Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover-lift">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">100% Seguro</div>
                  <div className="text-xs text-muted-foreground">Verificados</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover-lift">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Instantâneo</div>
                  <div className="text-xs text-muted-foreground">Em segundos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover-lift">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Garantido</div>
                  <div className="text-xs text-muted-foreground">Satisfação</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button
                variant="hero"
                size="xl"
                className="group text-lg px-12 py-6 h-auto btn-liquid glow-primary"
                onClick={() => {
                  const element = document.getElementById("sobre");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Quero Contratar
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button
                variant="outline"
                size="xl"
                className="text-lg px-12 py-6 h-auto btn-liquid border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
                onClick={() => {
                  const element = document.getElementById("seja-profissional");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Sou Profissional
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-8 border-t border-primary/10">
              <div className="text-center">
                <div className="text-3xl font-black text-primary">15K+</div>
                <div className="text-sm text-muted-foreground">Profissionais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary">150K+</div>
                <div className="text-sm text-muted-foreground">Serviços</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">Avaliação</div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Mockup & Visual */}
          <div className="relative">
            {/* 3D Background Elements */}
            <div className="absolute inset-0">
              <div
                className="absolute top-10 right-10 w-72 h-72 bg-gradient-emerald rounded-3xl opacity-20 transform rotate-12 blur-xl"
                style={{
                  transform: `rotate(12deg) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                }}
              />
              <div
                className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-primary rounded-full opacity-15 blur-2xl"
                style={{
                  transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
                }}
              />
            </div>

            {/* Main Phone Mockup */}
            <div className="relative z-10 max-w-lg mx-auto">
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                {/* Phone Frame */}
                <div className="bg-white rounded-[3rem] p-8 shadow-xl">
                  <div className="aspect-[9/19] bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2.5rem] p-6 relative overflow-hidden">
                    {/* Mockup Content */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-foreground">Click Serviços</span>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="h-4 bg-primary/20 rounded-full w-3/4"></div>
                        <div className="h-4 bg-primary/15 rounded-full w-1/2"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-primary/10 rounded-2xl"></div>
                        <div className="aspect-square bg-primary/15 rounded-2xl"></div>
                      </div>
                      
                      <div className="bg-gradient-emerald rounded-2xl p-4 text-white">
                        <div className="text-sm font-semibold">João está a caminho!</div>
                        <div className="text-xs opacity-90">Chegada em 8 minutos</div>
                      </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-20 right-4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <div className="absolute bottom-32 left-4 w-1 h-1 bg-primary/60 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Floating UI Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-large max-w-48">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Verificado!</div>
                      <div className="text-xs text-muted-foreground">Profissional aprovado</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-large">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-navy rounded-full border-2 border-white"></div>
                      <div className="w-8 h-8 bg-success rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-sm font-medium">+5K felizes</div>
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