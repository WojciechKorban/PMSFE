import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({
  name: 'translatedCurrency',
  standalone: true,
  pure: false,
})
export class TranslatedCurrencyPipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(value: number | null | undefined, currency: string = 'PLN'): string {
    if (value === null || value === undefined) return '';
    return this.languageService.formatCurrency(value, currency);
  }
}
