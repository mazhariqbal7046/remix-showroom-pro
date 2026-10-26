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
import { auth, ensureShowroom, isSupabaseConfigured, loadShowroomData, queueEmail, removeEntity, syncBookingPayment, syncEntity } from '../lib/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Safe local storage load helper
  const loadLocal = (key, fallback) => {
    try {
      const data = localStorage.getItem(`showroom_pro_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  // State
  const [showroomInfo, setShowroomInfo] = useState(() => loadLocal('showroom_info', INITIAL_SHOWROOM_INFO));
  const [userProfile, setUserProfile] = useState(() => loadLocal('user_profile', INITIAL_USER_PROFILE));
  const [subscription, setSubscription] = useState(() => {
    const stored = loadLocal('subscription', null);
    return stored?.planId === 'showroom' ? stored : INITIAL_SUBSCRIPTION;
  });
  const [plans, setPlans] = useState(() => {
    const stored = loadLocal('plans', null);
    return stored?.some((plan) => plan.id === 'showroom') ? stored : PLANS_CONFIG;
  });
  const [customers, setCustomers] = useState(() => loadLocal('customers', INITIAL_CUSTOMERS));
  const [products, setProducts] = useState(() => loadLocal('products', INITIAL_PRODUCTS));
  const [suppliers, setSuppliers] = useState(() => loadLocal('suppliers', INITIAL_SUPPLIERS));
  const [sales, setSales] = useState(() => loadLocal('sales', INITIAL_SALES));
  const [purchases, setPurchases] = useState(() => loadLocal('purchases', INITIAL_PURCHASES));
  const [partners, setPartners] = useState(() => loadLocal('partners', INITIAL_PARTNERS));
  const [expenses, setExpenses] = useState(() => loadLocal('expenses', INITIAL_EXPENSES));
  const [notifications, setNotifications] = useState(() => loadLocal('notifications', INITIAL_NOTIFICATIONS));
  const [adminShowrooms, setAdminShowrooms] = useState(() => loadLocal('admin_showrooms', INITIAL_ADMIN_SHOWROOMS));
  const [adminPayments, setAdminPayments] = useState(() => loadLocal('admin_payments', INITIAL_ADMIN_PAYMENTS));
  const [adminLogs, setAdminLogs] = useState(() => loadLocal('admin_logs', INITIAL_ADMIN_LOGS));
  const [platformSettings, setPlatformSettings] = useState(() => loadLocal('platform_settings', INITIAL_PLATFORM_SETTINGS));
  const [bookings, setBookings] = useState(() => loadLocal('bookings', INITIAL_BOOKINGS));
  const [partnerInvestments, setPartnerInvestments] = useState(() => loadLocal('partner_investments', INITIAL_PARTNER_INVESTMENTS));
  const [ownershipHistory, setOwnershipHistory] = useState(() => loadLocal('ownership_history', INITIAL_OWNERSHIP_HISTORY));
  const [profitShareHistory, setProfitShareHistory] = useState(() => loadLocal('profit_share_history', INITIAL_PROFIT_SHARES));
  const [settlements, setSettlements] = useState(() => loadLocal('settlements', INITIAL_SETTLEMENTS));
  const [withdrawals, setWithdrawals] = useState(() => loadLocal('withdrawals', INITIAL_WITHDRAWALS));
  const [currentRole, setCurrentRole] = useState('showroom_owner'); // 'showroom_owner' | 'super_admin'
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    let active = true;
    auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const user = data?.session?.user || null;
      setAuthUser(user);
      setAuthLoading(false);
      if (user && isSupabaseConfigured) await hydrateSupabase(user);
    });
    const { data: listener } = auth.onAuthStateChange(async (_event, session) => { const user = session?.user || null; setAuthUser(user); if (user && isSupabaseConfigured) await hydrateSupabase(user); });
    return () => { active = false; listener?.subscription?.unsubscribe?.(); };
  }, []);

  const hydrateSupabase = async (user) => {
    const pending = loadLocal('pending_onboarding', {});
    const showroomResult = await ensureShowroom({ user, metadata: pending });
    if (showroomResult.error || !showroomResult.data) return;
    const showroom = showroomResult.data;
    setShowroomInfo((current) => ({ ...current, id: showroom.id, name: showroom.name, category: showroom.category || current.category, address: showroom.address || current.address, currency: showroom.currency || current.currency }));
    const loaded = await loadShowroomData(showroom.id);
    if (loaded.error || !loaded.data) return;
    const remote = loaded.data;
    setCustomers(remote.customers); setProducts(remote.products); setBookings(remote.bookings); setSales(remote.sales); setExpenses(remote.expenses); setPartners(remote.partners); setPartnerInvestments(remote.partnerInvestments); setOwnershipHistory(remote.ownershipHistory); setProfitShareHistory(remote.profitShareHistory); setSettlements(remote.settlements); setWithdrawals(remote.withdrawals);
    ['customers', 'products', 'bookings', 'sales', 'expenses', 'partners', 'partner_investments', 'ownership_history', 'profit_share_history', 'settlements', 'withdrawals'].forEach((key) => saveLocal(key, remote[key === 'partner_investments' ? 'partnerInvestments' : key] || []));
    try { localStorage.removeItem('showroom_pro_pending_onboarding'); } catch {}
  };

  // Persist harmless demo states to localStorage
  const saveLocal = (key, value) => {
    try {
      localStorage.setItem(`showroom_pro_${key}`, JSON.stringify(value));
    } catch {}
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) return { data: null, error: null, demo: true };
    const result = await auth.signIn(email, password);
    if (result.error) throw result.error;
    return result;
  };
  const signUp = async ({ email, password, metadata }) => {
    if (!isSupabaseConfigured) return { data: null, error: null, demo: true };
    try { localStorage.setItem('showroom_pro_pending_onboarding', JSON.stringify(metadata || {})); } catch {}
    const result = await auth.signUp({ email, password, metadata });
    if (result.error) throw result.error;
    if (result.data?.user && result.data?.session) await hydrateSupabase(result.data.user);
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
  const fetchAdminMetrics = async () => {
    const session = (await auth.getSession()).data?.session;
    if (!session?.access_token) return { data: null, error: new Error('Admin session is required.') };
    const base = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
    const response = await fetch(`${base}/api/admin/metrics`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = await response.json().catch(() => ({}));
    return response.ok ? { data, error: null } : { data: null, error: new Error(data.detail || 'Admin metrics request failed.') };
  };

  // Active Plan Resolution
  const activePlan = useMemo(() => {
    return plans.find(p => p.id === subscription.planId) || plans[0];
  }, [plans, subscription.planId]);

  // Partner Limit Rules Evaluation
  // Rule: Basic = 2, Business = 6, Enterprise = Unlimited
  const partnerLimitInfo = useMemo(() => {
    const count = partners.length;
    const limit = activePlan.partnerLimit;
    const isUnlimited = activePlan.isUnlimitedPartners || limit === null;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - count);
    const isLimitReached = !isUnlimited && count >= limit;

    let displayLimitText = isUnlimited
      ? `${count} active partners (Unlimited Plan)`
      : `${count} of ${limit} partner slots used`;

    let warningMessage = null;
    if (isLimitReached) {
      warningMessage = `You have reached the maximum limit of ${limit} partners on the ${activePlan.name}. Upgrade your subscription to invite additional showroom partners.`;
    } else if (!isUnlimited && remaining === 1) {
      warningMessage = `Only 1 partner slot remaining on your ${activePlan.name}.`;
    }

    return {
      count,
      limit,
      isUnlimited,
      remaining,
      isLimitReached,
      displayLimitText,
      warningMessage,
      canAddPartner: !isLimitReached,
    };
  }, [partners.length, activePlan]);

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
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
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
      id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
      costPrice: Number(productData.costPrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      quantity: Math.max(0, Number(productData.quantity) || 0),
      minStockThreshold: Math.max(0, Number(productData.minStockThreshold) || 1),
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    saveLocal('products', updated);
    void syncEntity('inventory_units', newProd, showroomInfo.id);
    if (showroomInfo.email && newProd.quantity <= newProd.minStockThreshold) void queueEmailNotification({ eventType: 'low_stock', destination: showroomInfo.email, subject: `Low stock alert: ${newProd.name || newProd.model}`, body: `${newProd.name || newProd.model} has ${newProd.quantity} units remaining, at or below the minimum threshold of ${newProd.minStockThreshold}.`, recipientType: 'owner' });
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
    if (showroomInfo.email && changed && changed.quantity <= changed.minStockThreshold) void queueEmailNotification({ eventType: 'low_stock', destination: showroomInfo.email, subject: `Low stock alert: ${changed.name || changed.model}`, body: `${changed.name || changed.model} has ${changed.quantity} units remaining, at or below the minimum threshold of ${changed.minStockThreshold}.`, recipientType: 'owner' });
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
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      outstandingBalance: Number(supplierData.outstandingBalance) || 0,
    };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    saveLocal('suppliers', updated);
    return newSup;
  };

  const updateSupplier = (id, updatedFields) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updatedFields } : s);
    setSuppliers(updated);
    saveLocal('suppliers', updated);
  };

  const deleteSupplier = (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveLocal('suppliers', updated);
  };

  // Sales & Invoices Actions
  const addSale = (saleData) => {
    const invNum = `INV-2026-${String(sales.length + 1).padStart(3, '0')}`;
    const newSale = {
      ...saleData,
      id: `SALE-${1000 + sales.length + 1}`,
      invoiceNumber: invNum,
      date: saleData.date || new Date().toISOString().slice(0, 10),
      subtotal: Number(saleData.subtotal) || 0,
      discount: Number(saleData.discount) || 0,
      total: Number(saleData.total) || 0,
      paidAmount: Number(saleData.paidAmount) || 0,
      remainingBalance: Math.max(0, (Number(saleData.total) || 0) - (Number(saleData.paidAmount) || 0)),
      status: Number(saleData.paidAmount) >= Number(saleData.total) ? 'Paid' : (Number(saleData.paidAmount) > 0 ? 'Partially Paid' : 'Unpaid'),
    };

    // Update product quantities (deduct sold quantities)
    if (saleData.items && saleData.items.length) {
      setProducts(prevProducts => {
        const productUpdates = prevProducts.map(prod => {
          const soldItem = saleData.items.find(i => i.productId === prod.id || i.productName === prod.name);
          if (soldItem) {
            const newQty = Math.max(0, prod.quantity - Number(soldItem.quantity));
            return { ...prod, quantity: newQty };
          }
          return prod;
        });
        saveLocal('products', productUpdates);
        return productUpdates;
      });
    }

    // Update customer purchases and balance if linked
    if (saleData.customerId) {
      setCustomers(prevCust => {
        const custUpdates = prevCust.map(c => {
          if (c.id === saleData.customerId) {
            return {
              ...c,
              totalPurchases: (Number(c.totalPurchases) || 0) + newSale.total,
              outstandingBalance: (Number(c.outstandingBalance) || 0) + newSale.remainingBalance,
            };
          }
          return c;
        });
        saveLocal('customers', custUpdates);
        return custUpdates;
      });
    }

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveLocal('sales', updatedSales);
    void syncEntity('sales', newSale, showroomInfo.id);

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
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveLocal('sales', updated);
  };

  // Purchases Actions
  const addPurchase = (purchaseData) => {
    const newPur = {
      ...purchaseData,
      id: `PUR-${String(purchases.length + 1).padStart(3, '0')}`,
      date: purchaseData.date || new Date().toISOString().slice(0, 10),
      totalCost: Number(purchaseData.totalCost) || 0,
      paidAmount: Number(purchaseData.paidAmount) || 0,
      remainingBalance: Math.max(0, (Number(purchaseData.totalCost) || 0) - (Number(purchaseData.paidAmount) || 0)),
      status: Number(purchaseData.paidAmount) >= Number(purchaseData.totalCost) ? 'Paid' : 'Partially Paid',
    };

    // Increase product quantities in stock
    if (purchaseData.items && purchaseData.items.length) {
      setProducts(prevProducts => {
        const productUpdates = prevProducts.map(prod => {
          const purItem = purchaseData.items.find(i => i.productName === prod.name || i.productId === prod.id);
          if (purItem) {
            return { ...prod, quantity: prod.quantity + Number(purItem.quantity) };
          }
          return prod;
        });
        saveLocal('products', productUpdates);
        return productUpdates;
      });
    }

    const updated = [newPur, ...purchases];
    setPurchases(updated);
    saveLocal('purchases', updated);
    return newPur;
  };

  // Partners Actions with STRICT Partner Limit check
  const addPartner = (partnerData) => {
    if (!partnerLimitInfo.canAddPartner) {
      throw new Error(partnerLimitInfo.warningMessage);
    }
    const newPartner = {
      ...partnerData,
      id: `PART-${String(partners.length + 1).padStart(3, '0')}`,
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
      id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
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
  const updateSubscriptionPlan = (planId, billingInterval = 'monthly') => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const newSub = {
      ...subscription,
      planId,
      billingInterval,
      status: 'Active',
      lastPaymentAmount: billingInterval === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      invoices: [
        {
          id: `SUB-INV-${Math.floor(100 + Math.random() * 900)}`,
          date: new Date().toISOString().slice(0, 10),
          plan: selectedPlan.name,
          amount: billingInterval === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice,
          status: 'Paid',
          receiptUrl: '#',
        },
        ...subscription.invoices,
      ],
    };
    setSubscription(newSub);
    saveLocal('subscription', newSub);
    if (showroomInfo?.id) void syncEntity('subscriptions', { ...newSub, monthlyAmount: billingInterval === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice, startedAt: new Date().toISOString().slice(0, 10), nextBillingDate: newSub.renewalDate }, showroomInfo.id);
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
    const next = { ...data, id: `BOOK-${Date.now()}`, bookingNumber: data.bookingNumber || `BK-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(3, '0')}`, payments: data.payments || [], status: data.status || 'Pending', deliveryStatus: data.deliveryStatus || 'Reserved' };
    const product = products.find((item) => item.id === next.bikeProductId);
    const activeReservations = bookings.filter((item) => item.bikeProductId === next.bikeProductId && !['Cancelled', 'Delivered'].includes(item.status)).length;
    if (product && activeReservations >= Number(product.quantity || 0)) throw new Error(`No available ${product.name} unit remains for reservation.`);
    const normalized = normaliseBooking(next);
    void syncEntity('bookings', normalized, showroomInfo.id);
    return persist(setBookings, 'bookings', [normalized, ...bookings]);
  };
  const updateBooking = (id, fields) => {
    const current = bookings.find((item) => item.id === id);
    if (!current) throw new Error('Booking not found');
    const next = normaliseBooking({ ...current, ...fields });
    if (next.status === 'Delivered' && current.status !== 'Delivered' && !current.inventoryDeducted && current.bikeProductId) {
      const updatedProducts = products.map((product) => product.id === current.bikeProductId ? { ...product, quantity: Math.max(0, Number(product.quantity || 0) - 1) } : product);
      setProducts(updatedProducts);
      saveLocal('products', updatedProducts);
      next.inventoryDeducted = true;
    }
    void syncEntity('bookings', next, showroomInfo.id);
    if (next.status === 'Delivered' && current.status !== 'Delivered') {
      const customer = customers.find((item) => item.id === next.customerId);
      if (customer?.email) void queueEmailNotification({ eventType: 'delivery_complete', destination: customer.email, subject: `Bike delivery completed ${next.bookingNumber}`, body: `Hello ${next.customerName}, your ${next.bikeBrand} ${next.bikeModel} has been marked delivered.`, recipientType: 'customer', recipientId: next.customerId });
    }
    return persist(setBookings, 'bookings', bookings.map((booking) => booking.id === id ? next : booking));
  };
  const addBookingPayment = (id, payment) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error('Booking not found');
    const outstanding = Math.max(0, Number(booking.totalPrice || 0) - Number(booking.amountReceived || 0));
    if (Number(payment.amount || 0) > outstanding && !payment.allowAdvance) throw new Error('Payment exceeds outstanding balance. Confirm an advance or refund first.');
    const item = { ...payment, id: `PAY-${Date.now()}`, receiptNumber: payment.receiptNumber || `RCT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`, date: payment.date || new Date().toISOString().slice(0, 10) };
    const received = [...(booking.payments || []), item].reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const status = received >= Number(booking.totalPrice) ? 'Fully Paid' : received > 0 ? 'Partially Paid' : booking.status;
    void syncBookingPayment(booking.id, item);
    return persist(setBookings, 'bookings', bookings.map((b) => b.id === id ? normaliseBooking({ ...b, payments: [...(b.payments || []), item], amountReceived: received, status }) : b));
  };
  const addPartnerInvestment = (data) => { const item = { ...data, id: `INVST-${Date.now()}`, amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_capital_entries', { ...item, entryDate: item.date || item.entryDate, entryType: item.entryType || 'initial' }, showroomInfo.id); return persist(setPartnerInvestments, 'partner_investments', [item, ...partnerInvestments]); };
  const addSettlement = (data) => { const item = { ...data, id: `SET-${Date.now()}`, amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_settlements', { ...item, settlementDate: item.date || item.settlementDate, settlementType: item.type || 'Profit payment' }, showroomInfo.id); return persist(setSettlements, 'settlements', [item, ...settlements]); };
  const addWithdrawal = (data) => { const item = { ...data, id: `WD-${Date.now()}`, amount: Number(data.amount || 0), status: 'Posted' }; void syncEntity('partner_settlements', { ...item, settlementDate: item.date || item.settlementDate, settlementType: 'Withdrawal' }, showroomInfo.id); return persist(setWithdrawals, 'withdrawals', [item, ...withdrawals]); };
  const addOwnershipArrangement = (data) => { const item = { ...data, id: `OWN-${Date.now()}` }; void syncEntity('partner_allocations', { ...item, allocationType: 'ownership' }, showroomInfo.id); return persist(setOwnershipHistory, 'ownership_history', [item, ...ownershipHistory]); };
  const addProfitShareArrangement = (data) => { const item = { ...data, id: `PS-${Date.now()}` }; void syncEntity('partner_allocations', { ...item, allocationType: 'profit_sharing' }, showroomInfo.id); return persist(setProfitShareHistory, 'profit_share_history', [item, ...profitShareHistory]); };

  // Settings Actions
  const updateShowroomSettings = (fields) => {
    const updated = { ...showroomInfo, ...fields };
    setShowroomInfo(updated);
    saveLocal('showroom_info', updated);
  };

  const updateUserProfile = (fields) => {
    const updated = { ...userProfile, ...fields };
    setUserProfile(updated);
    saveLocal('user_profile', updated);
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

  const updatePlanConfig = (planId, updatedFields) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        // Enforce hard rules for partner limits
        let enforcedLimit = p.partnerLimit;
        if (p.id === 'showroom') enforcedLimit = null;

        return {
          ...p,
          ...updatedFields,
          partnerLimit: enforcedLimit,
          isUnlimitedPartners: p.id === 'showroom',
        };
      }
      return p;
    });
    setPlans(updated);
    saveLocal('plans', updated);
  };

  // Reset all demo data to pristine state
  const resetDemoData = () => {
    setShowroomInfo(INITIAL_SHOWROOM_INFO);
    setUserProfile(INITIAL_USER_PROFILE);
    setSubscription(INITIAL_SUBSCRIPTION);
    setPlans(PLANS_CONFIG);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setPartners(INITIAL_PARTNERS);
    setExpenses(INITIAL_EXPENSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAdminShowrooms(INITIAL_ADMIN_SHOWROOMS);
    setAdminPayments(INITIAL_ADMIN_PAYMENTS);
    setAdminLogs(INITIAL_ADMIN_LOGS);
    setPlatformSettings(INITIAL_PLATFORM_SETTINGS);
    setBookings(INITIAL_BOOKINGS);
    setPartnerInvestments(INITIAL_PARTNER_INVESTMENTS);
    setOwnershipHistory(INITIAL_OWNERSHIP_HISTORY);
    setProfitShareHistory(INITIAL_PROFIT_SHARES);
    setSettlements(INITIAL_SETTLEMENTS);
    setWithdrawals(INITIAL_WITHDRAWALS);

    const keys = [
      'showroom_info', 'user_profile', 'subscription', 'plans', 'customers',
      'products', 'suppliers', 'sales', 'purchases', 'partners', 'expenses',
      'notifications', 'admin_showrooms', 'admin_payments', 'admin_logs', 'platform_settings', 'bookings', 'partner_investments', 'ownership_history', 'profit_share_history', 'settlements', 'withdrawals'
    ];
    keys.forEach(k => {
      try { localStorage.removeItem(`showroom_pro_${k}`); } catch {}
    });
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
    updatePlanConfig,
    resetDemoData,
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
