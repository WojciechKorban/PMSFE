import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
  adminOnly?: boolean;
}

interface NavSection {
  labelKey: string;
  items: NavItem[];
}

const STORAGE_KEY = 'pms_sidebar_collapsed';

@Component({
  selector: 'pms-sidebar',
  imports: [RouterLink, TranslocoModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">

      <!-- Logo area -->
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <span class="material-icons">apartment</span>
        </div>
        <div class="sidebar-logo-text" aria-hidden="true">
          {{ 'app.name' | transloco }}
          <span>{{ 'app.tagline' | transloco }}</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav" [attr.aria-label]="'nav.navigationAriaLabel' | transloco">
        @for (section of navSections; track section.labelKey) {
          <div class="nav-section">
            <div class="nav-label" aria-hidden="true">{{ section.labelKey | transloco }}</div>
            @for (item of section.items; track item.path) {
              @if (!item.adminOnly || isAdmin()) {
                <a
                  class="nav-item"
                  [routerLink]="item.path"
                  [class.active]="isActive(item.path)"
                  [attr.aria-current]="isActive(item.path) ? 'page' : null"
                  [matTooltip]="collapsed() ? (item.labelKey | transloco) : ''"
                  matTooltipPosition="right"
                >
                  <span class="material-icons">{{ item.icon }}</span>
                  <span class="nav-item-label">{{ item.labelKey | transloco }}</span>
                </a>
              }
            }
          </div>
        }
      </nav>

      <!-- User section -->
      <div class="sidebar-user">
        <div class="user-avatar">{{ userInitial() }}</div>
        <div class="user-info">
          <div class="user-name">{{ userName() }}</div>
          <div class="user-role">{{ 'nav.userRoleOwner' | transloco }}</div>
        </div>
      </div>

      <!-- Collapse toggle -->
      <button
        class="sidebar-toggle"
        (click)="toggleCollapse()"
        [attr.aria-label]="(collapsed() ? 'nav.expandMenu' : 'nav.collapseMenu') | transloco"
      >
        <span class="material-icons toggle-icon" [class.rotated]="collapsed()">chevron_left</span>
        <span class="sidebar-toggle-label">{{ 'nav.collapseMenu' | transloco }}</span>
      </button>

    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar {
      width: 240px;
      min-width: 240px;
      height: 100%;
      background: #0F172A;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1), min-width 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar.collapsed {
      width: 64px;
      min-width: 64px;
    }

    /* ── Logo ── */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      height: 64px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      white-space: nowrap;
      overflow: hidden;
      flex-shrink: 0;
    }

    .sidebar-logo-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      background: #2563EB;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons {
        color: #ffffff;
        font-size: 18px;
      }
    }

    .sidebar-logo-text {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
      line-height: 1;
      overflow: hidden;

      span {
        display: block;
        font-size: 0.75rem;
        font-weight: 400;
        color: #94A3B8;
        letter-spacing: 0.05em;
        margin-top: 2px;
      }
    }

    .sidebar.collapsed .sidebar-logo-text {
      display: none;
    }

    /* ── Navigation ── */
    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    }

    .nav-section {
      margin-bottom: 4px;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(148,163,184,0.5);
      padding: 16px 12px 8px;
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 200ms;
    }

    .sidebar.collapsed .nav-label {
      opacity: 0;
      height: 0;
      padding: 0;
      pointer-events: none;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 12px;
      height: 44px;
      border-radius: 6px;
      color: #94A3B8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 4px;
      cursor: pointer;
      transition: background 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      overflow: hidden;

      .material-icons {
        font-size: 20px;
        min-width: 20px;
        opacity: 0.85;
        flex-shrink: 0;
      }

      &:hover {
        background: #1E293B;
        color: #ffffff;
        text-decoration: none;

        .material-icons { opacity: 1; }
      }

      &.active {
        background: #2563EB;
        color: #ffffff;

        .material-icons { opacity: 1; }
      }
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0;
    }

    .sidebar.collapsed .nav-item-label {
      display: none;
    }

    /* ── User section ── */
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      white-space: nowrap;
      overflow: hidden;
      flex-shrink: 0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      min-width: 32px;
      border-radius: 9999px;
      background: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
    }

    .user-info {
      overflow: hidden;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94A3B8;
      white-space: nowrap;
    }

    .sidebar.collapsed .user-info {
      display: none;
    }

    /* ── Collapse toggle ── */
    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-left: none;
      border-right: none;
      border-bottom: none;
      background: transparent;
      cursor: pointer;
      color: #94A3B8;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      transition: color 200ms;
      flex-shrink: 0;

      &:hover {
        color: #ffffff;
      }

      .material-icons {
        font-size: 20px;
        min-width: 20px;
        transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .toggle-icon.rotated {
      transform: rotate(180deg);
    }

    .sidebar.collapsed .sidebar-toggle-label {
      display: none;
    }
  `],
})
export class SidebarComponent {
  protected readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly collapsed = signal<boolean>(this.loadCollapsed());

  readonly navSections: NavSection[] = [
    {
      labelKey: 'nav.sections.main',
      items: [
        { path: '/dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' },
        { path: '/properties', icon: 'apartment', labelKey: 'nav.properties' },
        { path: '/tenants', icon: 'group', labelKey: 'nav.tenants' },
      ],
    },
    {
      labelKey: 'nav.sections.data',
      items: [
        { path: '/meters', icon: 'electric_meter', labelKey: 'nav.meters' },
        { path: '/reports', icon: 'bar_chart', labelKey: 'nav.reports' },
      ],
    },
    {
      labelKey: 'nav.sections.system',
      items: [
        { path: '/settings', icon: 'settings', labelKey: 'nav.settings' },
        { path: '/admin', icon: 'admin_panel_settings', labelKey: 'nav.admin', adminOnly: true },
      ],
    },
  ];

  isAdmin(): boolean {
    return this.authService.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false;
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  userName(): string {
    const email = this.authService.currentUser()?.email ?? '';
    return email.split('@')[0] || email;
  }

  userInitial(): string {
    const email = this.authService.currentUser()?.email ?? '';
    return email ? email[0].toUpperCase() : '?';
  }

  toggleCollapse(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  }

  private loadCollapsed(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
