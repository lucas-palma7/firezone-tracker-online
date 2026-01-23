/**
 * Currency formatting utilities for Brazilian Real (BRL)
 * @module utils/currency
 */

/**
 * Intl.NumberFormat instance configured for Brazilian Real currency formatting
 * @constant {Intl.NumberFormat}
 * @example
 * BRL.format(10.50) // "R$ 10,50"
 */
export const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

/**
 * Formats a raw input value into Brazilian Real currency format (R$ X,XX)
 * This function is designed for real-time input formatting as users type.
 * 
 * @param {string} val - The input value to format (may contain non-numeric characters)
 * @returns {string} Formatted currency string in the format "R$ X,XX"
 * 
 * @example
 * formatCurrencyInput("1050") // "R$ 10,50"
 * formatCurrencyInput("R$ 10,50") // "R$ 10,50"
 * formatCurrencyInput("abc123") // "R$ 1,23"
 */
export const formatCurrencyInput = (val) => {
    // Remove all non-digit characters
    let v = val.replace(/\D/g, '');

    // Convert to decimal (divide by 100 to get cents as decimal)
    v = (v / 100).toFixed(2) + '';

    // Replace decimal point with comma (Brazilian format)
    v = v.replace(".", ",");

    // Add thousand separators (dots in Brazilian format)
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    // Add currency symbol prefix
    return "R$ " + v;
};

/**
 * Parses a formatted currency string back to a numeric float value
 * Handles various input formats including formatted currency strings and plain numbers.
 * 
 * @param {string} val - The formatted currency string to parse
 * @returns {number} The numeric value as a float, or 0 if parsing fails
 * 
 * @example
 * parseCurrency("R$ 10,50") // 10.5
 * parseCurrency("R$ 1.234,56") // 1234.56
 * parseCurrency("10,50") // 10.5
 * parseCurrency("invalid") // 0
 */
export const parseCurrency = (val) => {
    // Remove everything except digits and comma
    // Then replace comma with period for parseFloat
    return parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};
