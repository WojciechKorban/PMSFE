import { Component, inject, input } from '@angular/core';
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
      [class.ghost-variant]="variant() === 'ghost'"
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

    .lang-name {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .active {
      font-weight: 600;
    }

    /* Ghost variant — for dark auth background */
    .ghost-variant {
      border-radius: 9999px !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(8px);
      color: rgba(255, 255, 255, 0.85) !important;
      font-size: 0.875rem;
      padding: 6px 14px;
      height: auto;

      mat-icon {
        color: rgba(255, 255, 255, 0.7);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.35) !important;
      }
    }
  `],
})
export class LanguageSwitcherComponent {
  protected readonly languageService = inject(LanguageService);
  protected readonly supportedLanguages = SUPPORTED_LANGUAGES;

  readonly variant = input<'default' | 'ghost'>('default');

  selectLanguage(code: string): void {
    this.languageService.setLanguage(code).subscribe();
  }
}
