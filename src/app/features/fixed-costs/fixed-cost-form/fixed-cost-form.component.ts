import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FixedCostService } from '../services/fixed-cost.service';
import { FixedCost } from '../models/fixed-cost.models';

@Component({
  selector: 'app-fixed-cost-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatDatepickerModule, MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cost-form">
      @if (!isEdit()) {
        <mat-form-field appearance="outline">
          <mat-label>{{ 'fixedCosts.form.name' | transloco }}</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
      }
      <mat-form-field appearance="outline">
        <mat-label>{{ 'fixedCosts.form.amount' | transloco }}</mat-label>
        <input matInput type="number" formControlName="amount" step="0.01" min="0.01" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'fixedCosts.form.currency' | transloco }}</mat-label>
        <input matInput formControlName="currency" maxlength="3" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'fixedCosts.form.validFrom' | transloco }}</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="validFrom" />
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
      <div class="form-actions">
        <button mat-stroked-button type="button" (click)="cancelled.emit()">
          {{ 'common.cancel' | transloco }}
        </button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
          @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
          @else { {{ (isEdit() ? 'common.save' : 'common.create') | transloco }} }
        </button>
      </div>
    </form>
  `,
  styles: [`
    .cost-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 0; }
    .form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }
  `]
})
export class FixedCostFormComponent implements OnInit {
  propertyId = input.required<string>();
  existingCost = input<FixedCost | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private fixedCostService = inject(FixedCostService);

  isEdit = () => this.existingCost() !== null;
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: ['PLN', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    validFrom: [new Date(), Validators.required]
  });

  ngOnInit(): void {
    const cost = this.existingCost();
    if (cost) {
      this.form.patchValue({
        amount: cost.amount,
        currency: cost.currency,
        validFrom: new Date(cost.validFrom)
      });
      this.form.get('name')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const dateStr = (val.validFrom as Date).toISOString().split('T')[0];
    const cost = this.existingCost();

    const obs = cost
      ? this.fixedCostService.update(this.propertyId(), cost.id, {
          amount: val.amount!,
          currency: val.currency!,
          validFrom: dateStr
        })
      : this.fixedCostService.create(this.propertyId(), {
          name: val.name!,
          amount: val.amount!,
          currency: val.currency!,
          validFrom: dateStr
        });

    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: () => this.saving.set(false)
    });
  }
}
