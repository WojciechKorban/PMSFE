import { inject, Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'translatedValidationErrors',
  standalone: true,
  pure: false,
})
export class TranslatedValidationErrorsPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

  transform(errors: ValidationErrors | null): string {
    if (!errors) return '';

    const entry = Object.entries(errors)[0];
    if (!entry) return '';
    const [key, value] = entry;

    switch (key) {
      case 'required':
        return this.transloco.translate('validation.required');
      case 'email':
        return this.transloco.translate('validation.email');
      case 'minlength':
        return this.transloco.translate('validation.minlength', {
          requiredLength: (value as { requiredLength: number }).requiredLength,
        });
      case 'maxlength':
        return this.transloco.translate('validation.maxlength', {
          requiredLength: (value as { requiredLength: number }).requiredLength,
        });
      case 'min':
        return this.transloco.translate('validation.min', { min: (value as { min: number }).min });
      case 'max':
        return this.transloco.translate('validation.max', { max: (value as { max: number }).max });
      case 'pattern':
        return this.transloco.translate('validation.pattern');
      case 'passwordMismatch':
        return this.transloco.translate('validation.passwordMismatch');
      case 'serverError':
        return typeof value === 'string' ? value : this.transloco.translate('common.errors.unknownError');
      default:
        return this.transloco.translate('common.errors.validationError');
    }
  }
}
