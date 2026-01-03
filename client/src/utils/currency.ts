
interface Currency {
    symbol: string;
    rate: number; // Exchange rate relative to USD (base)
}

export const CURRENCIES: Record<string, Currency> = {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    JPY: { symbol: '¥', rate: 151.5 },
    AUD: { symbol: 'A$', rate: 1.54 },
    CAD: { symbol: 'C$', rate: 1.36 },
    INR: { symbol: '₹', rate: 83.3 },
    SGD: { symbol: 'S$', rate: 1.35 },
};

export const formatCurrency = (amount: number | string, currencyCode: string = 'USD'): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '';

    // Use Intl.NumberFormat for proper formatting
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 0, // Usually rounded for clean display in UI
        }).format(value);
    } catch (e) {
        // Fallback if currency code is invalid
        const symbol = CURRENCIES[currencyCode]?.symbol || currencyCode;
        return `${symbol}${value.toFixed(0)}`;
    }
};
