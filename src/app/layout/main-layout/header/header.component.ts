import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'pms-header',
  imports: [
    MatButtonModule, MatIconModule,
    MatMenuModule, TranslocoModule, RouterLink,
    LanguageSwitcherComponent,
  ],
  template: `
    <header class="app-header">
      <!-- Left: menu toggle + page title -->
      <div class="header-left">
        <button
          class="icon-btn mobile-only"
          (click)="menuToggle.emit()"
          [attr.aria-label]="'toggleMenu' | transloco"
        >
          <span class="material-icons">menu</span>
        </button>
        <span class="app-title">{{ 'app.name' | transloco }}</span>
      </div>

      <!-- Right: language switcher + notifications + user -->
      <div class="header-right">
        <pms-language-switcher />

        <!-- Theme toggle -->
        <button
          class="icon-btn"
          (click)="toggleTheme()"
          [attr.aria-label]="'toggleTheme' | transloco"
        >
          @if (isDark()) {
            <span class="material-icons">light_mode</span>
          } @else {
            <span class="material-icons">dark_mode</span>
          }
        </button>

        <!-- Notification bell -->
        <button class="icon-btn" [attr.aria-label]="'nav.notifications' | transloco">
          <span class="material-icons">notifications_none</span>
        </button>

        <!-- User menu -->
        <button class="user-btn" [matMenuTriggerFor]="userMenu" [attr.aria-label]="'nav.userMenu' | transloco">
          <div class="user-avatar">{{ userInitial() }}</div>
          <span class="user-name hide-mobile">{{ userEmail() }}</span>
          <span class="material-icons dropdown-icon">arrow_drop_down</span>
        </button>

        <mat-menu #userMenu>
          <div class="user-menu-email" mat-menu-item disabled>
            {{ authService.currentUser()?.email }}
          </div>
          <button mat-menu-item routerLink="/settings/profile">
            <span class="material-icons">manage_accounts</span>
            {{ 'nav.settings' | transloco }}
          </button>
          <button mat-menu-item (click)="onLogout()">
            <span class="material-icons">logout</span>
            {{ 'nav.logout' | transloco }}
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky, 200);
      height: 64px;
      background: var(--color-bg-surface, #ffffff);
      border-bottom: 1px solid var(--color-border-default, #E2E8F0);
      box-shadow: var(--shadow-xs, 0px 1px 2px 0px rgba(15,23,42,0.05));
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
    }

    /* Left side */
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .app-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary, #0F172A);
      letter-spacing: -0.01em;
    }

    /* Right side */
    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Icon button */
    .icon-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary, #475569);
      transition: background 150ms, color 150ms;

      &:hover {
        background: var(--color-neutral-100, #F1F5F9);
        color: var(--color-text-primary, #0F172A);
      }

      .material-icons { font-size: 20px; }
    }

    .mobile-only {
      display: none;
    }

    /* User button */
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 8px 0 4px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: background 150ms;
      margin-left: 4px;

      &:hover {
        background: var(--color-neutral-100, #F1F5F9);
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #2563EB, #60A5FA);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #ffffff;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary, #0F172A);
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-icon {
      font-size: 18px;
      color: var(--color-text-muted, #94A3B8);
    }

    .user-menu-email {
      font-size: 0.8rem;
      opacity: 0.7;
      padding: 8px 16px;
      cursor: default;
    }

    @media (max-width: 960px) {
      .mobile-only { display: flex; }
      .hide-mobile { display: none; }
      .app-header { padding: 0 16px; }
    }
  `],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  readonly isDark = signal(document.documentElement.classList.contains('dark-theme'));

  userEmail(): string {
    return this.authService.currentUser()?.email ?? '';
  }

  userInitial(): string {
    const email = this.userEmail();
    return email ? email[0].toUpperCase() : '?';
  }

  toggleTheme(): void {
    const dark = !this.isDark();
    this.isDark.set(dark);
    if (dark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('pms_theme', dark ? 'dark' : 'light');
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
