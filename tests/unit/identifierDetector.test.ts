import { describe, it, expect } from 'vitest';
import { detectIdentifierType } from '../../src/backend/utils/identifierDetector';

describe('Unit Test: Multi-Identifier Detector', () => {
  it('should accurately detect EMAIL identifiers', () => {
    expect(detectIdentifierType('student@enterprise.io')).toBe('EMAIL');
    expect(detectIdentifierType('admin.user@company.org')).toBe('EMAIL');
    expect(detectIdentifierType('  john.doe@domain.co  ')).toBe('EMAIL');
  });

  it('should accurately detect STUDENT_ID identifiers', () => {
    expect(detectIdentifierType('STU10203')).toBe('STUDENT_ID');
    expect(detectIdentifierType('stu998877')).toBe('STUDENT_ID');
    expect(detectIdentifierType('S123456')).toBe('STUDENT_ID');
    expect(detectIdentifierType('20241001')).toBe('STUDENT_ID');
  });

  it('should accurately detect EMPLOYEE_ID identifiers', () => {
    expect(detectIdentifierType('EMP501')).toBe('EMPLOYEE_ID');
    expect(detectIdentifierType('emp999')).toBe('EMPLOYEE_ID');
    expect(detectIdentifierType('E8812')).toBe('EMPLOYEE_ID');
    expect(detectIdentifierType('700102')).toBe('EMPLOYEE_ID');
  });

  it('should fallback to USERNAME for standard handles', () => {
    expect(detectIdentifierType('smsmoe006')).toBe('USERNAME');
    expect(detectIdentifierType('john_doe_99')).toBe('USERNAME');
    expect(detectIdentifierType('admin_lead')).toBe('USERNAME');
  });
});
