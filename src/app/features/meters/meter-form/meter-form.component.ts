import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MeterService } from '../services/meter.service';
import { UtilityType } from '../models/meter.models';

@Component({
  selector: 'app-meter-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatDatepickerModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <button mat-icon-button routerLink="..">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ (isEdit() ? 'meters.form.editTitle' : 'meters.form.createTitle') | transloco }}</h2>
      </div>

      @if (isEdit() && meterResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="meter-form">
          @if (!isEdit()) {
            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.form.utilityType' | transloco }}</mat-label>
              <mat-select formControlName="utilityType">
                @for (type of utilityTypes; track type) {
                  <mat-option [value]="type">{{ ('meters.utilityType.' + type) | transloco }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meters.form.serialNumber' | transloco }}</mat-label>
            <input matInput formControlName="serialNumber" />
          </mat-form-field>

          @if (!isEdit()) {
            <mat-form-field appearance="outline">
              <mat-label>{{ 'meters.form.installationDate' | transloco }}</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="installationDate" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>{{ 'meters.form.notes' | transloco }}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="..">
              {{ 'common.cancel' | transloco }}
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ (isEdit() ? 'common.save' : 'common.create') | transloco }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .meter-form { display: flex; flex-direction: column; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class MeterFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private meterService = inject(MeterService);

  propertyId = signal('');
  meterId = signal<string | null>(null);
  isEdit = signal(false);
  saving = signal(false);

  readonly utilityTypes: UtilityType[] = ['ELECTRICITY', 'GAS', 'WATER_COLD', 'WATER_HOT', 'HEAT'];

  form = this.fb.group({
    utilityType: ['ELECTRICITY' as UtilityType, Validators.required],
    serialNumber: ['', Validators.required],
    installationDate: [null as Date | null],
    notes: ['']
  });

  meterResource = rxResource({
    params: () => ({ propertyId: this.propertyId(), meterId: this.meterId() }),
    stream: ({ params: { propertyId, meterId } }) => {
      if (!meterId || !propertyId) return EMPTY;
      return this.meterService.getById(propertyId, meterId);
    }
  });

  constructor() {
    effect(() => {
      const meter = this.meterResource.value();
      if (meter) {
        this.form.controls['serialNumber'].setValue(meter.serialNumber);
        this.form.controls['notes'].setValue(meter.description ?? '');
      }
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    const parent = this.route.parent?.snapshot.params;
    this.propertyId.set(parent?.['propertyId'] ?? params['propertyId'] ?? '');
    const mid = params['meterId'];
    if (mid) {
      this.meterId.set(mid);
      this.isEdit.set(true);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const pid = this.propertyId();
    const val = this.form.getRawValue();

    const obs = this.isEdit()
      ? this.meterService.update(pid, this.meterId()!, {
          serialNumber: val.serialNumber!,
          description: val.notes ?? undefined
        })
      : this.meterService.create(pid, {
          utilityType: val.utilityType as UtilityType,
          serialNumber: val.serialNumber!,
          installationDate: val.installationDate
            ? (val.installationDate as Date).toISOString().split('T')[0]
            : undefined,
          description: val.notes ?? undefined
        });

    obs.subscribe({
      next: () => this.router.navigate(['..'], { relativeTo: this.route }),
      error: () => this.saving.set(false)
    });
  }
}
