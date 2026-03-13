import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Shield, Zap, Play, MapPin, Clock } from "lucide-react";
import person1 from "@/assets/review-person-1.jpg";
import person2 from "@/assets/review-person-2.jpg";
import person3 from "@/assets/review-person-3.jpg";
import { ComingSoonDialog } from "./ComingSoonDialog";

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

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
    <>
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
            className="absolute bottom-20 left-20 w-80 h-80 bg-primary/[0.08] rounded-full blur-3xl animate-pulse"
            style={{
              animationDelay: "1s",
              transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            }}
          />
        </div>

        <div className="container-custom pt-28 pb-16 lg:section-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center min-h-[80vh] lg:min-h-[90vh]">
            {/* Left Column */}
            <motion.div
              className="space-y-6 lg:space-y-12"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center gap-2 lg:gap-3 glass-effect text-primary px-4 lg:px-6 py-2 lg:py-3 rounded-2xl text-xs lg:text-sm font-semibold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="relative">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                  <div className="absolute inset-0 animate-ping">
                    <Star className="w-4 h-4 lg:w-5 lg:h-5 fill-current opacity-30" />
                  </div>
                </div>
                <span>Plataforma #1 em Serviços Premium</span>
              </motion.div>

              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-[0.95] tracking-tight">
                  O profissional certo,{" "}
                  <span className="text-gradient-primary relative">
                    na palma
                    <div className="absolute -bottom-2 lg:-bottom-3 left-0 right-0 h-4 lg:h-6 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
                  </span>{" "}
                  da sua mão.
                </h1>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light max-w-2xl">
                  Encontre e contrate em segundos com a{" "}
                  <span className="font-semibold text-primary">Click Serviços</span>.
                  A revolução que você estava esperando.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 lg:gap-6">
                {[
                  { icon: Shield, title: "100% Seguro", sub: "Verificados" },
                  { icon: Zap, title: "Instantâneo", sub: "Em segundos" },
                  { icon: CheckCircle, title: "Satisfação", sub: "Garantida" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="flex items-center gap-2 lg:gap-3 p-2 sm:p-3 lg:p-4 bg-white/50 backdrop-blur-sm rounded-xl lg:rounded-2xl hover-lift cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs lg:text-sm font-bold text-foreground">{item.title}</div>
                      <div className="text-[10px] lg:text-xs text-muted-foreground">{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="hero"
                    size="xl"
                    className="group text-base lg:text-lg px-8 lg:px-12 py-5 lg:py-6 h-auto btn-liquid glow-primary w-full sm:w-auto"
                    onClick={() => setComingSoonOpen(true)}
                  >
                    Quero Contratar
                    <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    size="xl"
                    className="text-base lg:text-lg px-8 lg:px-12 py-5 lg:py-6 h-auto btn-liquid border-2 border-primary/20 hover:border-primary hover:bg-primary/5 w-full sm:w-auto"
                    onClick={() => document.getElementById("seja-profissional")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Sou Profissional
                  </Button>
                </motion.div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 pt-6 lg:pt-8 border-t border-primary/10">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-primary">+1k</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Pro pré-cadastrado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-primary">+150</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Tipos de serviços</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black text-primary">4.9★</div>
                  <div className="text-xs lg:text-sm text-muted-foreground">Avaliação dos testadores</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Phone Mockup (hidden on mobile) */}
            <motion.div
              className="relative hidden md:block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="absolute inset-0">
                <div
                  className="absolute top-10 right-10 w-72 h-72 bg-gradient-emerald rounded-3xl opacity-20 transform rotate-12 blur-xl"
                  style={{ transform: `rotate(12deg) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
                />
                <div
                  className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-primary rounded-full opacity-15 blur-2xl"
                  style={{ transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)` }}
                />
              </div>

              <div className="relative z-10 max-w-lg mx-auto">
                <motion.div className="relative" whileHover={{ scale: 1.03 }} transition={{ duration: 0.5 }}>
                  {/* Phone Frame */}
                  <div className="bg-white rounded-[3rem] p-8 shadow-xl">
                    <div className="aspect-[9/19] bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2.5rem] p-6 relative overflow-hidden">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-foreground text-sm">Click Serviços</span>
                          </div>
                          <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
                        </div>

                        <div className="space-y-3">
                          <div className="h-3 bg-primary/20 rounded-full w-3/4"></div>
                          <div className="h-3 bg-primary/15 rounded-full w-1/2"></div>
                        </div>

                        <div className="bg-gradient-emerald rounded-2xl p-3 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold">João confirmou o agendamento!</span>
                          </div>
                          <div className="text-[10px] opacity-90">O encanador João estará disponível entre 8h e 12h.</div>
                        </div>

                        <div className="bg-blue-500 rounded-2xl p-3 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-semibold">João está a caminho!</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-90">
                            <Clock className="w-3 h-3" />
                            <span>Chegada estimada em 8 minutos</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-20 right-4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                      <div className="absolute bottom-32 left-4 w-1 h-1 bg-primary/60 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Floating: Verified */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-large max-w-48"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Verificado!</div>
                        <div className="text-xs text-muted-foreground">Profissional aprovado</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating: Likes with 3 avatars */}
                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-large"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <img src={person1} alt="Pessoa 1" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                        <img src={person2} alt="Pessoa 2" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                        <img src={person3} alt="Pessoa 3" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                      </div>
                      <div className="text-sm font-medium">+5K Likes</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ComingSoonDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen} />
    </>
  );
};
