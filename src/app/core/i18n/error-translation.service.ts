import { Injectable } from '@angular/core';

const ERROR_CODE_MAP: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'auth.errors.emailAlreadyExists',
  EMAIL_NOT_VERIFIED: 'auth.errors.emailNotVerified',
  INVALID_TOKEN: 'auth.errors.emailNotVerified',
  INVALID_CREDENTIALS: 'auth.errors.invalidCredentials',
  TOKEN_EXPIRED: 'auth.errors.tokenExpired',
  TOKEN_NOT_FOUND: 'auth.errors.tokenNotFound',
  TOKEN_ALREADY_REVOKED: 'auth.errors.tokenAlreadyRevoked',
  ACCOUNT_DISABLED: 'auth.errors.accountDisabled',
  RATE_LIMIT_EXCEEDED: 'common.errors.rateLimitExceeded',
  NOT_FOUND: 'common.errors.notFound',
  CONFLICT: 'common.errors.conflict',
  FORBIDDEN: 'common.errors.forbidden',
  INTERNAL_SERVER_ERROR: 'common.errors.serverError',
  BAD_REQUEST: 'common.errors.validationError',
  UNAUTHORIZED: 'auth.errors.invalidCredentials',
};

@Injectable({ providedIn: 'root' })
export class ErrorTranslationService {
  translate(errorCode: string): string {
    return ERROR_CODE_MAP[errorCode] ?? 'common.errors.unknownError';
  }
}
