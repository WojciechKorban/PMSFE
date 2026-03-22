import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PropertyService } from '../services/property.service';
import { PropertyResponse } from '../models/property.models';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'pms-property-list',
  imports: [
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    FormsModule, TranslocoModule, PropertyCardComponent,
    EmptyStateComponent, SkeletonLoaderComponent, PageHeaderComponent,
  ],
  template: `
    <pms-page-header [title]="'properties.list.title' | transloco">
      <button mat-flat-button color="primary"
              (click)="router.navigate(['/properties/new'])">
        <mat-icon>add</mat-icon>
        {{ 'properties.list.addButton' | transloco }}
      </button>
    </pms-page-header>

    <div class="list-content">
      @if (!propertiesResource.isLoading() && (propertiesResource.value()?.length ?? 0) > 0) {
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ 'properties.list.searchPlaceholder' | transloco }}</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [ngModel]="searchQuery()"
                 (ngModelChange)="searchQuery.set($event)" />
        </mat-form-field>
      }

      @if (propertiesResource.isLoading()) {
        <pms-skeleton-loader type="list" [rowCount]="4" />
      } @else if (propertiesResource.error()) {
        <p class="error-text">{{ 'properties.list.loadError' | transloco }}</p>
      } @else if (filteredProperties().length === 0 && searchQuery().length === 0) {
        <pms-empty-state
          icon="home"
          [title]="'properties.list.emptyState.title' | transloco"
          [description]="'properties.list.emptyState.description' | transloco"
          [actionLabel]="'properties.list.emptyState.action' | transloco"
          (actionClick)="router.navigate(['/properties/new'])"
        />
      } @else {
        <div class="properties-grid">
          @for (property of filteredProperties(); track property.id) {
            <pms-property-card
              [property]="property"
              (editClick)="onEdit($event)"
              (deleteClick)="onDelete($event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .list-content { padding: 0 24px 24px; }
    .search-field { width: 100%; max-width: 400px; margin-bottom: 16px; }
    .properties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .error-text { color: var(--mat-sys-error); }
  `],
})
export class PropertyListComponent {
  protected readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(SnackbarService);
  private readonly transloco = inject(TranslocoService);

  readonly searchQuery = signal('');

  readonly propertiesResource = rxResource<PropertyResponse[], void>({
    stream: () => this.propertyService.getAll(),
  });

  readonly filteredProperties = computed((): PropertyResponse[] => {
    const q = this.searchQuery().toLowerCase();
    const all: PropertyResponse[] = this.propertiesResource.value() ?? [];
    if (!q) return all;
    return all.filter(
      (p: PropertyResponse) =>
        p.name.toLowerCase().includes(q) ||
        (p.city ?? '').toLowerCase().includes(q)
    );
  });

  onEdit(id: string): void {
    this.router.navigate(['/properties', id, 'edit']);
  }

  onDelete(property: PropertyResponse): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.transloco.translate('properties.delete.confirmTitle'),
        message: this.transloco.translate('properties.delete.confirmMessage', {
          name: property.name,
        }),
        confirmLabel: this.transloco.translate('properties.delete.confirmButton'),
        cancelLabel: this.transloco.translate('buttons.cancel'),
        dangerous: true,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.propertyService.delete(property.id).subscribe({
        next: () => {
          this.snackbar.success('properties.delete.success');
          this.propertiesResource.reload();
        },
      });
    });
  }
}
