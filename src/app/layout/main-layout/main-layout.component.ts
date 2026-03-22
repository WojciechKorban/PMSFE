import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'pms-main-layout',
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile() || sidenavOpen()"
        class="sidenav"
      >
        <pms-sidebar />
      </mat-sidenav>

      <mat-sidenav-content class="sidenav-content">
        <pms-header (menuToggle)="toggleSidenav(sidenav)" />
        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { border-right: 1px solid var(--mat-sys-outline-variant); }
    .sidenav-content { display: flex; flex-direction: column; }
    .main-content { flex: 1; overflow: auto; background: var(--mat-sys-surface-variant); }
  `],
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  readonly sidenavOpen = signal(false);

  toggleSidenav(sidenav: { toggle: () => void }): void {
    if (this.isMobile()) {
      this.sidenavOpen.update(v => !v);
      sidenav.toggle();
    }
  }
}
