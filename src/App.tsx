import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { RecruiterProtectedRoute } from "@/components/RecruiterProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";
import ComingSoon from "./pages/ComingSoon";
import Contact from "./pages/Contact";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminLogin from "./pages/admin/AdminLogin";
import RecruiterRegister from "./pages/RecruiterRegister";
import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterLayout from "./pages/recruiter/RecruiterLayout";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterClients from "./pages/recruiter/RecruiterClients";
import RecruiterWithdrawals from "./pages/recruiter/RecruiterWithdrawals";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import NotFound from "./pages/NotFound";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/recrutador/cadastro" element={<RecruiterRegister />} />
            <Route path="/recrutador/login" element={<RecruiterLogin />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/pagamento-sucesso" element={<PaymentSuccess />} />
            <Route path="/pagamento-erro" element={<PaymentError />} />
            <Route path="/em-breve" element={<ComingSoon />} />
            <Route path="/termos-de-uso" element={<TermsOfUse />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/politica-de-cookies" element={<CookiePolicy />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="recruiters" element={<AdminRecruiters />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
            <Route
              path="/recrutador"
              element={
                <RecruiterProtectedRoute>
                  <RecruiterLayout />
                </RecruiterProtectedRoute>
              }
            >
              <Route index element={<RecruiterDashboard />} />
              <Route path="clientes" element={<RecruiterClients />} />
              <Route path="saques" element={<RecruiterWithdrawals />} />
              <Route path="perfil" element={<RecruiterProfile />} />
              <Route path="*" element={<Navigate to="/recrutador" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
