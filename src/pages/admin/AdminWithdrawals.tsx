import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Upload, Download, Image } from "lucide-react";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Withdrawal {
  id: string;
  recruiterUid: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterPixKey: string;
  amount: number;
  status: string;
  pixKey: string;
  receiptURL?: string;
  requestedAt: string;
  processedAt?: string;
}

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approveItem, setApproveItem] = useState<Withdrawal | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const receiptRef = useRef<HTMLInputElement>(null);

  const getToken = async () => auth.currentUser?.getIdToken();

  const load = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setWithdrawals(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (w: Withdrawal, status: "approved" | "rejected") => {
    setSaving(true);
    try {
      let receiptBase64 = "";
      let receiptContentType = "";
      if (status === "approved" && receiptFile) {
        const reader = new FileReader();
        receiptBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
          reader.readAsDataURL(receiptFile);
        });
        receiptContentType = receiptFile.type;
      }

      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/withdrawals/${w.recruiterUid}/${w.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, receipt: receiptBase64 || undefined, receiptContentType: receiptContentType || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: status === "approved" ? "Saque aprovado!" : "Saque rejeitado" });
      setApproveItem(null);
      setReceiptFile(null);
      setReceiptPreview(null);
      load();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovado</span>;
    if (status === "pending") return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeitado</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Saques de Recrutadores</h1>

      {withdrawals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum saque solicitado.</div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div key={`${w.recruiterUid}-${w.id}`} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-foreground">R$ {w.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{w.recruiterName} ({w.recruiterEmail})</p>
                  <p className="text-xs text-muted-foreground">PIX: {w.recruiterPixKey || w.pixKey}</p>
                  <p className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                {getStatusBadge(w.status)}
              </div>

              {w.status === "pending" && (
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button variant="hero" size="sm" onClick={() => { setApproveItem(w); setReceiptFile(null); setReceiptPreview(null); }}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction(w, "rejected")} disabled={saving}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
                  </Button>
                </div>
              )}

              {w.receiptURL && (
                <div className="pt-1 border-t border-border/50">
                  <a href={w.receiptURL} target="_blank" rel="noopener">
                    <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> Ver comprovante</Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approveItem} onOpenChange={(open) => { if (!open) { setApproveItem(null); setReceiptFile(null); setReceiptPreview(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Aprovar Saque</DialogTitle></DialogHeader>
          {approveItem && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p>Recrutador: <strong className="text-foreground">{approveItem.recruiterName}</strong></p>
                <p>Valor: <strong className="text-foreground">R$ {approveItem.amount.toFixed(2)}</strong></p>
                <p>PIX: <strong className="text-foreground">{approveItem.recruiterPixKey || approveItem.pixKey}</strong></p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Comprovante de pagamento *</p>
                <input ref={receiptRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setReceiptFile(e.target.files[0]);
                    const reader = new FileReader();
                    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
                <Button variant="outline" className="w-full" onClick={() => receiptRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" /> {receiptFile ? receiptFile.name : "Anexar comprovante"}
                </Button>
                {receiptPreview && <img src={receiptPreview} className="w-full rounded-lg border max-h-48 object-contain" />}
              </div>

              <Button variant="hero" className="w-full" onClick={() => handleAction(approveItem, "approved")} disabled={saving || !receiptFile}>
                {saving ? "Processando..." : "Confirmar aprovação"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawals;
