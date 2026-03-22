import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageService } from '../../../core/i18n/language.service';
import { SUPPORTED_LANGUAGES } from '../../../core/i18n/language.models';
import { NgClass } from '@angular/common';

@Component({
    selector: 'pms-language-switcher',
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        NgClass,
    ],
    template: `
    <button
      mat-button
      [matMenuTriggerFor]="langMenu"
      [attr.aria-label]="'languageSwitcher.ariaLabel' | transloco"
      [disabled]="languageService.isLoading()"
      class="lang-button"
    >
      @if (languageService.isLoading()) {
        <mat-spinner diameter="16"></mat-spinner>
      } @else {
        <ng-container>
          <span class="flag">{{ languageService.currentLanguage().flag }}</span>
          <span class="lang-name">{{ languageService.currentLanguage().name }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </ng-container>
      }
    </button>

    <mat-menu #langMenu>
      @for (lang of supportedLanguages; track lang.code) {
        <button
          mat-menu-item
          (click)="selectLanguage(lang.code)"
          [ngClass]="{ active: lang.code === languageService.currentLanguage().code }"
        >
          <span class="flag">{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
        </button>
      }
    </mat-menu>
  `,
    styles: [`
    .lang-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .flag {
      font-size: 1.2rem;
    }
    .active {
      font-weight: 600;
    }
  `]
})
export class LanguageSwitcherComponent {
  protected readonly languageService = inject(LanguageService);
  protected readonly supportedLanguages = SUPPORTED_LANGUAGES;

  selectLanguage(code: string): void {
    this.languageService.setLanguage(code).subscribe();
  }
}
