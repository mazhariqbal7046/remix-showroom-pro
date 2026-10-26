// Utilities for formatting, export, and calculations

export const CURRENCY_MAP = {
  PKR: { symbol: 'Rs.', label: 'Pakistani Rupee (PKR)', code: 'PKR' },
  USD: { symbol: '$', label: 'US Dollar (USD)', code: 'USD' },
  EUR: { symbol: '€', label: 'Euro (EUR)', code: 'EUR' },
  GBP: { symbol: '£', label: 'British Pound (GBP)', code: 'GBP' },
  AED: { symbol: 'AED', label: 'UAE Dirham (AED)', code: 'AED' },
  SAR: { symbol: 'SAR', label: 'Saudi Riyal (SAR)', code: 'SAR' },
};

export const formatCurrency = (amount, currencyCode = 'PKR') => {
  const num = Number(amount) || 0;
  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.PKR;
  return `${config.symbol} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) return;
  const columnHeaders = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row => {
    return headers.map(h => {
      let val = row[h.key];
      if (typeof h.format === 'function') {
        val = h.format(val, row);
      }
      if (val === undefined || val === null) val = '';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [columnHeaders, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
