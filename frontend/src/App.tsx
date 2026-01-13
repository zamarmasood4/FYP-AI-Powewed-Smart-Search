import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index.jsx";
import JobSearch from "./pages/JobSearch.jsx";
import ProductSearch from "./pages/ProductSearch.jsx";
import UniversitySearch from "./pages/UniversitySearch.jsx";
import SearchResultsPage from "./pages/SearchResults.jsx";
import NotFound from "./pages/NotFound.jsx";
import Navbar from "./components/Navbar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import JobDetail from "./pages/JobDetail";
import History from "./pages/History";
import ProductDetail from "./pages/ProductDetail";
import UniversityDetail from "./pages/UniversityDetail";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen">
      {!isAdminRoute && <Navbar />}
      <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/products" element={<ProductSearch />} />
              <Route path="/universities" element={<UniversitySearch />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              {/* Auth routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/universities/:id" element={<UniversityDetail />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              {/* <Route path="/admin" element={<AdminDashboard />} /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
      {!isAdminRoute && <ThemeToggle />}
    </div>
  );
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
