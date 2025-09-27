import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardLayout from "./components/DashboardLayout";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import Calendar from "./pages/Calendar";
import ActivityLogs from "./pages/ActivityLogs";
import UserManagement from "./pages/UserManagement";
import ThreatMonitor from "./pages/ThreatMonitor";
import SystemSettings from "./pages/SystemSettings";
import SecurityCenter from "./pages/SecurityCenter";
import AuditTrail from "./pages/AuditTrail";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Documents />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Projects />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Messages />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Calendar />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/activity" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer']}>
                    <DashboardLayout>
                      <ActivityLogs />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer']}>
                    <DashboardLayout title="User Management">
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/threats" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer', 'department_head']}>
                    <DashboardLayout title="Threat Monitor">
                      <ThreatMonitor />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer']}>
                    <DashboardLayout title="System Settings">
                      <SystemSettings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/security" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer', 'department_head', 'supervisor']}>
                    <DashboardLayout title="Security Center">
                      <SecurityCenter />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/audit" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer', 'department_head', 'supervisor']}>
                    <DashboardLayout title="Audit Trail">
                      <AuditTrail />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'security_officer', 'department_head', 'supervisor']}>
                    <DashboardLayout title="Notifications">
                      <Notifications />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
