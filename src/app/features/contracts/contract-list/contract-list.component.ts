import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from '../services/contract.service';
import { ContractTerminateDialogComponent } from '../contract-terminate-dialog/contract-terminate-dialog.component';
import { Contract } from '../models/contract.models';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="contracts-header">
      <h3>{{ 'contracts.title' | transloco }}</h3>
      <a mat-raised-button color="primary" [routerLink]="['/', 'properties', propertyId(), 'contracts', 'new']">
        <mat-icon>add</mat-icon>
        {{ 'contracts.addContract' | transloco }}
      </a>
    </div>

    @if (contractsResource.isLoading()) {
      <div class="loading-center"><mat-spinner diameter="32"></mat-spinner></div>
    } @else {
      @for (contract of contractsResource.value() ?? []; track contract.id) {
        <div class="contract-item">
          <div class="contract-info">
            <span class="contract-amount">{{ contract.monthlyAmount | number:'1.2-2' }} {{ contract.currency }}/mo</span>
            <span class="contract-dates">{{ contract.startDate | date:'dd.MM.yyyy' }} – {{ contract.endDate ? (contract.endDate | date:'dd.MM.yyyy') : '∞' }}</span>
            <span [class]="'status-chip status-' + contract.status.toLowerCase()">
              {{ ('contracts.status.' + contract.status) | transloco }}
            </span>
          </div>
          <div class="contract-actions">
            <a mat-icon-button [routerLink]="['/', 'properties', propertyId(), 'contracts', contract.id]">
              <mat-icon>visibility</mat-icon>
            </a>
            @if (contract.status === 'ACTIVE') {
              <button mat-icon-button color="warn" (click)="terminateContract(contract)">
                <mat-icon>cancel</mat-icon>
              </button>
            }
          </div>
        </div>
      } @empty {
        <p class="empty">{{ 'contracts.empty' | transloco }}</p>
      }
    }
  `,
  styles: [`
    .contracts-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 24px; }
    .contract-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; }
    .contract-info { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .contract-amount { font-weight: 500; }
    .contract-dates { color: #666; font-size: 0.875rem; }
    .contract-actions { display: flex; gap: 4px; }
    .status-chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-terminated { background: #fce4ec; color: #880e4f; }
    .status-expired { background: #f5f5f5; color: #616161; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class ContractListComponent {
  propertyId = input.required<string>();

  private contractService = inject(ContractService);
  private dialog = inject(MatDialog);

  contractsResource = rxResource({
    params: () => this.propertyId(),
    stream: ({ params: pid }) => this.contractService.getAll(pid),
  });

  terminateContract(contract: Contract): void {
    const ref = this.dialog.open(ContractTerminateDialogComponent, {
      data: { propertyId: this.propertyId(), contractId: contract.id },
      width: '400px',
    });
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) this.contractsResource.reload();
    });
  }
}
