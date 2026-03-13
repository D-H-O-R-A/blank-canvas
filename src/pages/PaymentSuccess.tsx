import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogIn, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-primary/10">
          <motion.div
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-3">
            Pagamento confirmado!
          </h1>

          <p className="text-muted-foreground mb-2 leading-relaxed">
            Seu cadastro como profissional na <span className="font-semibold text-primary">Click Serviços</span> foi realizado com sucesso.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Agora você pode acessar o painel do profissional e configurar seu perfil.
          </p>

          <div className="space-y-3">
            <Link to="/login" className="block">
              <Button variant="hero" size="lg" className="w-full h-14 text-lg font-bold">
                Fazer login
                <LogIn className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link to="/" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Voltar ao site
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Em caso de dúvidas, entre em contato pelo WhatsApp.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
