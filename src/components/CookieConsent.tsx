import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type: "all" | "essential") => {
    localStorage.setItem("cookie-consent", type);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-xl p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                    Utilizamos cookies 🍪
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.
                    Ao continuar, você concorda com nossa{" "}
                    <Link to="/politica-de-cookies" className="text-primary underline hover:text-primary/80">
                      Política de Cookies
                    </Link>
                    {" "}e{" "}
                    <Link to="/politica-de-privacidade" className="text-primary underline hover:text-primary/80">
                      Política de Privacidade
                    </Link>.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => accept("essential")}
                  className="text-xs sm:text-sm"
                >
                  Apenas essenciais
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => accept("all")}
                  className="text-xs sm:text-sm"
                >
                  Aceitar todos
                </Button>
              </div>
              <button
                onClick={() => accept("essential")}
                className="absolute top-3 right-3 sm:static text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
