import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContractService } from '../services/contract.service';

export interface ContractTerminateDialogData {
  propertyId: string;
  contractId: string;
}

@Component({
  selector: 'app-contract-terminate-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, TranslocoPipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'contracts.terminate.dialogTitle' | transloco }}</h2>
    <mat-dialog-content>
      <p class="warning">{{ 'contracts.terminate.warning' | transloco }}</p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" style="width: 100%">
          <mat-label>{{ 'contracts.terminate.reason' | transloco }}</mat-label>
          <textarea matInput formControlName="terminationReason" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close(false)" [disabled]="terminating()">
        {{ 'common.cancel' | transloco }}
      </button>
      <button mat-raised-button color="warn" (click)="onConfirm()" [disabled]="terminating()">
        @if (terminating()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ 'contracts.terminate.confirm' | transloco }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.warning { color: var(--mat-sys-error); font-weight: 500; margin-bottom: 16px; }`],
})
export class ContractTerminateDialogComponent {
  data = inject<ContractTerminateDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ContractTerminateDialogComponent>);
  private contractService = inject(ContractService);
  private fb = inject(FormBuilder);

  terminating = signal(false);

  form = this.fb.group({
    terminationReason: [''],
  });

  onConfirm(): void {
    this.terminating.set(true);
    const reason = this.form.getRawValue().terminationReason || undefined;
    this.contractService
      .terminate(this.data.propertyId, this.data.contractId, { terminationReason: reason })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.terminating.set(false);
          this.dialogRef.close(false);
        },
      });
  }
}
