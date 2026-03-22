import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MeterService } from '../services/meter.service';

@Component({
  selector: 'app-meter-replacement-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatDatepickerModule, MatProgressSpinnerModule, MatIconModule, MatCardModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <button mat-icon-button routerLink="..">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ 'meters.replacement.title' | transloco }}</h2>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="replacement-form">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.replacement.newSerialNumber' | transloco }}</mat-label>
              <input matInput formControlName="newSerialNumber" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.replacement.replacementDate' | transloco }}</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="replacementDate" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.replacement.oldFinalReading' | transloco }}</mat-label>
              <input matInput type="number" formControlName="oldFinalReading" step="0.001" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.replacement.newInitialReading' | transloco }}</mat-label>
              <input matInput type="number" formControlName="newInitialReading" step="0.001" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.replacement.reason' | transloco }}</mat-label>
              <textarea matInput formControlName="reason" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="..">
                {{ 'common.cancel' | transloco }}
              </button>
              <button mat-raised-button color="warn" type="submit"
                [disabled]="form.invalid || saving()">
                @if (saving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'meters.replacement.confirm' | transloco }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .replacement-form { display: flex; flex-direction: column; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `]
})
export class MeterReplacementFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private meterService = inject(MeterService);

  propertyId = signal('');
  meterId = signal('');
  saving = signal(false);

  form = this.fb.group({
    newSerialNumber: ['', Validators.required],
    replacementDate: [new Date() as Date | null, Validators.required],
    oldFinalReading: [null as number | null, [Validators.required, Validators.min(0)]],
    newInitialReading: [null as number | null, [Validators.required, Validators.min(0)]],
    reason: ['']
  });

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    this.meterId.set(snapshot.params['meterId']);
    this.propertyId.set(snapshot.parent?.params['propertyId'] ?? snapshot.params['propertyId'] ?? '');
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();

    this.meterService.replace(this.propertyId(), this.meterId(), {
      newSerialNumber: val.newSerialNumber!,
      replacementDate: (val.replacementDate as Date).toISOString().split('T')[0],
      oldFinalReading: val.oldFinalReading!,
      newInitialReading: val.newInitialReading!,
      reason: val.reason ?? undefined
    }).subscribe({
      next: () => this.router.navigate(['../..'], { relativeTo: this.route }),
      error: () => this.saving.set(false)
    });
  }
}
