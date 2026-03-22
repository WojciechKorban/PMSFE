import { APP_INITIALIZER, ApplicationConfig, inject, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import {
  provideRouter,
  withPreloading,
  withComponentInputBinding,
  PreloadAllModules,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTransloco } from '@jsverse/transloco';
import { appRoutes } from './app.routes';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { AuthService } from './core/auth/auth.service';
import { LanguageService } from './core/i18n/language.service';
import { authInterceptor } from './core/http/auth.interceptor';
import { tokenRefreshInterceptor } from './core/http/token-refresh.interceptor';
import { correlationIdInterceptor } from './core/http/correlation-id.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        tokenRefreshInterceptor,
        correlationIdInterceptor,
        errorInterceptor,
        loadingInterceptor,
      ])
    ),
    provideRouter(appRoutes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideTransloco({
      config: {
        availableLangs: ['pl', 'en'],
        defaultLang: 'pl',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          useFallbackTranslation: true,
          logMissingKey: isDevMode(),
        },
      },
      loader: TranslocoHttpLoader,
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authService = inject(AuthService);
        return () => authService.restoreSession();
      },
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const languageService = inject(LanguageService);
        return () => languageService.initLanguage();
      },
      multi: true,
    },
  ],
};
