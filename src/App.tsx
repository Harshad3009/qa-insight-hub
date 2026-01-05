import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { DateFilterProvider } from "@/contexts/DateFilterContext";
import Index from "./pages/Index";
import RunDetails from "./pages/RunDetails";
import TestRuns from "./pages/TestRuns";
import FlakyTests from "./pages/FlakyTests";
import Trends from "./pages/Trends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <DateFilterProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/runs" element={<TestRuns />} />
                <Route path="/runs/:id" element={<RunDetails />} />
                <Route path="/flaky" element={<FlakyTests />} />
                <Route path="/trends" element={<Trends />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </DateFilterProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
