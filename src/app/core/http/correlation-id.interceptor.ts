import { inject, isDevMode } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { LanguageService } from '../i18n/language.service';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = uuidv4();
  const languageService = inject(LanguageService);
  const langCode = languageService.currentLanguage().code;

  if (isDevMode()) {
    console.debug(`[${req.method}] ${req.url} (${correlationId})`);
  }

  const enrichedReq = req.clone({
    setHeaders: {
      'X-Correlation-ID': correlationId,
      'Accept-Language': langCode,
    },
  });

  return next(enrichedReq);
};
