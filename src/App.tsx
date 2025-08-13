import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import HomeScreen from "@/screens/HomeScreen";
import InspectionFormScreen from "@/screens/InspectionFormScreen";
import ReportListScreen from "@/screens/ReportListScreen";
import AddVehicleScreen from "@/screens/AddVehicleScreen";
import NotFound from "./pages/NotFound";
import LoginScreen from "@/screens/LoginScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import { AuthProvider, RequireAuth } from "@/contexts/AuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignUpScreen />} />
              <Route path="/new" element={<RequireAuth><InspectionFormScreen /></RequireAuth>} />
              <Route path="/reports" element={<ReportListScreen />} />
              <Route path="/vehicles" element={<AddVehicleScreen />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
