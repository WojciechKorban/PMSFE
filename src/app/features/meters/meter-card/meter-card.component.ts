import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Meter } from '../models/meter.models';
import { MeterService } from '../services/meter.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-meter-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatMenuModule,
    StatusBadgeComponent
  ],
  template: `
    <mat-card class="meter-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>{{ utilityIcon() }}</mat-icon>
          {{ ('meters.utilityType.' + meter().utilityType) | transloco }}
        </mat-card-title>
        <mat-card-subtitle>{{ meter().serialNumber }}</mat-card-subtitle>
        <div class="card-actions">
          <app-status-badge [status]="meter().status" />
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <a mat-menu-item [routerLink]="[meter().id]">
              <mat-icon>visibility</mat-icon>
              {{ 'common.view' | transloco }}
            </a>
            <a mat-menu-item [routerLink]="[meter().id, 'edit']">
              <mat-icon>edit</mat-icon>
              {{ 'common.edit' | transloco }}
            </a>
            @if (meter().status === 'ACTIVE') {
              <a mat-menu-item [routerLink]="[meter().id, 'replace']">
                <mat-icon>swap_horiz</mat-icon>
                {{ 'meters.replace' | transloco }}
              </a>
            }
            <button mat-menu-item (click)="confirmDelete()" [disabled]="deleting()">
              <mat-icon color="warn">delete</mat-icon>
              {{ 'common.delete' | transloco }}
            </button>
          </mat-menu>
        </div>
      </mat-card-header>
      <mat-card-content>
        @if (meter().latestReading) {
          <div class="reading-info">
            <span class="reading-label">{{ 'meters.latestReading' | transloco }}:</span>
            <span class="reading-value">{{ meter().latestReading!.value }} {{ meter().unit }}</span>
            <span class="reading-date">{{ meter().latestReading!.readingDate | date:'dd.MM.yyyy' }}</span>
          </div>
        } @else {
          <p class="no-reading">{{ 'meters.noReadings' | transloco }}</p>
        }
        @if (meter().notes) {
          <p class="notes">{{ meter().notes }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .meter-card { height: 100%; }
    mat-card-header { display: flex; justify-content: space-between; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    .card-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
    .reading-info { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
    .reading-label { color: #666; font-size: 0.875rem; }
    .reading-value { font-weight: 500; }
    .reading-date { color: #888; font-size: 0.75rem; }
    .no-reading { color: #999; font-style: italic; font-size: 0.875rem; }
    .notes { color: #666; font-size: 0.875rem; margin-top: 8px; }
  `]
})
export class MeterCardComponent {
  meter = input.required<Meter>();
  deleted = output<void>();

  private meterService = inject(MeterService);
  deleting = signal(false);

  utilityIcon = computed(() => {
    const icons: Record<string, string> = {
      ELECTRICITY: 'bolt',
      GAS: 'local_fire_department',
      WATER: 'water_drop',
      HEAT: 'thermostat',
      OTHER: 'electric_meter'
    };
    return icons[this.meter().utilityType] ?? 'electric_meter';
  });

  confirmDelete(): void {
    if (!confirm('Delete this meter?')) return;
    this.deleting.set(true);
    this.meterService.delete(this.meter().propertyId, this.meter().id).subscribe({
      next: () => this.deleted.emit(),
      error: () => this.deleting.set(false)
    });
  }
}
