// Initial mock data for Showroom Pro SaaS Frontend

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
  name: 'UrbanVolt EV Showroom (Demo)',
  category: 'Electric Bike Showroom',
  email: 'demo-owner@urbanvolt.example',
  phone: '+92 300 0000001',
  address: 'Shop 14, Main Boulevard, Gulberg III',
  city: 'Lahore',
  country: 'Pakistan',
  currency: 'PKR',
  dateFormat: 'YYYY-MM-DD',
  taxNumber: 'DEMO-NTN-0001',
  website: 'https://showroom-pro-frontend.onrender.com',
  establishedYear: '2022',
};

export const INITIAL_USER_PROFILE = {
  fullName: 'Tariq Mansoor',
  email: 'tariq@example.com',
  phone: '+92 300 0000001',
  role: 'Owner & Managing Partner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_SUBSCRIPTION = {
  planId: 'showroom',
  status: 'Active', // 'Trial' | 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled'
  billingInterval: 'monthly',
  startDate: '2026-01-01',
  renewalDate: '2026-11-01',
  expirationDate: '2026-11-01',
  lastPaymentAmount: 10000,
  cardLast4: '4242',
  invoices: [
    { id: 'SUB-INV-101', date: '2026-10-01', plan: 'Showroom Pro', amount: 10000, status: 'Paid', receiptUrl: '#' },
    { id: 'SUB-INV-098', date: '2026-09-01', plan: 'Showroom Pro', amount: 10000, status: 'Paid', receiptUrl: '#' },
    { id: 'SUB-INV-084', date: '2026-08-01', plan: 'Showroom Pro', amount: 10000, status: 'Paid', receiptUrl: '#' },
    { id: 'SUB-INV-071', date: '2026-07-01', plan: 'Showroom Pro', amount: 10000, status: 'Paid', receiptUrl: '#' },
  ],
};

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-001',
    fullName: 'Hammad Ali (Demo)',
    phone: '+92 300 0000002',
    email: 'hammad@example.com',
    address: 'DHA Phase 6, Lahore',
    totalPurchases: 220000,
    outstandingBalance: 20000,
    registrationDate: '2026-08-14',
    status: 'Active',
  },
  {
    id: 'CUST-002',
    fullName: 'Sana Arif (Demo)',
    phone: '+92 300 0000003',
    email: 'sana@example.com',
    address: 'Model Town, Lahore',
    totalPurchases: 269900,
    outstandingBalance: 0,
    registrationDate: '2026-09-22',
    status: 'Active',
  },
  {
    id: 'CUST-003',
    fullName: 'Bilal Ahmed (Demo)',
    phone: '+92 300 0000004',
    email: 'bilal@example.com',
    address: 'People’s Colony, Faisalabad',
    totalPurchases: 315000,
    outstandingBalance: 15000,
    registrationDate: '2026-10-05',
    status: 'Active',
  },
  {
    id: 'CUST-004',
    fullName: 'Noor Fatima (Demo)',
    phone: '+92 300 0000005',
    email: 'noor@example.com',
    address: 'Clifton Block 2, Karachi',
    totalPurchases: 285000,
    outstandingBalance: 0,
    registrationDate: '2026-07-12',
    status: 'Active',
  },
  {
    id: 'CUST-005',
    fullName: 'Usman Raza (Demo)',
    phone: '+92 300 0000006',
    email: 'usman@example.com',
    address: 'F-10 Markaz, Islamabad',
    totalPurchases: 295000,
    outstandingBalance: 0,
    registrationDate: '2026-10-18',
    status: 'Active',
  },
  {
    id: 'CUST-006',
    fullName: 'Mariam Shah (Demo)',
    phone: '+92 300 0000007',
    email: 'mariam@example.com',
    address: 'Johar Town, Lahore',
    totalPurchases: 195000,
    outstandingBalance: 0,
    registrationDate: '2026-10-22',
    status: 'Active',
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'CROWN-SPARK', name: 'Crown Spark', sku: 'CROWN-SPARK', barcode: 'CROWN-SPARK', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Spark', modelYear: '2026', color: 'Blue',
    topSpeed: '55-65 km/h', batteryType: 'Lithium LFP', batteryCapacity: '64V/30Ah', rangeKm: 50, rangeDescription: '50-70 km', chargingTime: '3-4 hours', motorPower: '800-1200W', costPrice: 155000, sellingPrice: 195000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Spark electric bike from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-FAIRY', name: 'Crown Fairy', sku: 'CROWN-FAIRY', barcode: 'CROWN-FAIRY', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Fairy', modelYear: '2026', color: 'White',
    topSpeed: '50-55 km/h', batteryType: 'Lithium LFP', batteryCapacity: '60.8V/30Ah', rangeKm: 60, rangeDescription: '60-70 km', chargingTime: '3-4 hours', motorPower: '1000-1500W', costPrice: 175000, sellingPrice: 220000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Fairy electric scooter from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-FIREFLY', name: 'Crown Firefly', sku: 'CROWN-FIREFLY', barcode: 'CROWN-FIREFLY', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Firefly', modelYear: '2026', color: 'White/Black',
    topSpeed: '60-65 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.6V/30Ah', rangeKm: 70, rangeDescription: '70-90 km', chargingTime: '4-5 hours', motorPower: '1200-1800W', costPrice: 188000, sellingPrice: 235000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Firefly electric scooter from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-CHAMPION', name: 'Crown Champion', sku: 'CROWN-CHAMPION', barcode: 'CROWN-CHAMPION', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Champion', modelYear: '2026', color: 'Black',
    topSpeed: '60-70 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.6V/40Ah', rangeKm: 100, rangeDescription: '100-120 km', chargingTime: '4-5 hours', motorPower: '1500-2200W', costPrice: 228000, sellingPrice: 285000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Champion electric bike from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-CHAMPION-PRO', name: 'Crown Champion Pro', sku: 'CROWN-CHAMPION-PRO', barcode: 'CROWN-CHAMPION-PRO', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Champion Pro', modelYear: '2026', color: 'Red/Black',
    topSpeed: '60-70 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.6V/60Ah', rangeKm: 160, rangeDescription: '160-180 km', chargingTime: '6-7 hours', motorPower: '1500-2200W', costPrice: 268000, sellingPrice: 335000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Champion Pro long-range electric bike from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-FLOSH', name: 'Crown Flosh', sku: 'CROWN-FLOSH', barcode: 'CROWN-FLOSH', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Flosh', modelYear: '2026', color: 'Grey/Black',
    topSpeed: '60-70 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.6V/40Ah', rangeKm: 100, rangeDescription: '100-120 km', chargingTime: '4-5 hours', motorPower: '1500-2200W', costPrice: 228000, sellingPrice: 285000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Flosh electric scooter from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-KNIGHT-RIDER', name: 'Crown Knight Rider', sku: 'CROWN-KNIGHT-RIDER', barcode: 'CROWN-KNIGHT-RIDER', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Knight Rider', modelYear: '2026', color: 'Black',
    topSpeed: '60-70 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.5V/40Ah', rangeKm: 100, rangeDescription: '100-120 km', chargingTime: '4-5 hours', motorPower: '1500-2200W', costPrice: 236000, sellingPrice: 295000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Knight Rider electric motorcycle from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-RAFTAR-PRO', name: 'Crown Raftar Pro', sku: 'CROWN-RAFTAR-PRO', barcode: 'CROWN-RAFTAR-PRO', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'Raftar Pro', modelYear: '2026', color: 'Red/Black',
    topSpeed: '85-90 km/h', batteryType: 'Lithium LFP', batteryCapacity: '73.6V/60Ah', rangeKm: 140, rangeDescription: '140-160 km', chargingTime: '6-7 hours', motorPower: '3000-4000W', costPrice: 276000, sellingPrice: 345000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown Raftar Pro high-performance electric bike from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-X200', name: 'Crown X200', sku: 'CROWN-X200', barcode: 'CROWN-X200', category: 'EV Bikes', brand: 'Crown Electric Mobility', model: 'X200', modelYear: '2026', color: 'Red/Black',
    topSpeed: '60-70 km/h', batteryType: 'Lithium LFP', batteryCapacity: '76.8V/40Ah', rangeKm: 100, rangeDescription: '100-120 km', chargingTime: '4 hours', motorPower: '2000-3000W', costPrice: 252000, sellingPrice: 315000, quantity: 5, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', warranty: '4 years / 48,000 km battery; 3 years / 36,000 km motor & controller', description: 'Crown X200 electric motorcycle from the supplied Crown range sheet.',
  },
  {
    id: 'CROWN-TOUGHGUARD', name: 'Crown Toughguard Add-on', sku: 'CROWN-TOUGHGUARD', barcode: 'CROWN-TOUGHGUARD', category: 'EV Bike Accessories', brand: 'Crown Electric Mobility', model: 'Toughguard',
    costPrice: 7000, sellingPrice: 10000, quantity: 10, reservedQuantity: 0, minStockThreshold: 2, supplier: 'Crown Electric Mobility', description: 'Optional Toughguard add-on shown in the supplied Crown range sheet.',
  },
  {
    id: 'EVEE-S1-LITHIUM', name: 'Evee S1 Lithium Electric Scooter', sku: 'EVEE-S1-LITHIUM', barcode: 'EVEE-S1-LITHIUM', category: 'EV Bikes', brand: 'Evee', model: 'S1 Lithium', modelYear: '2026', color: 'Pearl White',
    topSpeed: '50-55 km/h', batteryType: 'Phylion Lithium', batteryCapacity: '76.8V/32Ah', rangeKm: 70, rangeDescription: '70-90 km', chargingTime: '7 hours', motorPower: '1500W', costPrice: 245000, sellingPrice: 269900, quantity: 3, reservedQuantity: 1, minStockThreshold: 2, supplier: 'Evee Electric (Demo Supplier)', warranty: 'Motor 24 months; battery/controller 20 months; frame 36 months; charger 3 months', description: 'Evee S1 lithium model. Official listed range is 70–90 km; demo stock cost is an estimate for sample accounting.',
  },
];

