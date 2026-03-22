import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-language-settings',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, MatCardModule, MatIconModule],
  template: `
    <div class="settings-container">
      <h2>{{ 'settings.language.title' | transloco }}</h2>
      <p>{{ 'settings.language.subtitle' | transloco }}</p>

      <div class="language-cards">
        @for (lang of languages; track lang.code) {
          <mat-card
            [class.active]="selectedLang() === lang.code"
            (click)="selectLanguage(lang.code)"
            class="lang-card">
            <mat-card-content>
              <div class="lang-card-inner">
                <span class="flag">{{ lang.flag }}</span>
                <span class="lang-name">{{ lang.name }}</span>
                @if (selectedLang() === lang.code) {
                  <mat-icon color="primary">check_circle</mat-icon>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .settings-container { max-width: 500px; margin: 0 auto; padding: 16px; }
    .language-cards { display: flex; gap: 16px; margin-top: 24px; flex-wrap: wrap; }
    .lang-card { cursor: pointer; flex: 1; min-width: 160px; border: 2px solid transparent; transition: border-color 0.2s; }
    .lang-card.active { border-color: #1976d2; }
    .lang-card-inner { display: flex; align-items: center; gap: 12px; padding: 8px; }
    .flag { font-size: 2rem; }
    .lang-name { font-size: 1.1rem; font-weight: 500; flex: 1; }
  `]
})
export class LanguageSettingsComponent implements OnInit {
  private languageService = inject(LanguageService);
  private transloco = inject(TranslocoService);
  private snackBar = inject(MatSnackBar);

  selectedLang = signal('pl');

  languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  ngOnInit(): void {
    this.selectedLang.set(this.transloco.getActiveLang());
  }

  selectLanguage(lang: string): void {
    if (this.selectedLang() === lang) return;
    this.selectedLang.set(lang);
    this.languageService.setLanguage(lang).subscribe();
    setTimeout(() => {
      this.snackBar.open(
        this.transloco.translate('settings.language.changed'),
        undefined,
        { duration: 3000 }
      );
    }, 200);
  }
}
