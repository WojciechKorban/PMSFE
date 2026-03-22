import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  success(messageKey: string, params?: Record<string, unknown>): void {
    const msg = this.transloco.translate(messageKey, params ?? {});
    this.snackBar.open(msg, '✕', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  error(messageKey: string, params?: Record<string, unknown>): void {
    const msg = this.transloco.translate(messageKey, params ?? {});
    this.snackBar.open(msg, '✕', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  info(messageKey: string, params?: Record<string, unknown>): void {
    const msg = this.transloco.translate(messageKey, params ?? {});
    this.snackBar.open(msg, '✕', {
      duration: 4000,
    });
  }
}