export const INITIAL_SUPPLIERS = [
  { id: 'SUP-001', name: 'Crown Dealer Desk (Demo)', company: 'Crown Electric Mobility', phone: '+92 300 0000011', email: 'crown-demo@example.com', address: 'Lahore, Pakistan', productsSupplied: 'Crown electric bikes and Toughguard accessories', outstandingBalance: 242000 },
  { id: 'SUP-002', name: 'Evee Dealer Desk (Demo)', company: 'Evee Electric', phone: '+92 300 0000012', email: 'evee-demo@example.com', address: 'Karachi, Pakistan', productsSupplied: 'Evee S1 electric scooters and lithium battery models', outstandingBalance: 225000 },
];

export const INITIAL_SALES = [
  { id: 'SALE-1001', invoiceNumber: 'INV-2026-001', customerId: 'CUST-002', customerName: 'Sana Arif (Demo)', customerPhone: '+92 300 0000003', date: '2026-10-10', items: [{ productId: 'EVEE-S1-LITHIUM', productName: 'Evee S1 Lithium Electric Scooter', quantity: 1, unitPrice: 269900, unitCost: 245000, total: 269900 }], subtotal: 269900, discount: 0, total: 269900, paidAmount: 269900, remainingBalance: 0, paymentMethod: 'Bank Transfer', status: 'Paid', notes: 'Delivered Evee S1 Lithium; full payment cleared.' },
  { id: 'SALE-1002', invoiceNumber: 'INV-2026-002', customerId: 'CUST-004', customerName: 'Noor Fatima (Demo)', customerPhone: '+92 300 0000005', date: '2026-10-13', items: [{ productId: 'CROWN-CHAMPION', productName: 'Crown Champion', quantity: 1, unitPrice: 285000, unitCost: 228000, total: 285000 }], subtotal: 285000, discount: 0, total: 285000, paidAmount: 285000, remainingBalance: 0, paymentMethod: 'Cash', status: 'Paid', notes: 'Crown Champion delivery completed; receipt issued.' },
  { id: 'SALE-1003', invoiceNumber: 'INV-2026-003', customerId: 'CUST-006', customerName: 'Mariam Shah (Demo)', customerPhone: '+92 300 0000007', date: '2026-10-15', items: [{ productId: 'CROWN-SPARK', productName: 'Crown Spark', quantity: 1, unitPrice: 195000, unitCost: 155000, total: 195000 }], subtotal: 195000, discount: 0, total: 195000, paidAmount: 195000, remainingBalance: 0, paymentMethod: 'Mobile Wallet', status: 'Paid', notes: 'Crown Spark delivered and paid in full.' },
  { id: 'SALE-1004', invoiceNumber: 'INV-2026-004', customerId: 'CUST-001', customerName: 'Hammad Ali (Demo)', customerPhone: '+92 300 0000002', date: '2026-10-17', items: [{ productId: 'CROWN-FAIRY', productName: 'Crown Fairy', quantity: 1, unitPrice: 220000, unitCost: 175000, total: 220000 }], subtotal: 220000, discount: 0, total: 220000, paidAmount: 200000, remainingBalance: 20000, paymentMethod: 'Bank Transfer', status: 'Partially Paid', notes: 'Crown Fairy delivered; Rs. 20,000 balance due.' },
  { id: 'SALE-1005', invoiceNumber: 'INV-2026-005', customerId: 'CUST-003', customerName: 'Bilal Ahmed (Demo)', customerPhone: '+92 300 0000004', date: '2026-10-19', items: [{ productId: 'CROWN-X200', productName: 'Crown X200', quantity: 1, unitPrice: 315000, unitCost: 252000, total: 315000 }], subtotal: 315000, discount: 0, total: 315000, paidAmount: 300000, remainingBalance: 15000, paymentMethod: 'Bank Transfer', status: 'Partially Paid', notes: 'Crown X200 delivered; Rs. 15,000 balance due.' },
  { id: 'SALE-1006', invoiceNumber: 'INV-2026-006', customerId: 'CUST-005', customerName: 'Usman Raza (Demo)', customerPhone: '+92 300 0000006', date: '2026-10-20', items: [{ productId: 'CROWN-KNIGHT-RIDER', productName: 'Crown Knight Rider', quantity: 1, unitPrice: 295000, unitCost: 236000, total: 295000 }], subtotal: 295000, discount: 0, total: 295000, paidAmount: 295000, remainingBalance: 0, paymentMethod: 'Cash', status: 'Paid', notes: 'Crown Knight Rider delivered; full payment cleared.' },
];

