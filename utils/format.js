/**
 * formatCurrency(2077)         → "RD$2,077"
 * formatCurrency(2077.5, true) → "RD$2,077.50"
 */
export const formatCurrency = (amount, showCents = false) => {
  if (amount == null) return 'RD$0';
  const formatted = showCents
    ? Number(amount).toFixed(2)
    : Math.round(amount).toLocaleString('es-DO');
  return `RD$${formatted}`;
};

// Hardcoded Spanish names so the output is identical on every device,
// regardless of whether the OS has the es-DO locale data installed.
const DAY_NAMES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const toDate = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return null;
  return dateOrTimestamp?.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
};

/**
 * formatDate(timestamp) → "martes, 22 de abril de 2026"  (Dominican long form)
 */
export const formatDate = (dateOrTimestamp) => {
  const date = toDate(dateOrTimestamp);
  if (!date) return '';
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
};

/**
 * formatDateShort(date) → "22/04/2026"  (DD/MM/YYYY, Dominican format)
 */
export const formatDateShort = (dateOrTimestamp) => {
  const date = toDate(dateOrTimestamp);
  if (!date) return '';
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * convertTo24h("2:00 PM") → "14:00:00"
 */
export const convertTo24h = (time12) => {
  const [time, modifier] = time12.split(' ');
  let [hours, minutes]   = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}:00`;
};

/**
 * formatSlot(Date | Timestamp) → "9:00 AM" (matches TIME_SLOTS format)
 */
export const formatSlot = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return '';
  const date = dateOrTimestamp?.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  let   h    = date.getHours();
  const m    = String(date.getMinutes()).padStart(2, '0');
  const mod  = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${mod}`;
};

/**
 * formatDRPhone("8095551234") → "+18095551234"
 */
export const formatDRPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) return '+' + digits;
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 7)  return '+1809' + digits;
  return '+' + digits;
};

/**
 * getInitials("Carlos Rodríguez") → "CR"
 */
export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
