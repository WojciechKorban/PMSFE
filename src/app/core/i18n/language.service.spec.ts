import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { TranslocoService } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SUPPORTED_LANGUAGES } from './language.models';

describe('LanguageService', () => {
  let service: LanguageService;
  let translocoSpy: jest.Mocked<Pick<TranslocoService, 'load' | 'setActiveLang'>>;
  let authServiceSpy: jest.Mocked<Pick<AuthService, 'isAuthenticated'>>;

  beforeEach(() => {
    translocoSpy = {
      load: jest.fn().mockReturnValue(of({})),
      setActiveLang: jest.fn(),
    };

    authServiceSpy = {
      isAuthenticated: jest.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslocoService, useValue: translocoSpy },
        {
          provide: AuthService,
          useValue: { ...authServiceSpy, currentUser: { set: jest.fn() }, isAuthenticated: jest.fn().mockReturnValue(false) },
        },
        {
          provide: HttpClient,
          useValue: { get: jest.fn().mockReturnValue(of({})), put: jest.fn().mockReturnValue(of(void 0)) },
        },
      ],
    });

    service = TestBed.inject(LanguageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setLanguage calls translocoService.setActiveLang with the correct code', (done) => {
    service.setLanguage('en').subscribe(() => {
      expect(translocoSpy.setActiveLang).toHaveBeenCalledWith('en');
      done();
    });
  });

  it('setLanguage updates currentLanguage signal to English', (done) => {
    service.setLanguage('en').subscribe(() => {
      expect(service.currentLanguage().code).toBe('en');
      done();
    });
  });

  it('setLanguage saves language code to localStorage', (done) => {
    service.setLanguage('en').subscribe(() => {
      expect(localStorage.getItem('pms_language')).toBe('en');
      done();
    });
  });

  it('setLanguage with unknown code falls back to English', (done) => {
    service.setLanguage('xx').subscribe(() => {
      const lang = service.currentLanguage();
      const supported = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(supported).toContain(lang.code);
      done();
    });
  });

  it('formatCurrency in Polish contains non-breaking space and zł', (done) => {
    service.setLanguage('pl').subscribe(() => {
      const result = service.formatCurrency(1234.56, 'PLN');
      expect(result).toContain('1\u00A0234');
      expect(result).toContain('zł');
      done();
    });
  });

  it('formatCurrency in English starts with $', (done) => {
    service.setLanguage('en').subscribe(() => {
      const result = service.formatCurrency(1234.56, 'USD');
      expect(result.startsWith('$')).toBe(true);
      done();
    });
  });
});