export const INITIAL_PURCHASES = [
  { id: 'PUR-001', supplierId: 'SUP-001', supplierName: 'Crown Electric Mobility', invoiceRef: 'CROWN-DEMO-101', date: '2026-10-02', items: [{ productName: 'Crown Spark', quantity: 1, unitCost: 155000, total: 155000 }, { productName: 'Crown Fairy', quantity: 1, unitCost: 175000, total: 175000 }, { productName: 'Crown Champion', quantity: 1, unitCost: 228000, total: 228000 }, { productName: 'Crown Champion Pro', quantity: 1, unitCost: 268000, total: 268000 }, { productName: 'Crown Flosh', quantity: 1, unitCost: 228000, total: 228000 }, { productName: 'Crown Knight Rider', quantity: 1, unitCost: 236000, total: 236000 }, { productName: 'Crown X200', quantity: 1, unitCost: 252000, total: 252000 }], totalCost: 1542000, paidAmount: 1300000, remainingBalance: 242000, paymentMethod: 'Bank Transfer', status: 'Partially Paid' },
  { id: 'PUR-002', supplierId: 'SUP-002', supplierName: 'Evee Electric', invoiceRef: 'EVEE-DEMO-204', date: '2026-10-04', items: [{ productName: 'Evee S1 Lithium Electric Scooter', quantity: 5, unitCost: 245000, total: 1225000 }], totalCost: 1225000, paidAmount: 1000000, remainingBalance: 225000, paymentMethod: 'Bank Transfer', status: 'Partially Paid' },
];

