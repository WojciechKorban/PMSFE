import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MeterReadingService } from '../services/meter-reading.service';
import { ReadingPhotoService } from '../services/reading-photo.service';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-reading-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatDatepickerModule, MatProgressSpinnerModule, MatExpansionModule,
    FileUploadComponent
  ],
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>{{ 'meters.readings.addReading' | transloco }}</mat-panel-title>
      </mat-expansion-panel-header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="reading-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'meters.readings.date' | transloco }}</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="readingDate" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'meters.readings.value' | transloco }} ({{ unit() }})</mat-label>
          <input matInput type="number" formControlName="value" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'meters.readings.notes' | transloco }}</mat-label>
          <input matInput formControlName="notes" />
        </mat-form-field>

        <div class="photo-section">
          <label class="photo-label">{{ 'meters.photos.attachPhoto' | transloco }}</label>
          <app-file-upload
            [uploading]="uploading()"
            (fileSelected)="onFileSelected($event)"
          />
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit"
            [disabled]="form.invalid || saving()">
            @if (saving() || uploading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'meters.readings.save' | transloco }}
            }
          </button>
        </div>
      </form>
    </mat-expansion-panel>
  `,
  styles: [`
    .reading-form { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; }
    .photo-section { display: flex; flex-direction: column; gap: 8px; }
    .photo-label { font-size: 0.875rem; color: #666; }
    .form-actions { display: flex; justify-content: flex-end; }
  `]
})
export class ReadingFormComponent {
  propertyId = input.required<string>();
  meterId = input.required<string>();
  unit = input<string>('');
  readingAdded = output<void>();

  private fb = inject(FormBuilder);
  private readingService = inject(MeterReadingService);
  private photoService = inject(ReadingPhotoService);

  saving = signal(false);
  uploading = signal(false);
  pendingFile = signal<File | null>(null);

  form = this.fb.group({
    readingDate: [new Date(), Validators.required],
    value: [null as number | null, [Validators.required, Validators.min(0)]],
    notes: ['']
  });

  onFileSelected(file: File): void {
    this.pendingFile.set(file);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const pid = this.propertyId();
    const mid = this.meterId();

    this.readingService.create(pid, mid, {
      readingDate: (val.readingDate as Date).toISOString().split('T')[0],
      value: val.value!,
      notes: val.notes ?? undefined
    }).pipe(
      switchMap(reading => {
        const file = this.pendingFile();
        if (!file) {
          this.readingAdded.emit();
          this.form.reset({ readingDate: new Date() });
          this.saving.set(false);
          this.pendingFile.set(null);
          return EMPTY;
        }
        this.uploading.set(true);
        return this.photoService.uploadPhoto(pid, mid, reading.id, file);
      })
    ).subscribe({
      next: () => {
        this.uploading.set(false);
        this.saving.set(false);
        this.pendingFile.set(null);
        this.form.reset({ readingDate: new Date() });
        this.readingAdded.emit();
      },
      error: () => {
        this.saving.set(false);
        this.uploading.set(false);
      }
    });
  }
}
