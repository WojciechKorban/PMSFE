import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-occupancy-assign',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatExpansionModule, MatFormFieldModule, MatSelectModule,
    MatDatepickerModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>{{ 'tenants.occupancy.assignTitle' | transloco }}</mat-panel-title>
      </mat-expansion-panel-header>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="assign-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ 'tenants.occupancy.selectTenant' | transloco }}</mat-label>
          <mat-select formControlName="tenantId">
            @for (t of tenantsResource.value() ?? []; track t.id) {
              <mat-option [value]="t.id">{{ t.firstName }} {{ t.lastName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>{{ 'tenants.occupancy.startDate' | transloco }}</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="startDate" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            @if (saving()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              {{ 'tenants.occupancy.assign' | transloco }}
            }
          </button>
        </div>
      </form>
    </mat-expansion-panel>
  `,
  styles: [`.assign-form { display: flex; flex-direction: column; gap: 12px; padding-top: 16px; } .form-actions { display: flex; justify-content: flex-end; }`],
})
export class OccupancyAssignComponent {
  propertyId = input.required<string>();
  assigned = output<void>();

  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);

  saving = signal(false);

  form = this.fb.group({
    tenantId: ['', Validators.required],
    startDate: [new Date(), Validators.required],
  });

  tenantsResource = rxResource({
    stream: () => this.tenantService.getAll(),
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    this.tenantService.assign(this.propertyId(), val.tenantId!, {
      startDate: (val.startDate as Date).toISOString().split('T')[0],
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ startDate: new Date() });
        this.assigned.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