export const INITIAL_PARTNERS = [
  { id: 'PART-001', fullName: 'Tariq Mansoor', email: 'tariq@example.com', phone: '+92 300 0000001', role: 'Managing Partner (Owner)', equityShare: '40%', joiningDate: '2022-03-01', status: 'Active' },
  { id: 'PART-002', fullName: 'Haris Abbasi', email: 'haris@example.com', phone: '+92 300 0000021', role: 'Sales & Commercial Partner', equityShare: '25%', joiningDate: '2023-06-15', status: 'Active' },
  { id: 'PART-003', fullName: 'Kamran Raza', email: 'kamran@example.com', phone: '+92 300 0000022', role: 'Procurement Partner', equityShare: '20%', joiningDate: '2024-01-10', status: 'Active' },
  { id: 'PART-004', fullName: 'Nadia Qureshi', email: 'nadia@example.com', phone: '+92 300 0000023', role: 'Finance Partner', equityShare: '15%', joiningDate: '2025-04-01', status: 'Active' },
];

export const INITIAL_EXPENSES = [
  { id: 'EXP-001', title: 'UrbanVolt Showroom Rent — Gulberg', category: 'Rent', amount: 95000, paymentMethod: 'Bank Transfer', date: '2026-10-01', notes: 'Monthly rent for the demo Lahore showroom.' },
  { id: 'EXP-002', title: 'Sales and Workshop Staff Salaries', category: 'Salaries', amount: 75000, paymentMethod: 'Bank Transfer', date: '2026-10-05', notes: 'Monthly payroll for demo showroom staff.' },
  { id: 'EXP-003', title: 'Electricity and Charging Area Utilities', category: 'Utilities', amount: 24000, paymentMethod: 'Bank Transfer', date: '2026-10-10', notes: 'Showroom and EV charging area utilities.' },
  { id: 'EXP-004', title: 'Bike PDI and Workshop Maintenance', category: 'Maintenance', amount: 8000, paymentMethod: 'Cash', date: '2026-10-12', notes: 'Pre-delivery inspection tools and service.' },
  { id: 'EXP-005', title: 'EV Bike Digital Campaign', category: 'Marketing', amount: 18000, paymentMethod: 'Card', date: '2026-10-14', notes: 'Crown and Evee local showroom promotions.' },
  { id: 'EXP-006', title: 'Bike Delivery and Local Freight', category: 'Transport', amount: 9000, paymentMethod: 'Cash', date: '2026-10-16', notes: 'Customer delivery and supplier transport.' },
  { id: 'EXP-007', title: 'Internet, Phone and Security', category: 'Utilities', amount: 7000, paymentMethod: 'Card', date: '2026-10-17', notes: 'Monthly connectivity and showroom security.' },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'NOTIF-001', type: 'warning', title: 'Low Stock Alert', message: 'Evee S1 Lithium stock is near the 2-unit reorder threshold. Check available and reserved units before ordering.', date: '2026-10-27T05:30:00Z', read: false, link: '/inventory' },
  { id: 'NOTIF-002', type: 'info', title: 'Subscription Renewal Reminder', message: 'Showroom Pro demo plan renews on Nov 1, 2026 at Rs. 10,000 per month.', date: '2026-10-25T04:15:00Z', read: false, link: '/subscription' },
  { id: 'NOTIF-003', type: 'success', title: 'EV Bike Sale Recorded', message: 'Invoice INV-2026-006 recorded for Usman Raza (Demo): Crown Knight Rider, Rs. 295,000.', date: '2026-10-20T02:00:00Z', read: false, link: '/invoices' },
  { id: 'NOTIF-004', type: 'info', title: 'Partner Shares', message: 'Four demo partners have approved ownership and profit-share allocations totaling 100%.', date: '2026-10-24T12:00:00Z', read: true, link: '/partners' },
  { id: 'NOTIF-005', type: 'warning', title: 'Booking Balance Due', message: 'Crown Spark booking BK-2026-001 has Rs. 145,000 remaining after the advance payment.', date: '2026-10-23T09:00:00Z', read: true, link: '/bookings' },
  { id: 'NOTIF-006', type: 'success', title: 'Customer Added', message: 'Mariam Shah (Demo) was added to the EV showroom customer register.', date: '2026-10-22T14:20:00Z', read: true, link: '/customers' },
];

