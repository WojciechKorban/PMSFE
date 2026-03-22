import { TestBed } from '@angular/core/testing';
import { ErrorTranslationService } from './error-translation.service';

describe('ErrorTranslationService', () => {
  let service: ErrorTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorTranslationService);
  });

  it('translates EMAIL_ALREADY_EXISTS correctly', () => {
    expect(service.translate('EMAIL_ALREADY_EXISTS')).toBe('auth.errors.emailAlreadyExists');
  });

  it('translates EMAIL_NOT_VERIFIED correctly', () => {
    expect(service.translate('EMAIL_NOT_VERIFIED')).toBe('auth.errors.emailNotVerified');
  });

  it('translates INVALID_CREDENTIALS correctly', () => {
    expect(service.translate('INVALID_CREDENTIALS')).toBe('auth.errors.invalidCredentials');
  });

  it('translates TOKEN_EXPIRED correctly', () => {
    expect(service.translate('TOKEN_EXPIRED')).toBe('auth.errors.tokenExpired');
  });

  it('translates TOKEN_NOT_FOUND correctly', () => {
    expect(service.translate('TOKEN_NOT_FOUND')).toBe('auth.errors.tokenNotFound');
  });

  it('translates TOKEN_ALREADY_REVOKED correctly', () => {
    expect(service.translate('TOKEN_ALREADY_REVOKED')).toBe('auth.errors.tokenAlreadyRevoked');
  });

  it('translates ACCOUNT_DISABLED correctly', () => {
    expect(service.translate('ACCOUNT_DISABLED')).toBe('auth.errors.accountDisabled');
  });

  it('translates RATE_LIMIT_EXCEEDED correctly', () => {
    expect(service.translate('RATE_LIMIT_EXCEEDED')).toBe('common.errors.rateLimitExceeded');
  });

  it('translates NOT_FOUND correctly', () => {
    expect(service.translate('NOT_FOUND')).toBe('common.errors.notFound');
  });

  it('translates CONFLICT correctly', () => {
    expect(service.translate('CONFLICT')).toBe('common.errors.conflict');
  });

  it('translates FORBIDDEN correctly', () => {
    expect(service.translate('FORBIDDEN')).toBe('common.errors.forbidden');
  });

  it('translates INTERNAL_SERVER_ERROR correctly', () => {
    expect(service.translate('INTERNAL_SERVER_ERROR')).toBe('common.errors.serverError');
  });

  it('translates BAD_REQUEST correctly', () => {
    expect(service.translate('BAD_REQUEST')).toBe('common.errors.validationError');
  });

  it('translates UNAUTHORIZED correctly', () => {
    expect(service.translate('UNAUTHORIZED')).toBe('auth.errors.invalidCredentials');
  });

  it('returns unknownError for unknown code', () => {
    expect(service.translate('UNKNOWN_CODE')).toBe('common.errors.unknownError');
  });

  it('all mapped codes return a non-empty string', () => {
    const codes = [
      'EMAIL_ALREADY_EXISTS', 'EMAIL_NOT_VERIFIED', 'INVALID_CREDENTIALS',
      'TOKEN_EXPIRED', 'TOKEN_NOT_FOUND', 'TOKEN_ALREADY_REVOKED',
      'ACCOUNT_DISABLED', 'RATE_LIMIT_EXCEEDED', 'NOT_FOUND', 'CONFLICT',
      'FORBIDDEN', 'INTERNAL_SERVER_ERROR', 'BAD_REQUEST', 'UNAUTHORIZED',
    ];
    for (const code of codes) {
      const result = service.translate(code);
      expect(result.length).toBeGreaterThan(0);
    }
  });
});
