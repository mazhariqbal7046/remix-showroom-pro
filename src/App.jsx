import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppProvider } from './context/AppContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { ShowroomLayout } from './components/layout/ShowroomLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PricingPage } from './pages/public/PricingPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { PartnerInvitePage } from './pages/auth/PartnerInvitePage';

// Showroom Pages
import { DashboardPage } from './pages/showroom/DashboardPage';
import { CustomersPage } from './pages/showroom/CustomersPage';
import { ProductsPage } from './pages/showroom/ProductsPage';
import { InventoryPage } from './pages/showroom/InventoryPage';
import { SuppliersPage } from './pages/showroom/SuppliersPage';
import { SalesPage } from './pages/showroom/SalesPage';
import { InvoicesPage } from './pages/showroom/InvoicesPage';
import { PurchasesPage } from './pages/showroom/PurchasesPage';
import { PartnersPage } from './pages/showroom/PartnersPage';
import { ExpensesPage } from './pages/showroom/ExpensesPage';
import { ReportsPage } from './pages/showroom/ReportsPage';
import { SubscriptionPage } from './pages/showroom/SubscriptionPage';
import { NotificationsPage } from './pages/showroom/NotificationsPage';
import { SettingsPage } from './pages/showroom/SettingsPage';
import { ProfilePage } from './pages/showroom/ProfilePage';
import { BookingsPage } from './pages/showroom/BookingsPage';
import { FinancePage } from './pages/showroom/FinancePage';
import { BusinessReportsPage } from './pages/showroom/BusinessReportsPage';
import { PartnerFinancePage } from './pages/showroom/PartnerFinancePage';
import { PartnerPortalPage } from './pages/showroom/PartnerPortalPage';
import { QuotationsPage } from './pages/showroom/QuotationsPage';
import { AIAssistantPage } from './pages/showroom/AIAssistantPage';

// Super Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminShowroomsPage } from './pages/admin/AdminShowroomsPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminRevenuePage } from './pages/admin/AdminRevenuePage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing & Pricing Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/partner-invite" element={<PartnerInvitePage />} />

              {/* Showroom Owner Management Routes */}
              <Route element={<ShowroomLayout />}>
                <Route path="/partner-portal" element={<PartnerPortalPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/quotations" element={<QuotationsPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/partner-finance" element={<PartnerFinancePage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/business-reports" element={<BusinessReportsPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Super Admin Routes */}
              <Route path="/super-admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="showrooms" element={<AdminShowroomsPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="plans" element={<AdminPlansPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="revenue" element={<AdminRevenuePage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="system-health" element={<AdminSystemHealthPage />} />
                <Route path="activity-logs" element={<AdminActivityLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
