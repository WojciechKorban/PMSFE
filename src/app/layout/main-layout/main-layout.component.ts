import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'pms-main-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      <!-- Sidebar -->
      <pms-sidebar [class.sidebar-host]="true" />

      <!-- Main area -->
      <div class="main-area">
        <pms-header (menuToggle)="mobileMenuOpen.set(!mobileMenuOpen())" />
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    pms-sidebar {
      flex-shrink: 0;
      height: 100vh;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--color-bg-canvas, #F8FAFC);

      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: var(--color-border-default, #E2E8F0); border-radius: 3px; }
    }
  `],
})
export class MainLayoutComponent {
  readonly mobileMenuOpen = signal(false);
}
