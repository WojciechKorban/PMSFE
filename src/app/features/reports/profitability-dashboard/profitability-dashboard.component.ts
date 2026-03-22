import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { switchMap } from 'rxjs';
import { ReportService } from '../services/report.service';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';
import { DateRange, ReportRequest } from '../models/report.models';

@Component({
  selector: 'app-profitability-dashboard',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatCardModule, MatDividerModule,
    DateRangePickerComponent
  ],
  template: `
    <div class="dashboard-container">
      <h2>{{ 'reports.profitability.title' | transloco }}</h2>

      <mat-card class="range-card">
        <mat-card-content>
          <p class="range-hint">{{ 'reports.dateRange.hint' | transloco }}</p>
          <app-date-range-picker (rangeSelected)="onRangeSelected($event)" />
        </mat-card-content>
      </mat-card>

      @if (selectedRange()) {
        <div class="actions-section">
          <h3>{{ 'reports.profitability.downloads' | transloco }}</h3>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="downloadPdf()" [disabled]="!!downloading()">
              <mat-icon>picture_as_pdf</mat-icon>
              {{ 'reports.profitability.downloadPdf' | transloco }}
              @if (downloading() === 'pdf') { <mat-spinner diameter="16"></mat-spinner> }
            </button>
            <button mat-stroked-button (click)="downloadCsv()" [disabled]="!!downloading()">
              <mat-icon>table_chart</mat-icon>
              {{ 'reports.csv.download' | transloco }}
              @if (downloading() === 'csv') { <mat-spinner diameter="16"></mat-spinner> }
            </button>
          </div>

          <mat-divider></mat-divider>

          <h3>{{ 'reports.async.title' | transloco }}</h3>
          <p class="async-hint">{{ 'reports.async.hint' | transloco }}</p>

          @if (!asyncReport()) {
            <button mat-stroked-button (click)="requestAsync()" [disabled]="requestingAsync()">
              <mat-icon>schedule</mat-icon>
              {{ 'reports.async.request' | transloco }}
              @if (requestingAsync()) { <mat-spinner diameter="16"></mat-spinner> }
            </button>
          } @else {
            <div class="async-status">
              @switch (asyncReport()!.status) {
                @case ('PENDING') {
                  <mat-spinner diameter="24"></mat-spinner>
                  <span>{{ 'reports.async.pending' | transloco }}</span>
                }
                @case ('PROCESSING') {
                  <mat-spinner diameter="24"></mat-spinner>
                  <span>{{ 'reports.async.processing' | transloco }}</span>
                }
                @case ('COMPLETE') {
                  <mat-icon color="primary">check_circle</mat-icon>
                  <span>{{ 'reports.async.complete' | transloco }}</span>
                  <a mat-raised-button color="accent" [href]="asyncReport()!.downloadUrl!" target="_blank">
                    <mat-icon>download</mat-icon>
                    {{ 'reports.async.download' | transloco }}
                  </a>
                  <button mat-stroked-button (click)="resetAsync()">{{ 'reports.async.newReport' | transloco }}</button>
                }
                @case ('FAILED') {
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ 'reports.async.failed' | transloco }}: {{ asyncReport()!.errorMessage }}</span>
                  <button mat-stroked-button (click)="resetAsync()">{{ 'reports.async.retry' | transloco }}</button>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; padding: 16px; }
    .range-card { margin-bottom: 24px; }
    .range-hint { color: #666; margin-bottom: 12px; }
    .actions-section { display: flex; flex-direction: column; gap: 16px; }
    .action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .async-hint { color: #666; }
    .async-status { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px; background: #f5f5f5; border-radius: 8px; }
    mat-divider { margin: 8px 0; }
    h3 { margin: 0; }
  `]
})
export class ProfitabilityDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  propertyId = signal('');
  selectedRange = signal<DateRange | null>(null);
  downloading = signal<'pdf' | 'csv' | null>(null);
  requestingAsync = signal(false);
  asyncReport = signal<ReportRequest | null>(null);

  ngOnInit(): void {
    this.propertyId.set(
      this.route.snapshot.params['propertyId'] ??
      this.route.snapshot.parent?.params['propertyId'] ?? ''
    );
  }

  onRangeSelected(range: DateRange): void {
    this.selectedRange.set(range);
    this.asyncReport.set(null);
  }

  private dateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  downloadPdf(): void {
    const range = this.selectedRange();
    if (!range) return;
    this.downloading.set('pdf');
    this.reportService.downloadProfitabilityPdf(
      this.propertyId(), this.dateStr(range.from), this.dateStr(range.to)
    ).subscribe({
      next: blob => {
        this.reportService.triggerDownload(blob, `profitability_${this.dateStr(range.from)}_${this.dateStr(range.to)}.pdf`);
        this.downloading.set(null);
      },
      error: () => this.downloading.set(null)
    });
  }

  downloadCsv(): void {
    const range = this.selectedRange();
    if (!range) return;
    this.downloading.set('csv');
    this.reportService.downloadCsv(
      this.propertyId(), this.dateStr(range.from), this.dateStr(range.to)
    ).subscribe({
      next: blob => {
        this.reportService.triggerDownload(blob, `readings_${this.dateStr(range.from)}_${this.dateStr(range.to)}.csv`);
        this.downloading.set(null);
      },
      error: () => this.downloading.set(null)
    });
  }

  requestAsync(): void {
    const range = this.selectedRange();
    if (!range) return;
    this.requestingAsync.set(true);
    this.reportService.requestAsync(
      this.propertyId(), 'PROFITABILITY_SUMMARY', this.dateStr(range.from), this.dateStr(range.to)
    ).pipe(
      switchMap(result => {
        this.asyncReport.set(result);
        this.requestingAsync.set(false);
        return this.reportService.pollStatus(this.propertyId(), result.reportRequestId);
      })
    ).subscribe({
      next: result => this.asyncReport.set(result),
      error: () => this.requestingAsync.set(false)
    });
  }

  resetAsync(): void {
    this.asyncReport.set(null);
  }
}
