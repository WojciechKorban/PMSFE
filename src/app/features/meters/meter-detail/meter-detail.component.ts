import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MeterService } from '../services/meter.service';
import { MeterReadingService } from '../services/meter-reading.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ReadingFormComponent } from '../reading-form/reading-form.component';

@Component({
  selector: 'app-meter-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatTabsModule,
    MatProgressSpinnerModule, MatDividerModule,
    StatusBadgeComponent, ReadingFormComponent
  ],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <button mat-icon-button routerLink="..">
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (meterResource.value()) {
          <h2>{{ ('meters.utilityType.' + meterResource.value()!.utilityType) | transloco }} — {{ meterResource.value()!.serialNumber }}</h2>
          <app-status-badge [status]="meterResource.value()!.status" />
          <div class="header-actions">
            <a mat-stroked-button [routerLink]="['edit']">
              <mat-icon>edit</mat-icon>{{ 'common.edit' | transloco }}
            </a>
            @if (meterResource.value()!.status === 'ACTIVE') {
              <a mat-stroked-button [routerLink]="['replace']">
                <mat-icon>swap_horiz</mat-icon>{{ 'meters.replace' | transloco }}
              </a>
            }
          </div>
        }
      </div>

      @if (meterResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (meterResource.error()) {
        <div class="error">{{ 'common.error.loadFailed' | transloco }}</div>
      } @else if (meterResource.value()) {
        <mat-tab-group>
          <mat-tab [label]="'meters.tabs.readings' | transloco">
            <div class="tab-content">
              <app-reading-form
                [propertyId]="propertyId()"
                [meterId]="meterId()"
                [unit]="meterUnit()"
                (readingAdded)="onReadingAdded()"
              />
              <mat-divider></mat-divider>
              <div class="readings-list">
                @if (readingsResource.isLoading()) {
                  <mat-spinner diameter="32"></mat-spinner>
                } @else {
                  @for (reading of readingsResource.value() ?? []; track reading.id) {
                    <div class="reading-item">
                      <span class="reading-date">{{ reading.readingDate | date:'dd.MM.yyyy' }}</span>
                      <span class="reading-value">{{ reading.readingValue }} {{ meterUnit() }}</span>
                      @if (reading.notes) {
                        <span class="reading-notes">{{ reading.notes }}</span>
                      }
                    </div>
                  } @empty {
                    <p class="empty">{{ 'meters.readings.empty' | transloco }}</p>
                  }
                }
              </div>
            </div>
          </mat-tab>
          <mat-tab [label]="'meters.tabs.info' | transloco">
            <div class="tab-content info-grid">
              <div class="info-item">
                <span class="label">{{ 'meters.form.unit' | transloco }}</span>
                <span>{{ meterUnit() }}</span>
              </div>
              @if (meterResource.value()!.installationDate) {
                <div class="info-item">
                  <span class="label">{{ 'meters.form.installationDate' | transloco }}</span>
                  <span>{{ meterResource.value()!.installationDate | date:'dd.MM.yyyy' }}</span>
                </div>
              }
              @if (meterResource.value()!.description) {
                <div class="info-item">
                  <span class="label">{{ 'meters.form.notes' | transloco }}</span>
                  <span>{{ meterResource.value()!.description }}</span>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 800px; margin: 0 auto; padding: 16px; }
    .detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .header-actions { display: flex; gap: 8px; margin-left: auto; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .tab-content { padding: 16px 0; }
    .readings-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .reading-item { display: flex; align-items: center; gap: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px; }
    .reading-date { color: #666; font-size: 0.875rem; min-width: 90px; }
    .reading-value { font-weight: 500; }
    .reading-notes { color: #888; font-size: 0.875rem; }
    .empty { color: #999; font-style: italic; }
    .info-grid { display: flex; flex-direction: column; gap: 12px; }
    .info-item { display: flex; gap: 16px; }
    .info-item .label { color: #666; min-width: 160px; }
    .error { color: red; padding: 16px; }
  `]
})
export class MeterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private meterService = inject(MeterService);
  private readingService = inject(MeterReadingService);

  propertyId = signal('');
  meterId = signal('');

  meterUnit = computed(() => {
    const units: Record<string, string> = {
      ELECTRICITY: 'kWh', GAS: 'm³', WATER_COLD: 'm³', WATER_HOT: 'm³', HEAT: 'GJ',
    };
    return units[this.meterResource.value()?.utilityType ?? ''] ?? '';
  });

  meterResource = rxResource({
    params: () => ({ propertyId: this.propertyId(), meterId: this.meterId() }),
    stream: ({ params: { propertyId, meterId } }) => {
      if (!propertyId || !meterId) return EMPTY;
      return this.meterService.getById(propertyId, meterId);
    }
  });

  readingsResource = rxResource({
    params: () => ({ propertyId: this.propertyId(), meterId: this.meterId() }),
    stream: ({ params: { propertyId, meterId } }) => {
      if (!propertyId || !meterId) return EMPTY;
      return this.readingService.getAll(propertyId, meterId);
    }
  });

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    this.meterId.set(snapshot.params['meterId']);
    this.propertyId.set(snapshot.parent?.params['propertyId'] ?? snapshot.params['propertyId'] ?? '');
  }

  onReadingAdded(): void {
    this.readingsResource.reload();
    this.meterResource.reload();
  }
}
