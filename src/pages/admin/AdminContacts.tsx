import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Mail } from "lucide-react";
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
  read: boolean;
}

const AdminContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const markRead = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ read: true }),
      });
      toast({ title: "Marcado como lido" });
      loadContacts(page);
    } catch { toast({ title: "Erro", variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Contatos</h1>
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhum contato recebido</p>
        ) : contacts.map((c) => (
          <div key={c.id} className={`bg-card border rounded-xl p-5 space-y-3 ${c.read ? "border-border/50 opacity-70" : "border-primary/30"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!c.read && <Mail className="w-4 h-4 text-primary" />}
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{c.subject}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.email} {c.phone && `• ${c.phone}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                {!c.read && (
                  <Button variant="ghost" size="icon" onClick={() => markRead(c.id)} title="Marcar como lido">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{c.message}</p>
          </div>
        ))}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={(p) => loadContacts(p)} />
    </div>
  );
};

export default AdminContacts;
