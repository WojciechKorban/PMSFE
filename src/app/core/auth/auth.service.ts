import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { TokenService } from './token.service';
import type { AuthUser, JwtPayload, LoginRequest, RegisterRequest, TokenResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  restoreSession(): Observable<void> {
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken && !this.tokenService.isAccessTokenExpired()) {
      const user = this.decodeUser(accessToken);
      if (user) {
        this.currentUser.set(user);
        return of(void 0);
      }
    }
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      return this.refresh().pipe(catchError(() => {
        this.tokenService.clearTokens();
        return of(void 0);
      }));
    }
    return of(void 0);
  }

  login(email: string, password: string): Observable<void> {
    return this.http.post<TokenResponse>('/api/v1/auth/login', { email, password } satisfies LoginRequest).pipe(
      tap(tokens => {
        this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
        const user = this.decodeUser(tokens.accessToken);
        this.currentUser.set(user);
      }),
      map(() => void 0)
    );
  }

  register(name: string, email: string, password: string): Observable<void> {
    return this.http.post<void>('/api/v1/auth/register', { name, email, password } satisfies RegisterRequest);
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<void>('/api/v1/auth/logout', { refreshToken }).pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.currentUser.set(null);
      }),
      catchError(() => {
        this.tokenService.clearTokens();
        this.currentUser.set(null);
        return of(void 0);
      })
    );
  }

  logoutAll(): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout-all', {}).pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.currentUser.set(null);
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>('/api/v1/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>('/api/v1/auth/reset-password', { token, newPassword });
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>('/api/v1/auth/verify-email', { token });
  }

  refresh(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<TokenResponse>('/api/v1/auth/refresh', { refreshToken }).pipe(
      tap(tokens => {
        this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
        const user = this.decodeUser(tokens.accessToken);
        this.currentUser.set(user);
      }),
      map(() => void 0)
    );
  }

  private decodeUser(accessToken: string): AuthUser | null {
    const payload = this.tokenService.decodePayload<JwtPayload>(accessToken);
    if (!payload) return null;
    return {
      userId: payload['sub'],
      email: payload['email'],
      roles: payload['roles'] ?? [],
    };
  }
}
