import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'pms-skeleton-loader',
  imports: [NgClass],
  template: `
    <div class="skeleton-container" [ngClass]="'skeleton-' + type()">
      @for (i of rows(); track i) {
        <div class="skeleton-row">
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line medium"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton-line {
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 8px;
    }
    .wide { width: 100%; }
    .medium { width: 60%; }
    .skeleton-row { padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
  `],
})
export class SkeletonLoaderComponent {
  readonly type = input<'list' | 'card' | 'detail'>('list');
  readonly rowCount = input<number>(3);

  protected rows(): number[] {
    return Array.from({ length: this.rowCount() }, (_, i) => i);
  }
}
