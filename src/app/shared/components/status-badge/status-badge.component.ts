import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatChip } from '@angular/material/chips';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChip, TranslocoPipe],
  template: `
    <mat-chip [class]="statusClass()">
      {{ ('meters.status.' + status()) | transloco }}
    </mat-chip>
  `,
  styles: [`
    .status-active { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-replaced { background-color: #fff3e0 !important; color: #e65100 !important; }
    .status-decommissioned { background-color: #fce4ec !important; color: #880e4f !important; }
  `]
})
export class StatusBadgeComponent {
  status = input.required<string>();

  statusClass = computed(() => `status-${this.status().toLowerCase()}`);
}
