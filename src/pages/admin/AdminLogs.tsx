import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import AdminPagination from "@/components/AdminPagination";

const API_BASE = "https://us-central1-click-servico.cloudfunctions.net/api";

interface LogEntry {
  id: string;
  endpoint: string;
  method: string;
  uid: string;
  timestamp: string;
  summary: string;
  ip: string;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = async (p = page) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE}/admin/logs?page=${p}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data);
        setTotalPages(json.totalPages);
        setPage(json.page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadLogs(); }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const methodColor = (m: string) => {
    if (m === "POST") return "bg-blue-500/20 text-blue-600";
    if (m === "PUT") return "bg-orange-500/20 text-orange-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Logs Internos</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Data</th>
              <th className="p-3">Método</th>
              <th className="p-3">Endpoint</th>
              <th className="p-3">UID</th>
              <th className="p-3">Resumo</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum log registrado</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString("pt-BR")}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-mono font-medium ${methodColor(l.method)}`}>{l.method}</span></td>
                <td className="p-3 font-mono text-xs text-foreground">{l.endpoint}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{l.uid ? l.uid.slice(0, 8) + "…" : "anon"}</td>
                <td className="p-3 text-muted-foreground text-xs max-w-xs truncate">{l.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={(p) => loadLogs(p)} />
    </div>
  );
};

export default AdminLogs;
