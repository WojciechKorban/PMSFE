import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DateRange } from '../../../features/reports/models/report.models';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatDatepickerModule, MatInputModule, MatButtonModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onApply()" class="date-range-form">
      <mat-form-field appearance="outline">
        <mat-label>{{ 'reports.dateRange.from' | transloco }}</mat-label>
        <input matInput [matDatepicker]="fromPicker" formControlName="from" />
        <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
        <mat-datepicker #fromPicker></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'reports.dateRange.to' | transloco }}</mat-label>
        <input matInput [matDatepicker]="toPicker" formControlName="to" />
        <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
        <mat-datepicker #toPicker></mat-datepicker>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        {{ 'reports.dateRange.apply' | transloco }}
      </button>
    </form>
  `,
  styles: [`.date-range-form { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }`]
})
export class DateRangePickerComponent {
  rangeSelected = output<DateRange>();
  private fb = inject(FormBuilder);

  form = this.fb.group({
    from: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), Validators.required],
    to: [new Date(), Validators.required]
  });

  onApply(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.rangeSelected.emit({ from: val.from as Date, to: val.to as Date });
  }
}
