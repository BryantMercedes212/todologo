// Must match PRICING_RATES in constants/data.js
const SERVICE_FEE_RATE = 0.10;
const ITBIS_RATE       = 0.18;

exports.calculatePricing = (hourlyRate, estimatedHours) => {
  const subtotal   = hourlyRate * estimatedHours;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const itbis      = Math.round((subtotal + serviceFee) * ITBIS_RATE);
  return {
    hourlyRate,
    estimatedHours,
    subtotal,
    serviceFee,
    itbis,
    total:    subtotal + serviceFee + itbis,
    currency: 'DOP',
  };
};
