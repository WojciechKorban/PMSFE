import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'pms_access_token';
const REFRESH_TOKEN_KEY = 'pms_refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  setTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      return (payload['exp'] as number) * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  decodePayload<T = Record<string, unknown>>(token: string): T | null {
    try {
      return JSON.parse(atob(token.split('.')[1])) as T;
    } catch {
      return null;
    }
  }
}
