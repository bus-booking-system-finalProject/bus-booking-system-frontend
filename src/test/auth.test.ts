import { describe, it, expect } from 'vitest';
import { RegisterSchema, LoginSchema } from '../schemas/AuthSchema';

describe('Auth Validation Schemas', () => {
  describe('RegisterSchema', () => {
    it('validates a correct user', () => {
      const validUser = { email: 'test@example.com', password: 'password123' };
      const result = RegisterSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('rejects short passwords', () => {
      const shortPass = { email: 'test@example.com', password: '123' };
      const result = RegisterSchema.safeParse(shortPass);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('rejects invalid emails', () => {
      const invalidEmail = { email: 'not-an-email', password: 'password123' };
      const result = RegisterSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('requires password', () => {
      const noPass = { email: 'test@example.com', password: '' };
      const result = LoginSchema.safeParse(noPass);
      expect(result.success).toBe(false);
    });
  });
});
