export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function passwordLengthOK(pw: string): boolean {
  return pw.length >= 12;
}

export function passwordComplexOK(pw: string): boolean {
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}
