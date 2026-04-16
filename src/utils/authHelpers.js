export function normalizeIdentifier(value) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(value) {
  return value.includes("@");
}

export function calculatePregnancyStartDate(dueDateInput) {
  const dueDate = new Date(dueDateInput);
  const result = new Date(dueDate);
  result.setDate(result.getDate() - 280);
  return result;
}

export function buildTrialPhoneNumber(deviceId) {
  const compact = deviceId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `TRIAL${compact.slice(0, 10)}`.padEnd(15, "0").slice(0, 15);
}
