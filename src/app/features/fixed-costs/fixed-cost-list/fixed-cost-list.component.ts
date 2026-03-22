import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { FixedCostService } from '../services/fixed-cost.service';
import { FixedCostFormComponent } from '../fixed-cost-form/fixed-cost-form.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FixedCost } from '../models/fixed-cost.models';

@Component({
  selector: 'app-fixed-cost-list',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, FixedCostFormComponent
  ],
  template: `
    <div class="fixed-cost-section">
      <div class="section-header">
        <h3>{{ 'fixedCosts.title' | transloco }}</h3>
        <button mat-stroked-button (click)="showAddForm.set(!showAddForm())">
          <mat-icon>{{ showAddForm() ? 'close' : 'add' }}</mat-icon>
          {{ (showAddForm() ? 'common.cancel' : 'fixedCosts.addCost') | transloco }}
        </button>
      </div>

      @if (showAddForm()) {
        <app-fixed-cost-form
          [propertyId]="propertyId()"
          (saved)="onSaved()"
          (cancelled)="showAddForm.set(false)"
        />
        <mat-divider></mat-divider>
      }

      @if (costsResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="32"></mat-spinner></div>
      } @else {
        <h4>{{ 'fixedCosts.active' | transloco }}</h4>
        @for (cost of activeCosts(); track cost.id) {
          @if (editingId() === cost.id) {
            <app-fixed-cost-form
              [propertyId]="propertyId()"
              [existingCost]="cost"
              (saved)="onSaved()"
              (cancelled)="editingId.set(null)"
            />
          } @else {
            <div class="cost-item">
              <div class="cost-info">
                <span class="cost-name">{{ cost.name }}</span>
                <span class="cost-amount">{{ cost.amount | number:'1.2-2' }} {{ cost.currency }}/mo</span>
                <span class="cost-date">{{ 'fixedCosts.from' | transloco }}: {{ cost.validFrom | date:'dd.MM.yyyy' }}</span>
              </div>
              <div class="cost-actions">
                <button mat-icon-button (click)="editingId.set(cost.id)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deactivate(cost)">
                  <mat-icon>block</mat-icon>
                </button>
              </div>
            </div>
          }
        } @empty {
          <p class="empty">{{ 'fixedCosts.empty' | transloco }}</p>
        }

        @if (inactiveCosts().length > 0) {
          <mat-divider></mat-divider>
          <h4 class="inactive-label">{{ 'fixedCosts.inactive' | transloco }}</h4>
          @for (cost of inactiveCosts(); track cost.id) {
            <div class="cost-item inactive">
              <div class="cost-info">
                <span class="cost-name">{{ cost.name }}</span>
                <span class="cost-amount">{{ cost.amount | number:'1.2-2' }} {{ cost.currency }}/mo</span>
                <span class="cost-date">{{ cost.validFrom | date:'dd.MM.yyyy' }} – {{ cost.validTo | date:'dd.MM.yyyy' }}</span>
              </div>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .fixed-cost-section { padding: 16px 0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 24px; }
    .cost-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
    .cost-item.inactive { opacity: 0.5; }
    .cost-info { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .cost-name { font-weight: 500; }
    .cost-amount { color: #1976d2; }
    .cost-date { color: #666; font-size: 0.875rem; }
    .cost-actions { display: flex; }
    .empty { color: #999; font-style: italic; }
    .inactive-label { color: #999; font-size: 0.875rem; margin-top: 12px; }
    h4 { margin: 8px 0; }
  `]
})
export class FixedCostListComponent {
  propertyId = input.required<string>();

  private fixedCostService = inject(FixedCostService);
  private dialog = inject(MatDialog);
  private transloco = inject(TranslocoService);

  showAddForm = signal(false);
  editingId = signal<string | null>(null);

  costsResource = rxResource({
    params: () => this.propertyId(),
    stream: ({ params: pid }) => this.fixedCostService.getAll(pid)
  });

  activeCosts = () => (this.costsResource.value() ?? []).filter(c => c.validTo === null);
  inactiveCosts = () => (this.costsResource.value() ?? []).filter(c => c.validTo !== null);

  onSaved(): void {
    this.showAddForm.set(false);
    this.editingId.set(null);
    this.costsResource.reload();
  }

  deactivate(cost: FixedCost): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.transloco.translate('fixedCosts.deactivateTitle'),
        message: this.transloco.translate('fixedCosts.deactivateMessage', { name: cost.name }),
        confirmLabel: this.transloco.translate('fixedCosts.deactivate')
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.fixedCostService.deactivate(this.propertyId(), cost.id)
          .subscribe(() => this.costsResource.reload());
      }
    });
  }
}
