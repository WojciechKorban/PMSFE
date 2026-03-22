import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
    selector: 'pms-register',
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
        <mat-card-title>{{ 'register.title' | transloco }}</mat-card-title>
        <mat-card-subtitle>{{ 'register.subtitle' | transloco }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (registrationSuccess()) {
          <div class="success-state">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h3>{{ 'register.successTitle' | transloco }}</h3>
            <p>{{ 'register.successMessage' | transloco }}</p>
            <a mat-flat-button color="primary" routerLink="/auth/login">
              {{ 'login.title' | transloco }}
            </a>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'register.nameLabel' | transloco }}</mat-label>
              <input
                matInput
                type="text"
                formControlName="name"
                [placeholder]="'register.namePlaceholder' | transloco"
                autocomplete="name"
              />
              <mat-error>
                {{ form.controls.name.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'register.emailLabel' | transloco }}</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                [placeholder]="'register.emailPlaceholder' | transloco"
                autocomplete="email"
              />
              <mat-error>
                {{ form.controls.email.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'register.passwordLabel' | transloco }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                [placeholder]="'register.passwordPlaceholder' | transloco"
                autocomplete="new-password"
              />
              <mat-error>
                {{ form.controls.password.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'register.confirmPasswordLabel' | transloco }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
                [placeholder]="'register.confirmPasswordPlaceholder' | transloco"
                autocomplete="new-password"
              />
              <mat-error>
                {{ form.controls.confirmPassword.errors | translatedValidationErrors }}
              </mat-error>
            </mat-form-field>

            <p class="terms-note">{{ 'register.termsAccept' | transloco }}</p>

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
                {{ 'register.submitButton' | transloco }}
              }
            </button>
          </form>
        }
      </mat-card-content>

      @if (!registrationSuccess()) {
        <mat-card-actions>
          <span class="login-hint">
            {{ 'register.hasAccount' | transloco }}
            <a mat-button routerLink="/auth/login" color="primary">
              {{ 'register.loginLink' | transloco }}
            </a>
          </span>
        </mat-card-actions>
      }
    </mat-card>
  `,
    styles: [`
    .auth-card { width: 100%; max-width: 440px; }
    .full-width { width: 100%; }
    .submit-btn { margin-top: 8px; height: 48px; }
    .login-hint { display: flex; align-items: center; gap: 4px; padding: 8px; }
    .terms-note { font-size: 0.8rem; color: rgba(0,0,0,0.6); margin: 8px 0; }
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly registrationSuccess = signal(false);

  readonly form = new FormGroup<RegisterForm>(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { name, email, password } = this.form.getRawValue();

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/register/success']);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
