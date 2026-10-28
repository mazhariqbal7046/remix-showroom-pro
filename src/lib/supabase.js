import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The application has no local authentication mode. Supabase is required for all accounts.
export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseConfigured = Boolean(supabase);

export const auth = {
  signIn: async (email, password) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured. Account authentication is unavailable.') };
    return supabase.auth.signInWithPassword({ email, password });
  },
  signUp: async ({ email, password, metadata }) => {
    if (!supabase) return { data: null, error: new Error('Supabase is not configured. Account registration is unavailable.') };
    return supabase.auth.signUp({ email, password, options: { data: metadata } });
  },
  signOut: async () => supabase ? supabase.auth.signOut() : { error: null },
  getSession: async () => supabase ? supabase.auth.getSession() : { data: { session: null }, error: null },
  resetPassword: async (email) => supabase ? supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` }) : { data: null, error: new Error('Supabase is not configured. Password recovery is unavailable.') },
  updateProfile: async (fields) => supabase ? supabase.auth.updateUser({ data: { fullName: fields.fullName, phone: fields.phone } }) : { data: null, error: new Error('Supabase is not configured.') },
  onAuthStateChange: (callback) => supabase ? supabase.auth.onAuthStateChange(callback) : { data: { subscription: { unsubscribe: () => {} } } },
};

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

const reportWriteFailure = (label, error) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('showroom:database-error', { detail: { label, message: error?.message || 'The database did not accept this change.' } }));
};

const monitorWrite = async (operation, label) => {
  try {
    const result = await operation;
    if (result?.error) reportWriteFailure(label, result.error);
    return result;
  } catch (error) {
    reportWriteFailure(label, error);
    return { data: null, error };
  }
};

export const ensureShowroom = async ({ user, metadata = {} }) => {
  if (!supabase || !user?.id) return { data: null, error: null };
  const existing = await supabase.from('showrooms').select('*').eq('owner_id', user.id).limit(1).maybeSingle();
  if (existing.error) return existing;
  if (existing.data) {
    const membership = await supabase.from('showroom_members').upsert({ showroom_id: existing.data.id, user_id: user.id, role: 'owner' }, { onConflict: 'showroom_id,user_id' });
    if (membership.error) return { data: null, error: membership.error };
    if (metadata.showroomName || metadata.phone || user.email) {
      const profileUpdate = await supabase.from('showrooms').update({
        ...(metadata.showroomName ? { name: metadata.showroomName } : {}),
        ...(metadata.businessCategory ? { category: metadata.businessCategory } : {}),
        ...(metadata.businessAddress ? { address: metadata.businessAddress } : {}),
        ...(metadata.phone ? { phone: metadata.phone } : {}),
        ...(metadata.country ? { country: metadata.country } : {}),
        ...(user.email ? { email: user.email } : {}),
      }).eq('id', existing.data.id).select().single();
      if (profileUpdate.error) return { data: null, error: profileUpdate.error };
      existing.data = profileUpdate.data;
    }
    return existing;
  }
  const created = await supabase.from('showrooms').insert({ owner_id: user.id, name: metadata.showroomName || 'My EV Bike Showroom', category: metadata.businessCategory || 'EV Bike Dealership', address: metadata.businessAddress || null, currency: metadata.currency || 'PKR', email: user.email || null, phone: metadata.phone || null, country: metadata.country || 'Pakistan' }).select().single();
  if (!created.error && created.data) {
    const membership = await supabase.from('showroom_members').insert({ showroom_id: created.data.id, user_id: user.id, role: 'owner' });
    if (membership.error) return { data: null, error: membership.error };
  }
  return created;
};

const mapRows = (table, rows, payments = []) => {
  if (table === 'customers') return rows.map((r) => ({ ...r, fullName: r.full_name, identificationReference: r.identification_reference, totalPurchases: Number(r.total_purchases || 0), outstandingBalance: Number(r.outstanding_balance || 0) }));
  if (table === 'inventory_units') return rows.map((r) => ({ ...r, name: [r.brand, r.model].filter(Boolean).join(' ') || 'EV Bike', category: r.category || 'EV Bikes', modelYear: r.model_year, chassisNumber: r.chassis_reference, stockUnitReference: r.stock_unit_reference, batteryType: r.battery_type, batteryCapacity: r.battery_capacity, batteryVoltage: r.battery_voltage, batteryAh: r.battery_ah, rangeKm: r.range_km, rangeDescription: r.range_description, topSpeed: r.top_speed, warranty: r.warranty, sku: r.sku, barcode: r.barcode, description: r.description, chargingTime: r.charging_time, motorPower: r.motor_power, costPrice: r.purchase_cost, sellingPrice: r.selling_price, reservedQuantity: r.reserved_quantity, minStockThreshold: r.min_stock_level }));
  if (table === 'bookings') return rows.map((r) => { const bookingPayments = payments.filter((p) => p.booking_id === r.id).map((p) => ({ ...p, receiptNumber: p.receipt_number, date: p.payment_date, method: p.method })); return { ...r, customerId: r.customer_id, customerName: r.customer_name, customerPhone: r.customer_phone, customerEmail: r.customer_email, address: r.address, identificationReference: r.identification_reference, bikeProductId: r.inventory_id, bikeBrand: r.bike_brand, bikeModel: r.bike_model, modelYear: r.model_year, color: r.bike_color, chassisReference: r.chassis_reference, stockUnitReference: r.stock_unit_reference, salesperson: r.salesperson, depositRequired: Number(r.deposit_required || 0), costOfGoods: Number(r.cost_of_goods || 0), stockArrivalNotifiedAt: r.stock_arrival_notified_at, deliveryStatus: r.delivery_status, bookingNumber: r.booking_number, bookingDate: r.booking_date, expectedDeliveryDate: r.expected_delivery_date, totalPrice: Number(r.total_price || 0), status: r.status, deliveryDate: r.delivery_date, inventoryDeducted: r.inventory_deducted, payments: bookingPayments, amountReceived: bookingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) }; });
  if (table === 'partners') return rows.map((r) => ({ ...r, fullName: r.full_name, ownershipPercentage: r.ownership_percentage, profitSharingPercentage: r.profit_sharing_percentage, joiningDate: r.joining_date }));
  if (table === 'expenses') return rows.map((r) => ({ ...r, date: r.expense_date, title: r.description }));
  if (table === 'sales') return rows.map((r) => ({ ...r, invoiceNumber: r.invoice_number, customerId: r.customer_id, paidAmount: r.paid_amount, costOfGoods: Number(r.cost_of_goods || 0), bookingId: r.booking_id, items: payments.filter((item) => item.sale_id === r.id).map((item) => ({ ...item, productId: item.inventory_id, productName: item.product_name, quantity: Number(item.quantity || 0), unitPrice: Number(item.unit_price || 0), unitCost: Number(item.unit_cost || 0), total: Number(item.line_total || 0) })) }));
  if (table === 'suppliers') return rows.map((r) => ({ ...r, productsSupplied: r.products_supplied || '', outstandingBalance: 0 }));
  if (table === 'purchases') return rows.map((r) => ({ ...r, supplierId: r.supplier_id, supplierName: r.supplier_name, invoiceRef: r.invoice_reference, date: r.purchase_date, totalCost: Number(r.total_cost || 0), paidAmount: Number(r.paid_amount || 0), remainingBalance: Math.max(0, Number(r.total_cost || 0) - Number(r.paid_amount || 0)), paymentMethod: r.payment_method, items: payments.filter((item) => item.purchase_id === r.id).map((item) => ({ ...item, productId: item.inventory_id, productName: item.product_name, unitCost: Number(item.unit_cost || 0), total: Number(item.line_total || 0) })) }));
  if (table === 'partner_capital_entries') return rows.map((r) => ({ ...r, partnerId: r.partner_id, entryDate: r.entry_date, entryType: r.entry_type }));
  if (table === 'partner_allocations') return rows.map((r) => ({ ...r, allocationType: r.allocation_type, effectiveDate: r.effective_date }));
  if (table === 'partner_settlements') return rows.map((r) => ({ ...r, partnerId: r.partner_id, settlementDate: r.settlement_date, type: r.settlement_type }));
  if (table === 'quotations') return rows.map((r) => ({ ...r, customerId: r.customer_id, quoteNumber: r.quote_number, issueDate: r.issue_date, validUntil: r.valid_until, ownerSignature: r.owner_signature, ownerStamp: r.owner_stamp, items: payments.filter((item) => item.quotation_id === r.id) }));
  return rows;
};

export const loadShowroomData = async (showroomId) => {
  if (!supabase || !showroomId) return { showroom: null, data: null, error: null };
  const tables = ['customers', 'inventory_units', 'bookings', 'booking_payments', 'sales', 'sale_items', 'expenses', 'partners', 'partner_capital_entries', 'partner_allocations', 'partner_settlements', 'quotations', 'quotation_items', 'suppliers', 'purchases', 'purchase_items', 'subscriptions'];
  const results = await Promise.all(tables.map((table) => ['booking_payments', 'sale_items', 'quotation_items', 'purchase_items'].includes(table) ? supabase.from(table).select('*') : supabase.from(table).select('*').eq('showroom_id', showroomId)));
  const failed = results.find((result) => result.error);
  if (failed) return { showroom: null, data: null, error: failed.error };
  const rows = Object.fromEntries(tables.map((table, index) => [table, results[index].data || []]));
  const allocations = mapRows('partner_allocations', rows.partner_allocations);
  return { showroom: null, data: { customers: mapRows('customers', rows.customers), products: mapRows('inventory_units', rows.inventory_units), bookings: mapRows('bookings', rows.bookings, rows.booking_payments), sales: mapRows('sales', rows.sales, rows.sale_items), expenses: mapRows('expenses', rows.expenses), partners: mapRows('partners', rows.partners), partnerInvestments: rows.partner_capital_entries.map((r) => ({ ...r, partnerId: r.partner_id, entryDate: r.entry_date, entryType: r.entry_type })), ownershipHistory: allocations.filter((r) => r.allocationType === 'ownership'), profitShareHistory: allocations.filter((r) => r.allocationType === 'profit_sharing'), settlements: rows.partner_settlements.map((r) => ({ ...r, partnerId: r.partner_id, settlementDate: r.settlement_date, type: r.settlement_type })).filter((r) => r.type === 'Profit payment'), withdrawals: rows.partner_settlements.map((r) => ({ ...r, partnerId: r.partner_id, settlementDate: r.settlement_date, type: r.settlement_type })).filter((r) => r.type === 'Withdrawal'), quotations: mapRows('quotations', rows.quotations, rows.quotation_items), suppliers: mapRows('suppliers', rows.suppliers), purchases: mapRows('purchases', rows.purchases, rows.purchase_items), subscription: rows.subscriptions.find((item) => ['trial', 'active', 'past_due'].includes(item.status)) || null }, error: null };
};

const toSupabase = (table, record, showroomId) => {
  const base = { showroom_id: showroomId };
  if (table === 'customers') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), full_name: record.fullName, phone: record.phone, email: record.email || null, address: record.address || null, identification_reference: record.identificationReference || null, total_purchases: Number(record.totalPurchases || 0), outstanding_balance: Number(record.outstandingBalance || 0) };
  if (table === 'inventory_units') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), brand: record.brand || record.name, model: record.model || record.name, model_year: record.modelYear || null, color: record.color || null, chassis_reference: record.chassisNumber || null, stock_unit_reference: record.stockUnitReference || null, battery_type: record.batteryType || null, battery_capacity: record.batteryCapacity || null, battery_voltage: record.batteryVoltage || null, battery_ah: record.batteryAh || null, range_km: Number(record.rangeKm || 0), range_description: record.rangeDescription || null, charging_time: record.chargingTime || null, top_speed: record.topSpeed || null, motor_power: record.motorPower || null, warranty: record.warranty || null, sku: record.sku || null, barcode: record.barcode || null, description: record.description || null, category: record.category || 'EV Bikes', purchase_cost: Number(record.costPrice || 0), selling_price: Number(record.sellingPrice || 0), quantity: Number(record.quantity || 0), reserved_quantity: Number(record.reservedQuantity || 0), min_stock_level: Number(record.minStockThreshold || 1) };
  if (table === 'bookings') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), customer_id: isUuid(record.customerId) ? record.customerId : null, customer_name: record.customerName, customer_phone: record.customerPhone || null, customer_email: record.customerEmail || null, address: record.address || null, identification_reference: record.identificationReference || null, inventory_id: isUuid(record.bikeProductId) ? record.bikeProductId : null, bike_brand: record.bikeBrand || null, bike_model: record.bikeModel || null, model_year: Number(record.modelYear) || null, bike_color: record.color || null, chassis_reference: record.chassisReference || null, stock_unit_reference: record.stockUnitReference || null, salesperson: record.salesperson || null, deposit_required: Number(record.depositRequired || 0), cost_of_goods: Number(record.costOfGoods || 0), stock_arrival_notified_at: record.stockArrivalNotifiedAt || null, delivery_status: record.deliveryStatus || 'Reserved', booking_number: record.bookingNumber, booking_date: record.bookingDate, expected_delivery_date: record.expectedDeliveryDate || null, total_price: Number(record.totalPrice || 0), status: record.status || 'Pending', delivery_date: record.deliveryDate || null, inventory_deducted: Boolean(record.inventoryDeducted), notes: record.notes || null };
  if (table === 'partners') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), full_name: record.fullName, phone: record.phone || null, email: record.email || null, ownership_percentage: Number(record.ownershipPercentage || 0), profit_sharing_percentage: Number(record.profitSharingPercentage || 0), joining_date: record.joiningDate || null, status: record.status || 'Active' };
  if (table === 'suppliers') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), name: record.name, company: record.company, phone: record.phone || null, email: record.email || null, address: record.address || null, products_supplied: record.productsSupplied || null };
  if (table === 'purchases') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), supplier_id: isUuid(record.supplierId) ? record.supplierId : null, supplier_name: record.supplierName, invoice_reference: record.invoiceRef, purchase_date: record.date, total_cost: Number(record.totalCost || 0), paid_amount: Number(record.paidAmount || 0), payment_method: record.paymentMethod || null, status: record.status || 'Unpaid' };
  if (table === 'expenses') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), expense_date: record.date, amount: Number(record.amount || 0), category: record.category || null, description: record.title || record.description || null, reference: record.reference || null };
  if (table === 'sales') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), invoice_number: record.invoiceNumber, customer_id: isUuid(record.customerId) ? record.customerId : null, date: record.date, total: Number(record.total || 0), paid_amount: Number(record.paidAmount || 0), cost_of_goods: Number(record.costOfGoods || 0), status: record.status || 'Paid', booking_id: isUuid(record.bookingId) ? record.bookingId : null };
  if (table === 'partners') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), full_name: record.fullName, phone: record.phone || null, email: record.email || null, ownership_percentage: Number(record.ownershipPercentage || 0), profit_sharing_percentage: Number(record.profitSharingPercentage || 0), joining_date: record.joiningDate || null, status: record.status || 'Active' };
  if (table === 'partner_capital_entries') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), partner_id: isUuid(record.partnerId) ? record.partnerId : null, entry_date: record.entryDate || record.date, amount: Number(record.amount || 0), entry_type: record.entryType || 'initial', method: record.method || null, reference: record.reference || null, notes: record.notes || null, status: record.status || 'Posted' };
  if (table === 'partner_settlements') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), partner_id: isUuid(record.partnerId) ? record.partnerId : null, settlement_date: record.settlementDate || record.date, amount: Number(record.amount || 0), settlement_type: record.settlementType || 'Profit payment', reference: record.reference || null, notes: record.notes || null };
  if (table === 'partner_allocations') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), allocation_type: record.allocationType, effective_date: record.effectiveDate, status: record.status || 'Draft', allocations: record.allocations || {}, reason: record.reason || null };
  if (table === 'subscriptions') return { ...base, ...(record.id && isUuid(record.id) ? { id: record.id } : {}), plan_id: record.planId || 'showroom', status: record.status || 'trial', monthly_amount: Number(record.monthlyAmount || 10000), started_at: record.startedAt || null, next_billing_date: record.nextBillingDate || null, last_paid_at: record.lastPaidAt || null, provider: record.provider || null, provider_reference: record.providerReference || null };
  return null;
};

export const syncEntity = async (table, record, showroomId) => {
  const payload = toSupabase(table, record, showroomId);
  if (!supabase || !payload || !showroomId) return { data: null, error: null };
  return monitorWrite(supabase.from(table).upsert(payload).select().single(), `Save ${table}`);
};

export const syncShowroomProfile = async (showroomId, fields) => {
  if (!supabase || !showroomId) return { data: null, error: new Error('Authenticated showroom database is required.') };
  const columns = { name: 'name', category: 'category', address: 'address', currency: 'currency', email: 'email', phone: 'phone', city: 'city', country: 'country', taxNumber: 'tax_number', website: 'website', establishedYear: 'established_year' };
  const payload = Object.fromEntries(Object.entries(columns).filter(([field]) => fields[field] !== undefined).map(([field, column]) => [column, fields[field] || null]));
  return monitorWrite(supabase.from('showrooms').update(payload).eq('id', showroomId).select().single(), 'Save showroom profile');
};

export const syncSale = async (record, showroomId) => {
  if (!supabase || !showroomId) return { data: null, error: new Error('Authenticated showroom database is required.') };
  const sale = await syncEntity('sales', record, showroomId);
  if (sale.error || !sale.data) return sale;
  const lines = (record.items || []).map((item) => ({
    sale_id: sale.data.id,
    inventory_id: isUuid(item.productId) ? item.productId : null,
    product_name: item.productName,
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.unitPrice || 0),
    unit_cost: Number(item.unitCost || 0),
    line_total: Number(item.total || (Number(item.unitPrice || 0) * Number(item.quantity || 1))),
  }));
  if (!lines.length) return sale;
  const savedLines = await monitorWrite(supabase.from('sale_items').upsert(lines, { onConflict: 'id' }).select(), 'Save sale line items');
  return savedLines.error ? { data: null, error: savedLines.error } : sale;
};

export const syncPurchase = async (record, showroomId) => {
  if (!supabase || !showroomId) return { data: null, error: new Error('Authenticated showroom database is required.') };
  const purchase = await syncEntity('purchases', record, showroomId);
  if (purchase.error || !purchase.data) return purchase;
  const lines = (record.items || []).map((item) => ({
    purchase_id: purchase.data.id,
    inventory_id: isUuid(item.productId) ? item.productId : null,
    product_name: item.productName,
    quantity: Number(item.quantity || 1),
    unit_cost: Number(item.unitCost || 0),
    line_total: Number(item.total || (Number(item.unitCost || 0) * Number(item.quantity || 1))),
  }));
  if (!lines.length) return purchase;
  const savedLines = await monitorWrite(supabase.from('purchase_items').insert(lines).select(), 'Save purchase line items');
  return savedLines.error ? { data: null, error: savedLines.error } : purchase;
};

export const removeEntity = async (table, id) => {
  if (!supabase || !isUuid(id)) return { error: null };
  return monitorWrite(supabase.from(table).delete().eq('id', id), `Delete ${table}`);
};

export const syncBookingPayment = async (bookingId, payment) => {
  if (!supabase || !isUuid(bookingId)) return { data: null, error: null };
  return monitorWrite(supabase.from('booking_payments').insert({ booking_id: bookingId, receipt_number: payment.receiptNumber, payment_date: payment.date, amount: Number(payment.amount || 0), method: payment.method || null, reference: payment.reference || null }).select().single(), 'Save booking payment');
};

export const syncQuotation = async ({ showroomId, quotation, item }) => {
  if (!supabase || !showroomId) return { data: null, error: null };
  const quotePayload = { showroom_id: showroomId, ...(quotation.id && isUuid(quotation.id) ? { id: quotation.id } : {}), customer_id: isUuid(quotation.customerId) ? quotation.customerId : null, quote_number: quotation.quoteNumber, issue_date: quotation.issueDate, valid_until: quotation.validUntil || null, status: quotation.status || 'Draft', subtotal: Number(quotation.subtotal || quotation.total || 0), total: Number(quotation.total || 0), notes: quotation.notes || null, owner_signature: quotation.ownerSignature || null, owner_stamp: quotation.ownerStamp || null };
  const quote = await monitorWrite(supabase.from('quotations').upsert(quotePayload).select().single(), 'Save quotation');
  if (quote.error || !item) return quote;
  const itemPayload = { quotation_id: quote.data.id, inventory_id: isUuid(item.productId) ? item.productId : null, product_name: item.productName, brand: item.brand || null, model: item.model || null, color: item.color || null, motor_power: item.motorPower || null, battery_type: item.batteryType || null, battery_capacity: item.batteryCapacity || null, quantity: 1, unit_price: Number(item.unitPrice || 0) };
  const savedItem = await monitorWrite(supabase.from('quotation_items').insert(itemPayload).select().single(), 'Save quotation bike details');
  return savedItem.error ? savedItem : { data: { ...quote.data, item: savedItem.data }, error: null };
};

export const supabaseTable = async (table, operation = 'select', payload) => {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured. Database access is unavailable.') };
  const query = supabase.from(table);
  if (operation === 'insert') return query.insert(payload).select();
  if (operation === 'update') return query.update(payload.fields).eq('id', payload.id).select();
  return query.select('*');
};

export const queueEmail = async ({ showroomId, accessToken, eventType, destination, subject, body, recipientType = 'owner', recipientId = null }) => {
  if (!showroomId || !accessToken) return { data: null, error: new Error('Authenticated showroom session is required.') };
  const base = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';
  try {
    const response = await fetch(`${base}/api/notifications/queue`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'x-showroom-id': showroomId, 'Content-Type': 'application/json' }, body: JSON.stringify({ event_type: eventType, destination, subject, body, recipient_type: recipientType, recipient_id: recipientId }) });
    const data = await response.json().catch(() => ({}));
    const result = response.ok ? { data, error: null } : { data: null, error: new Error(data.detail || 'Email queue request failed.') };
    if (result.error) reportWriteFailure('Queue email notification', result.error);
    return result;
  } catch (error) {
    reportWriteFailure('Queue email notification', error);
    return { data: null, error };
  }
};
