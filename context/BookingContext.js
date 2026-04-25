import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { PRICING_RATES } from '../constants/data';

const BookingContext = createContext(null);

const INITIAL = {
  tasker: null, date: null, time: null,
  address: { street: '', sector: '', city: 'Santo Domingo', coords: null, notes: '' },
  serviceNotes: '', estimatedHours: 2, paymentMethod: 'cash',
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(INITIAL);

  const updateBooking = useCallback((fields) => setBooking(prev => ({ ...prev, ...fields })), []);
  const resetBooking  = useCallback(() => setBooking(INITIAL), []);

  // Pricing is always derived — never stored in state to prevent stale values.
  // Memoized so children that depend on it don't re-render needlessly.
  const pricing = useMemo(() => {
    if (!booking.tasker) return null;
    const hourlyRate = booking.tasker.hourlyRate ?? 0;
    const hours      = booking.estimatedHours;
    const subtotal   = hourlyRate * hours;
    const serviceFee = Math.round(subtotal * PRICING_RATES.SERVICE_FEE);
    const itbis      = Math.round((subtotal + serviceFee) * PRICING_RATES.ITBIS);
    return { hourlyRate, hours, subtotal, serviceFee, itbis, total: subtotal + serviceFee + itbis };
  }, [booking.tasker, booking.estimatedHours]);

  const value = useMemo(
    () => ({ booking, updateBooking, resetBooking, pricing }),
    [booking, updateBooking, resetBooking, pricing]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => useContext(BookingContext);
