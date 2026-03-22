import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../auth/token.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (req.url.includes('/auth/')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (isRefreshing) {
          return refreshSubject.pipe(
            filter((token): token is string => token !== null),
            take(1),
            switchMap(token =>
              next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
            )
          );
        }

        isRefreshing = true;
        refreshSubject.next(null);

        return authService.refresh().pipe(
          switchMap(() => {
            isRefreshing = false;
            const newToken = tokenService.getAccessToken() ?? '';
            refreshSubject.next(newToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError(refreshError => {
            isRefreshing = false;
            tokenService.clearTokens();
            authService.currentUser.set(null);
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
