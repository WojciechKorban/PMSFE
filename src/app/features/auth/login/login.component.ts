import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatedValidationErrorsPipe } from '../../../shared/pipes/translated-validation-errors.pipe';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
    selector: 'pms-login',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        RouterLink,
        TranslatedValidationErrorsPipe,
    ],
    template: `
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>{{ 'login.title' | transloco }}</mat-card-title>
        <mat-card-subtitle>{{ 'login.subtitle' | transloco }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'login.emailLabel' | transloco }}</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              [placeholder]="'login.emailPlaceholder' | transloco"
              autocomplete="email"
            />
            <mat-error>
              {{ form.controls.email.errors | translatedValidationErrors }}
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'login.passwordLabel' | transloco }}</mat-label>
            <input
              matInput
              type="password"
              formControlName="password"
              [placeholder]="'login.passwordPlaceholder' | transloco"
              autocomplete="current-password"
            />
            <mat-error>
              {{ form.controls.password.errors | translatedValidationErrors }}
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <a mat-button routerLink="/auth/forgot-password" color="primary">
              {{ 'login.forgotPassword' | transloco }}
            </a>
          </div>

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
              {{ 'login.submitButton' | transloco }}
            }
          </button>
        </form>
      </mat-card-content>

      <mat-card-actions>
        <span class="register-hint">
          {{ 'login.noAccount' | transloco }}
          <a mat-button routerLink="/auth/register" color="primary">
            {{ 'login.registerLink' | transloco }}
          </a>
        </span>
      </mat-card-actions>
    </mat-card>
  `,
    styles: [`
    .auth-card { width: 100%; max-width: 440px; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; margin-bottom: 8px; }
    .submit-btn { margin-top: 8px; height: 48px; }
    .register-hint { display: flex; align-items: center; gap: 4px; padding: 8px; }
    mat-card-content { padding-top: 16px !important; }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);

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
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
