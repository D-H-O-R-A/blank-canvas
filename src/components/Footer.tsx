import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Instagram, Shield, Star, Lock, BadgeCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  const trustBadges = [
    { icon: Star, label: "Site bem avaliado" },
    { icon: Shield, label: "LGPD" },
    { icon: Lock, label: "Pagamento seguro" },
    { icon: BadgeCheck, label: "Profissionais verificados" },
    { icon: ShieldCheck, label: "Dados protegidos" },
  ];

  return (
    <footer className="bg-navy text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container-custom relative z-10">
        <div className="py-12 lg:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4 lg:mb-6">
                <img src="/lovable-uploads/logo.png" alt="Click Serviços" className="w-10 h-10 rounded-xl object-contain" />
                <span className="text-xl lg:text-2xl font-bold">Click Serviços</span>
              </div>
              <p className="text-white/70 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
                Conectando pessoas que precisam com profissionais que fazem acontecer.
                O futuro dos serviços está aqui.
              </p>
              <div className="flex gap-3 lg:gap-4">
                {[Facebook, Instagram, Linkedin, MessageCircle].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-9 h-9 lg:w-10 lg:h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Links Rápidos</h3>
              <ul className="space-y-3 lg:space-y-4">
                {[
                  { label: "Início", href: "#inicio" },
                  { label: "Sobre", href: "#sobre" },
                  { label: "Como funciona", href: "#como-funciona" },
                  { label: "Contato", href: "/contato" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-white/70 hover:text-primary transition-colors duration-300 text-sm lg:text-base">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-base lg:text-lg font-semibold mb-4 lg:mb-6">Legal</h3>
              <ul className="space-y-3 lg:space-y-4">
                <li>
                  <Link to="/termos-de-uso" className="text-white/70 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Termos de Uso</Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidade" className="text-white/70 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Política de Privacidade</Link>
                </li>
                <li>
                  <Link to="/politica-de-cookies" className="text-white/70 hover:text-primary transition-colors duration-300 text-sm lg:text-base">Política de Cookies</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-8 lg:pt-12 mt-8 lg:mt-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Fique por dentro das novidades</h3>
              <p className="text-white/70 mb-4 lg:mb-6 text-sm lg:text-base">Receba as últimas atualizações sobre novos serviços e funcionalidades.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 lg:gap-4 max-w-md mx-auto">
                <Input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-primary" required />
                <Button type="submit" variant="hero" className="whitespace-nowrap">Inscrever-se</Button>
              </form>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-white/60 text-xs sm:text-sm">
                <Icon className="w-4 h-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 lg:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 lg:gap-4">
            <div className="text-white/70 text-xs lg:text-sm">© 2025 Click Serviços, Inc. Todos os direitos reservados.</div>
            <div className="flex items-center gap-2 text-white/70 text-xs lg:text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span>Em conformidade com a LGPD</span>
            </div>
            <div className="text-white/70 text-xs lg:text-sm">
              Powered By{" "}
              <a 
                href="https://better2better.com.br" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-medium"
              >
                Better2better.com.br
              </a>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-10 h-10 lg:w-12 lg:h-12 bg-primary text-white rounded-xl shadow-large hover:shadow-xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="w-5 h-5 lg:w-6 lg:h-6 mx-auto" />
      </motion.button>
    </footer>
  );
};
