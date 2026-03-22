import { inject, Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { LanguageService } from './language.service';

@Pipe({
  name: 'translatedDate',
  standalone: true,
  pure: false,
})
export class TranslatedDatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    return format(date, this.languageService.getDateFormat(), {
      locale: this.languageService.getDateFnsLocale(),
    });
  }
}
