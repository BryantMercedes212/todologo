export const CATEGORIES = [
  { id: 'limpieza',   label: 'Limpieza',     icon: 'home'    },
  { id: 'plomeria',   label: 'Plomería',     icon: 'tool'    },
  { id: 'electrico',  label: 'Electricidad', icon: 'zap'     },
  { id: 'mudanzas',   label: 'Mudanzas',     icon: 'truck'   },
  { id: 'jardineria', label: 'Jardinería',   icon: 'leaf'    },
  { id: 'pintura',    label: 'Pintura',      icon: 'edit'    },
  { id: 'ensamblaje', label: 'Ensamblaje',   icon: 'package' },
];

export const SECTORS_SANTO_DOMINGO = [
  'Piantini', 'Naco', 'Evaristo Morales', 'Gazcue',
  'Los Cacicazgos', 'Bella Vista', 'Arroyo Hondo',
  'Los Prados', 'Mirador Norte', 'Mirador Sur',
  'La Esperilla', 'El Millón', 'Serralles',
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

export const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Efectivo',          sub: 'Pagas al finalizar el servicio'       },
  { id: 'azul',     label: 'Tarjeta Azul',      sub: 'Débito o crédito dominicano'          },
  { id: 'card',     label: 'Visa / Mastercard', sub: 'Tarjeta internacional'                },
  { id: 'transfer', label: 'Transferencia',     sub: 'Banco local (BHD, Popular, Reservas)' },
];

export const ESTIMATED_HOURS_OPTIONS = [1, 2, 3, 4];
export const DR_AREA_CODES           = ['809', '829', '849'];

export const DEFAULT_LOCATION = {
  latitude:  18.4861,
  longitude: -69.9312,
  city:      'Santo Domingo',
};

// Must match exactly with functions/src/utils/pricing.js
export const PRICING_RATES = {
  SERVICE_FEE: 0.10,   // 10% platform fee
  ITBIS:       0.18,   // 18% Dominican tax
};
