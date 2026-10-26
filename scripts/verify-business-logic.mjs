import assert from 'node:assert/strict';
import { normaliseBooking, calculateFinancials, getApplicableAllocation } from '../src/utils/businessLogic.js';

const booking = normaliseBooking({ totalPrice: 250000, payments: [{ amount: 50000 }, { amount: 75000 }] });
assert.equal(booking.amountReceived, 125000);
assert.equal(booking.remainingBalance, 125000);

const history = [
  { effectiveDate: '2026-01-01', status: 'Approved', allocations: { A: 10, B: 90 } },
  { effectiveDate: '2026-04-01', status: 'Approved', allocations: { A: 30, B: 70 } },
];
assert.equal(getApplicableAllocation(history, '2026-02-01').A, 10);
assert.equal(getApplicableAllocation(history, '2026-04-01').A, 30);

const report = calculateFinancials({
  sales: [{ date: '2026-10-25', total: 300000, status: 'Paid', items: [{ productId: 'bike', quantity: 1 }] }],
  products: [{ id: 'bike', costPrice: 200000 }],
  expenses: [{ date: '2026-10-25', amount: 50000 }],
  bookings: [{ bookingDate: '2026-10-25', totalPrice: 250000, amountReceived: 50000, status: 'Confirmed' }],
  from: '2026-10-25', to: '2026-10-25',
});
assert.equal(report.revenue, 300000); // deposit is not completed-sale revenue
assert.equal(report.cogs, 200000);
assert.equal(report.netProfit, 50000);
console.log('Business logic checks passed: booking balance, effective shares, COGS and profit separation.');
