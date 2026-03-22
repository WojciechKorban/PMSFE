import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import type { Locale } from 'date-fns';
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  Language,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './language.models';
import { AuthService } from '../auth/auth.service';

interface NotificationPreferencesResponse {
  language?: string;
  emailNotificationsEnabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translocoService = inject(TranslocoService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly currentLanguage = signal<Language>(this.resolveLanguage(DEFAULT_LANGUAGE));
  readonly isLoading = signal<boolean>(false);

  initLanguage(): Observable<void> {
    if (this.authService.isAuthenticated()) {
      return this.http
        .get<NotificationPreferencesResponse>('/api/v1/notifications/preferences')
        .pipe(
          map(prefs => prefs.language ?? this.getStoredLanguage()),
          catchError(() => of(this.getStoredLanguage())),
          switchMap(code => this.setLanguage(code))
        );
    }
    return this.setLanguage(this.getStoredLanguage());
  }

  setLanguage(code: string): Observable<void> {
    const lang = this.resolveLanguage(code);
    this.isLoading.set(true);

    return this.translocoService.load(lang.code).pipe(
      tap(() => {
        this.translocoService.setActiveLang(lang.code);
        this.currentLanguage.set(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang.code);
        document.documentElement.lang = lang.code;
        this.isLoading.set(false);

        if (this.authService.isAuthenticated()) {
          this.persistLanguagePreference(lang.code).subscribe();
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        return throwError(() => err);
      }),
      map(() => void 0)
    );
  }

  getDateFormat(): string {
    return this.currentLanguage().dateFormat;
  }

  getDateFnsLocale(): Locale {
    return this.currentLanguage().dateFnsLocale;
  }

  formatCurrency(amount: number, _currencyCode: string): string {
    const fmt = this.currentLanguage().currencyFormat;
    const [intPart, decPart] = amount.toFixed(2).split('.');
    const formattedInt = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousand);
    const number = `${formattedInt}${fmt.decimal}${decPart ?? '00'}`;
    return fmt.position === 'before'
      ? `${fmt.symbol}${number}`
      : `${number}\u00A0${fmt.symbol}`;
  }

  private resolveLanguage(code: string): Language {
    return (
      SUPPORTED_LANGUAGES.find(l => l.code === code) ??
      SUPPORTED_LANGUAGES.find(l => l.code === FALLBACK_LANGUAGE) ??
      SUPPORTED_LANGUAGES[0]
    );
  }

  private getStoredLanguage(): string {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE;
  }

  private persistLanguagePreference(code: string): Observable<void> {
    return this.http.put<void>('/api/v1/notifications/preferences', { language: code }).pipe(
      catchError(() => of(void 0))
    );
  }
}
