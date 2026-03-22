import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { ErrorTranslationService } from '../i18n/error-translation.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const transloco = inject(TranslocoService);
  const errorTranslation = inject(ErrorTranslationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        let message: string;

        switch (error.status) {
          case 400: {
            const errorCode = (error.error as Record<string, unknown>)?.['error'] as string | undefined;
            const translationKey = errorCode
              ? errorTranslation.translate(errorCode)
              : 'common.errors.validationError';
            message = transloco.translate(translationKey);
            break;
          }
          case 401:
            return throwError(() => error);
          case 403:
            message = transloco.translate('common.errors.forbidden');
            break;
          case 404:
            message = transloco.translate('common.errors.notFound');
            break;
          case 429: {
            const retryAfter = error.headers.get('Retry-After') ?? '60';
            message = transloco.translate('common.errors.rateLimitExceeded', {
              retryAfter,
            });
            break;
          }
          case 0:
            message = transloco.translate('common.errors.networkError');
            break;
          default:
            message = transloco.translate('common.errors.serverError');
        }

        snackBar.open(message, transloco.translate('buttons.close'), {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }

      return throwError(() => error);
    })
  );
};
