import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentUrl: string;
}

export const RegistrationSuccessDialog = ({ open, onOpenChange, paymentUrl }: Props) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!open || !paymentUrl) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.open(paymentUrl, "_blank");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, paymentUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            Cadastro iniciado com sucesso!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Você está sendo redirecionado para finalizar o pagamento no Mercado Pago.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecionando em <span className="font-bold text-primary">{countdown}s</span>...
          </p>
          <Button
            variant="hero"
            className="w-full"
            onClick={() => window.open(paymentUrl, "_blank")}
          >
            Ir para pagamento agora
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