// SUPER ADMIN INITIAL DATA
export const INITIAL_ADMIN_SHOWROOMS = [
  {
    id: 'SHW-101',
    name: 'Apex Luxury Showroom',
    owner: 'Tariq Mansoor',
    email: 'director@apexshowroom.com',
    phone: '+92 300 5551234',
    city: 'Islamabad',
    category: 'Automotive & Accessories',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null,
    activePartners: 4,
    status: 'Active',
    registeredDate: '2025-01-10',
    mrr: 10000,
    totalSalesLogged: 12450000,
    inventoryCount: 65,
  },
  {
    id: 'SHW-102',
    name: 'Royal Motors & Speed',
    owner: 'Zeeshan Qadir',
    email: 'zeeshan@royalmotors.com',
    phone: '+92 321 9887711',
    city: 'Lahore',
    category: 'Automotive Dealership',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null, // Unlimited
    activePartners: 11,
    status: 'Active',
    registeredDate: '2024-11-20',
    mrr: 10000,
    totalSalesLogged: 48900000,
    inventoryCount: 142,
  },
  {
    id: 'SHW-103',
    name: 'TechLine LED Displays',
    owner: 'Arslan Rauf',
    email: 'arslan@techlinedisplays.pk',
    phone: '+92 333 4411223',
    city: 'Karachi',
    category: 'Electronics & Audio',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null,
    activePartners: 2,
    status: 'Active',
    registeredDate: '2025-04-15',
    mrr: 10000,
    totalSalesLogged: 6100000,
    inventoryCount: 38,
  },
  {
    id: 'SHW-104',
    name: 'Elegance Interior Studios',
    owner: 'Marium Shakeel',
    email: 'marium@elegancestudios.pk',
    phone: '+92 301 5566778',
    city: 'Islamabad',
    category: 'Home & Office Décor',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null,
    activePartners: 3,
    status: 'Expiring Soon',
    registeredDate: '2025-07-02',
    mrr: 10000,
    totalSalesLogged: 9800000,
    inventoryCount: 84,
  },
  {
    id: 'SHW-105',
    name: 'Metro Bike & Scooter Hub',
    owner: 'Saad Farooqi',
    email: 'saad@metrocycles.pk',
    phone: '+92 345 9900112',
    city: 'Rawalpindi',
    category: 'Two-Wheeler Showroom',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null,
    activePartners: 1,
    status: 'Trial',
    registeredDate: '2026-10-18',
    mrr: 0,
    totalSalesLogged: 1200000,
    inventoryCount: 22,
  },
  {
    id: 'SHW-106',
    name: 'Pioneer Sound & Lights',
    owner: 'Danish Khan',
    email: 'danish@pioneersound.pk',
    phone: '+92 312 8844221',
    city: 'Peshawar',
    category: 'Stage & Car Audio',
    plan: 'showroom',
    planName: 'Showroom Pro',
    partnerLimit: null,
    activePartners: 5,
    status: 'Suspended',
    registeredDate: '2025-02-14',
    mrr: 0,
    totalSalesLogged: 4300000,
    inventoryCount: 49,
  },
];

