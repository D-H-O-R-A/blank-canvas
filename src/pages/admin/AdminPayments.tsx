import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import AdminPagination from "@/components/AdminPagination";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface Payment {
  id: string;
  professionalName: string;
  professionalEmail: string;
  preapprovalId: string;
  status: string;
  amount: number;
  paidAt: string;
  paidUntil: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = async (p = page) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/payments?page=${p}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setPayments(json.data);
        setTotalPages(json.totalPages);
        setPage(json.page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadPayments(); }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const statusColor = (s: string) => {
    if (s === "authorized" || s === "active") return "bg-primary/20 text-primary";
    if (s === "pending") return "bg-yellow-500/20 text-yellow-600";
    return "bg-red-500/20 text-red-600";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Profissional</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Data</th>
              <th className="p-3">Pago até</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum pagamento registrado</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3">
                  <div className="font-medium text-foreground">{p.professionalName}</div>
                  <div className="text-xs text-muted-foreground">{p.professionalEmail}</div>
                </td>
                <td className="p-3 text-foreground">R$ {p.amount?.toFixed(2)}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
                <td className="p-3 text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="p-3 text-muted-foreground">{p.paidUntil ? new Date(p.paidUntil).toLocaleDateString("pt-BR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={(p) => loadPayments(p)} />
    </div>
  );
};

export default AdminPayments;
