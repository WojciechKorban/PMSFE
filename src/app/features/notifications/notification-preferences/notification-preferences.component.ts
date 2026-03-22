import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification.service';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSlideToggleModule, MatProgressSpinnerModule, MatCardModule
  ],
  template: `
    <div class="prefs-container">
      <h2>{{ 'notifications.preferences.title' | transloco }}</h2>

      @if (prefsResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSave()" class="prefs-form">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'notifications.preferences.email' | transloco }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-slide-toggle formControlName="emailNotificationsEnabled">
                {{ 'notifications.preferences.enableEmail' | transloco }}
              </mat-slide-toggle>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'notifications.preferences.leaseExpiry' | transloco }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'notifications.preferences.warningDays' | transloco }}</mat-label>
                <input matInput type="number" formControlName="leaseExpiryWarningDays" min="1" max="90" />
                <mat-hint>{{ 'notifications.preferences.warningDaysHint' | transloco }}</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'notifications.preferences.meterReading' | transloco }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'notifications.preferences.reminderDay' | transloco }}</mat-label>
                <input matInput type="number" formControlName="meterReadingReminderDayOfMonth" min="1" max="28" />
                <mat-hint>{{ 'notifications.preferences.dayHint' | transloco }}</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'notifications.preferences.profitabilityReport' | transloco }}</mat-card-title>
            </mat-card-header>
            <mat-card-content class="profitability-section">
              <mat-slide-toggle formControlName="profitabilityReportEnabled">
                {{ 'notifications.preferences.enableProfitability' | transloco }}
              </mat-slide-toggle>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'notifications.preferences.reportDay' | transloco }}</mat-label>
                <input matInput type="number" formControlName="profitabilityReportDayOfMonth" min="1" max="28" />
                <mat-hint>{{ 'notifications.preferences.dayHint' | transloco }}</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
              @else { {{ 'common.save' | transloco }} }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .prefs-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .prefs-form { display: flex; flex-direction: column; gap: 16px; }
    .profitability-section { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
    .form-actions { display: flex; justify-content: flex-end; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class NotificationPreferencesComponent {
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private languageService = inject(LanguageService);

  saving = signal(false);

  form = this.fb.group({
    emailNotificationsEnabled: [true],
    leaseExpiryWarningDays: [30, [Validators.required, Validators.min(1), Validators.max(90)]],
    meterReadingReminderDayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(28)]],
    profitabilityReportEnabled: [false],
    profitabilityReportDayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(28)]]
  });

  prefsResource = rxResource({
    stream: () => this.notificationService.getPreferences()
  });

  constructor() {
    effect(() => {
      const prefs = this.prefsResource.value();
      if (prefs) {
        this.form.patchValue(prefs);
        if (!prefs.profitabilityReportEnabled) {
          this.form.get('profitabilityReportDayOfMonth')?.disable();
        }
      }
    });
    this.form.get('profitabilityReportEnabled')?.valueChanges.subscribe(enabled => {
      const ctrl = this.form.get('profitabilityReportDayOfMonth');
      enabled ? ctrl?.enable() : ctrl?.disable();
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    this.notificationService.updatePreferences({
      emailNotificationsEnabled: val.emailNotificationsEnabled!,
      leaseExpiryWarningDays: val.leaseExpiryWarningDays!,
      meterReadingReminderDayOfMonth: val.meterReadingReminderDayOfMonth!,
      profitabilityReportEnabled: val.profitabilityReportEnabled!,
      profitabilityReportDayOfMonth: val.profitabilityReportDayOfMonth!,
      language: this.languageService.currentLanguage().code
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(
          this.transloco.translate('notifications.preferences.saved'),
          undefined,
          { duration: 3000 }
        );
      },
      error: () => this.saving.set(false)
    });
  }
}
