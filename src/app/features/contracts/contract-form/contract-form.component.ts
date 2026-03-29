import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContractService } from '../services/contract.service';
import { TenantService } from '../../tenants/services/tenant.service';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule, MatSelectModule,
    MatDatepickerModule, MatCheckboxModule,
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <button mat-icon-button [routerLink]="['/properties', propertyId()]">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ 'contracts.form.createTitle' | transloco }}</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="contract-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'contracts.form.tenant' | transloco }}</mat-label>
          <mat-select formControlName="tenantId">
            @for (t of tenantsResource.value() ?? []; track t.id) {
              <mat-option [value]="t.id">{{ t.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'contracts.form.startDate' | transloco }}</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'contracts.form.endDate' | transloco }}</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-checkbox (change)="toggleOpenEnded($event.checked)">
          {{ 'contracts.form.openEnded' | transloco }}
        </mat-checkbox>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'contracts.form.monthlyAmount' | transloco }}</mat-label>
            <input matInput type="number" min="0.01" step="0.01" formControlName="monthlyAmount" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'contracts.form.currency' | transloco }}</mat-label>
            <input matInput maxlength="3" formControlName="currency" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>{{ 'contracts.form.notes' | transloco }}</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>

        <div class="form-actions">
          <button mat-stroked-button type="button" [routerLink]="['/properties', propertyId()]">
            {{ 'common.cancel' | transloco }}
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'common.create' | transloco }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { max-width: 700px; margin: 0 auto; padding: 16px; }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .contract-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
  `],
})
export class ContractFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private tenantService = inject(TenantService);

  propertyId = signal('');
  saving = signal(false);

  form = this.fb.group({
    tenantId: ['', Validators.required],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null],
    monthlyAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency: ['PLN', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    notes: [''],
  });

  tenantsResource = rxResource({
    stream: () => this.tenantService.getAll(),
  });

  ngOnInit(): void {
    const pid = this.route.snapshot.params['propertyId'];
    if (pid) this.propertyId.set(pid);
  }

  toggleOpenEnded(checked: boolean): void {
    const endDateCtrl = this.form.get('endDate');
    if (checked) {
      endDateCtrl?.setValue(null);
      endDateCtrl?.disable();
    } else {
      endDateCtrl?.enable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const data = {
      tenantId: val.tenantId!,
      startDate: (val.startDate as Date).toISOString().split('T')[0],
      endDate: val.endDate ? (val.endDate as Date).toISOString().split('T')[0] : undefined,
      monthlyAmount: val.monthlyAmount!,
      currency: val.currency!,
      notes: val.notes || undefined,
    };
    this.contractService.create(this.propertyId(), data).subscribe({
      next: () => this.router.navigate(['/properties', this.propertyId()]),
      error: () => this.saving.set(false),
    });
  }
}
