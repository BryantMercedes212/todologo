exports.validateBookingInput = (data, taskerDoc) => {
  const errors = [];
  if (!data.taskerId)        errors.push('taskerId required');
  if (!data.clientId)        errors.push('clientId required');
  if (!data.scheduledAt)     errors.push('scheduledAt required');
  if (!data.estimatedHours)  errors.push('estimatedHours required');
  if (!data.paymentMethod)   errors.push('paymentMethod required');
  if (!data.address?.street) errors.push('address.street required');
  if (!data.address?.sector) errors.push('address.sector required');
  if (data.estimatedHours < 1 || data.estimatedHours > 8)
    errors.push('estimatedHours must be 1–8');
  if (!['cash','azul','card','transfer'].includes(data.paymentMethod))
    errors.push('invalid paymentMethod');
  if (new Date(data.scheduledAt) <= new Date())
    errors.push('scheduledAt must be in the future');

  if (!taskerDoc.exists) {
    errors.push('Tasker not found');
  } else {
    const t = taskerDoc.data();
    if (!t.isActive)                                 errors.push('Tasker not active');
    else if (!t.isAvailableNow)                      errors.push('Tasker not available');
    if (typeof t.hourlyRate !== 'number' || t.hourlyRate <= 0)
      errors.push('Tasker hourlyRate not set');
  }

  if (errors.length) throw new Error(errors.join(' | '));
};
