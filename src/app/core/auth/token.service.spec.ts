import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

function buildJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('setTokens stores accessToken in sessionStorage and refreshToken in localStorage', () => {
    service.setTokens('access123', 'refresh456');
    expect(sessionStorage.getItem('pms_access_token')).toBe('access123');
    expect(localStorage.getItem('pms_refresh_token')).toBe('refresh456');
  });

  it('getAccessToken returns value from sessionStorage', () => {
    sessionStorage.setItem('pms_access_token', 'myAccessToken');
    expect(service.getAccessToken()).toBe('myAccessToken');
  });

  it('getRefreshToken returns value from localStorage', () => {
    localStorage.setItem('pms_refresh_token', 'myRefreshToken');
    expect(service.getRefreshToken()).toBe('myRefreshToken');
  });

  it('clearTokens removes both tokens', () => {
    service.setTokens('acc', 'ref');
    service.clearTokens();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('isAccessTokenExpired returns true when no token present', () => {
    expect(service.isAccessTokenExpired()).toBe(true);
  });

  it('isAccessTokenExpired returns true for an expired token', () => {
    const expiredPayload = { sub: 'user1', exp: Math.floor(Date.now() / 1000) - 3600 };
    const token = buildJwt(expiredPayload);
    service.setTokens(token, 'refresh');
    expect(service.isAccessTokenExpired()).toBe(true);
  });

  it('isAccessTokenExpired returns false for a valid token', () => {
    const validPayload = { sub: 'user1', exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = buildJwt(validPayload);
    service.setTokens(token, 'refresh');
    expect(service.isAccessTokenExpired()).toBe(false);
  });

  it('decodePayload returns parsed payload for valid JWT', () => {
    const payload = { sub: 'user1', email: 'test@test.com', roles: ['ROLE_USER'], exp: 9999999999, iat: 1 };
    const token = buildJwt(payload);
    const decoded = service.decodePayload(token);
    expect(decoded).toMatchObject({ sub: 'user1', email: 'test@test.com' });
  });

  it('decodePayload returns null for malformed token', () => {
    expect(service.decodePayload('not.a.token')).toBeNull();
  });
});
