import { Component, input, output } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { TranslocoModule } from '@jsverse/transloco';
import { PropertySummary } from '../models/property.models';

@Component({
  selector: 'pms-property-card',
  imports: [NgClass, DecimalPipe, MatMenuModule, TranslocoModule],
  template: `
    <div class="property-card loaded" [class.loss]="isLoss()">
      <!-- Card body -->
      <div class="property-card-body">
        <div class="property-address">{{ property().name }}</div>
        <div class="property-location">
          {{ cityLine() }}
        </div>

        <div class="property-divider"></div>

        <!-- Stats row -->
        <div class="property-stats">
          <div class="property-stat">
            <span class="material-icons">electric_meter</span>
            <span>{{ property().meterCount }}</span>
          </div>
          <div class="property-stat">
            <span class="material-icons">people</span>
            <span>{{ property().activeTenantCount }}</span>
          </div>
          <div class="property-stat">
            <span class="material-icons">description</span>
            <span>{{ property().activeContractCount }}</span>
          </div>
        </div>

        <!-- Profitability row -->
        <div class="property-profit-row">
          <div class="property-profit-label">{{ 'properties.card.profit' | transloco }}</div>
          <div class="property-profit-right">
            @if (property().lastProfitability; as p) {
              <span class="profit-amount" [ngClass]="profitClass(p.grossProfit)">
                {{ p.grossProfit | number:'1.0-0' }} {{ p.currency }}
              </span>
              <span class="status-badge" [ngClass]="statusBadgeClass(p.dataStatus)">
                {{ statusLabel(p.dataStatus) | transloco }}
              </span>
            } @else {
              <span class="profit-amount muted">–</span>
              <span class="status-badge neutral">{{ 'properties.card.noData' | transloco }}</span>
            }
          </div>
        </div>
      </div>

      <!-- Card footer -->
      <div class="property-card-footer">
        <button class="btn-details" (click)="detailsClick.emit(property().id)" type="button">
          {{ 'properties.card.details' | transloco }}
          <span class="material-icons" style="font-size:16px">arrow_forward</span>
        </button>

        <button class="btn-options" [matMenuTriggerFor]="cardMenu" type="button" aria-label="Opcje">
          <span class="material-icons">more_vert</span>
        </button>
        <mat-menu #cardMenu>
          <button mat-menu-item (click)="editClick.emit(property().id)">
            <span class="material-icons">edit</span>
            {{ 'buttons.edit' | transloco }}
          </button>
          <button mat-menu-item class="danger-item" (click)="deleteClick.emit(property())">
            <span class="material-icons">delete</span>
            {{ 'buttons.delete' | transloco }}
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .property-card {
      background: var(--color-bg-surface, #ffffff);
      border: 1px solid var(--color-border-default, #E2E8F0);
      border-left: 4px solid var(--color-primary-500, #3B82F6);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      opacity: 0;
      animation: fadeSlideUp 400ms cubic-bezier(0,0,0.2,1) forwards;
      transition: box-shadow 200ms, transform 200ms;
      display: flex;
      flex-direction: column;
    }

    .property-card.loss {
      border-left-color: var(--color-error-500, #EF4444);
    }

    .property-card.loaded:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .property-card-body {
      padding: 20px;
      flex: 1;
    }

    .property-address {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-primary, #0F172A);
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .property-location {
      font-size: 0.875rem;
      color: var(--color-text-secondary, #475569);
      margin-bottom: 16px;
    }

    .property-divider {
      height: 1px;
      background: var(--color-border-default, #E2E8F0);
      margin-bottom: 16px;
    }

    .property-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .property-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--color-text-secondary, #64748B);

      .material-icons {
        font-size: 16px;
        color: var(--color-text-muted, #94A3B8);
      }
    }

    .property-profit-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .property-profit-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary, #475569);
    }

    .property-profit-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .profit-amount {
      font-size: 0.875rem;
      font-weight: 700;
      font-family: 'Roboto Mono', monospace;
    }

    .profit-amount.green { color: var(--color-status-profit, #16A34A); }
    .profit-amount.red { color: var(--color-status-loss, #DC2626); }
    .profit-amount.muted { color: var(--color-text-muted, #94A3B8); }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .status-badge.green { background: #DCFCE7; color: #15803D; }
    .status-badge.amber { background: #FEF3C7; color: #B45309; }
    .status-badge.neutral { background: #F1F5F9; color: #475569; }
    .status-badge.red { background: #FEE2E2; color: #B91C1C; }

    /* Footer */
    .property-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid var(--color-border-default, #E2E8F0);
      background: var(--color-bg-canvas, #F8FAFC);
    }

    .btn-details {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-interactive-primary, #2563EB);
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      padding: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 200ms;

      &:hover { color: var(--color-primary-700, #1D4ED8); }
    }

    .btn-options {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid var(--color-border-default, #E2E8F0);
      background: var(--color-bg-surface, #ffffff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary, #475569);
      transition: background 200ms;
      font-family: var(--font-family-base, 'Inter', sans-serif);

      .material-icons { font-size: 18px; }
      &:hover { background: var(--color-bg-canvas, #F8FAFC); color: var(--color-text-primary, #0F172A); }
    }

    ::ng-deep .danger-item {
      color: var(--color-error-600, #DC2626) !important;
      .material-icons { color: var(--color-error-600, #DC2626) !important; }
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class PropertyCardComponent {
  readonly property = input.required<PropertySummary>();
  readonly detailsClick = output<string>();
  readonly editClick = output<string>();
  readonly deleteClick = output<PropertySummary>();

  isLoss(): boolean {
    const p = this.property().lastProfitability;
    return p !== null && p.grossProfit < 0;
  }

  cityLine(): string {
    const p = this.property();
    const parts = [p.postalCode, p.city].filter(Boolean);
    return parts.join(' ') || '–';
  }

  profitClass(grossProfit: number): string {
    if (grossProfit > 0) return 'green';
    if (grossProfit < 0) return 'red';
    return 'muted';
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETE': return 'green';
      case 'INCOMPLETE_DATA': return 'amber';
      case 'NO_DATA': return 'neutral';
      default: return 'neutral';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'COMPLETE': return 'properties.card.statusComplete';
      case 'INCOMPLETE_DATA': return 'properties.card.statusIncomplete';
      case 'NO_DATA': return 'properties.card.statusNoData';
      default: return 'properties.card.statusNoData';
    }
  }
}
