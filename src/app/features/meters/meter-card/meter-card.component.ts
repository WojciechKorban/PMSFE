import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';

import { TranslocoPipe } from '@jsverse/transloco';
import { Meter } from '../models/meter.models';

@Component({
  selector: 'app-meter-card',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, DecimalPipe, DatePipe],
  template: `
    <div [class]="cardClasses()">
      <div class="meter-card-inner">

        <!-- Top section -->
        <div class="meter-card-top">
          <div class="meter-type-icon" [style.background]="iconBg()">
            <span class="material-icons" [style.color]="utilityColor()">{{ utilityIcon() }}</span>
          </div>
          <div class="meter-header-info">
            <div class="meter-type-label">{{ utilityLabel() | transloco }}</div>
            <div class="meter-serial">{{ meter().serialNumber }}</div>
          </div>
          <div class="meter-status-chip">
            <span class="status-dot"></span>
            {{ 'meters.status.' + meter().status | transloco }}
          </div>
        </div>

        <!-- Reading section -->
        <div class="meter-reading-section">
          <div class="reading-label">{{ 'meters.card.lastReading' | transloco }}</div>

          @if (meter().lastReading) {
            <div class="reading-value-row">
              <span class="reading-value">{{ meter().lastReading!.readingValue | number:'1.2-2' }}</span>
              @if (meter().lastReading!.consumptionSincePrevious !== undefined) {
                <span class="reading-delta positive">
                  +{{ meter().lastReading!.consumptionSincePrevious | number:'1.2-2' }}
                </span>
              }
            </div>
            <div class="reading-date-row">
              <span class="reading-date">{{ meter().lastReading!.readingDate | date:'dd.MM.yyyy' }}</span>
              @if (meter().daysSinceLastReading !== undefined) {
                <span [class]="daysClass()">
                  <span class="material-icons">{{ daysIcon() }}</span>
                  {{ meter().daysSinceLastReading }} dni temu
                </span>
              }
            </div>
          } @else {
            <div class="no-reading">{{ 'meters.card.noReadings' | transloco }}</div>
          }
        </div>

        <!-- Footer -->
        <div class="meter-card-footer">
          <button class="btn-add-reading" (click)="addReadingClick.emit(meter())">
            <span class="material-icons">add</span>
            {{ 'meters.card.addReading' | transloco }}
          </button>
          <button class="btn-history" (click)="historyClick.emit(meter())">
            {{ 'meters.card.history' | transloco }}
          </button>
          <div class="btn-more-wrap">
            <button class="btn-more" (click)="menuOpen.set(!menuOpen())">
              <span class="material-icons">more_vert</span>
            </button>
            @if (menuOpen()) {
              <div class="dropdown-menu">
                <button class="dropdown-item" (click)="replaceClick.emit(meter()); menuOpen.set(false)">
                  <span class="material-icons">swap_horiz</span>
                  {{ 'meters.card.replace' | transloco }}
                </button>
                <button class="dropdown-item" (click)="editClick.emit(meter()); menuOpen.set(false)">
                  <span class="material-icons">edit</span>
                  {{ 'common.actions.edit' | transloco }}
                </button>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .meter-card {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: box-shadow 200ms ease, transform 200ms ease;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      &.electricity { border-left: 4px solid #F59E0B; }
      &.gas { border-left: 4px solid #F97316; }
      &.water-cold { border-left: 4px solid #60A5FA; }
      &.water-hot { border-left: 4px solid #FB923C; }
      &.heat { border-left: 4px solid #F87171; }
      &.overdue { box-shadow: 0 0 0 1px rgba(239,68,68,0.2), var(--shadow-sm); }
    }

    .meter-card-top {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-bottom: 1px solid var(--color-border-default);
    }

    .meter-type-icon {
      width: 48px;
      height: 48px;
      min-width: 48px;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons { font-size: 24px; }
    }

    .meter-header-info {
      flex: 1;
      min-width: 0;
    }

    .meter-type-label {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meter-serial {
      font-family: var(--font-family-mono);
      font-size: 0.75rem;
      color: var(--color-text-muted);
      letter-spacing: 0.05em;
    }

    .meter-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 600;
      background: #DCFCE7;
      color: #15803D;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .meter-reading-section {
      padding: 16px 20px;
    }

    .reading-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .reading-value-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 8px;
    }

    .reading-value {
      font-family: var(--font-family-mono);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .reading-delta {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: var(--radius-full);

      &.positive { background: #DCFCE7; color: #15803D; }
    }

    .reading-date-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .reading-date {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .days-ago {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);

      .material-icons { font-size: 12px; }

      &.days-ok { background: #DCFCE7; color: #15803D; }
      &.days-warning { background: #FEF3C7; color: #B45309; }
      &.days-overdue { background: #FEE2E2; color: #B91C1C; }
    }

    .no-reading {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .meter-card-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid var(--color-border-default);
      background: var(--color-bg-canvas);
    }

    .btn-add-reading {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 32px;
      padding: 0 12px;
      border: none;
      border-radius: var(--radius-md);
      background: var(--color-interactive-primary);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-family-base);
      transition: background 200ms ease;

      .material-icons { font-size: 14px; }

      &:hover { background: var(--color-interactive-primary-hover); }
    }

    .btn-history {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding: 0 12px;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-family-base);
      transition: border-color 200ms ease, color 200ms ease;

      &:hover { border-color: var(--color-border-strong); color: var(--color-text-primary); }
    }

    .btn-more-wrap {
      position: relative;
      margin-left: auto;
    }

    .btn-more {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: background 200ms ease;

      .material-icons { font-size: 18px; }

      &:hover { background: var(--color-bg-canvas); color: var(--color-text-primary); }
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
      bottom: 40px;
      background: var(--color-bg-surface-raised);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--color-text-primary);
      font-size: 0.875rem;
      cursor: pointer;
      font-family: var(--font-family-base);
      text-align: left;
      transition: background 150ms ease;

      .material-icons { font-size: 16px; color: var(--color-text-secondary); }

      &:hover { background: var(--color-bg-canvas); }
    }
  `]
})
export class MeterCardComponent {
  meter = input.required<Meter>();
  addReadingClick = output<Meter>();
  historyClick = output<Meter>();
  replaceClick = output<Meter>();
  editClick = output<Meter>();

