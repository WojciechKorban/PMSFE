import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { forkJoin, map, Observable, catchError, of } from 'rxjs';

const TRANSLATION_FILES = [
  'common',
  'auth',
  'validation',
  'properties',
  'meters',
  'tenants',
  'contracts',
  'profitability',
  'notifications',
  'admin',
  'reports',
  'settings',
];

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    const requests = TRANSLATION_FILES.map(file =>
      this.http.get<Translation>(`/assets/i18n/${lang}/${file}.json`).pipe(
        catchError(() => {
          console.warn(`Missing translation file: ${lang}/${file}.json`);
          return of({} as Translation);
        })
      )
    );
    return forkJoin(requests).pipe(
      map(results =>
        results.reduce(
          (merged, translations) => ({ ...merged, ...translations }),
          {} as Translation
        )
      )
    );
  }
}
