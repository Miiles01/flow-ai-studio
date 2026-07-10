import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import LandingDev from "./pages/LandingDev";
import Afiliados from "./pages/Afiliados";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import BusinessInquiry from "./pages/BusinessInquiry";
import BusinessInquiryThanks from "./pages/BusinessInquiryThanks";
import Features from "./pages/Features";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import Boards from "./pages/Boards";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import SearchAI from "./pages/SearchAI";
import Trends from "./pages/Trends";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import ProgramApplicants from "./pages/ProgramApplicants";
import PublicApplicants from "./pages/PublicApplicants";
import NotFound from "./pages/NotFound";
import JoinFlow from "./pages/JoinFlow";
import Admin from "./pages/Admin";
import AuthLayout from "./components/AuthLayout";
import { useEffect, useState } from "react";
import { capturePendingReferral, registerPendingReferral } from "@/lib/referral";

const queryClient = new QueryClient();

const ReferralTracker = () => {
  const { user } = useAuth();
  useEffect(() => {
    capturePendingReferral();
  }, []);
  useEffect(() => {
    if (user) registerPendingReferral();
  }, [user]);
  return null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setOnboardingDone((data as any)?.onboarding_completed ?? false);
      });
  }, [user]);

  if (loading || (user && onboardingDone === null)) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    return <Navigate to={next} replace />;
  }
  return <>{children}</>;
};

const ProtectedOnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ReferralTracker />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home-dev" element={<LandingDev />} />
              <Route path="/acerca-de" element={<About />} />
              <Route path="/afiliados" element={<Afiliados />} />
              <Route path="/precios" element={<Pricing />} />
              <Route path="/precios/negocios" element={<BusinessInquiry />} />
              <Route path="/precios/negocios/gracias" element={<BusinessInquiryThanks />} />
              <Route path="/funciones" element={<Features />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/dashboard" element={<DashboardRoute><Dashboard /></DashboardRoute>} />
              <Route path="/boards" element={<DashboardRoute><Boards /></DashboardRoute>} />
              <Route path="/trends" element={<DashboardRoute><Trends /></DashboardRoute>} />
              <Route path="/boards/new" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/boards/join/:token" element={<JoinFlow />} />
              <Route path="/boards/:id" element={<Index />} />
              <Route path="/programs" element={<DashboardRoute><Programs /></DashboardRoute>} />
              <Route path="/programs/:id" element={<ProgramDetail />} />
              <Route path="/p/:slug" element={<ProgramDetail />} />
              <Route path="/search" element={<DashboardRoute><SearchAI /></DashboardRoute>} />
              <Route path="/search/:conversationId" element={<DashboardRoute><SearchAI /></DashboardRoute>} />
              {/* <Route path="/flows" element={<DashboardRoute><Index /></DashboardRoute>} /> */}
              <Route path="/profile" element={<DashboardRoute><Profile /></DashboardRoute>} />
              <Route path="/programs/:id/applicants" element={<ProgramApplicants />} />
              <Route path="/applicants/:token" element={<PublicApplicants />} />
              <Route path="/onboarding" element={<ProtectedOnboardingRoute><Onboarding /></ProtectedOnboardingRoute>} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              </Route>
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
