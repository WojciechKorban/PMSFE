import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'pms-loading-spinner',
    imports: [MatProgressSpinnerModule],
    template: `
    @if (loadingService.isLoading()) {
      <div class="spinner-overlay">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    }
  `,
    styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.15);
      z-index: 9999;
    }
  `]
})
export class LoadingSpinnerComponent {
  protected readonly loadingService = inject(LoadingService);
}
