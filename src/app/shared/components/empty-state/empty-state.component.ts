import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'pms-empty-state',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="actionClick.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      gap: 12px;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px;
                  color: var(--mat-sys-on-surface-variant); }
    h2 { margin: 0; }
    p { margin: 0; color: var(--mat-sys-on-surface-variant); max-width: 360px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly actionLabel = input<string>();
  readonly actionClick = output<void>();
}
