import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface AdminUser {
  uid: string;
  email: string;
}

const AdminAdmins = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Não autenticado");
    return user.getIdToken();
  };

  const fetchAdmins = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdmins(await res.json());
      }
    } catch {
      toast({ title: "Erro ao carregar administradores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/admins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: addEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Administrador adicionado com sucesso" });
        setAddEmail("");
        setDialogOpen(false);
        fetchAdmins();
      } else {
        toast({ title: data.error || "Erro ao adicionar", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao adicionar administrador", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (uid: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/admins/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Administrador removido" });
        fetchAdmins();
      } else {
        toast({ title: data.error || "Erro ao remover", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao remover administrador", variant: "destructive" });
    }
  };

  const currentUid = auth.currentUser?.uid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Administradores</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Administrador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail do usuário</Label>
                <Input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  O usuário deve ter uma conta cadastrada no sistema.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>UID</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum administrador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((a) => (
                  <TableRow key={a.uid}>
                    <TableCell>{a.email}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.uid}</TableCell>
                    <TableCell>
                      {a.uid === currentUid ? (
                        <span className="text-xs text-muted-foreground">Você</span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {a.email} perderá acesso ao painel administrativo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemove(a.uid)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
