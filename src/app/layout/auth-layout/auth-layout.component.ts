import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'pms-auth-layout',
    imports: [RouterOutlet, TranslocoModule, LanguageSwitcherComponent, MatCardModule],
    template: `
    <div class="auth-container">
      <header class="auth-header">
        <span class="app-name">{{ 'app.name' | transloco }}</span>
        <pms-language-switcher />
      </header>
      <main class="auth-main">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-surface-variant);
    }
    .auth-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--mat-sys-surface);
      box-shadow: var(--mat-sys-level1);
    }
    .app-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--mat-sys-primary);
    }
    .auth-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }
  `]
})
export class AuthLayoutComponent {}
