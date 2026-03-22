import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'pms-register-success',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslocoModule],
  template: `
    <div class="success-container">
      <mat-icon class="success-icon">mark_email_read</mat-icon>
      <h1>{{ 'auth.registerSuccess.title' | transloco }}</h1>
      <p>{{ 'auth.registerSuccess.message' | transloco }}</p>
      <a mat-flat-button routerLink="/auth/login">
        {{ 'auth.registerSuccess.goToLogin' | transloco }}
      </a>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 60vh; gap: 16px;
      text-align: center; padding: 24px;
    }
    .success-icon { font-size: 80px; width: 80px; height: 80px; color: #2e7d32; }
    h1 { margin: 0; }
    p { margin: 0; color: var(--mat-sys-on-surface-variant); max-width: 360px; }
  `],
})
export class RegisterSuccessComponent {}