export const INITIAL_ADMIN_PAYMENTS = [
  {
    id: 'PAY-9041',
    showroomName: 'Apex Luxury Showroom',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'Credit Card (Visa)',
    date: '2026-10-01',
    status: 'Paid',
    reference: 'TXN-9481023',
  },
  {
    id: 'PAY-9040',
    showroomName: 'Royal Motors & Speed',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'Direct Bank Wire',
    date: '2026-10-01',
    status: 'Paid',
    reference: 'WIRE-8891024',
  },
  {
    id: 'PAY-9039',
    showroomName: 'TechLine LED Displays',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'MasterCard',
    date: '2026-10-05',
    status: 'Paid',
    reference: 'TXN-7761922',
  },
  {
    id: 'PAY-9038',
    showroomName: 'Elegance Interior Studios',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'Credit Card',
    date: '2026-10-08',
    status: 'Pending',
    reference: 'TXN-Pending-99',
  },
  {
    id: 'PAY-9037',
    showroomName: 'Pioneer Sound & Lights',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'Bank Transfer',
    date: '2026-09-15',
    status: 'Failed',
    reference: 'ERR-INSUFFICIENT',
  },
  {
    id: 'PAY-9036',
    showroomName: 'Karachi Auto World',
    plan: 'Showroom Pro',
    amount: 10000,
    method: 'Direct Bank Wire',
    date: '2026-09-28',
    status: 'Paid',
    reference: 'WIRE-7711200',
  },
];

export const INITIAL_ADMIN_LOGS = [
  {
    id: 'LOG-001',
    actor: 'System Automation',
    action: 'Subscription Renewal Invoice Generated',
    target: 'Apex Luxury Showroom (SUB-INV-101)',
    timestamp: '2026-10-25 04:00:12',
    severity: 'info',
  },
  {
    id: 'LOG-002',
    actor: 'SuperAdmin (Root)',
    action: 'Showroom Status Suspended',
    target: 'Pioneer Sound & Lights (Non-payment flag)',
    timestamp: '2026-10-24 16:45:00',
    severity: 'warning',
  },
  {
    id: 'LOG-003',
    actor: 'User: Saad Farooqi',
    action: 'New Showroom Self-Registration (Trial)',
    target: 'Metro Bike & Scooter Hub',
    timestamp: '2026-10-18 11:20:44',
    severity: 'info',
  },
  {
    id: 'LOG-004',
    actor: 'SuperAdmin (Root)',
    action: 'Plan Pricing Config Updated',
    target: 'Showroom Pro Rs. 10,000 monthly price',
    timestamp: '2026-10-15 09:30:19',
    severity: 'info',
  },
  {
    id: 'LOG-005',
    actor: 'Database Watcher',
    action: 'Backup Snapshot Completed Successfully',
    target: 'Supabase Staging Snapshot #4102',
    timestamp: '2026-10-25 00:00:00',
    severity: 'info',
  },
];

