// New accounts start with real, empty business records. No sample showroom,
// customer, inventory, payment, or partner data is seeded into the application.
export const PLANS_CONFIG = [
  {
    id: 'showroom',
    name: 'Showroom Pro',
    monthlyPrice: 10000,
    partnerLimit: null,
    isUnlimitedPartners: true,
    badge: 'One complete plan',
    description: 'Complete EV bike showroom office management for one simple monthly subscription.',
    features: [
      'Unlimited partners and partner finance',
      'EV bike inventory, reservations and stock alerts',
      'Customer CRM, bookings, receipts and quotations',
      'Daily and monthly profit reports',
      'Email notification workflows',
      'AI showroom assistant and reorder insights',
    ],
  },
];

export const INITIAL_SHOWROOM_INFO = {
  name: '', category: 'Electric Bike Showroom', email: '', phone: '', address: '',
  city: '', country: 'Pakistan', currency: 'PKR', dateFormat: 'YYYY-MM-DD',
  taxNumber: '', website: '', establishedYear: '',
};
export const INITIAL_USER_PROFILE = { fullName: '', email: '', phone: '', role: 'Owner', avatar: '' };
export const INITIAL_SUBSCRIPTION = {
  planId: 'showroom', status: 'Trial', billingInterval: 'monthly', startDate: '',
  renewalDate: '', expirationDate: '', lastPaymentAmount: 0, cardLast4: '', invoices: [],
};
export const INITIAL_CUSTOMERS = [];
export const INITIAL_PRODUCTS = [];
export const INITIAL_SUPPLIERS = [];
export const INITIAL_SALES = [];
export const INITIAL_PURCHASES = [];
export const INITIAL_PARTNERS = [];
export const INITIAL_EXPENSES = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_ADMIN_SHOWROOMS = [];
export const INITIAL_ADMIN_PAYMENTS = [];
export const INITIAL_ADMIN_LOGS = [];
export const INITIAL_SYSTEM_HEALTH = {};
export const INITIAL_PLATFORM_SETTINGS = {};
export const INITIAL_BOOKINGS = [];
export const INITIAL_PARTNER_INVESTMENTS = [];
export const INITIAL_OWNERSHIP_HISTORY = [];
export const INITIAL_PROFIT_SHARES = [];
export const INITIAL_SETTLEMENTS = [];
export const INITIAL_WITHDRAWALS = [];
