import { IdentifierType } from '../types/auth';

/**
 * Infer identifier type using strict regex patterns
 */
export function detectIdentifierType(identifier: string): IdentifierType {
  const cleanInput = identifier.trim();

  // 1. Email Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(cleanInput)) {
    return 'EMAIL';
  }

  // 2. Student ID Regex (e.g., STU98765, S123456, 20241001)
  const studentIdRegex = /^(STU|S|202[0-9])\d{4,8}$/i;
  if (studentIdRegex.test(cleanInput)) {
    return 'STUDENT_ID';
  }

  // 3. Employee ID Regex (e.g., EMP102, E8812, 700102)
  const employeeIdRegex = /^(EMP|E|700)\d{3,8}$/i;
  if (employeeIdRegex.test(cleanInput)) {
    return 'EMPLOYEE_ID';
  }

  // 4. Fallback to Username (alphanumeric, underscores, dots)
  return 'USERNAME';
}
