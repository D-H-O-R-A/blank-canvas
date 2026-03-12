import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import emojiLightbulb from "@/assets/emoji-lightbulb.png";
import emojiShield from "@/assets/emoji-shield.png";
import emojiRocket from "@/assets/emoji-rocket.png";

export const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="hero"
                size="xl"
                className="group text-lg px-12 py-6 h-auto"
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contratar um serviço
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="xl"
                className="text-lg px-12 py-6 h-auto border-2 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => document.getElementById("seja-profissional")?.scrollIntoView({ behavior: "smooth" })}
              >
                Seja um prestador
              </Button>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { img: emojiLightbulb, title: "Inovação constante", desc: "Sempre evoluindo para oferecer a melhor experiência" },
              { img: emojiShield, title: "Conexão segura", desc: "Conectamos você a profissionais verificados com segurança" },
              { img: emojiRocket, title: "Crescimento acelerado", desc: "Oportunidades para profissionais e clientes crescerem juntos" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-12 h-12 object-contain" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
