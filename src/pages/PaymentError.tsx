import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-destructive/10">
          <motion.div
            className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <XCircle className="w-10 h-10 text-destructive" />
          </motion.div>

          <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-3">
            Pagamento não concluído
          </h1>

          <p className="text-muted-foreground mb-2 leading-relaxed">
            Houve um problema ao processar seu pagamento. Isso pode acontecer por diversos motivos.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground font-medium mb-2">Possíveis causas:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Saldo insuficiente no cartão</li>
              <li>• Pagamento cancelado pelo usuário</li>
              <li>• Erro temporário no processamento</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Você pode tentar novamente ou entrar em contato com nosso suporte.
          </p>

          <div className="space-y-3">
            <Link to="/#seja-profissional" className="block">
              <Button variant="hero" size="lg" className="w-full h-14 text-lg font-bold">
                Tentar novamente
                <RefreshCw className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link to="/" className="block">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Precisa de ajuda? Entre em contato pelo WhatsApp.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentError;
