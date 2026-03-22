import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({
  name: 'translatedNumber',
  standalone: true,
  pure: false,
})
export class TranslatedNumberPipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(value: number | null | undefined, decimals: string = '2'): string {
    if (value === null || value === undefined) return '';
    const dp = parseInt(decimals, 10);
    const fmt = this.languageService.currentLanguage().currencyFormat;
    const [intPart, decPart] = value.toFixed(dp).split('.');
    const formattedInt = (intPart ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousand);
    return decPart !== undefined
      ? `${formattedInt}${fmt.decimal}${decPart}`
      : formattedInt;
  }
}
