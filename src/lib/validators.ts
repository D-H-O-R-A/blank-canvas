/** Shared frontend validation helpers */

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(cleaned[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(cleaned[10]) === check;
}

export function validateEmail(email: string): boolean {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

export function validateName(name: string): boolean {
  return !!name && name.trim().length >= 2 && name.trim().length <= 100;
}

export function validatePassword(password: string): boolean {
  return !!password && password.length >= 6 && password.length <= 128;
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
