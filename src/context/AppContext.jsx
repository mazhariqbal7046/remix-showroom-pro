import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  PLANS_CONFIG,
  INITIAL_SHOWROOM_INFO,
  INITIAL_USER_PROFILE,
  INITIAL_SUBSCRIPTION,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_PARTNERS,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_SHOWROOMS,
  INITIAL_ADMIN_PAYMENTS,
  INITIAL_ADMIN_LOGS,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_BOOKINGS,
  INITIAL_PARTNER_INVESTMENTS,
  INITIAL_OWNERSHIP_HISTORY,
  INITIAL_PROFIT_SHARES,
  INITIAL_SETTLEMENTS,
  INITIAL_WITHDRAWALS,
} from '../data/initialData';
import { calculateFinancials, normaliseBooking, getApplicableAllocation, todayISO } from '../utils/businessLogic';
import { auth, ensureShowroom, isSupabaseConfigured, loadShowroomData, queueEmail, removeEntity, syncBookingPayment, syncEntity, syncSale, syncPurchase, syncShowroomProfile } from '../lib/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Safe local storage load helper
  // Business records are loaded from the authenticated showroom database.
  // Old browser-local demo records must never be presented as live business data.
  const loadLocal = (key, fallback) => {
    if (key !== 'pending_onboarding') return fallback;
    try {
      return JSON.parse(localStorage.getItem('showroom_pro_pending_onboarding') || '{}');
    } catch {
      return fallback;
    }
  };
  const loadArray = (key, fallback) => {
    const value = loadLocal(key, fallback);
    return Array.isArray(value) ? value : fallback;
  };

  // State
  const [showroomInfo, setShowroomInfo] = useState(() => loadLocal('showroom_info', INITIAL_SHOWROOM_INFO));
  const [userProfile, setUserProfile] = useState(() => loadLocal('user_profile', INITIAL_USER_PROFILE));
  const [subscription, setSubscription] = useState(() => {
    const stored = loadLocal('subscription', null);
    return stored?.planId === 'showroom'
      ? {
          ...stored,
          billingInterval: 'monthly',
          lastPaymentAmount: PLANS_CONFIG[0].monthlyPrice,
          invoices: (Array.isArray(stored.invoices) ? stored.invoices : INITIAL_SUBSCRIPTION.invoices).map((invoice) => ({
            ...invoice,
            plan: 'Showroom Pro',
            amount: PLANS_CONFIG[0].monthlyPrice,
          })),
        }
      : INITIAL_SUBSCRIPTION;
  });
  const [plans, setPlans] = useState(PLANS_CONFIG);
  const [customers, setCustomers] = useState(() => loadLocal('customers', INITIAL_CUSTOMERS));
  const [products, setProducts] = useState(() => loadLocal('products', INITIAL_PRODUCTS));
  const [suppliers, setSuppliers] = useState(() => loadLocal('suppliers', INITIAL_SUPPLIERS));
  const [sales, setSales] = useState(() => loadLocal('sales', INITIAL_SALES));
  const [purchases, setPurchases] = useState(() => loadLocal('purchases', INITIAL_PURCHASES));
  const [partners, setPartners] = useState(() => loadLocal('partners', INITIAL_PARTNERS));
  const [expenses, setExpenses] = useState(() => loadLocal('expenses', INITIAL_EXPENSES));
  const [notifications, setNotifications] = useState(() =>
    loadArray('notifications', INITIAL_NOTIFICATIONS).map((notification) => (
      notification.title === 'Partner Slot Alert'
        ? { ...notification, title: 'Partner Accounts Included', message: 'Unlimited showroom partner accounts are included in your Showroom Pro plan.' }
        : notification
    ))
  );
  const [adminShowrooms, setAdminShowrooms] = useState(() =>
    loadArray('admin_showrooms', INITIAL_ADMIN_SHOWROOMS).map((showroom) => ({
      ...showroom,
      plan: 'showroom',
      planName: 'Showroom Pro',
      partnerLimit: null,
      mrr: ['Active', 'Expiring Soon'].includes(showroom.status) ? PLANS_CONFIG[0].monthlyPrice : 0,
    }))
  );
  const [adminPayments, setAdminPayments] = useState(() =>
    loadArray('admin_payments', INITIAL_ADMIN_PAYMENTS).map((payment) => ({
      ...payment,
      plan: 'Showroom Pro',
      amount: PLANS_CONFIG[0].monthlyPrice,
    }))
  );
  const [adminLogs, setAdminLogs] = useState(() => loadLocal('admin_logs', INITIAL_ADMIN_LOGS));
  const [platformSettings, setPlatformSettings] = useState(() => loadLocal('platform_settings', INITIAL_PLATFORM_SETTINGS));
  const [bookings, setBookings] = useState(() => loadLocal('bookings', INITIAL_BOOKINGS));
  const [partnerInvestments, setPartnerInvestments] = useState(() => loadLocal('partner_investments', INITIAL_PARTNER_INVESTMENTS));
  const [ownershipHistory, setOwnershipHistory] = useState(() => loadLocal('ownership_history', INITIAL_OWNERSHIP_HISTORY));
  const [profitShareHistory, setProfitShareHistory] = useState(() => loadLocal('profit_share_history', INITIAL_PROFIT_SHARES));
  const [settlements, setSettlements] = useState(() => loadLocal('settlements', INITIAL_SETTLEMENTS));
  const [withdrawals, setWithdrawals] = useState(() => loadLocal('withdrawals', INITIAL_WITHDRAWALS));
  const [currentRole, setCurrentRole] = useState('showroom_owner'); // UI role follows the authenticated account only.
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let active = true;
    auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const user = data?.session?.user || null;
      setAuthUser(user);
      setAuthLoading(false);
      if (user && isSupabaseConfigured) await hydrateSupabase(user, data?.session?.access_token);
    });
    const { data: listener } = auth.onAuthStateChange(async (_event, session) => { const user = session?.user || null; setAuthUser(user); if (user && isSupabaseConfigured) await hydrateSupabase(user, session?.access_token); });
    return () => { active = false; listener?.subscription?.unsubscribe?.(); };
  }, []);

  const hydrateSupabase = async (user, accessToken) => {
    const pending = loadLocal('pending_onboarding', {});
    const showroomResult = await ensureShowroom({ user, metadata: pending });
    if (showroomResult.error || !showroomResult.data) return;
    const showroom = showroomResult.data;
    if (accessToken && user.app_metadata?.role !== 'super_admin') {
      const apiBase = (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
      try {
        const billingResponse = await fetch(`${apiBase}/api/billing/ensure-trial`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'x-showroom-id': showroom.id },
        });
        if (!billingResponse.ok) {
          const payload = await billingResponse.json().catch(() => ({}));
          window.dispatchEvent(new CustomEvent('showroom:database-error', { detail: { label: 'Subscription setup', message: payload.detail || 'Could not load or initialize the showroom subscription.' } }));
        }
      } catch (error) {
        window.dispatchEvent(new CustomEvent('showroom:database-error', { detail: { label: 'Subscription setup', message: error?.message || 'Could not connect to the billing service.' } }));
      }
    }
    setShowroomInfo((current) => ({ ...current, ...showroom, id: showroom.id, name: showroom.name, category: showroom.category || current.category, address: showroom.address || current.address, currency: showroom.currency || current.currency }));
    setUserProfile({ fullName: user.user_metadata?.fullName || user.user_metadata?.full_name || '', email: user.email || '', phone: showroom.phone || user.user_metadata?.phone || '', role: user.app_metadata?.role === 'super_admin' ? 'Super Admin' : 'Owner', avatar: '' });
    const loaded = await loadShowroomData(showroom.id);
    if (loaded.error || !loaded.data) return;
    const remote = loaded.data;
    setCustomers(remote.customers); setProducts(remote.products); setBookings(remote.bookings); setSales(remote.sales); setExpenses(remote.expenses); setPartners(remote.partners); setPartnerInvestments(remote.partnerInvestments); setOwnershipHistory(remote.ownershipHistory); setProfitShareHistory(remote.profitShareHistory); setSettlements(remote.settlements); setWithdrawals(remote.withdrawals); setSuppliers(remote.suppliers || []); setPurchases(remote.purchases || []);
    if (remote.subscription) setSubscription({ ...INITIAL_SUBSCRIPTION, ...remote.subscription, status: remote.subscription.status === 'trial' ? 'Trial' : remote.subscription.status });
    ['customers', 'products', 'bookings', 'sales', 'expenses', 'partners', 'partner_investments', 'ownership_history', 'profit_share_history', 'settlements', 'withdrawals'].forEach((key) => saveLocal(key, remote[key === 'partner_investments' ? 'partnerInvestments' : key] || []));
    try {
      [
        'showroom_info', 'user_profile', 'subscription', 'customers', 'products', 'suppliers',
        'sales', 'purchases', 'partners', 'expenses', 'notifications', 'admin_showrooms',
        'admin_payments', 'admin_logs', 'platform_settings', 'bookings', 'partner_investments',
        'ownership_history', 'profit_share_history', 'settlements', 'withdrawals',
        'showroom_pro_pending_onboarding',
      ].forEach((key) => localStorage.removeItem(key));
    } catch {}
  };

  // Local storage is intentionally not used for business records. Supabase is
  // the source of truth; silently caching failed writes made the old demo look real.
  const saveLocal = () => {};
  const newRecordId = () => globalThis.crypto.randomUUID();

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error('Showroom Pro is not connected to Supabase yet. Configure the Supabase URL and publishable key before signing in.');
    const result = await auth.signIn(email, password);
    if (result.error) throw result.error;
    return result;
  };
  const signUp = async ({ email, password, metadata }) => {
    if (!isSupabaseConfigured) throw new Error('Showroom Pro is not connected to Supabase yet. Configure the Supabase URL and publishable key before creating an account.');
    try { localStorage.setItem('showroom_pro_pending_onboarding', JSON.stringify(metadata || {})); } catch {}
    const result = await auth.signUp({ email, password, metadata });
    if (result.error) throw result.error;
    if (result.data?.user && result.data?.session) await hydrateSupabase(result.data.user, result.data.session.access_token);
    return result;
  };
  const signOut = async () => { await auth.signOut(); setAuthUser(null); };
  const queueEmailNotification = async (payload) => {
    const session = (await auth.getSession()).data?.session;
    return queueEmail({ ...payload, showroomId: showroomInfo?.id, accessToken: session?.access_token });
  };
  const closeMonthlyReport = async (monthStart, notes = '') => {
    const session = (await auth.getSession()).data?.session;
    if (!showroomInfo?.id || !session?.access_token) return { data: null, error: new Error('Authenticated showroom session is required.') };
    const base = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
    const response = await fetch(`${base}/api/reports/monthly-closing`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'x-showroom-id': showroomInfo.id, 'Content-Type': 'application/json' }, body: JSON.stringify({ month_start: monthStart, notes }) });
    const data = await response.json().catch(() => ({}));
    return response.ok ? { data, error: null } : { data: null, error: new Error(data.detail || 'Monthly closing failed.') };
  };
  const apiRequest = async (path, { method = 'GET', body, showroom = false } = {}) => {
    const session = (await auth.getSession()).data?.session;
    if (!session?.access_token) return { data: null, error: new Error('Please sign in to continue.') };
    const base = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
    const headers = { Authorization: `Bearer ${session.access_token}` };
    if (showroom && showroomInfo?.id) headers['x-showroom-id'] = showroomInfo.id;
    if (body) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${base}${path}`, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    return response.ok ? { data, error: null } : { data: null, error: new Error(data.detail || 'Request failed.') };
  };
  const adminRequest = (path, options) => apiRequest(path, options);
  const fetchAdminMetrics = () => adminRequest('/api/admin/metrics');
  const fetchAdminShowrooms = async () => {
    const result = await adminRequest('/api/admin/showrooms');
    if (result.data?.showrooms) setAdminShowrooms(result.data.showrooms);
    return result;
  };
  const fetchPlatformPaymentSettings = () => adminRequest('/api/admin/payment-settings');
  const savePlatformPaymentSettings = (body) => adminRequest('/api/admin/payment-settings', { method: 'PUT', body });
  const fetchSubscriptionPayments = () => adminRequest('/api/admin/subscription-payments');
  const fetchPlatformActivityLogs = () => adminRequest('/api/admin/activity-logs');
  const reviewSubscriptionPayment = (id, body) => adminRequest(`/api/admin/subscription-payments/${id}/review`, { method: 'POST', body });
  const fetchBillingSubscription = () => apiRequest('/api/billing/subscription', { showroom: true });
  const submitSubscriptionPayment = (body) => apiRequest('/api/billing/subscription-payments', { method: 'POST', body, showroom: true });

  const notifyLowStockTransition = (before, after, includeInitial = false) => {
    if (!showroomInfo.email || !after) return;
    const availableBefore = before ? Number(before.quantity || 0) - Number(before.reservedQuantity || 0) : Infinity;
    const availableAfter = Number(after.quantity || 0) - Number(after.reservedQuantity || 0);
    const threshold = Number(after.minStockThreshold || 0);
    if (availableAfter <= threshold && (includeInitial || availableBefore > threshold)) {
      void queueEmailNotification({ eventType: 'low_stock', destination: showroomInfo.email, subject: `Low stock alert: ${after.name || after.model}`, body: `${after.name || after.model} has ${Math.max(0, availableAfter)} unreserved unit(s) available, at or below the minimum threshold of ${threshold}.`, recipientType: 'owner' });
    }
  };

  const notifyBookedCustomersOfArrival = (productId, receivedQuantity) => {
    const quantity = Math.max(0, Number(receivedQuantity || 0));
    if (!quantity) return;
    const candidates = bookings.filter((booking) => booking.bikeProductId === productId && !booking.stockArrivalNotifiedAt && !['Cancelled', 'Delivered'].includes(booking.status) && (booking.customerEmail || customers.find((customer) => customer.id === booking.customerId)?.email)).sort((a, b) => String(a.bookingDate || '').localeCompare(String(b.bookingDate || ''))).slice(0, quantity);
    if (!candidates.length) return;
    const notifiedAt = new Date().toISOString();
    const notifiedIds = new Set(candidates.map((booking) => booking.id));
    const updatedBookings = bookings.map((booking) => notifiedIds.has(booking.id) ? { ...booking, stockArrivalNotifiedAt: notifiedAt } : booking);
    setBookings(updatedBookings);
    for (const booking of candidates) {
      const email = booking.customerEmail || customers.find((customer) => customer.id === booking.customerId)?.email;
      void queueEmailNotification({ eventType: 'bike_stock_arrived', destination: email, subject: `Your booked ${booking.bikeBrand || ''} ${booking.bikeModel || 'EV bike'} is in stock`, body: `Hello ${booking.customerName}, the bike reserved under booking ${booking.bookingNumber} has arrived at ${showroomInfo.name}. Please contact the showroom to arrange collection.`, recipientType: 'customer', recipientId: booking.customerId });
      void syncEntity('bookings', { ...booking, stockArrivalNotifiedAt: notifiedAt }, showroomInfo.id);
    }
  };

  // Active Plan Resolution
  const activePlan = useMemo(() => {
    return plans.find(p => p.id === subscription.planId) || plans[0];
  }, [plans, subscription.planId]);

  // The one Showroom Pro subscription includes unlimited partner accounts.
  const partnerLimitInfo = useMemo(() => {
    const count = partners.length;
    return {
      count,
      limit: null,
      isUnlimited: true,
      remaining: Infinity,
      isLimitReached: false,
      displayLimitText: `${count} active partner accounts · Unlimited included`,
      warningMessage: null,
      canAddPartner: true,
    };
  }, [partners.length]);

  // Financial & Inventory Aggregations
  const dashboardStats = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalPaidSales = sales.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
    const totalSalesBalance = sales.reduce((sum, s) => sum + (Number(s.remainingBalance) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalStockCostValue = products.reduce((sum, p) => sum + ((Number(p.costPrice) || 0) * (Number(p.quantity) || 0)), 0);
    const totalStockRetailValue = products.reduce((sum, p) => sum + ((Number(p.sellingPrice) || 0) * (Number(p.quantity) || 0)), 0);
    const netProfit = totalSales - totalExpenses;

    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockThreshold).length;
    const outOfStockCount = products.filter(p => p.quantity <= 0).length;

    return {
      totalSales,
      totalPaidSales,
      totalSalesBalance,
      totalExpenses,
      totalStockCostValue,
      totalStockRetailValue,
      netProfit,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockCount,
      outOfStockCount,
      activePartners: partners.length,
    };
  }, [sales, expenses, products, customers.length, partners.length]);

  const financials = useMemo(() => calculateFinancials({ sales, purchases, expenses, bookings, products }), [sales, purchases, expenses, bookings, products]);

  const bookingStats = useMemo(() => {
    const reserved = bookings.filter((b) => !['Cancelled', 'Delivered'].includes(b.status));
    const received = bookings.reduce((sum, b) => sum + (b.payments || []).reduce((p, item) => p + Number(item.amount || 0), 0), 0);
    return { total: bookings.length, pending: reserved.length, received, outstanding: bookings.reduce((sum, b) => sum + Math.max(0, Number(b.totalPrice || 0) - Number(b.amountReceived || 0)), 0), reservedByProduct: reserved.reduce((map, b) => ({ ...map, [b.bikeProductId]: (map[b.bikeProductId] || 0) + 1 }), {}) };
  }, [bookings]);

  const partnerFinance = useMemo(() => partners.map((partner) => {
    const capital = partnerInvestments.filter((i) => i.partnerId === partner.id && i.status !== 'Reversed').reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const paid = settlements.filter((s) => s.partnerId === partner.id && s.type === 'Profit payment').reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const allocation = getApplicableAllocation(profitShareHistory, todayISO(), {});
    const share = Number(allocation[partner.id] || partner.profitSharingPercentage || 0);
    return { ...partner, capital, profitShare: share, paid, currentAllocation: financials.distributableProfit * share / 100, unpaid: Math.max(0, financials.distributableProfit * share / 100 - paid) };
  }), [partners, partnerInvestments, settlements, profitShareHistory, financials.distributableProfit]);

  // Customer Actions
  const addCustomer = (customerData) => {
    const newCust = {
      ...customerData,
      id: newRecordId(),
      totalPurchases: Number(customerData.totalPurchases) || 0,
      outstandingBalance: Number(customerData.outstandingBalance) || 0,
      registrationDate: customerData.registrationDate || new Date().toISOString().slice(0, 10),
      status: customerData.status || 'Active',
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveLocal('customers', updated);
    void syncEntity('customers', newCust, showroomInfo.id);
    return newCust;
  };

  const updateCustomer = (id, updatedFields) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCustomers(updated);
    saveLocal('customers', updated);
    void syncEntity('customers', updated.find((item) => item.id === id), showroomInfo.id);
  };

  const deleteCustomer = (id) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveLocal('customers', updated);
    void removeEntity('customers', id);
  };

  // Product Actions
  const addProduct = (productData) => {
    const newProd = {
      ...productData,
      id: newRecordId(),
      costPrice: Number(productData.costPrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      quantity: Math.max(0, Number(productData.quantity) || 0),
      minStockThreshold: Math.max(0, Number(productData.minStockThreshold) || 1),
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    saveLocal('products', updated);
    void syncEntity('inventory_units', newProd, showroomInfo.id);
    notifyLowStockTransition(null, newProd, true);
    notifyBookedCustomersOfArrival(newProd.id, newProd.quantity);
    return newProd;
  };

  const updateProduct = (id, updatedFields) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedFields,
          costPrice: updatedFields.costPrice !== undefined ? Number(updatedFields.costPrice) : p.costPrice,
          sellingPrice: updatedFields.sellingPrice !== undefined ? Number(updatedFields.sellingPrice) : p.sellingPrice,
          quantity: updatedFields.quantity !== undefined ? Math.max(0, Number(updatedFields.quantity)) : p.quantity,
          minStockThreshold: updatedFields.minStockThreshold !== undefined ? Math.max(0, Number(updatedFields.minStockThreshold)) : p.minStockThreshold,
        };
      }
      return p;
    });
    setProducts(updated);
    saveLocal('products', updated);
    void syncEntity('inventory_units', updated.find((item) => item.id === id), showroomInfo.id);
    const changed = updated.find((item) => item.id === id);
    notifyLowStockTransition(products.find((item) => item.id === id), changed);
    const beforeQuantity = Number(products.find((item) => item.id === id)?.quantity || 0);
    if (changed && Number(changed.quantity) > beforeQuantity) notifyBookedCustomersOfArrival(id, Number(changed.quantity) - beforeQuantity);
  };

  const deleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveLocal('products', updated);
    void removeEntity('inventory_units', id);
  };

  // Supplier Actions
  const addSupplier = (supplierData) => {
    const newSup = {
      ...supplierData,
      id: newRecordId(),
      outstandingBalance: Number(supplierData.outstandingBalance) || 0,
    };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    saveLocal('suppliers', updated);
    void syncEntity('suppliers', newSup, showroomInfo.id);
    return newSup;
  };

  const updateSupplier = (id, updatedFields) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    setSuppliers(updated);
    saveLocal('suppliers', updated);
    void syncEntity('suppliers', updated.find((item) => item.id === id), showroomInfo.id);
  };

  const deleteSupplier = (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveLocal('suppliers', updated);
    void removeEntity('suppliers', id);
  };

  // Sales & Invoices Actions
  const addSale = (saleData) => {
    const invNum = `INV-${new Date().getFullYear()}-${Date.now()}`;
    const saleCostOfGoods = (saleData.items || []).reduce((sum, item) => {
      const product = products.find((row) => row.id === item.productId || row.name === item.productName);
      return sum + Number(item.quantity || 0) * Number(item.unitCost ?? product?.costPrice ?? 0);
    }, 0);
    const newSale = {
      ...saleData,
      id: newRecordId(),
      invoiceNumber: invNum,
      date: saleData.date || new Date().toISOString().slice(0, 10),
      subtotal: Number(saleData.subtotal) || 0,
      discount: Number(saleData.discount) || 0,
      total: Number(saleData.total) || 0,
      costOfGoods: saleCostOfGoods,
      paidAmount: Number(saleData.paidAmount) || 0,
      remainingBalance: Math.max(0, (Number(saleData.total) || 0) - (Number(saleData.paidAmount) || 0)),
      status: Number(saleData.paidAmount) >= Number(saleData.total) ? 'Paid' : (Number(saleData.paidAmount) > 0 ? 'Partially Paid' : 'Unpaid'),
    };

    for (const item of saleData.items || []) {
      const product = products.find((p) => p.id === item.productId || p.name === item.productName);
      if (product && Number(item.quantity || 0) > Number(product.quantity || 0) - Number(product.reservedQuantity || 0)) {
        throw new Error(`Only ${Math.max(0, Number(product.quantity || 0) - Number(product.reservedQuantity || 0))} unreserved ${product.name} unit(s) are available.`);
      }
    }
    const productUpdates = products.map((product) => {
      const soldQuantity = (saleData.items || []).filter((item) => item.productId === product.id || item.productName === product.name).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      return soldQuantity ? { ...product, quantity: Math.max(0, Number(product.quantity || 0) - soldQuantity) } : product;
    });
    setProducts(productUpdates);
    productUpdates.filter((product) => product.quantity !== products.find((old) => old.id === product.id)?.quantity).forEach((product) => {
      void syncEntity('inventory_units', product, showroomInfo.id);
      notifyLowStockTransition(products.find((old) => old.id === product.id), product);
    });

    // Update customer purchases and balance if linked
    if (saleData.customerId) {
      const customerUpdates = customers.map((customer) => customer.id === saleData.customerId ? { ...customer, totalPurchases: Number(customer.totalPurchases || 0) + newSale.total, outstandingBalance: Number(customer.outstandingBalance || 0) + newSale.remainingBalance } : customer);
      setCustomers(customerUpdates);
      const customer = customerUpdates.find((item) => item.id === saleData.customerId);
      if (customer) void syncEntity('customers', customer, showroomInfo.id);
    }

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveLocal('sales', updatedSales);
    void syncSale(newSale, showroomInfo.id);

    // Add notification
    addNotification({
      type: 'success',
      title: 'Sale Recorded',
      message: `Invoice ${invNum} created for ${saleData.customerName || 'Customer'} (${formatCurrency(newSale.total, showroomInfo.currency)}).`,
      link: '/invoices',
    });

    return newSale;
  };

  const deleteSale = (id) => {
    const sale = sales.find((item) => item.id === id);
    if (!sale) return;
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveLocal('sales', updated);
    void removeEntity('sales', id);
    const restoredProducts = products.map((product) => ({ ...product, quantity: Number(product.quantity || 0) + (sale.items || []).filter((item) => item.productId === product.id || item.productName === product.name).reduce((sum, item) => sum + Number(item.quantity || 0), 0) }));
    setProducts(restoredProducts);
    restoredProducts.filter((product) => product.quantity !== products.find((old) => old.id === product.id)?.quantity).forEach((product) => void syncEntity('inventory_units', product, showroomInfo.id));
    if (sale.customerId) {
      const updatedCustomers = customers.map((customer) => customer.id === sale.customerId ? { ...customer, totalPurchases: Math.max(0, Number(customer.totalPurchases || 0) - Number(sale.total || 0)), outstandingBalance: Math.max(0, Number(customer.outstandingBalance || 0) - Number(sale.remainingBalance || 0)) } : customer);
      setCustomers(updatedCustomers);
      const customer = updatedCustomers.find((item) => item.id === sale.customerId);
      if (customer) void syncEntity('customers', customer, showroomInfo.id);
    }
  };

  // Purchases Actions
  const addPurchase = (purchaseData) => {
    const newPur = {
      ...purchaseData,
      id: newRecordId(),
      date: purchaseData.date || new Date().toISOString().slice(0, 10),
      totalCost: Number(purchaseData.totalCost) || 0,
      paidAmount: Number(purchaseData.paidAmount) || 0,
      remainingBalance: Math.max(0, (Number(purchaseData.totalCost) || 0) - (Number(purchaseData.paidAmount) || 0)),
      status: Number(purchaseData.paidAmount) >= Number(purchaseData.totalCost) ? 'Paid' : 'Partially Paid',
    };

    // Increase product quantities in stock
    if (purchaseData.items && purchaseData.items.length) {
      const productUpdates = products.map((prod) => {
        const purItem = purchaseData.items.find((item) => item.productName === prod.name || item.productId === prod.id);
        if (!purItem) return prod;
        const oldQuantity = Number(prod.quantity || 0);
        const receivedQuantity = Number(purItem.quantity || 0);
        const unitCost = Number(purItem.unitCost || 0);
        return { ...prod, quantity: oldQuantity + receivedQuantity, costPrice: oldQuantity + receivedQuantity > 0 ? ((oldQuantity * Number(prod.costPrice || 0)) + (receivedQuantity * unitCost)) / (oldQuantity + receivedQuantity) : unitCost };
      });
      setProducts(productUpdates);
      saveLocal('products', productUpdates);
      productUpdates.filter((product) => product.quantity !== products.find((old) => old.id === product.id)?.quantity).forEach((product) => {
        void syncEntity('inventory_units', product, showroomInfo.id);
        const oldProduct = products.find((old) => old.id === product.id);
        notifyLowStockTransition(oldProduct, product);
        const receivedQuantity = (purchaseData.items || []).filter((item) => item.productName === product.name || item.productId === product.id).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        notifyBookedCustomersOfArrival(product.id, receivedQuantity);
      });
    }

    const updated = [newPur, ...purchases];
    setPurchases(updated);
    saveLocal('purchases', updated);
    void syncPurchase(newPur, showroomInfo.id);
    return newPur;
  };

  // Partner accounts are unlimited on the single subscription plan.
  const addPartner = (partnerData) => {
    const newPartner = {
      ...partnerData,
      id: newRecordId(),
      joiningDate: partnerData.joiningDate || new Date().toISOString().slice(0, 10),
      status: 'Active',
    };
    const updated = [...partners, newPartner];
    setPartners(updated);
    saveLocal('partners', updated);
    void syncEntity('partners', newPartner, showroomInfo.id);
    return newPartner;
  };

  const updatePartner = (id, updatedFields) => {
    const updated = partners.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setPartners(updated);
    saveLocal('partners', updated);
    void syncEntity('partners', updated.find((item) => item.id === id), showroomInfo.id);
  };

  const removePartner = (id) => {
    const updated = partners.filter(p => p.id !== id);
    setPartners(updated);
    saveLocal('partners', updated);
    void removeEntity('partners', id);
  };

  // Expenses Actions
  const addExpense = (expenseData) => {
    const newExp = {
      ...expenseData,
      id: newRecordId(),
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || new Date().toISOString().slice(0, 10),
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveLocal('expenses', updated);
    void syncEntity('expenses', newExp, showroomInfo.id);
    return newExp;
  };

  const updateExpense = (id, updatedFields) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...updatedFields, amount: updatedFields.amount !== undefined ? Number(updatedFields.amount) : e.amount } : e);
    setExpenses(updated);
    saveLocal('expenses', updated);
    void syncEntity('expenses', updated.find((item) => item.id === id), showroomInfo.id);
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveLocal('expenses', updated);
    void removeEntity('expenses', id);
  };

  // Subscription Actions
  const updateSubscriptionPlan = (planId) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan || planId !== 'showroom') return;

    const newSub = {
      ...subscription,
      planId,
      billingInterval: 'monthly',
      status: subscription.status || 'Trial',
      invoices: subscription.invoices || [],
    };
    setSubscription(newSub);
    saveLocal('subscription', newSub);
  };

  // Notifications Actions
  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveLocal('notifications', updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveLocal('notifications', updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveLocal('notifications', []);
  };

  const addNotification = (item) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
      ...item,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveLocal('notifications', updated);
  };

  // EV booking, finance and partner accounting actions
  const persist = (setter, key, value) => { setter(value); saveLocal(key, value); return value; };
  const addBooking = (data) => {
    const initialAmount = Number(data.amountReceived || 0);
    const initialPayment = initialAmount > 0 ? [{ id: newRecordId(), receiptNumber: `RCT-${new Date().getFullYear()}-${Date.now()}`, date: data.bookingDate || new Date().toISOString().slice(0, 10), amount: initialAmount, method: data.paymentMethod || 'Cash', reference: data.paymentReference || null }] : [];
    const product = products.find((item) => item.id === data.bikeProductId);
    const next = { ...data, costOfGoods: Number(data.costOfGoods ?? product?.costPrice ?? 0), id: newRecordId(), bookingNumber: data.bookingNumber || `BK-${new Date().getFullYear()}-${Date.now()}`, payments: data.payments || initialPayment, status: data.status || 'Pending', deliveryStatus: data.deliveryStatus || 'Reserved' };
    const activeReservations = bookings.filter((item) => item.bikeProductId === next.bikeProductId && !['Cancelled', 'Delivered'].includes(item.status)).length;
    if (product && activeReservations >= Number(product.quantity || 0)) throw new Error(`No available ${product.name} unit remains for reservation.`);
    const normalized = normaliseBooking(next);
    void syncEntity('bookings', normalized, showroomInfo.id);
    normalized.payments.forEach((payment) => void syncBookingPayment(normalized.id, payment));
    if (product) {
      const productsUpdated = products.map((item) => item.id === product.id ? { ...item, reservedQuantity: Number(item.reservedQuantity || 0) + 1 } : item);
      setProducts(productsUpdated);
      const changed = productsUpdated.find((item) => item.id === product.id);
      void syncEntity('inventory_units', changed, showroomInfo.id);
      notifyLowStockTransition(product, changed);
    }
    return persist(setBookings, 'bookings', [normalized, ...bookings]);
  };
  const updateBooking = (id, fields) => {
    const current = bookings.find((item) => item.id === id);
    if (!current) throw new Error('Booking not found');
    const next = normaliseBooking({ ...current, ...fields });
    if (next.status === 'Delivered' && current.status !== 'Delivered' && !current.inventoryDeducted && current.bikeProductId) {
      const updatedProducts = products.map((product) => product.id === current.bikeProductId ? { ...product, quantity: Math.max(0, Number(product.quantity || 0) - 1), reservedQuantity: Math.max(0, Number(product.reservedQuantity || 0) - 1) } : product);
      setProducts(updatedProducts);
      saveLocal('products', updatedProducts);
      const changed = updatedProducts.find((product) => product.id === current.bikeProductId);
      if (changed) {
        void syncEntity('inventory_units', changed, showroomInfo.id);
        notifyLowStockTransition(products.find((product) => product.id === current.bikeProductId), changed);
      }
      next.inventoryDeducted = true;
    } else if (next.status === 'Cancelled' && current.status !== 'Cancelled' && current.status !== 'Delivered' && current.bikeProductId) {
      const updatedProducts = products.map((product) => product.id === current.bikeProductId ? { ...product, reservedQuantity: Math.max(0, Number(product.reservedQuantity || 0) - 1) } : product);
      setProducts(updatedProducts);
      const changed = updatedProducts.find((product) => product.id === current.bikeProductId);
      if (changed) void syncEntity('inventory_units', changed, showroomInfo.id);
    }
    void syncEntity('bookings', next, showroomInfo.id);
    if (next.status === 'Delivered' && current.status !== 'Delivered') {
      const customer = customers.find((item) => item.id === next.customerId);
      const destination = customer?.email || next.customerEmail;
      if (destination) void queueEmailNotification({ eventType: 'delivery_complete', destination, subject: `Bike delivery completed ${next.bookingNumber}`, body: `Hello ${next.customerName}, your ${next.bikeBrand} ${next.bikeModel} has been marked delivered.`, recipientType: 'customer', recipientId: next.customerId });
    }
    return persist(setBookings, 'bookings', bookings.map((booking) => booking.id === id ? next : booking));
  };
  const addBookingPayment = (id, payment) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error('Booking not found');
    const outstanding = Math.max(0, Number(booking.totalPrice || 0) - Number(booking.amountReceived || 0));
    if (Number(payment.amount || 0) > outstanding && !payment.allowAdvance) throw new Error('Payment exceeds outstanding balance. Confirm an advance or refund first.');
    const item = { ...payment, id: newRecordId(), receiptNumber: payment.receiptNumber || `RCT-${new Date().getFullYear()}-${Date.now()}`, date: payment.date || new Date().toISOString().slice(0, 10) };
    const received = [...(booking.payments || []), item].reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const status = received >= Number(booking.totalPrice) ? 'Fully Paid' : received > 0 ? 'Partially Paid' : booking.status;
    void syncBookingPayment(booking.id, item);
    return persist(setBookings, 'bookings', bookings.map((b) => b.id === id ? normaliseBooking({ ...b, payments: [...(b.payments || []), item], amountReceived: received, status }) : b));
  };
  const addPartnerInvestment = (data) => { const item = { ...data, id: newRecordId(), amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_capital_entries', { ...item, entryDate: item.date || item.entryDate, entryType: item.entryType || 'initial' }, showroomInfo.id); return persist(setPartnerInvestments, 'partner_investments', [item, ...partnerInvestments]); };
  const addSettlement = (data) => { const item = { ...data, id: newRecordId(), amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_settlements', { ...item, settlementDate: item.date || item.settlementDate, settlementType: item.type || 'Profit payment' }, showroomInfo.id); return persist(setSettlements, 'settlements', [item, ...settlements]); };
  const addWithdrawal = (data) => { const item = { ...data, id: newRecordId(), amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_settlements', { ...item, settlementDate: item.date || item.settlementDate, settlementType: 'Withdrawal' }, showroomInfo.id); return persist(setWithdrawals, 'withdrawals', [item, ...withdrawals]); };
  const addOwnershipArrangement = (data) => { const item = { ...data, id: newRecordId() }; void syncEntity('partner_allocations', { ...item, allocationType: 'ownership' }, showroomInfo.id); return persist(setOwnershipHistory, 'ownership_history', [item, ...ownershipHistory]); };
  const addProfitShareArrangement = (data) => { const item = { ...data, id: newRecordId() }; void syncEntity('partner_allocations', { ...item, allocationType: 'profit_sharing' }, showroomInfo.id); return persist(setProfitShareHistory, 'profit_share_history', [item, ...profitShareHistory]); };

  // Settings Actions
  const updateShowroomSettings = (fields) => {
    const updated = { ...showroomInfo, ...fields };
    setShowroomInfo(updated);
    saveLocal('showroom_info', updated);
    if (showroomInfo.id) void syncShowroomProfile(showroomInfo.id, fields);
  };

  const updateUserProfile = (fields) => {
    const updated = { ...userProfile, ...fields };
    setUserProfile(updated);
    saveLocal('user_profile', updated);
    void auth.updateProfile(fields);
  };

  // Super Admin Actions
  const toggleShowroomStatus = (id) => {
    const updated = adminShowrooms.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setAdminShowrooms(updated);
    saveLocal('admin_showrooms', updated);
  };

  // Currency helper tied to context
  const formatAmount = (amt) => {
    const num = Number(amt) || 0;
    const curr = showroomInfo.currency || 'PKR';
    const symbolMap = {
      PKR: 'Rs.',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED',
      SAR: 'SAR',
    };
    const sym = symbolMap[curr] || 'Rs.';
    return `${sym} ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const value = {
    showroomInfo,
    userProfile,
    subscription,
    plans,
    activePlan,
    partnerLimitInfo,
    dashboardStats,
    customers,
    products,
    suppliers,
    sales,
    purchases,
    partners,
    expenses,
    notifications,
    adminShowrooms,
    adminPayments,
    adminLogs,
    platformSettings,
    bookings,
    partnerInvestments,
    ownershipHistory,
    profitShareHistory,
    settlements,
    withdrawals,
    financials,
    bookingStats,
    partnerFinance,
    currentRole,
    setCurrentRole,
    authUser,
    authLoading,
    isSupabaseConfigured,
    queueEmailNotification,
    closeMonthlyReport,
    fetchAdminMetrics,
    fetchAdminShowrooms,
    fetchPlatformPaymentSettings,
    savePlatformPaymentSettings,
    fetchSubscriptionPayments,
    fetchPlatformActivityLogs,
    reviewSubscriptionPayment,
    fetchBillingSubscription,
    submitSubscriptionPayment,
    // Methods
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSale,
    deleteSale,
    addPurchase,
    addPartner,
    updatePartner,
    removePartner,
    addExpense,
    addBooking,
    updateBooking,
    addBookingPayment,
    addPartnerInvestment,
    addSettlement,
    addWithdrawal,
    addOwnershipArrangement,
    addProfitShareArrangement,
    updateExpense,
    deleteExpense,
    updateSubscriptionPlan,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    addNotification,
    updateShowroomSettings,
    updateUserProfile,
    toggleShowroomStatus,
    formatAmount,
    signIn,
    signUp,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
