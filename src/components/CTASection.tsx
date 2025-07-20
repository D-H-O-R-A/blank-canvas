import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>O Futuro dos Serviços</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            O futuro dos serviços{" "}
            <span className="text-primary relative">
              está aqui
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-primary/20 rounded-full -z-10"></div>
            </span>
            . E você?
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Junte-se à revolução que está transformando a forma como pessoas 
            encontram e prestam serviços no Brasil.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              variant="hero"
              size="xl"
              className="group text-lg px-12 py-6 h-auto"
              onClick={() => {
                const element = document.getElementById("como-funciona");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contratar um serviço
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button
              variant="outline-white"
              size="xl"
              className="text-lg px-12 py-6 h-auto border-2 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                const element = document.getElementById("seja-profissional");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Seja um prestador
            </Button>
          </div>

          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💡</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Inovação constante</h3>
              <p className="text-sm text-muted-foreground">
                Sempre evoluindo para oferecer a melhor experiência
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🛡️</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Segurança garantida</h3>
              <p className="text-sm text-muted-foreground">
                Proteção total em todas as transações e serviços
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🚀</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Crescimento acelerado</h3>
              <p className="text-sm text-muted-foreground">
                Oportunidades ilimitadas para profissionais e clientes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};