import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Skull } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Skull className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Click Serviços
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection("sobre")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Como funciona
            </button>
            <button
              onClick={() => scrollToSection("seja-profissional")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Seja um Profissional
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Contato
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => scrollToSection("contratar")}
              className="hover:border-primary hover:text-primary"
            >
              Quero contratar
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={() => scrollToSection("seja-profissional")}
            >
              Me tornar profissional
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
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
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-large rounded-b-2xl p-6 space-y-4">
            <button
              onClick={() => scrollToSection("inicio")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection("sobre")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Como funciona
            </button>
            <button
              onClick={() => scrollToSection("seja-profissional")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Seja um Profissional
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              Contato
            </button>
            <div className="flex flex-col space-y-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => scrollToSection("contratar")}
                className="w-full"
              >
                Quero contratar
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={() => scrollToSection("seja-profissional")}
                className="w-full"
              >
                Me tornar profissional
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};