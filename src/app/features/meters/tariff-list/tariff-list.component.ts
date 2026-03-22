import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TariffService } from '../services/tariff.service';
import { TariffFormComponent } from '../tariff-form/tariff-form.component';

@Component({
  selector: 'app-tariff-list',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDividerModule,
    TariffFormComponent
  ],
  template: `
    <div class="tariff-section">
      <div class="section-header">
        <h3>{{ 'tariffs.title' | transloco }}</h3>
        <button mat-stroked-button (click)="showForm.set(!showForm())">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ (showForm() ? 'common.cancel' : 'tariffs.addTariff') | transloco }}
        </button>
      </div>

      @if (showForm()) {
        <app-tariff-form
          [propertyId]="propertyId()"
          (tariffAdded)="onTariffAdded()"
        />
        <mat-divider></mat-divider>
      }

      @if (tariffsResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="32"></mat-spinner></div>
      } @else {
        @for (tariff of tariffsResource.value() ?? []; track tariff.id) {
          <div class="tariff-item">
            <div class="tariff-info">
              <span class="utility-type">{{ ('meters.utilityType.' + tariff.utilityType) | transloco }}</span>
              <span class="price">{{ tariff.pricePerUnit | number:'1.2-4' }} {{ tariff.currency }}</span>
              <span class="valid-from">{{ 'tariffs.validFrom' | transloco }}: {{ tariff.validFrom | date:'dd.MM.yyyy' }}</span>
            </div>
            <button mat-icon-button color="warn" (click)="deleteTariff(tariff.id)" [disabled]="deleting()">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        } @empty {
          <p class="empty">{{ 'tariffs.empty' | transloco }}</p>
        }
      }
    </div>
  `,
  styles: [`
    .tariff-section { padding: 16px 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 24px; }
    .tariff-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
    .tariff-info { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .utility-type { font-weight: 500; }
    .price { color: #1976d2; }
    .valid-from { color: #666; font-size: 0.875rem; }
    .empty { color: #999; font-style: italic; }
  `]
})
export class TariffListComponent {
  propertyId = input.required<string>();

  private tariffService = inject(TariffService);
  showForm = signal(false);
  deleting = signal(false);

  tariffsResource = rxResource({
    params: () => this.propertyId(),
    stream: ({ params: pid }) => this.tariffService.getAll(pid)
  });

  onTariffAdded(): void {
    this.showForm.set(false);
    this.tariffsResource.reload();
  }

  deleteTariff(tariffId: string): void {
    if (!confirm('Delete this tariff?')) return;
    this.deleting.set(true);
    this.tariffService.delete(this.propertyId(), tariffId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.tariffsResource.reload();
      },
      error: () => this.deleting.set(false)
    });
  }
}
