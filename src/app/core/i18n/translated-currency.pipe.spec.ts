import { TestBed } from '@angular/core/testing';
import { TranslatedCurrencyPipe } from './translated-currency.pipe';
import { LanguageService } from './language.service';
import { SUPPORTED_LANGUAGES } from './language.models';
import { signal } from '@angular/core';

function makeLanguageServiceMock(code: 'pl' | 'en') {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)!;
  return {
    currentLanguage: signal(lang),
    formatCurrency: (amount: number, currency: string) => {
      const fmt = lang.currencyFormat;
      const [intPart, decPart] = amount.toFixed(2).split('.');
      const formattedInt = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousand);
      const number = `${formattedInt}${fmt.decimal}${decPart ?? '00'}`;
      return fmt.position === 'before'
        ? `${fmt.symbol}${number}`
        : `${number}\u00A0${fmt.symbol}`;
    },
  };
}

describe('TranslatedCurrencyPipe', () => {
  it('transforms null to empty string', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedCurrencyPipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedCurrencyPipe);
    expect(pipe.transform(null)).toBe('');
  });

  it('transforms undefined to empty string', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedCurrencyPipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedCurrencyPipe);
    expect(pipe.transform(undefined)).toBe('');
  });

  it('formats 1234.56 in Polish — contains zł', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedCurrencyPipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedCurrencyPipe);
    const result = pipe.transform(1234.56, 'PLN');
    expect(result).toContain('zł');
  });

  it('formats 1234.56 in English — starts with $', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedCurrencyPipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('en') },
      ],
    });
    const pipe = TestBed.inject(TranslatedCurrencyPipe);
    const result = pipe.transform(1234.56, 'USD');
    expect(result.startsWith('$')).toBe(true);
  });

  it('formats 0 in Polish as 0,00 zł', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedCurrencyPipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedCurrencyPipe);
    const result = pipe.transform(0, 'PLN');
    expect(result).toBe('0,00\u00A0zł');
  });
});
