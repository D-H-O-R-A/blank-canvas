import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Clock, Bell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTargetDate = () => {
  const now = new Date();
  const target = new Date(now);
  target.setMonth(target.getMonth() + 2);
  return target;
};

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

export const ComingSoonDialog = ({ open, onOpenChange }: Props) => {
  const [targetDate] = useState(getTargetDate);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg text-center p-0 overflow-hidden border-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary to-primary-hover p-8 pb-12 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-8 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-white">
              Em breve disponível!
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8 -mt-6 relative z-10">
          {/* Countdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-primary/10 p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Lançamento previsto</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {timeUnits.map((unit) => (
                <motion.div
                  key={unit.label}
                  className="bg-primary/5 rounded-xl p-3"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-2xl sm:text-3xl font-black text-primary leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">
                    {unit.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Estamos preparando uma experiência incrível para conectar você aos melhores profissionais da sua região. 
            Em breve você poderá contratar serviços com total segurança e praticidade.
          </p>

          <div className="space-y-3">
            <Button
              variant="hero"
              className="w-full h-12 font-bold"
              onClick={() => {
                document.getElementById("seja-profissional")?.scrollIntoView({ behavior: "smooth" });
                onOpenChange(false);
              }}
            >
              Sou profissional, quero me cadastrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Voltar ao site
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
