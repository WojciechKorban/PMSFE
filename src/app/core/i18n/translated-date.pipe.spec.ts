import { TestBed } from '@angular/core/testing';
import { TranslatedDatePipe } from './translated-date.pipe';
import { LanguageService } from './language.service';
import { SUPPORTED_LANGUAGES } from './language.models';
import { signal } from '@angular/core';

function makeLanguageServiceMock(code: 'pl' | 'en') {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)!;
  return {
    currentLanguage: signal(lang),
    getDateFormat: () => lang.dateFormat,
    getDateFnsLocale: () => lang.dateFnsLocale,
  };
}

describe('TranslatedDatePipe', () => {
  it('transforms null to empty string', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedDatePipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedDatePipe);
    expect(pipe.transform(null)).toBe('');
  });

  it('transforms undefined to empty string', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedDatePipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedDatePipe);
    expect(pipe.transform(undefined)).toBe('');
  });

  it('formats 2024-11-15 in Polish format as 15.11.2024', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedDatePipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('pl') },
      ],
    });
    const pipe = TestBed.inject(TranslatedDatePipe);
    expect(pipe.transform('2024-11-15')).toBe('15.11.2024');
  });

  it('formats 2024-11-15 in English format as 11/15/2024', () => {
    TestBed.configureTestingModule({
      providers: [
        TranslatedDatePipe,
        { provide: LanguageService, useValue: makeLanguageServiceMock('en') },
      ],
    });
    const pipe = TestBed.inject(TranslatedDatePipe);
    expect(pipe.transform('2024-11-15')).toBe('11/15/2024');
  });
});
