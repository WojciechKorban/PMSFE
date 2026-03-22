import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';
import { NgClass } from '@angular/common';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'pms-sidebar',
  imports: [MatListModule, MatIconModule, TranslocoModule, RouterLink, NgClass],
  template: `
    <nav class="sidebar-nav">
      <mat-nav-list>
        @for (item of navItems; track item.path) {
          @if (!item.adminOnly || isAdmin()) {
            <a mat-list-item
               [routerLink]="item.path"
               [ngClass]="{ active: router.isActive(item.path, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }) }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.labelKey | transloco }}</span>
            </a>
          }
        }
      </mat-nav-list>
    </nav>
  `,
  styles: [`
    .sidebar-nav { width: 240px; height: 100%; background: var(--mat-sys-surface); }
    .active { background: var(--mat-sys-secondary-container) !important; }
  `],
})
export class SidebarComponent {
  protected readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected isAdmin(): boolean {
    return this.authService.currentUser()?.roles.includes('ROLE_ADMIN') ?? false;
  }

  protected readonly navItems: NavItem[] = [
    { path: '/dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' },
    { path: '/properties', icon: 'home', labelKey: 'nav.properties' },
    { path: '/tenants', icon: 'people', labelKey: 'nav.tenants' },
    { path: '/reports', icon: 'bar_chart', labelKey: 'nav.reports' },
    { path: '/settings', icon: 'settings', labelKey: 'nav.settings' },
    { path: '/admin', icon: 'admin_panel_settings', labelKey: 'nav.admin', adminOnly: true },
  ];
}
