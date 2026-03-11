import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skull, ArrowUp, Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

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

  return (
    <footer className="bg-navy text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-4 gap-12 lg:gap-16">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Skull className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Click Serviços</span>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                Conectando pessoas que precisam com profissionais que fazem acontecer.
                O futuro dos serviços está aqui.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors duration-300"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#inicio" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-white/70 hover:text-primary transition-colors duration-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#contato" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect with Us */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Connect with Us</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300">
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-white/10 pt-12 mt-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">
                Fique por dentro das novidades
              </h3>
              <p className="text-white/70 mb-6">
                Receba as últimas atualizações sobre novos serviços e funcionalidades.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-primary"
                  required
                />
                <Button
                  type="submit"
                  variant="hero"
                  className="whitespace-nowrap"
                >
                  Inscrever-se
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/70 text-sm">
              © 2025 Click Serviços, Inc. All rights reserved.
            </div>
            <div className="text-white/70 text-sm">
              Made with ❤️ in Brazil
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-xl shadow-large hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 mx-auto" />
      </button>
    </footer>
  );
};
