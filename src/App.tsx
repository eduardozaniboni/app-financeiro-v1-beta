import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Planejamento from "./pages/Planejamento";
import Metas from "./pages/Metas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))'
          }
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transacoes" element={<Transacoes />} />
            <Route path="planejamento" element={<Planejamento />} />
            <Route path="metas" element={<Metas />} />
            <Route path="comparador" element={<div className="p-8 text-center text-muted-foreground">Módulo em desenvolvimento</div>} />
            <Route path="chatbot" element={<div className="p-8 text-center text-muted-foreground">Módulo em desenvolvimento</div>} />
            <Route path="ativos" element={<div className="p-8 text-center text-muted-foreground">Módulo em desenvolvimento</div>} />
            <Route path="parcelamentos" element={<div className="p-8 text-center text-muted-foreground">Módulo em desenvolvimento</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
