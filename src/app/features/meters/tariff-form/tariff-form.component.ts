import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TariffService } from '../services/tariff.service';
import { UtilityType } from '../models/meter.models';

@Component({
  selector: 'app-tariff-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="tariff-form">
      <mat-form-field appearance="outline">
        <mat-label>{{ 'meters.form.utilityType' | transloco }}</mat-label>
        <mat-select formControlName="utilityType">
          @for (type of utilityTypes; track type) {
            <mat-option [value]="type">{{ ('meters.utilityType.' + type) | transloco }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>{{ 'tariffs.pricePerUnit' | transloco }}</mat-label>
        <input matInput type="number" formControlName="pricePerUnit" step="0.0001" min="0" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>{{ 'tariffs.currency' | transloco }}</mat-label>
        <input matInput formControlName="currency" placeholder="PLN" maxlength="3" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>{{ 'tariffs.validFrom' | transloco }}</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="validFrom" />
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <div class="form-actions">
        <button mat-raised-button color="primary" type="submit"
          [disabled]="form.invalid || saving()">
          @if (saving()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            {{ 'tariffs.addTariff' | transloco }}
          }
        </button>
      </div>
    </form>
  `,
  styles: [`
    .tariff-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 0; }
    .form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
  `]
})
export class TariffFormComponent {
  propertyId = input.required<string>();
  tariffAdded = output<void>();

  private fb = inject(FormBuilder);
  private tariffService = inject(TariffService);

  saving = signal(false);
  readonly utilityTypes: UtilityType[] = ['ELECTRICITY', 'GAS', 'WATER', 'HEAT', 'OTHER'];

  form = this.fb.group({
    utilityType: ['ELECTRICITY' as UtilityType, Validators.required],
    pricePerUnit: [null as number | null, [Validators.required, Validators.min(0)]],
    currency: ['PLN', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    validFrom: [new Date() as Date | null, Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();

    this.tariffService.create(this.propertyId(), {
      utilityType: val.utilityType as UtilityType,
      pricePerUnit: val.pricePerUnit!,
      currency: val.currency!,
      validFrom: (val.validFrom as Date).toISOString().split('T')[0]
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ utilityType: 'ELECTRICITY', currency: 'PLN', validFrom: new Date() });
        this.tariffAdded.emit();
      },
      error: () => this.saving.set(false)
    });
  }
}
