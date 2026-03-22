import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatedValidationErrorsPipe } from '../../../shared/pipes/translated-validation-errors.pipe';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

interface ResetPasswordForm {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
    selector: 'pms-reset-password',
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
        <mat-card-title>{{ 'resetPassword.title' | transloco }}</mat-card-title>
        @if (!resetSuccess() && token()) {
          <mat-card-subtitle>{{ 'resetPassword.subtitle' | transloco }}</mat-card-subtitle>
        }
      </mat-card-header>

      <mat-card-content>
        @if (resetSuccess()) {
          <div class="success-state">
            <mat-icon class="success-icon">lock_reset</mat-icon>
            <h3>{{ 'resetPassword.successTitle' | transloco }}</h3>
            <p>{{ 'resetPassword.successMessage' | transloco }}</p>
            <a mat-flat-button color="primary" routerLink="/auth/login">
              {{ 'login.title' | transloco }}
            </a>
          </div>
        } @else if (!token()) {
          <div class="error-state">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <p>{{ 'resetPassword.invalidToken' | transloco }}</p>
            <a mat-flat-button color="primary" routerLink="/auth/forgot-password">
              {{ 'forgotPassword.title' | transloco }}
            </a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'resetPassword.newPasswordLabel' | transloco }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="newPassword"
                [placeholder]="'resetPassword.newPasswordPlaceholder' | transloco"
                autocomplete="new-password"
              />
              <mat-error>
                {{ form.controls.newPassword.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'resetPassword.confirmLabel' | transloco }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
                [placeholder]="'resetPassword.confirmPlaceholder' | transloco"
                autocomplete="new-password"
              />
              <mat-error>
                {{ form.controls.confirmPassword.errors | translatedValidationErrors }}
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
                {{ 'resetPassword.submitButton' | transloco }}
              }
            </button>
          </form>
        }
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .auth-card { width: 100%; max-width: 440px; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 48px; }
    mat-card-content { padding-top: 16px !important; }
    .success-state, .error-state {
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
    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly resetSuccess = signal(false);
  readonly token = signal<string | null>(null);

  readonly form = new FormGroup<ResetPasswordForm>(
    {
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
  );

  ngOnInit(): void {
    const tokenValue = this.route.snapshot.queryParamMap.get('token');
    this.token.set(tokenValue);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const tokenValue = this.token();
    if (!tokenValue) return;

    this.isSubmitting.set(true);
    const { newPassword } = this.form.getRawValue();

    this.authService.resetPassword(tokenValue, newPassword).subscribe({
      next: () => {
        this.resetSuccess.set(true);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
