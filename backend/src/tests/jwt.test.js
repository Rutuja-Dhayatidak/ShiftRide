const jwtUtils = require('../utils/jwt');
const jwt = require('jsonwebtoken');

describe('JWT Utility', () => {
  const payload = { id: 1, role: 'user' };

  test('should sign a token', () => {
    const token = jwtUtils.signToken(payload);
    expect(token).toBeDefined();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development_secret');
    expect(decoded.id).toBe(payload.id);
  });

  test('should verify a valid token', () => {
    const token = jwtUtils.signToken(payload);
    const decoded = jwtUtils.verifyToken(token);
    expect(decoded.id).toBe(payload.id);
  });

  test('should throw error for invalid token', () => {
    expect(() => jwtUtils.verifyToken('invalid.token.here')).toThrow();
  });
});