export const INITIAL_SYSTEM_HEALTH = {
  apiLatency: 42, // ms
  dbLatency: 18, // ms
  uptime: 99.98, // %
  storageUsedPercent: 34,
  activeSessions: 184,
  errorRatePercent: 0.04,
  serverStatus: 'Operational',
  databaseStatus: 'Operational',
  authServiceStatus: 'Operational',
  storageServiceStatus: 'Operational',
};

export const INITIAL_PLATFORM_SETTINGS = {
  platformName: 'Showroom Pro SaaS',
  supportEmail: 'support@showroompro.io',
  defaultCurrency: 'PKR',
  allowPublicSignups: true,
  maintenanceMode: false,
  trialDurationDays: 14,
  reminderDaysBeforeExpiry: 7,
  version: 'v2.4.0-phase1-frontend',
};

// EV showroom demo extensions. These remain plain records so the same shapes can
// later be persisted in Supabase without changing the UI contracts.
export const INITIAL_BOOKINGS = [
  {
    id: 'BOOK-001', bookingNumber: 'BK-2026-001', customerId: 'CUST-001', customerName: 'Hammad Ali (Demo)', customerPhone: '+92 300 0000002', customerEmail: 'hammad@example.com', address: 'DHA Phase 6, Lahore', identificationReference: 'DEMO-CNIC-001',
    bikeProductId: 'CROWN-SPARK', bikeBrand: 'Crown Electric Mobility', bikeModel: 'Spark', modelYear: '2026', color: 'Blue', chassisReference: 'CROWN-SPARK-26-014', stockUnitReference: 'UV-STK-001',
    bookingDate: '2026-10-23', expectedDeliveryDate: '2026-10-30', totalPrice: 195000, depositRequired: 50000, amountReceived: 50000, remainingBalance: 145000,
    paymentMethod: 'Bank Transfer', salesperson: 'Tariq Mansoor', status: 'Confirmed', deliveryStatus: 'Reserved', notes: 'Advance received; customer asked for blue unit.',
    payments: [{ id: 'PAY-BOOK-001-A', receiptNumber: 'RCT-2026-101', date: '2026-10-23', amount: 50000, method: 'Bank Transfer', reference: 'DEMO-ADV-001' }],
  },
  {
    id: 'BOOK-002', bookingNumber: 'BK-2026-002', customerId: 'CUST-003', customerName: 'Bilal Ahmed (Demo)', customerPhone: '+92 300 0000004', customerEmail: 'bilal@example.com', address: 'People’s Colony, Faisalabad', identificationReference: 'DEMO-CNIC-003',
    bikeProductId: 'EVEE-S1-LITHIUM', bikeBrand: 'Evee', bikeModel: 'S1 Lithium', modelYear: '2026', color: 'Pearl White', chassisReference: 'EVEE-S1-26-021', stockUnitReference: 'UV-STK-002',
    bookingDate: '2026-10-24', expectedDeliveryDate: '2026-11-02', totalPrice: 269900, depositRequired: 100000, amountReceived: 100000, remainingBalance: 169900,
    paymentMethod: 'Cash', salesperson: 'Haris Abbasi', status: 'Confirmed', deliveryStatus: 'Reserved', notes: 'Evee S1 Lithium confirmed; remaining payment due at delivery.',
    payments: [{ id: 'PAY-BOOK-002-A', receiptNumber: 'RCT-2026-102', date: '2026-10-24', amount: 100000, method: 'Cash', reference: 'DEMO-ADV-002' }],
  },
  {
    id: 'BOOK-003', bookingNumber: 'BK-2026-003', customerId: 'CUST-005', customerName: 'Usman Raza (Demo)', customerPhone: '+92 300 0000006', customerEmail: 'usman@example.com', address: 'F-10 Markaz, Islamabad', identificationReference: 'DEMO-CNIC-005',
    bikeProductId: 'CROWN-CHAMPION-PRO', bikeBrand: 'Crown Electric Mobility', bikeModel: 'Champion Pro', modelYear: '2026', color: 'Red/Black', chassisReference: 'CROWN-CP-26-031', stockUnitReference: 'UV-STK-003',
    bookingDate: '2026-10-25', expectedDeliveryDate: '2026-11-05', totalPrice: 335000, depositRequired: 75000, amountReceived: 75000, remainingBalance: 260000,
    paymentMethod: 'Mobile Wallet', salesperson: 'Tariq Mansoor', status: 'Partially Paid', deliveryStatus: 'Reserved', notes: 'Long-range model selected; balance pending before handover.',
    payments: [{ id: 'PAY-BOOK-003-A', receiptNumber: 'RCT-2026-103', date: '2026-10-25', amount: 75000, method: 'Mobile Wallet', reference: 'DEMO-ADV-003' }],
  },
  {
    id: 'BOOK-004', bookingNumber: 'BK-2026-004', customerId: 'CUST-006', customerName: 'Mariam Shah (Demo)', customerPhone: '+92 300 0000007', customerEmail: 'mariam@example.com', address: 'Johar Town, Lahore', identificationReference: 'DEMO-CNIC-006',
    bikeProductId: 'CROWN-FIREFLY', bikeBrand: 'Crown Electric Mobility', bikeModel: 'Firefly', modelYear: '2026', color: 'White/Black', chassisReference: 'CROWN-FF-26-044', stockUnitReference: 'UV-STK-004',
    bookingDate: '2026-10-26', expectedDeliveryDate: '2026-11-04', totalPrice: 235000, depositRequired: 50000, amountReceived: 0, remainingBalance: 235000,
    paymentMethod: 'Cash', salesperson: 'Haris Abbasi', status: 'Pending', deliveryStatus: 'Reserved', notes: 'Price quote shared; booking confirmation and advance are still pending.', payments: [],
  },
  {
    id: 'BOOK-005', bookingNumber: 'BK-2026-005', customerId: 'CUST-002', customerName: 'Sana Arif (Demo)', customerPhone: '+92 300 0000003', customerEmail: 'sana@example.com', address: 'Model Town, Lahore', identificationReference: 'DEMO-CNIC-002',
    bikeProductId: 'CROWN-FAIRY', bikeBrand: 'Crown Electric Mobility', bikeModel: 'Fairy', modelYear: '2026', color: 'White', chassisReference: 'CROWN-FRY-26-052', stockUnitReference: 'UV-STK-005',
    bookingDate: '2026-10-27', expectedDeliveryDate: '2026-10-29', totalPrice: 220000, depositRequired: 220000, amountReceived: 220000, remainingBalance: 0,
    paymentMethod: 'Bank Transfer', salesperson: 'Tariq Mansoor', status: 'Confirmed', deliveryStatus: 'Ready', notes: 'Paid in full; unit ready for customer collection.',
    payments: [{ id: 'PAY-BOOK-005-A', receiptNumber: 'RCT-2026-104', date: '2026-10-27', amount: 220000, method: 'Bank Transfer', reference: 'DEMO-FULL-005' }],
  },
];

