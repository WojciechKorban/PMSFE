import { Component, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'pms-header',
  imports: [
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, TranslocoModule, RouterLink,
    LanguageSwitcherComponent,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-icon-button (click)="menuToggle.emit()"
              [attr.aria-label]="'common.toggleMenu' | transloco">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">{{ 'app.name' | transloco }}</span>
      <span class="spacer"></span>

      <pms-language-switcher />

      <button mat-icon-button (click)="toggleTheme()"
              [attr.aria-label]="'common.toggleTheme' | transloco">
        @if (isDark()) {
          <mat-icon>light_mode</mat-icon>
        } @else {
          <mat-icon>dark_mode</mat-icon>
        }
      </button>

      <button mat-icon-button [matMenuTriggerFor]="userMenu"
              aria-label="User menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu>
        <div class="user-email" mat-menu-item disabled>
          {{ authService.currentUser()?.email }}
        </div>
        <button mat-menu-item routerLink="/settings">
          <mat-icon>settings</mat-icon>
          {{ 'nav.settings' | transloco }}
        </button>
        <button mat-menu-item (click)="onLogout()">
          <mat-icon>logout</mat-icon>
          {{ 'nav.logout' | transloco }}
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .app-title { font-size: 1.1rem; font-weight: 600; margin-left: 8px; }
    .spacer { flex: 1; }
    .user-email { font-size: 0.85rem; opacity: 0.7; }
  `],
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  readonly isDark = signal(document.documentElement.classList.contains('theme-dark'));

  toggleTheme(): void {
    const dark = !this.isDark();
    this.isDark.set(dark);
    if (dark) {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
    localStorage.setItem('pms_theme', dark ? 'dark' : 'light');
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
