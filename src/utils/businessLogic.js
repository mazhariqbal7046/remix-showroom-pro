export const todayISO = () => new Date().toISOString().slice(0, 10);

export const inDateRange = (date, from, to) => {
  if (!date) return false;
  return (!from || date >= from) && (!to || date <= to);
};

export const monthBounds = (month) => {
  const [year, m] = month.split('-').map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
};

export const normaliseBooking = (booking) => {
  const received = (booking.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return { ...booking, amountReceived: received, remainingBalance: Math.max(0, Number(booking.totalPrice || 0) - received) };
};

export const getApplicableAllocation = (history, date, fallback = {}) => {
  return [...history]
    .filter((entry) => entry.status === 'Approved' && entry.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0]?.allocations || fallback;
};

export const calculateFinancials = ({ sales = [], purchases = [], expenses = [], bookings = [], products = [], from, to }) => {
  const completedSales = sales.filter((s) => inDateRange(s.date, from, to) && s.status !== 'Cancelled');
  const invoicedBookingIds = new Set(completedSales.map((sale) => sale.bookingId).filter(Boolean));
  const deliveredBookings = bookings.filter((b) => inDateRange(b.deliveryDate || b.bookingDate, from, to) && b.status === 'Delivered' && !invoicedBookingIds.has(b.id));
  const revenue = completedSales.reduce((sum, s) => sum + Number(s.total || 0), 0) + deliveredBookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const salesCogs = completedSales.reduce((sum, s) => {
    const storedCost = Number(s.costOfGoods ?? s.cost_of_goods ?? 0);
    if (storedCost > 0) return sum + storedCost;
    return sum + (s.items || []).reduce((i, item) => {
    const product = products.find((p) => p.id === item.productId || p.name === item.productName);
    return i + Number(item.quantity || 0) * Number(item.unitCost ?? product?.costPrice ?? 0);
    }, 0);
  }, 0);
  const cogs = salesCogs + deliveredBookings.reduce((sum, booking) => sum + Number(booking.costOfGoods ?? booking.cost_of_goods ?? 0), 0);
  const operatingExpenses = expenses.filter((e) => inDateRange(e.date, from, to)).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const grossProfit = revenue - cogs;
  return { revenue, cogs, operatingExpenses, grossProfit, netProfit: grossProfit - operatingExpenses, distributableProfit: Math.max(0, grossProfit - operatingExpenses) };
};

export const csvRows = (rows, columns) => rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? '')).join(','));
