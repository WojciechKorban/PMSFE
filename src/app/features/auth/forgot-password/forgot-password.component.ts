import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatedValidationErrorsPipe } from '../../../shared/pipes/translated-validation-errors.pipe';

interface ForgotPasswordForm {
  email: FormControl<string>;
}

@Component({
    selector: 'pms-forgot-password',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        TranslocoModule,
        RouterLink,
        TranslatedValidationErrorsPipe,
    ],
    template: `
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>{{ 'forgotPassword.title' | transloco }}</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @if (submitted()) {
          <div class="success-state">
            <mat-icon class="success-icon">mark_email_read</mat-icon>
            <h3>{{ 'forgotPassword.successTitle' | transloco }}</h3>
            <p>{{ 'forgotPassword.successMessage' | transloco }}</p>
            <a mat-flat-button color="primary" routerLink="/auth/login">
              {{ 'forgotPassword.backToLogin' | transloco }}
            </a>
          </div>
        } @else {
          <p class="description">{{ 'forgotPassword.description' | transloco }}</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'forgotPassword.emailLabel' | transloco }}</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                [placeholder]="'forgotPassword.emailPlaceholder' | transloco"
                autocomplete="email"
              />
              <mat-error>
                {{ form.controls.email.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="isSubmitting()"
            >
              @if (isSubmitting()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
              } @else {
                {{ 'forgotPassword.submitButton' | transloco }}
              }
            </button>
          </form>
        }
      </mat-card-content>

      @if (!submitted()) {
        <mat-card-actions>
          <a mat-button routerLink="/auth/login" color="primary">
            {{ 'forgotPassword.backToLogin' | transloco }}
          </a>
        </mat-card-actions>
      }
    </mat-card>
  `,
    styles: [`
    .auth-card { width: 100%; max-width: 440px; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 48px; }
    .description { color: rgba(0,0,0,0.6); margin-bottom: 16px; }
    mat-card-content { padding-top: 16px !important; }
    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px 0;
      text-align: center;
    }
    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);

  readonly form = new FormGroup<ForgotPasswordForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { email } = this.form.getRawValue();

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.submitted.set(true);
        this.isSubmitting.set(false);
      },
      error: () => {
        // Always show success to prevent email enumeration
        this.submitted.set(true);
        this.isSubmitting.set(false);
      },
    });
  }
}
