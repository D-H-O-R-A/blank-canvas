import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-liquid ${
        isScrolled
          ? "glass-effect shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToSection("inicio")}
          >
            <img
              src="/lovable-uploads/logo.png"
              alt="Click Serviços"
              className="w-12 h-12 rounded-2xl object-contain"
            />
            <span className="text-2xl font-black text-foreground tracking-tight">
              Click Serviços
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {["inicio", "sobre", "como-funciona", "seja-profissional", "contato"].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className="relative text-foreground hover:text-primary transition-all duration-300 font-medium text-lg group"
              >
                {section === "inicio" && "Início"}
                {section === "sobre" && "Sobre"}
                {section === "como-funciona" && "Como funciona"}
                {section === "seja-profissional" && "Seja um Pro"}
                {section === "contato" && "Contato"}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-emerald transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary/20 hover:border-primary hover:bg-primary/5 btn-liquid"
                onClick={() => scrollToSection("contratar")}
              >
                Quero contratar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="hero"
                size="lg"
                className="btn-liquid glow-primary"
                onClick={() => scrollToSection("seja-profissional")}
              >
                Me tornar Pro
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-3 rounded-xl hover:bg-primary/10 transition-colors duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden absolute top-full left-0 right-0 glass-effect shadow-xl rounded-b-3xl p-8 space-y-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {["inicio", "sobre", "como-funciona", "seja-profissional", "contato"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left py-3 text-foreground hover:text-primary transition-colors duration-300 font-medium text-lg"
                >
                  {section === "inicio" && "Início"}
                  {section === "sobre" && "Sobre"}
                  {section === "como-funciona" && "Como funciona"}
                  {section === "seja-profissional" && "Seja um Pro"}
                  {section === "contato" && "Contato"}
                </button>
              ))}
              <div className="flex flex-col space-y-4 pt-6 border-t border-primary/10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection("contratar")}
                  className="w-full border-2 border-primary/20 hover:border-primary"
                >
                  Quero contratar
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => scrollToSection("seja-profissional")}
                  className="w-full glow-primary"
                >
                  Me tornar Pro
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
