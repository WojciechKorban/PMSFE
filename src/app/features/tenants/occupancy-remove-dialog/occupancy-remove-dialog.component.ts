import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';
import { TenantService } from '../services/tenant.service';

export interface OccupancyRemoveDialogData {
  propertyId: string;
  tenantId: string;
  tenantName: string;
}

@Component({
  selector: 'app-occupancy-remove-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, TranslocoPipe],
  template: `
    <h2 mat-dialog-title>{{ 'tenants.occupancy.removeConfirmTitle' | transloco }}</h2>
    <mat-dialog-content>
      <p>{{ 'tenants.occupancy.removeConfirmMessage' | transloco }}</p>
      <p><strong>{{ data.tenantName }}</strong></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close(false)" [disabled]="removing()">
        {{ 'common.cancel' | transloco }}
      </button>
      <button mat-raised-button color="warn" (click)="onConfirm()" [disabled]="removing()">
        @if (removing()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ 'tenants.occupancy.remove' | transloco }}
        }
      </button>
    </mat-dialog-actions>
  `,
})
export class OccupancyRemoveDialogComponent {
  data = inject<OccupancyRemoveDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<OccupancyRemoveDialogComponent>);
  private tenantService = inject(TenantService);

  removing = signal(false);

  onConfirm(): void {
    this.removing.set(true);
    this.tenantService.remove(this.data.propertyId, this.data.tenantId).subscribe({
      next: result => this.dialogRef.close(result),
      error: () => {
        this.removing.set(false);
        this.dialogRef.close(false);
      },
    });
  }
}
