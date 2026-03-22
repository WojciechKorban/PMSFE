import { Component, input } from '@angular/core';

@Component({
  selector: 'pms-page-header',
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      gap: 16px;
    }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
    .subtitle { margin: 4px 0 0; color: var(--mat-sys-on-surface-variant); }
    .header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
