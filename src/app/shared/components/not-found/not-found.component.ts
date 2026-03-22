import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'pms-not-found',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslocoModule],
  template: `
    <div class="not-found">
      <mat-icon class="not-found-icon">search_off</mat-icon>
      <h1>404</h1>
      <h2>{{ 'common.notFound.title' | transloco }}</h2>
      <p>{{ 'common.notFound.message' | transloco }}</p>
      <button mat-flat-button routerLink="/dashboard">
        {{ 'common.notFound.goHome' | transloco }}
      </button>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      padding: 48px 24px;
      text-align: center;
      gap: 8px;
    }
    .not-found-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: var(--mat-sys-on-surface-variant);
    }
    h1 { margin: 0; font-size: 96px; font-weight: 700; color: var(--mat-sys-primary); }
    h2 { margin: 0; }
    p { margin: 0; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class NotFoundComponent {}