export const INITIAL_PARTNER_INVESTMENTS = [
  { id: 'INVST-001', partnerId: 'PART-001', date: '2026-01-01', amount: 2500000, method: 'Bank Transfer', reference: 'CAP-001', notes: 'Opening capital', status: 'Posted' },
  { id: 'INVST-002', partnerId: 'PART-002', date: '2026-02-15', amount: 1200000, method: 'Bank Transfer', reference: 'CAP-002', notes: 'Opening capital', status: 'Posted' },
  { id: 'INVST-003', partnerId: 'PART-003', date: '2026-03-01', amount: 800000, method: 'Cash', reference: 'CAP-003', notes: 'Opening capital', status: 'Posted' },
];

export const INITIAL_OWNERSHIP_HISTORY = [
  { id: 'OWN-001', effectiveDate: '2026-01-01', status: 'Approved', reason: 'Initial arrangement', approvedBy: 'Tariq Mansoor', allocations: { 'PART-001': 40, 'PART-002': 25, 'PART-003': 20, 'PART-004': 15 } },
];

export const INITIAL_PROFIT_SHARES = [
  { id: 'PS-001', effectiveDate: '2026-01-01', status: 'Approved', reason: 'Initial arrangement', approvedBy: 'Tariq Mansoor', allocations: { 'PART-001': 40, 'PART-002': 25, 'PART-003': 20, 'PART-004': 15 } },
];

export const INITIAL_SETTLEMENTS = [
  { id: 'SET-001', partnerId: 'PART-001', date: '2026-09-30', amount: 85000, type: 'Profit payment', reference: 'SET-SEP-001', notes: 'September settlement', status: 'Posted' },
];

export const INITIAL_WITHDRAWALS = [
  { id: 'WD-001', partnerId: 'PART-002', date: '2026-10-08', amount: 40000, reference: 'WD-OCT-001', notes: 'Approved partner withdrawal', status: 'Posted' },
];
