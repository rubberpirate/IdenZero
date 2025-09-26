import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import SimpleDashboard from "./pages/SimpleDashboard";
import { Button } from "./components/ui/button";



// Layout component that includes the Navbar
const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/dashboard'];
  const shouldShowNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-background">
      {shouldShowNavbar && <Navbar />}
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/market" element={<Index />} />
            <Route path="/dashboard" element={<SimpleDashboard />} />
            {/* 404 route */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl mb-6">Page not found</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};
export default App;
