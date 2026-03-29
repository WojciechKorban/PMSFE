import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { TenantService } from '../services/tenant.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule, MatTableModule,
  ],
  template: `
    <div class="tenant-list-header">
      <h2>{{ 'tenants.title' | transloco }}</h2>
      <a mat-raised-button color="primary" routerLink="new">
        <mat-icon>add</mat-icon>
        {{ 'tenants.addTenant' | transloco }}
      </a>
    </div>

    <mat-form-field appearance="outline" class="search-field">
      <mat-label>{{ 'tenants.search' | transloco }}</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" />
    </mat-form-field>

    @if (tenantsResource.isLoading()) {
      <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (tenantsResource.error()) {
      <div class="error">{{ 'common.error.loadFailed' | transloco }}</div>
    } @else if (filteredTenants().length === 0) {
      <div class="empty-state">
        <mat-icon>people</mat-icon>
        <p>{{ 'tenants.empty' | transloco }}</p>
      </div>
    } @else {
      <table mat-table [dataSource]="filteredTenants()" class="tenants-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let t">{{ t.name }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let t">{{ t.email }}</td>
        </ng-container>
        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef>Phone</th>
          <td mat-cell *matCellDef="let t">{{ t.phone ?? '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let t">
            <a mat-icon-button [routerLink]="[t.id]"><mat-icon>visibility</mat-icon></a>
            <a mat-icon-button [routerLink]="[t.id, 'edit']"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button color="warn" (click)="deleteTenant(t.id, t.name)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    }
  `,
  styles: [`
    .tenant-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .search-field { width: 100%; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .tenants-table { width: 100%; }
    .error { color: red; padding: 16px; }
  `],
})
export class TenantListComponent {
  private tenantService = inject(TenantService);
  private dialog = inject(MatDialog);
  private transloco = inject(TranslocoService);

  searchQuery = signal('');
  columns = ['name', 'email', 'phone', 'actions'];

  tenantsResource = rxResource({
    stream: () => this.tenantService.getAll(),
  });

  filteredTenants = computed(() => {
    const tenants = this.tenantsResource.value() ?? [];
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return tenants;
    return tenants.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  deleteTenant(id: string, name: string): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.transloco.translate('common.confirm'),
        message: `Delete tenant ${name}?`,
        confirmLabel: this.transloco.translate('common.delete'),
        dangerous: true,
      },
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.tenantService.delete(id).subscribe(() => this.tenantsResource.reload());
      }
    });
  }
}