  menuOpen = signal(false);

  utilityIcon = computed(() => {
    const icons: Record<string, string> = {
      ELECTRICITY: 'bolt',
      GAS: 'local_fire_department',
      WATER_COLD: 'water_drop',
      WATER_HOT: 'opacity',
      HEAT: 'thermostat',
    };
    return icons[this.meter().utilityType] ?? 'electric_meter';
  });

  utilityColor = computed(() => {
    const colors: Record<string, string> = {
      ELECTRICITY: '#F59E0B',
      GAS: '#F97316',
      WATER_COLD: '#3B82F6',
      WATER_HOT: '#06B6D4',
      HEAT: '#F87171',
    };
    return colors[this.meter().utilityType] ?? '#64748B';
  });

  iconBg = computed(() => {
    const bgs: Record<string, string> = {
      ELECTRICITY: '#FEF3C7',
      GAS: '#FFEDD5',
      WATER_COLD: '#EFF6FF',
      WATER_HOT: '#ECFEFF',
      HEAT: '#FEF2F2',
    };
    return bgs[this.meter().utilityType] ?? '#F1F5F9';
  });

  utilityLabel = computed(() => {
    const labels: Record<string, string> = {
      ELECTRICITY: 'meters.utilityTypes.electricity',
      GAS: 'meters.utilityTypes.gas',
      WATER_COLD: 'meters.utilityTypes.waterCold',
      WATER_HOT: 'meters.utilityTypes.waterHot',
      HEAT: 'meters.utilityTypes.heat',
    };
    return labels[this.meter().utilityType] ?? this.meter().utilityType;
  });

  cardClasses = computed(() => {
    const typeMap: Record<string, string> = {
      ELECTRICITY: 'electricity',
      GAS: 'gas',
      WATER_COLD: 'water-cold',
      WATER_HOT: 'water-hot',
      HEAT: 'heat',
    };
    const typeCls = typeMap[this.meter().utilityType] ?? '';
    const days = this.meter().daysSinceLastReading ?? 0;
    const overdue = days > 60 ? ' overdue' : '';
    return `meter-card ${typeCls}${overdue}`;
  });

  daysClass = computed(() => {
    const days = this.meter().daysSinceLastReading ?? 0;
    if (days <= 30) return 'days-ago days-ok';
    if (days <= 60) return 'days-ago days-warning';
    return 'days-ago days-overdue';
  });

  daysIcon = computed(() => {
    const days = this.meter().daysSinceLastReading ?? 0;
    if (days <= 30) return 'check_circle';
    if (days <= 60) return 'schedule';
    return 'warning';
  });
}
