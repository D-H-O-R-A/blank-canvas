import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Rocket, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================== Canvas 2D Background ====================

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    ctx.clearRect(0, 0, w, h);

    // Floating circles
    const circles = [
      { x: w * 0.2, y: h * 0.3, r: 120, color: "rgba(0,195,137,0.12)", speed: 0.8 },
      { x: w * 0.75, y: h * 0.6, r: 80, color: "rgba(0,195,137,0.08)", speed: 1.2 },
      { x: w * 0.5, y: h * 0.15, r: 150, color: "rgba(1,27,51,0.06)", speed: 0.5 },
      { x: w * 0.85, y: h * 0.2, r: 60, color: "rgba(0,168,118,0.1)", speed: 1.5 },
      { x: w * 0.1, y: h * 0.75, r: 90, color: "rgba(0,195,137,0.07)", speed: 1 },
    ];

    for (const c of circles) {
      const offsetY = Math.sin(time * c.speed * 0.001) * 30;
      const offsetX = Math.cos(time * c.speed * 0.0007) * 15;
      ctx.beginPath();
      ctx.arc(c.x + offsetX, c.y + offsetY, c.r, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
    }

    // Particles
    for (let i = 0; i < 60; i++) {
      const seed = i * 137.508;
      const px = ((seed * 7.3) % w);
      const py = ((seed * 13.7) % h);
      const floatY = Math.sin(time * 0.001 + seed) * 8;
      const floatX = Math.cos(time * 0.0008 + seed * 0.5) * 5;
      const alpha = 0.15 + Math.sin(time * 0.002 + seed) * 0.1;

      ctx.beginPath();
      ctx.arc(px + floatX, py + floatY, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,195,137,${alpha})`;
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (time: number) => {
      draw(ctx, canvas.offsetWidth, canvas.offsetHeight, time);
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}

// ==================== Countdown Logic ====================

const LAUNCH_DATE = new Date("2026-06-01T00:00:00");

const calculateTimeLeft = (target: Date) => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

// ==================== Page Component ====================

const ComingSoon = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(LAUNCH_DATE));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(LAUNCH_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Minutos" },
    { value: timeLeft.seconds, label: "Segundos" },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Canvas 2D Background */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[1] bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Icon */}
          <motion.div
            className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </motion.div>

          {/* Title */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight">
              Em breve{" "}
              <span className="text-primary">disponível</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Estamos preparando uma experiência incrível para conectar você aos melhores profissionais da sua região.
            </p>
          </div>

          {/* Countdown */}
          <motion.div
            className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-border/50 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Lançamento previsto
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {timeUnits.map((unit, i) => (
                <motion.div
                  key={unit.label}
                  className="bg-primary/5 border border-primary/10 rounded-2xl p-3 sm:p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-3xl sm:text-5xl md:text-6xl font-black text-primary leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    {unit.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Em breve você poderá contratar serviços com total segurança e praticidade.
            Profissionais verificados, pagamento seguro e atendimento rápido.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="hero"
              size="xl"
              className="group text-base px-8 py-5 h-auto"
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  document.getElementById("seja-profissional")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Sou profissional, quero me cadastrar
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="text-base px-8 py-5 h-auto border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao site
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
