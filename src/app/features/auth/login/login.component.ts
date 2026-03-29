import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'pms-login',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    RouterLink,
  ],
  template: `
    <div class="auth-card">
      <!-- Top accent bar -->
      <div class="card-accent-bar"></div>

      <div class="card-body">
        <!-- Logo section -->
        <div class="logo-section">
          <div class="logo-mark">
            <span class="material-icons">apartment</span>
          </div>
          <div class="logo-wordmark">LokalManager</div>
          <div class="logo-tagline">{{ 'app.tagline' | transloco }}</div>
        </div>

        <!-- Error banner -->
        @if (errorMessage()) {
          <div class="auth-error-banner" role="alert">
            <span class="material-icons">error_outline</span>
            <span class="auth-error-banner-text">{{ errorMessage() }}</span>
          </div>
        }

        <!-- Login form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="login-form">

          <!-- Email field -->
          <div class="form-group">
            <label class="form-label" for="email">{{ 'login.emailLabel' | transloco }}</label>
            <div class="form-input-wrapper">
              <div class="form-input-icon">
                <span class="material-icons">mail_outline</span>
              </div>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-input"
                [class.has-error]="form.controls.email.invalid && form.controls.email.touched"
                placeholder="twoj@email.pl"
                autocomplete="email"
                aria-required="true"
              />
            </div>
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <div class="form-error" role="alert">
                <span class="material-icons">error_outline</span>
                @if (form.controls.email.errors?.['required']) {
                  <span>{{ 'validation.required' | transloco }}</span>
                } @else {
                  <span>{{ 'validation.email' | transloco }}</span>
                }
              </div>
            }
          </div>

          <!-- Password field -->
          <div class="form-group">
            <label class="form-label" for="password">{{ 'login.passwordLabel' | transloco }}</label>
            <div class="form-input-wrapper">
              <div class="form-input-icon">
                <span class="material-icons">lock_outline</span>
              </div>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                formControlName="password"
                class="form-input"
                [class.has-error]="form.controls.password.invalid && form.controls.password.touched"
                placeholder="Wprowadź hasło"
                autocomplete="current-password"
                aria-required="true"
              />
              <div class="form-input-suffix">
                <button
                  type="button"
                  class="show-password-btn"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Ukryj hasło' : 'Pokaż hasło'"
                >
                  <span class="material-icons">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <div class="form-error" role="alert">
                <span class="material-icons">error_outline</span>
                <span>{{ 'validation.required' | transloco }}</span>
              </div>
            }
          </div>

          <!-- Forgot password link -->
          <div class="forgot-row">
            <a routerLink="/auth/forgot-password" class="forgot-link">
              {{ 'login.forgotPassword' | transloco }}
            </a>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="submit-btn"
            [class.loading]="isSubmitting()"
            [disabled]="isSubmitting()"
          >
            @if (isSubmitting()) {
              <div class="spinner"></div>
            } @else {
              <span class="material-icons btn-icon">login</span>
              <span class="btn-text">{{ 'login.submitButton' | transloco }}</span>
            }
          </button>

        </form>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">{{ 'login.noAccount' | transloco }}</span>
          <div class="divider-line"></div>
        </div>

        <!-- Register link -->
        <div class="register-row">
          <a routerLink="/auth/register" class="register-link">
            {{ 'login.registerLink' | transloco }}
          </a>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div class="auth-footer">
      &copy; 2026 LokalManager
    </div>
  `,
  styles: [`
    /* =====================================================================
       AUTH CARD
       ===================================================================== */
    .auth-card {
      width: 100%;
      max-width: 464px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow:
        0px 20px 25px -5px rgba(15,23,42,0.10),
        0px 8px 10px -6px rgba(15,23,42,0.10),
        0 0 0 1px rgba(255,255,255,0.08),
        0 0 40px rgba(37,99,235,0.15);
      overflow: hidden;
      animation: cardEntrance 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes cardEntrance {
      from { opacity: 0; transform: translateY(32px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .card-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%);
    }

    .card-body {
      padding: 32px;
    }

    /* =====================================================================
       LOGO
       ===================================================================== */
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
      animation: fadeSlideUp 0.4s cubic-bezier(0,0,0.2,1) 0.15s both;
    }

    .logo-mark {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563EB, #3B82F6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 4px 16px rgba(37,99,235,0.4);

      .material-icons {
        font-size: 28px;
        color: #ffffff;
      }
    }

    .logo-wordmark {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.025em;
      line-height: 1;
      margin-bottom: 4px;
    }

    .logo-tagline {
      font-size: 0.875rem;
      color: #475569;
    }

    /* =====================================================================
       ERROR BANNER
       ===================================================================== */
    .auth-error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #FEF2F2;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      margin-bottom: 20px;
      animation: shakeError 0.4s ease;

      .material-icons {
        color: #EF4444;
        font-size: 18px;
        flex-shrink: 0;
      }
    }

    .auth-error-banner-text {
      font-size: 0.875rem;
      color: #991B1B;
    }

    @keyframes shakeError {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    /* =====================================================================
       FORM
       ===================================================================== */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      animation: fadeSlideUp 0.4s cubic-bezier(0,0,0.2,1) 0.2s both;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #0F172A;
      letter-spacing: 0.01em;
    }

    .form-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input-icon {
      position: absolute;
      left: 16px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      pointer-events: none;
      z-index: 1;
      transition: color 200ms cubic-bezier(0.4,0,0.2,1);

      .material-icons { font-size: 20px; }
    }

    .form-input {
      width: 100%;
      height: 52px;
      padding: 0 16px 0 50px;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      font-size: 1rem;
      font-weight: 400;
      color: #0F172A;
      background: #F8FAFC;
      border: 2px solid #E2E8F0;
      border-radius: 8px;
      outline: none;
      transition: border-color 200ms, box-shadow 200ms, background 200ms;

      &::placeholder { color: #94A3B8; }
      &:hover { border-color: #CBD5E1; }
      &:focus {
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.40);
        background: #ffffff;
      }
      &:focus-within + .form-input-icon,
      &:focus ~ .form-input-icon {
        color: #2563EB;
      }
      &.has-error {
        border-color: #EF4444;
        box-shadow: 0 0 0 3px rgba(239,68,68,0.40);
      }
    }

    .form-input-wrapper:focus-within .form-input-icon {
      color: #2563EB;
    }

    .form-input-suffix {
      position: absolute;
      right: 12px;
      display: flex;
      align-items: center;
    }

    .show-password-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94A3B8;
      border-radius: 6px;
      transition: color 200ms, background 200ms;

      &:hover {
        color: #475569;
        background: #E2E8F0;
      }

      .material-icons { font-size: 18px; }
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: #EF4444;

      .material-icons { font-size: 14px; }
    }

    /* Forgot password */
    .forgot-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -8px;
    }

    .forgot-link {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #2563EB;
      text-decoration: none;
      transition: color 200ms;

      &:hover {
        color: #1D4ED8;
        text-decoration: underline;
      }
    }

    /* =====================================================================
       SUBMIT BUTTON
       ===================================================================== */
    .submit-btn {
      width: 100%;
      height: 52px;
      border: none;
      border-radius: 8px;
      background: #2563EB;
      color: #ffffff;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 200ms, transform 0.1s ease, box-shadow 200ms;
      box-shadow: 0 2px 8px rgba(37,99,235,0.35);
      margin-top: 8px;
      animation: fadeSlideUp 0.4s cubic-bezier(0,0,0.2,1) 0.25s both;

      &:hover:not(:disabled) {
        background: #1D4ED8;
        box-shadow: 0 4px 16px rgba(37,99,235,0.45);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: scale(0.98) translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      &.loading { pointer-events: none; opacity: 0.85; }

      .material-icons { font-size: 20px; }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #ffffff;
      border-radius: 9999px;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* =====================================================================
       DIVIDER & REGISTER LINK
       ===================================================================== */
    .divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 8px 0;
      animation: fadeSlideUp 0.4s cubic-bezier(0,0,0.2,1) 0.3s both;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: #E2E8F0;
    }

    .divider-text {
      font-size: 0.75rem;
      color: #94A3B8;
      white-space: nowrap;
    }

    .register-row {
      text-align: center;
      animation: fadeSlideUp 0.4s cubic-bezier(0,0,0.2,1) 0.35s both;
    }

    .register-link {
      font-size: 0.875rem;
      font-weight: 600;
      color: #2563EB;
      text-decoration: none;
      transition: color 200ms;

      &:hover {
        color: #1D4ED8;
        text-decoration: underline;
      }
    }

    /* =====================================================================
       FOOTER
       ===================================================================== */
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
    }

    /* =====================================================================
       ANIMATIONS
       ===================================================================== */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* =====================================================================
       RESPONSIVE
       ===================================================================== */
    @media (max-width: 520px) {
      .card-body { padding: 24px; }
      .auth-card { border-radius: 12px; }
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        if (err instanceof HttpErrorResponse) {
          // Error banner message — the error interceptor shows snackbar for most,
          // but for 401 it passes through, so we show it inline here
          const errorCode = (err.error as Record<string, unknown>)?.['error'] as string | undefined;
          if (errorCode === 'INVALID_CREDENTIALS' || err.status === 401) {
            this.errorMessage.set('Nieprawidłowy adres e-mail lub hasło. Spróbuj ponownie.');
          } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
            this.errorMessage.set('Zweryfikuj adres e-mail przed zalogowaniem.');
          } else if (errorCode === 'ACCOUNT_DISABLED') {
            this.errorMessage.set('Twoje konto zostało zablokowane. Skontaktuj się z pomocą techniczną.');
          } else {
            this.errorMessage.set('Wystąpił błąd. Spróbuj ponownie.');
          }
        } else {
          this.errorMessage.set('Wystąpił błąd. Spróbuj ponownie.');
        }
      },
    });
  }
}
