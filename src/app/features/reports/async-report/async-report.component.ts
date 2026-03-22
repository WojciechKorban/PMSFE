import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { ReportService } from '../services/report.service';
import { PropertyService } from '../../properties/services/property.service';
import { ReportRequest, ReportType } from '../models/report.models';

@Component({
  selector: 'app-async-report',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="async-container">
      <h2>{{ 'reports.async.title' | transloco }}</h2>

      @if (!reportResult()) {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.async.property' | transloco }}</mat-label>
                <mat-select formControlName="propertyId">
                  @if (propertiesResource.isLoading()) {
                    <mat-option disabled>Loading...</mat-option>
                  }
                  @for (prop of propertiesResource.value() ?? []; track prop.id) {
                    <mat-option [value]="prop.id">{{ prop.name }} — {{ prop.city }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.async.reportType' | transloco }}</mat-label>
                <mat-select formControlName="reportType">
                  @for (type of reportTypes; track type) {
                    <mat-option [value]="type">{{ 'reports.async.types.' + type | transloco }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.async.from' | transloco }}</mat-label>
                <input matInput [matDatepicker]="fromPicker" formControlName="from" />
                <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'reports.async.to' | transloco }}</mat-label>
                <input matInput [matDatepicker]="toPicker" formControlName="to" />
                <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="form.invalid || submitting()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
                  } @else {
                    <mat-icon>cloud_upload</mat-icon>
                  }
                  {{ 'reports.async.submit' | transloco }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="status-card">
          <mat-card-content>
            @switch (reportResult()!.status) {
              @case ('PENDING') {
                <div class="status-row">
                  <mat-spinner diameter="28"></mat-spinner>
                  <span>{{ 'reports.async.status.PENDING' | transloco }}</span>
                </div>
              }
              @case ('PROCESSING') {
                <div class="status-row">
                  <mat-spinner diameter="28"></mat-spinner>
                  <span>{{ 'reports.async.status.PROCESSING' | transloco }}</span>
                </div>
              }
              @case ('COMPLETE') {
                <div class="status-row">
                  <mat-icon class="success-icon">check_circle</mat-icon>
                  <span>{{ 'reports.async.status.COMPLETE' | transloco }}</span>
                </div>
                @if (reportResult()!.downloadUrl) {
                  <a mat-raised-button color="primary" [href]="reportResult()!.downloadUrl!" target="_blank">
                    <mat-icon>download</mat-icon>
                    {{ 'reports.async.download' | transloco }}
                  </a>
                }
              }
              @case ('FAILED') {
                <div class="status-row failed">
                  <mat-icon class="failed-icon">error</mat-icon>
                  <span class="failed-text">{{ 'reports.async.status.FAILED' | transloco }}</span>
                </div>
                @if (reportResult()!.errorMessage) {
                  <p class="error-message">{{ reportResult()!.errorMessage }}</p>
                }
              }
            }
          </mat-card-content>
          <mat-card-actions>
            <button mat-stroked-button (click)="reset()">
              <mat-icon>refresh</mat-icon>
              New Report
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .async-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-grid { display: flex; flex-direction: column; gap: 12px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    .btn-spinner { display: inline-block; margin-right: 8px; vertical-align: middle; }
    .status-card { margin-top: 16px; }
    .status-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 1rem; }
    .success-icon { color: #4caf50; font-size: 28px; width: 28px; height: 28px; }
    .failed-icon { color: #f44336; font-size: 28px; width: 28px; height: 28px; }
    .failed-text { color: #f44336; font-weight: 500; }
    .error-message { color: #f44336; margin: 0 0 12px; font-size: 0.875rem; }
  `]
})
export class AsyncReportComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private propertyService = inject(PropertyService);
  private destroyRef = inject(DestroyRef);

  submitting = signal(false);
  reportResult = signal<ReportRequest | null>(null);

  readonly reportTypes: ReportType[] = [
    'PROFITABILITY_SUMMARY',
    'METER_READINGS_CSV',
    'PROFITABILITY_COMPARISON',
  ];

  form = this.fb.group({
    propertyId: ['', Validators.required],
    reportType: ['' as ReportType | '', Validators.required],
    from: [null as Date | null, Validators.required],
    to: [null as Date | null, Validators.required],
  });

  propertiesResource = rxResource({
    stream: () => this.propertyService.getAll()
  });

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    const { propertyId, reportType, from, to } = this.form.value;
    if (!propertyId || !reportType || !from || !to) return;

    const fromStr = (from as Date).toISOString().split('T')[0];
    const toStr = (to as Date).toISOString().split('T')[0];

    this.submitting.set(true);

    this.reportService.requestAsync(propertyId, reportType as ReportType, fromStr, toStr).pipe(
      switchMap(result => {
        this.reportResult.set(result);
        this.submitting.set(false);
        return this.reportService.pollStatus(propertyId, result.reportRequestId);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result: ReportRequest) => this.reportResult.set(result),
      error: () => this.submitting.set(false)
    });
  }

  reset(): void {
    this.reportResult.set(null);
    this.form.reset();
  }
}
