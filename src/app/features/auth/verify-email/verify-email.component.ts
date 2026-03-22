import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';

type VerificationState = 'loading' | 'success' | 'error';

@Component({
    selector: 'pms-verify-email',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        TranslocoModule,
        RouterLink,
    ],
    template: `
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>{{ 'emailVerification.title' | transloco }}</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @switch (state()) {
          @case ('loading') {
            <div class="center-state">
              <mat-spinner diameter="48"></mat-spinner>
              <p>{{ 'emailVerification.subtitle' | transloco }}</p>
            </div>
          }
          @case ('success') {
            <div class="success-state">
              <mat-icon class="success-icon">verified</mat-icon>
              <h3>{{ 'emailVerification.successTitle' | transloco }}</h3>
              <p>{{ 'emailVerification.successMessage' | transloco }}</p>
              <a mat-flat-button color="primary" routerLink="/auth/login">
                {{ 'emailVerification.goToLogin' | transloco }}
              </a>
            </div>
          }
          @case ('error') {
            <div class="error-state">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <h3>{{ 'emailVerification.errorTitle' | transloco }}</h3>
              <p>{{ 'emailVerification.errorMessage' | transloco }}</p>
              <a mat-button routerLink="/auth/login" color="primary">
                {{ 'emailVerification.goToLogin' | transloco }}
              </a>
            </div>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    .auth-card { width: 100%; max-width: 440px; }
    mat-card-content { padding-top: 16px !important; }
    .center-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px 0;
    }
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
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly state = signal<VerificationState>('loading');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }
}
