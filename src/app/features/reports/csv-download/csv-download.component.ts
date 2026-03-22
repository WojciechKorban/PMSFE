import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';
import { ReportService } from '../services/report.service';
import { PropertyService } from '../../properties/services/property.service';

@Component({
  selector: 'app-csv-download',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="csv-container">
      <h2>{{ 'reports.csv.title' | transloco }}</h2>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'reports.csv.property' | transloco }}</mat-label>
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
              <mat-label>{{ 'reports.csv.from' | transloco }}</mat-label>
              <input matInput [matDatepicker]="fromPicker" formControlName="from" />
              <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'reports.csv.to' | transloco }}</mat-label>
              <input matInput [matDatepicker]="toPicker" formControlName="to" />
              <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || downloading()"
              >
                @if (downloading()) {
                  <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
                  {{ 'reports.csv.downloading' | transloco }}
                } @else {
                  <ng-container>
                    <mat-icon>download</mat-icon>
                    {{ 'reports.csv.download' | transloco }}
                  </ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .csv-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-grid { display: flex; flex-direction: column; gap: 12px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
    .btn-spinner { display: inline-block; margin-right: 8px; vertical-align: middle; }
  `]
})
export class CsvDownloadComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private propertyService = inject(PropertyService);
  private snackBar = inject(MatSnackBar);

  downloading = signal(false);

  form = this.fb.group({
    propertyId: ['', Validators.required],
    from: [null as Date | null, Validators.required],
    to: [null as Date | null, Validators.required],
  });

  propertiesResource = rxResource({
    stream: () => this.propertyService.getAll()
  });

  onSubmit(): void {
    if (this.form.invalid || this.downloading()) return;

    const { propertyId, from, to } = this.form.value;
    if (!propertyId || !from || !to) return;

    const fromStr = (from as Date).toISOString().split('T')[0];
    const toStr = (to as Date).toISOString().split('T')[0];

    this.downloading.set(true);
    this.reportService.downloadCsv(propertyId, fromStr, toStr).subscribe({
      next: blob => {
        this.reportService.triggerDownload(blob, `readings_${propertyId}_${fromStr}_${toStr}.csv`);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
        this.snackBar.open('reports.csv.error', 'OK', { duration: 4000 });
      }
    });
  }
}
