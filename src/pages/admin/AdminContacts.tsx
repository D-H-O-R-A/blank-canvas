import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import AdminPagination from "@/components/AdminPagination";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface ContactEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: string;
  recruiterUid?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-600", icon: Clock },
  responded: { label: "Respondido", color: "bg-primary/20 text-primary", icon: CheckCircle },
  ignored: { label: "Ignorado", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const AdminContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<ContactEntry | null>(null);

  const getToken = async () => auth.currentUser?.getIdToken();

  const loadContacts = async (p = page) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/contacts?page=${p}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data);
        setTotalPages(json.totalPages);
        setPage(json.page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadContacts(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      toast({ title: `Contato marcado como "${STATUS_CONFIG[status]?.label || status}"` });
      if (selected?.id === id) setSelected({ ...selected, status });
      loadContacts(page);
    } catch { toast({ title: "Erro ao atualizar", variant: "destructive" }); }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhum contato recebido</p>
        ) : contacts.map((c) => (
          <div
            key={c.id}
            className={`bg-card border rounded-xl p-4 sm:p-5 cursor-pointer hover:shadow-md transition-shadow ${c.status === "pending" ? "border-primary/30" : "border-border/50"}`}
            onClick={() => setSelected(c)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {c.status === "pending" && <Mail className="w-4 h-4 text-primary shrink-0" />}
                  <span className="font-semibold text-foreground truncate">{c.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{c.subject}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                {getStatusBadge(c.status)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.message}</p>
          </div>
        ))}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={(p) => loadContacts(p)} />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Detalhes do Contato
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium text-foreground">{selected.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">E-mail:</span>
                  <p className="font-medium text-foreground break-all">{selected.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <p className="font-medium text-foreground">{selected.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium text-foreground">{new Date(selected.createdAt).toLocaleString("pt-BR")}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Assunto:</span>
                <p className="font-semibold text-foreground">{selected.subject}</p>
              </div>

              {selected.recruiterUid && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-600">⚠️ Contestação de bloqueio — Recrutador</p>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground">Mensagem:</span>
                <div className="mt-1 bg-muted/30 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Status atual: {getStatusBadge(selected.status)}</span>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant={selected.status === "responded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus(selected.id, "responded")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Respondido
                  </Button>
                  <Button
                    variant={selected.status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus(selected.id, "pending")}
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" /> Pendente
                  </Button>
                  <Button
                    variant={selected.status === "ignored" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatus(selected.id, "ignored")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Ignorado
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContacts;
