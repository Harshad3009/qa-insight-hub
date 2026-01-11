import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route, useLocation, Navigate} from "react-router-dom";
import {SidebarProvider} from "@/components/ui/sidebar";
import {ThemeProvider} from "next-themes";
import {DateFilterProvider} from "@/contexts/DateFilterContext";
import Index from "./pages/Index";
import RunDetails from "./pages/RunDetails";
import TestRuns from "./pages/TestRuns";
import FlakyTests from "./pages/FlakyTests";
import Trends from "./pages/Trends";
import NotFound from "./pages/NotFound";
import {ProjectProvider} from "@/contexts/ProjectContext.tsx";
import {AuthProvider, useAuth} from "@/contexts/AuthContext";
import Login from "@/pages/Login.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import {Loader2} from "lucide-react";

const queryClient = new QueryClient();

// Helper component to protect routes
function ProtectedRoute({children}: { children: React.ReactNode }) {
    const {isAuthenticated, isLoading} = useAuth();
    const location = useLocation();

    // Wait for Auth Check
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Redirect if needed
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    return <>{children}</>;
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <TooltipProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <ProjectProvider>
                            <DateFilterProvider>
                                <Toaster/>
                                <Sonner/>
                                <SidebarProvider>
                                    <Routes>
                                        {/* Public Route */}
                                        <Route path="/login" element={<Login/>}/>

                                        {/* Protected Routes */}
                                        <Route path="/" element={<ProtectedRoute><Index/></ProtectedRoute>}/>
                                        <Route path="/runs" element={<ProtectedRoute><TestRuns/></ProtectedRoute>}/>
                                        <Route path="/runs/:id"
                                               element={<ProtectedRoute><RunDetails/></ProtectedRoute>}/>
                                        <Route path="/trends" element={<ProtectedRoute><Trends/></ProtectedRoute>}/>
                                        <Route path="/flaky" element={<ProtectedRoute><FlakyTests/></ProtectedRoute>}/>

                                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                        <Route path="*" element={<NotFound/>}/>
                                    </Routes>
                                </SidebarProvider>
                            </DateFilterProvider>
                        </ProjectProvider>
                    </AuthProvider>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
